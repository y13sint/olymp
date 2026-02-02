import { ApiError } from '../../../shared/errors/index.js'
import { calculateSubscriptionPrice, calculateSubscriptionDates, hasEnoughBalance, formatSubscriptionDescription } from '../../../shared/services/payment.service.js'
import { findExistingPickup, findActiveSubscription, createMealPickup, getTodayDate, getMealTypeName } from '../../../shared/services/meal.service.js'
import { parsePagination, paginatedResponse } from '../../../shared/utils/index.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { User, Payment, Subscription, MealPickup, MenuItem, Allergy, Review, FoodPreference } = db

export async function createPayment(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { amount, description } = req.body
    const userId = req.user.id

    const payment = await Payment.create({
      userId, amount, type: 'single', status: 'completed',
      description: description || 'Пополнение баланса',
    }, { transaction })

    await User.increment('balance', { by: amount, where: { id: userId }, transaction })
    await transaction.commit()

    const user = await User.findByPk(userId)
    res.status(201).json({ message: 'Баланс пополнен', payment, newBalance: user.balance })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function createSubscription(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { type, days } = req.body
    const userId = req.user.id

    const totalPrice = calculateSubscriptionPrice(type, days)
    const { startDate, endDate } = calculateSubscriptionDates(days)

    const user = await User.findByPk(userId, { transaction })
    if (!hasEnoughBalance(user.balance, totalPrice)) throw ApiError.badRequest('Недостаточно средств на балансе')

    await Payment.create({
      userId, amount: totalPrice, type: 'subscription', status: 'completed',
      description: formatSubscriptionDescription(type, days),
    }, { transaction })

    await User.decrement('balance', { by: totalPrice, where: { id: userId }, transaction })
    await Subscription.update({ isActive: false }, { where: { userId, type, isActive: true }, transaction })

    const subscription = await Subscription.create({ userId, startDate, endDate, type, isActive: true }, { transaction })
    await transaction.commit()

    res.status(201).json({ message: 'Абонемент оформлен', subscription, totalPrice })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function getPayments(req, res, next) {
  try {
    const { limit, offset, page } = parsePagination(req.query)
    const { count, rows } = await Payment.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit, offset,
    })
    res.json({ payments: rows, ...paginatedResponse(rows, count, page, limit).pagination })
  } catch (error) {
    next(error)
  }
}

export async function pickupMeal(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { menuItemId } = req.body
    const userId = req.user.id
    const today = getTodayDate()

    const menuItem = await MenuItem.findByPk(menuItemId, { include: [{ association: 'menuDay' }], transaction })
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')
    if (menuItem.menuDay.menuDate !== today) throw ApiError.badRequest('Это блюдо не из сегодняшнего меню')

    const existingPickup = await findExistingPickup(userId, menuItem.mealType, today, transaction)
    if (existingPickup) throw ApiError.conflict(`Вы уже получили ${getMealTypeName(menuItem.mealType)} сегодня`)

    const user = await User.findByPk(userId, { lock: transaction.LOCK.UPDATE, transaction })
    const activeSubscription = await findActiveSubscription(userId, menuItem.mealType, today, transaction)

    if (!activeSubscription) {
      if (!hasEnoughBalance(user.balance, menuItem.price)) {
        throw ApiError.badRequest('Недостаточно средств на балансе. Пополните баланс или оформите абонемент.')
      }
      await User.decrement('balance', { by: menuItem.price, where: { id: userId }, transaction })
    }

    const pickup = await createMealPickup({ userId, menuItemId, pickupDate: today, mealType: menuItem.mealType }, transaction)
    await transaction.commit()

    res.status(201).json({ message: 'Питание заказано', pickup, paidBy: activeSubscription ? 'subscription' : 'balance' })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function getMyMeals(req, res, next) {
  try {
    const { date } = req.query
    const where = { userId: req.user.id }
    if (date) where.pickupDate = date
    const { limit, offset, page } = parsePagination(req.query)

    const { count, rows } = await MealPickup.findAndCountAll({
      where,
      include: [{ association: 'menuItem', attributes: ['id', 'name', 'price', 'mealType'] }],
      order: [['pickupDate', 'DESC'], ['createdAt', 'DESC']],
      limit, offset, distinct: true,
    })
    res.json({ meals: rows, ...paginatedResponse(rows, count, page, limit).pagination })
  } catch (error) {
    next(error)
  }
}

export async function getAllergies(req, res, next) {
  try {
    const allergies = await Allergy.findAll({ where: { userId: req.user.id }, attributes: ['id', 'allergenName'] })
    res.json({ allergies })
  } catch (error) {
    next(error)
  }
}

export async function addAllergy(req, res, next) {
  try {
    const { allergenName } = req.body
    const userId = req.user.id
    const [allergy, created] = await Allergy.findOrCreate({
      where: { userId, allergenName: allergenName.toLowerCase() },
      defaults: { userId, allergenName: allergenName.toLowerCase() },
    })
    if (!created) throw ApiError.conflict('Эта аллергия уже добавлена')
    res.status(201).json({ allergy })
  } catch (error) {
    next(error)
  }
}

export async function deleteAllergy(req, res, next) {
  try {
    const deleted = await Allergy.destroy({ where: { id: req.params.id, userId: req.user.id } })
    if (!deleted) throw ApiError.notFound('Аллергия не найдена')
    res.json({ message: 'Аллергия удалена' })
  } catch (error) {
    next(error)
  }
}

// Предпочтения
export async function getPreferences(req, res, next) {
  try {
    const preferences = await FoodPreference.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'preferenceName'],
    })
    res.json({ preferences })
  } catch (error) {
    next(error)
  }
}

export async function addPreference(req, res, next) {
  try {
    const { preferenceName } = req.body
    const userId = req.user.id
    const [preference, created] = await FoodPreference.findOrCreate({
      where: { userId, preferenceName: preferenceName.toLowerCase() },
      defaults: { userId, preferenceName: preferenceName.toLowerCase() },
    })
    if (!created) throw ApiError.conflict('Это предпочтение уже добавлено')
    res.status(201).json({ preference })
  } catch (error) {
    next(error)
  }
}

export async function deletePreference(req, res, next) {
  try {
    const deleted = await FoodPreference.destroy({ where: { id: req.params.id, userId: req.user.id } })
    if (!deleted) throw ApiError.notFound('Предпочтение не найдено')
    res.json({ message: 'Предпочтение удалено' })
  } catch (error) {
    next(error)
  }
}

export async function createReview(req, res, next) {
  try {
    const { menuItemId, rating, comment } = req.body
    const userId = req.user.id

    const menuItem = await MenuItem.findByPk(menuItemId)
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')

    const existing = await Review.findOne({ where: { userId, menuItemId } })
    if (existing) {
      existing.rating = rating
      existing.comment = comment
      await existing.save()
      return res.json({ message: 'Отзыв обновлён', review: existing })
    }

    const review = await Review.create({ userId, menuItemId, rating, comment })
    res.status(201).json({ message: 'Отзыв добавлен', review })
  } catch (error) {
    next(error)
  }
}

export async function getMyReviews(req, res, next) {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'menuItem', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json({ reviews })
  } catch (error) {
    next(error)
  }
}

export async function deleteReview(req, res, next) {
  try {
    const deleted = await Review.destroy({ where: { id: req.params.id, userId: req.user.id } })
    if (!deleted) throw ApiError.notFound('Отзыв не найден')
    res.json({ message: 'Отзыв удалён' })
  } catch (error) {
    next(error)
  }
}

export async function confirmMealReceived(req, res, next) {
  try {
    const pickup = await MealPickup.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ association: 'menuItem', attributes: ['id', 'name', 'mealType'] }],
    })
    if (!pickup) throw ApiError.notFound('Заказ не найден')
    if (pickup.isReceived) throw ApiError.conflict('Вы уже отметили получение этого блюда')
    if (pickup.pickupDate !== getTodayDate()) {
      throw ApiError.badRequest('Можно отметить получение только за сегодняшний день')
    }

    pickup.isReceived = true
    pickup.receivedAt = new Date()
    await pickup.save()

    res.json({ message: 'Получение подтверждено', pickup })
  } catch (error) {
    next(error)
  }
}
