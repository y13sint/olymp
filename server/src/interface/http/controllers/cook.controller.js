import { ApiError } from '../../../shared/errors/index.js'
import { updateProductQuantity, getProductsWithLowStockFlag } from '../../../shared/services/inventory.service.js'
import { notifyLowStock, notifyNewPurchaseRequest } from '../../../shared/services/notification.service.js'
import { getTodayDate } from '../../../shared/services/meal.service.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { MealPickup, User, Product, PurchaseRequest } = db

export async function getTodayMeals(req, res, next) {
  try {
    const today = getTodayDate()
    const { mealType } = req.query
    const where = { pickupDate: today }
    if (mealType) where.mealType = mealType

    const meals = await MealPickup.findAll({
      where,
      include: [
        {
          association: 'user',
          attributes: ['id', 'fullName', 'classNumber', 'classLetter'],
          include: [
            { association: 'allergies', attributes: ['id', 'allergenName'] },
            { association: 'foodPreferences', attributes: ['id', 'preferenceName'] },
          ],
        },
        { association: 'menuItem', attributes: ['id', 'name', 'mealType'] },
      ],
      order: [['createdAt', 'ASC']],
    })

    const stats = {
      total: meals.length,
      received: meals.filter(m => m.isReceived).length,
      pending: meals.filter(m => !m.isReceived).length,
    }

    res.json({ meals, stats })
  } catch (error) {
    next(error)
  }
}

export async function getInventory(req, res, next) {
  try {
    const products = await getProductsWithLowStockFlag()
    res.json({ products })
  } catch (error) {
    next(error)
  }
}

export async function updateInventory(req, res, next) {
  try {
    const { quantityChange, reason } = req.body
    const { product, newQuantity, isLow } = await updateProductQuantity(req.params.id, quantityChange, reason)
    if (isLow) await notifyLowStock(product.name, newQuantity, product.minQuantity, product.unit)
    res.json({ message: 'Остаток обновлён', product })
  } catch (error) {
    if (error.message === 'Продукт не найден') return next(ApiError.notFound(error.message))
    if (error.message === 'Остаток не может быть отрицательным') return next(ApiError.badRequest(error.message))
    next(error)
  }
}

export async function getPurchaseRequests(req, res, next) {
  try {
    const { status } = req.query
    const where = { createdBy: req.user.id }
    if (status) where.status = status

    const requests = await PurchaseRequest.findAll({
      where,
      include: [{ association: 'product', attributes: ['id', 'name', 'unit', 'quantity'] }],
      order: [['createdAt', 'DESC']],
    })

    res.json({ requests })
  } catch (error) {
    next(error)
  }
}

export async function createPurchaseRequest(req, res, next) {
  try {
    const { productId, quantity, comment } = req.body
    const cookId = req.user.id

    const product = await Product.findByPk(productId)
    if (!product) throw ApiError.notFound('Продукт не найден')

    const cook = await User.findByPk(cookId, { attributes: ['fullName'] })
    const request = await PurchaseRequest.create({ productId, createdBy: cookId, quantity, status: 'pending', comment })

    await notifyNewPurchaseRequest(cook.fullName, product.name, quantity, product.unit)
    res.status(201).json({ message: 'Заявка создана', request })
  } catch (error) {
    next(error)
  }
}

export async function deletePurchaseRequest(req, res, next) {
  try {
    const request = await PurchaseRequest.findOne({ where: { id: req.params.id, createdBy: req.user.id } })
    if (!request) throw ApiError.notFound('Заявка не найдена')
    if (request.status !== 'pending') throw ApiError.badRequest('Можно удалить только заявки со статусом "На рассмотрении"')
    await request.destroy()
    res.json({ message: 'Заявка удалена' })
  } catch (error) {
    next(error)
  }
}
