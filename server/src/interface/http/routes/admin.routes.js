import { Router } from 'express'
import {
  getPaymentStats,
  getAttendanceStats,
  getAllPurchaseRequests,
  updatePurchaseRequest,
  getReport,
  exportReport,
  getAllMenuDays,
  createMenuDay,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
} from '../controllers/admin.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  dateRangeQuerySchema,
  purchaseRequestStatusSchema,
  createMenuDaySchema,
  addMenuItemSchema,
  updateMenuItemSchema,
  createUserSchema,
  updateUserSchema,
} from '../validators/admin.validator.js'
import { idParamSchema } from '../validators/student.validator.js'

const router = Router()

// Все роуты требуют авторизации админа
router.use(authMiddleware)
router.use(roleMiddleware('admin'))

// Статистика
router.get('/stats/payments', validate(dateRangeQuerySchema), getPaymentStats)
router.get('/stats/attendance', validate(dateRangeQuerySchema), getAttendanceStats)

// Заявки на закупку
router.get('/purchase-requests', getAllPurchaseRequests)
router.put('/purchase-requests/:id', validate(purchaseRequestStatusSchema), updatePurchaseRequest)

// Отчёты
router.get('/reports', validate(dateRangeQuerySchema), getReport)
router.get('/reports/export', validate(dateRangeQuerySchema), exportReport)

// Управление меню
router.get('/menu', getAllMenuDays)
router.post('/menu', validate(createMenuDaySchema), createMenuDay)
router.post('/menu/:dayId/items', validate(addMenuItemSchema), addMenuItem)
router.put('/menu/items/:id', validate(updateMenuItemSchema), updateMenuItem)
router.delete('/menu/items/:id', validate(idParamSchema), deleteMenuItem)

// Управление пользователями
router.get('/users', getAllUsers)
router.post('/users', validate(createUserSchema), createUser)
router.put('/users/:id', validate(updateUserSchema), updateUser)
router.delete('/users/:id', validate(idParamSchema), deleteUser)
router.post('/users/:id/restore', validate(idParamSchema), restoreUser)

export default router
