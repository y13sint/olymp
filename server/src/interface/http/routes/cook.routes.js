import { Router } from 'express'
import {
  getTodayMeals,
  getTodayMenuAll,
  getInventory,
  updateInventory,
  getPurchaseRequests,
  createPurchaseRequest,
  deletePurchaseRequest,
  createProduct,
  updateProduct,
  deleteProduct,
  getMenuItemIngredients,
  updateMenuItemIngredients,
} from '../controllers/cook.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  updateInventorySchema,
  createPurchaseRequestSchema,
  mealTypeQuerySchema,
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  updateIngredientsSchema,
} from '../validators/cook.validator.js'

const router = Router()

// Все роуты требуют авторизации повара
router.use(authMiddleware)
router.use(roleMiddleware('cook'))

// Учёт выданных блюд (только просмотр)
router.get('/meals/today', validate(mealTypeQuerySchema), getTodayMeals)

// Меню на сегодня (все блюда, включая недоступные)
router.get('/menu/today', getTodayMenuAll)

// Склад
router.get('/inventory', getInventory)
router.put('/inventory/:id', validate(updateInventorySchema), updateInventory)

// Продукты (CRUD)
router.post('/products', validate(createProductSchema), createProduct)
router.put('/products/:id', validate(updateProductSchema), updateProduct)
router.delete('/products/:id', validate(idParamSchema), deleteProduct)

// Заявки на закупку
router.get('/purchase-requests', getPurchaseRequests)
router.post('/purchase-requests', validate(createPurchaseRequestSchema), createPurchaseRequest)
router.delete('/purchase-requests/:id', validate(idParamSchema), deletePurchaseRequest)

// Рецептура (ингредиенты блюд)
router.get('/menu-items/:id/ingredients', validate(idParamSchema), getMenuItemIngredients)
router.put('/menu-items/:id/ingredients', validate(updateIngredientsSchema), updateMenuItemIngredients)

export default router
