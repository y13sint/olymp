import { verifyAccessToken } from '../../../shared/services/jwt.service.js'
import { ApiError } from '../../../shared/errors/index.js'

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw ApiError.unauthorized('Токен не предоставлен')

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw ApiError.unauthorized('Неверный формат токена')

    const payload = verifyAccessToken(parts[1])
    if (!payload) throw ApiError.unauthorized('Недействительный или истёкший токен')

    req.user = payload
    next()
  } catch (error) {
    next(error)
  }
}

export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized('Пользователь не авторизован')
      if (!allowedRoles.includes(req.user.role)) throw ApiError.forbidden('Недостаточно прав для выполнения операции')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const payload = verifyAccessToken(parts[1])
        if (payload) req.user = payload
      }
    }
    next()
  } catch (error) {
    next()
  }
}
