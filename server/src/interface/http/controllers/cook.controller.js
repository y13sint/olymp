import { ApiError } from '../../../shared/errors/index.js'
import { updateProductQuantity, getProductsWithLowStockFlag } from '../../../shared/services/inventory.service.js'
import { notifyLowStock, notifyNewPurchaseRequest } from '../../../shared/services/notification.service.js'
import { getTodayDate } from '../../../shared/services/meal.service.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { MealPickup, User, Product, PurchaseRequest, MenuItemIngredient, MenuItem, MenuDay } = db

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

export async function getTodayMenuAll(req, res, next) {
  try {
    const today = getTodayDate()
    const menuDay = await MenuDay.findOne({
      where: { menuDate: today },
      include: [{ association: 'menuItems' }],
    })
    res.json({ menuItems: menuDay?.menuItems || [] })
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

export async function createProduct(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { name, unit, quantity, minQuantity, createPurchaseRequest, purchaseQuantity, purchaseComment } = req.body
    const cookId = req.user.id

    const existing = await Product.findOne({ where: { name }, transaction })
    if (existing) throw ApiError.conflict('Продукт с таким названием уже существует')

    const product = await Product.create({
      name,
      unit,
      quantity: parseFloat(quantity) || 0,
      minQuantity: parseFloat(minQuantity) || 0,
    }, { transaction })

    let purchaseRequest = null
    if (createPurchaseRequest && purchaseQuantity > 0) {
      const cook = await User.findByPk(cookId, { attributes: ['fullName'], transaction })
      purchaseRequest = await PurchaseRequest.create({
        productId: product.id,
        createdBy: cookId,
        quantity: purchaseQuantity,
        status: 'pending',
        comment: purchaseComment || `Начальная закупка: ${name}`,
      }, { transaction })

      await notifyNewPurchaseRequest(cook.fullName, product.name, purchaseQuantity, unit)
    }

    await transaction.commit()
    res.status(201).json({ message: 'Продукт создан', product, purchaseRequest })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const { name, unit, minQuantity } = req.body

    const product = await Product.findByPk(id)
    if (!product) throw ApiError.notFound('Продукт не найден')

    if (name && name !== product.name) {
      const existing = await Product.findOne({ where: { name } })
      if (existing) throw ApiError.conflict('Продукт с таким названием уже существует')
    }

    await product.update({
      name: name ?? product.name,
      unit: unit ?? product.unit,
      minQuantity: minQuantity ?? product.minQuantity,
    })

    res.json({ message: 'Продукт обновлён', product })
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params

    const product = await Product.findByPk(id)
    if (!product) throw ApiError.notFound('Продукт не найден')

    const usedInRecipes = await MenuItemIngredient.count({ where: { productId: id } })
    if (usedInRecipes > 0) {
      throw ApiError.badRequest('Нельзя удалить продукт, который используется в рецептуре блюд')
    }

    const hasPendingRequests = await PurchaseRequest.count({ where: { productId: id, status: 'pending' } })
    if (hasPendingRequests > 0) {
      throw ApiError.badRequest('Нельзя удалить продукт с активными заявками на закупку')
    }

    await product.destroy()
    res.json({ message: 'Продукт удалён' })
  } catch (error) {
    next(error)
  }
}

export async function getMenuItemIngredients(req, res, next) {
  try {
    const { id } = req.params

    const menuItem = await MenuItem.findByPk(id)
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')

    const ingredients = await MenuItemIngredient.findAll({
      where: { menuItemId: id },
      include: [{ association: 'product', attributes: ['id', 'name', 'unit', 'quantity'] }],
      order: [['id', 'ASC']],
    })

    res.json({ menuItem: { id: menuItem.id, name: menuItem.name }, ingredients })
  } catch (error) {
    next(error)
  }
}

export async function updateMenuItemIngredients(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { id } = req.params
    const { ingredients } = req.body

    const menuItem = await MenuItem.findByPk(id, { transaction })
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')

    const productIds = ingredients.map(i => i.productId)
    const products = await Product.findAll({ where: { id: productIds }, transaction })
    if (products.length !== productIds.length) {
      throw ApiError.badRequest('Один или несколько продуктов не найдены')
    }

    await MenuItemIngredient.destroy({ where: { menuItemId: id }, transaction })

    if (ingredients.length > 0) {
      await MenuItemIngredient.bulkCreate(
        ingredients.map(i => ({
          menuItemId: id,
          productId: i.productId,
          quantity: i.quantity,
        })),
        { transaction }
      )
    }

    await transaction.commit()

    const updatedIngredients = await MenuItemIngredient.findAll({
      where: { menuItemId: id },
      include: [{ association: 'product', attributes: ['id', 'name', 'unit', 'quantity'] }],
    })

    res.json({ message: 'Рецептура обновлена', ingredients: updatedIngredients })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
