import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { httpLogger } from '../../shared/services/logger.service.js'
import { csrfMiddleware } from './middleware/index.js'

import authRoutes from './routes/auth.routes.js'
import menuRoutes from './routes/menu.routes.js'
import studentRoutes from './routes/student.routes.js'
import cookRoutes from './routes/cook.routes.js'
import adminRoutes from './routes/admin.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import templateRoutes from './routes/template.routes.js'

export const app = express()

app.use(helmet())
app.use(httpLogger)

// Лимит только для login/register
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15, 
  message: { success: false, error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['login', 'register'].some(path => req.path.includes(path)),
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/api/', apiLimiter)
app.use('/api/', csrfMiddleware)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', loginLimiter, authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/cook', cookRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin', templateRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' })
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500
  const response = { success: false, error: err.message || 'Внутренняя ошибка сервера' }
  if (err.details) response.details = err.details
  if (process.env.NODE_ENV === 'development' && statusCode === 500) response.stack = err.stack
  res.status(statusCode).json(response)
})
