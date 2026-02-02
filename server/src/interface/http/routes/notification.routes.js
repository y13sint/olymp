import { Router } from 'express'
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
} from '../controllers/notification.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  createNotificationSchema,
  broadcastNotificationSchema,
} from '../validators/notification.validator.js'
import { idParamSchema } from '../validators/student.validator.js'

const router = Router()

// Все роуты требуют авторизации
router.use(authMiddleware)

// Для всех авторизованных пользователей
router.get('/', getMyNotifications)
router.put('/read-all', markAllAsRead)
router.put('/:id/read', validate(idParamSchema), markAsRead)
router.delete('/:id', validate(idParamSchema), deleteNotification)

// Только для админов
router.post(
  '/',
  roleMiddleware('admin'),
  validate(createNotificationSchema),
  createNotification
)
router.post(
  '/broadcast',
  roleMiddleware('admin'),
  validate(broadcastNotificationSchema),
  broadcastNotification
)

export default router
