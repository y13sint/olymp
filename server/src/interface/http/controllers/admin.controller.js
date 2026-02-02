import { Op, fn, col } from 'sequelize'
import { ApiError } from '../../../shared/errors/index.js'
import { hashPassword } from '../../../shared/services/password.service.js'
import { restockFromRequest } from '../../../shared/services/inventory.service.js'
import { notifyPurchaseRequestDecision } from '../../../shared/services/notification.service.js'
import { parsePagination, paginatedResponse } from '../../../shared/utils/index.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { User, Payment, MealPickup, PurchaseRequest, Product, MenuDay, MenuItem } = db

export async function getPaymentStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const where = { status: 'completed' }
    if (startDate && endDate) where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] }

    const payments = await Payment.findAll({
      where,
      attributes: ['type', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('amount')), 'total']],
      group: ['type'],
    })

    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.dataValues.total || 0), 0)
    const totalCount = payments.reduce((sum, p) => sum + parseInt(p.dataValues.count || 0), 0)

    res.json({ stats: payments, summary: { totalAmount, totalCount } })
  } catch (error) {
    next(error)
  }
}

export async function getAttendanceStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const where = { isReceived: true }
    if (startDate && endDate) where.pickupDate = { [Op.between]: [startDate, endDate] }

    const [byMealType, byDate] = await Promise.all([
      MealPickup.findAll({ where, attributes: ['mealType', [fn('COUNT', col('id')), 'count']], group: ['mealType'] }),
      MealPickup.findAll({ where, attributes: ['pickupDate', [fn('COUNT', col('id')), 'count']], group: ['pickupDate'], order: [['pickupDate', 'DESC']], limit: 30 }),
    ])

    res.json({ byMealType, byDate })
  } catch (error) {
    next(error)
  }
}

export async function getAllPurchaseRequests(req, res, next) {
  try {
    const { status } = req.query
    const where = status ? { status } : {}
    const { limit, offset, page } = parsePagination(req.query)

    const { count, rows } = await PurchaseRequest.findAndCountAll({
      where,
      include: [
        { association: 'product', attributes: ['id', 'name', 'unit', 'quantity', 'minQuantity'] },
        { association: 'creator', attributes: ['id', 'fullName'] },
        { association: 'approver', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit, offset, distinct: true,
    })

    res.json({ requests: rows, ...paginatedResponse(rows, count, page, limit).pagination })
  } catch (error) {
    next(error)
  }
}

export async function updatePurchaseRequest(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { status } = req.body
    const approved = status === 'approved'

    const request = await PurchaseRequest.findByPk(req.params.id, { include: [{ association: 'product' }], transaction })
    if (!request) throw ApiError.notFound('Заявка не найдена')
    if (request.status !== 'pending') throw ApiError.badRequest('Заявка уже обработана')

    request.status = status
    request.approvedBy = req.user.id
    await request.save({ transaction })

    if (approved) await restockFromRequest(request.productId, request.quantity, request.id, transaction)
    await transaction.commit()

    await notifyPurchaseRequestDecision(request.createdBy, request.product.name, request.quantity, request.product.unit, approved)

    res.json({ message: approved ? 'Заявка одобрена' : 'Заявка отклонена', request })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function getReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const dateFilter = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {}

    const [mealsReport, paymentsReport] = await Promise.all([
      MealPickup.findAll({
        where: { isReceived: true, ...(startDate && endDate ? { pickupDate: dateFilter } : {}) },
        include: [
          { association: 'menuItem', attributes: ['name', 'price', 'mealType'] },
          { association: 'user', attributes: ['fullName', 'classNumber', 'classLetter'] },
        ],
        order: [['pickupDate', 'DESC']],
      }),
      Payment.findAll({
        where: { status: 'completed', ...(startDate && endDate ? { createdAt: { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] } } : {}) },
        attributes: [[fn('DATE', col('created_at')), 'date'], 'type', [fn('SUM', col('amount')), 'total'], [fn('COUNT', col('id')), 'count']],
        group: [fn('DATE', col('created_at')), 'type'],
        order: [[fn('DATE', col('created_at')), 'DESC']],
      }),
    ])

    const totalMeals = mealsReport.length
    const totalRevenue = mealsReport.reduce((sum, m) => sum + parseFloat(m.menuItem?.price || 0), 0)
    const totalPayments = paymentsReport.reduce((sum, p) => sum + parseFloat(p.dataValues.total || 0), 0)

    res.json({
      period: { startDate, endDate },
      meals: { data: mealsReport, total: totalMeals, revenue: totalRevenue },
      payments: { data: paymentsReport, total: totalPayments },
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllMenuDays(req, res, next) {
  try {
    const { limit, offset, page } = parsePagination(req.query, 30)
    const { count, rows } = await MenuDay.findAndCountAll({
      include: [{ association: 'menuItems' }],
      order: [['menuDate', 'DESC']],
      limit, offset, distinct: true,
    })
    res.json({ menuDays: rows, ...paginatedResponse(rows, count, page, limit).pagination })
  } catch (error) {
    next(error)
  }
}

export async function createMenuDay(req, res, next) {
  try {
    const { menuDate, isActive = true } = req.body
    const existing = await MenuDay.findOne({ where: { menuDate } })
    if (existing) throw ApiError.conflict('Меню на эту дату уже существует')

    const menuDay = await MenuDay.create({ menuDate, isActive })
    res.status(201).json({ menuDay })
  } catch (error) {
    next(error)
  }
}

export async function addMenuItem(req, res, next) {
  try {
    const { dayId } = req.params
    const { name, description, price, mealType, allergens, calories } = req.body

    const menuDay = await MenuDay.findByPk(dayId)
    if (!menuDay) throw ApiError.notFound('День меню не найден')

    const menuItem = await MenuItem.create({ menuDayId: dayId, name, description, price, mealType, allergens, calories, isAvailable: true })
    res.status(201).json({ menuItem })
  } catch (error) {
    next(error)
  }
}

export async function updateMenuItem(req, res, next) {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id)
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')

    const allowedFields = ['name', 'description', 'price', 'mealType', 'allergens', 'calories', 'isAvailable']
    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field]
    }

    await menuItem.update(updateData)
    res.json({ menuItem })
  } catch (error) {
    next(error)
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const deleted = await MenuItem.destroy({ where: { id: req.params.id } })
    if (!deleted) throw ApiError.notFound('Блюдо не найдено')
    res.json({ message: 'Блюдо удалено' })
  } catch (error) {
    next(error)
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const { role, includeDeleted } = req.query
    const where = role ? { role } : {}
    const { limit, offset, page } = parsePagination(req.query)
    const paranoid = includeDeleted !== 'true'

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      limit, offset, paranoid,
    })

    const users = rows.map(user => ({ ...user.toJSON(), isDeleted: user.deletedAt !== null }))
    res.json({ users, ...paginatedResponse(rows, count, page, limit).pagination })
  } catch (error) {
    next(error)
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, password, fullName, role } = req.body

    const existing = await User.findOne({ where: { email } })
    if (existing) throw ApiError.conflict('Пользователь с таким email уже существует')

    const deletedUser = await User.findOne({ where: { email }, paranoid: false })
    if (deletedUser && deletedUser.deletedAt !== null) {
      throw ApiError.conflict('Пользователь с таким email был удалён. Используйте restore для восстановления.', { deletedUserId: deletedUser.id })
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({ email, passwordHash, fullName, role, balance: 0 })
    res.status(201).json({ user: user.toJSON() })
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) throw ApiError.notFound('Пользователь не найден')

    const { fullName, role, classNumber, classLetter, balance } = req.body
    if (balance !== undefined && balance < 0) throw ApiError.badRequest('Баланс не может быть отрицательным')

    await user.update({
      fullName: fullName ?? user.fullName,
      role: role ?? user.role,
      classNumber: classNumber ?? user.classNumber,
      classLetter: classLetter ?? user.classLetter,
      balance: balance ?? user.balance,
    })

    res.json({ user: user.toJSON() })
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (parseInt(req.params.id) === req.user.id) throw ApiError.badRequest('Нельзя удалить самого себя')
    const user = await User.findByPk(req.params.id)
    if (!user) throw ApiError.notFound('Пользователь не найден')
    await user.destroy()
    res.json({ message: 'Пользователь удалён' })
  } catch (error) {
    next(error)
  }
}

export async function restoreUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, { paranoid: false })
    if (!user) throw ApiError.notFound('Пользователь не найден')
    if (user.deletedAt === null) throw ApiError.badRequest('Пользователь не был удалён')
    await user.restore()
    res.json({ message: 'Пользователь восстановлен', user: user.toJSON() })
  } catch (error) {
    next(error)
  }
}
