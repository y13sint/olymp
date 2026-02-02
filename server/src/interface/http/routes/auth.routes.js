import { Router } from 'express'
import { register, login, refresh, me, logout, logoutAll, changePassword } from '../controllers/auth.controller.js'
import { authMiddleware, validate } from '../middleware/index.js'
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from '../validators/auth.validator.js'

const router = Router()

// POST /api/auth/register - Регистрация ученика
router.post('/register', validate(registerSchema), register)

// POST /api/auth/login - Авторизация
router.post('/login', validate(loginSchema), login)

// POST /api/auth/refresh - Обновление токенов (токен из cookie или body)
router.post('/refresh', validate(refreshTokenSchema), refresh)

// GET /api/auth/me - Текущий пользователь
router.get('/me', authMiddleware, me)

// POST /api/auth/logout - Выход с текущего устройства
router.post('/logout', logout) // Без authMiddleware - работает по cookie

// POST /api/auth/logout-all - Выход со всех устройств
router.post('/logout-all', authMiddleware, logoutAll)

// POST /api/auth/change-password - Смена пароля
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword)

export default router
