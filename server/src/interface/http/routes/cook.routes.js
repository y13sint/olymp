import { Router } from 'express'
import {
  getTodayMeals,
  getInventory,
  updateInventory,
  getPurchaseRequests,
  createPurchaseRequest,
  deletePurchaseRequest,
} from '../controllers/cook.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  updateInventorySchema,
  createPurchaseRequestSchema,
  mealTypeQuerySchema,
} from '../validators/cook.validator.js'
import { idParamSchema } from '../validators/student.validator.js'

const router = Router()

// Все роуты требуют авторизации повара
router.use(authMiddleware)
router.use(roleMiddleware('cook'))

// Учёт выданных блюд (только просмотр)
router.get('/meals/today', validate(mealTypeQuerySchema), getTodayMeals)

// Склад
router.get('/inventory', getInventory)
router.put('/inventory/:id', validate(updateInventorySchema), updateInventory)

// Заявки на закупку
router.get('/purchase-requests', getPurchaseRequests)
router.post('/purchase-requests', validate(createPurchaseRequestSchema), createPurchaseRequest)
router.delete('/purchase-requests/:id', validate(idParamSchema), deletePurchaseRequest)

export default router
