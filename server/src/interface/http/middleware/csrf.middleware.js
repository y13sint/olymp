import crypto from 'crypto'
import { ApiError } from '../../../shared/errors/index.js'

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'x-csrf-token'

const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function setCsrfCookie(res, token) {
  res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS)
}

export function csrfMiddleware(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method)) return next()

  // Публичные пути - проверяем и с /api/ префиксом и без (зависит от того, как middleware подключен)
  const publicPaths = [
    '/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout',
    '/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'
  ]
  if (publicPaths.includes(req.path)) return next()

  const cookieToken = req.cookies[CSRF_COOKIE_NAME]
  const headerToken = req.headers[CSRF_HEADER_NAME]

  if (!cookieToken || !headerToken) return next(ApiError.forbidden('CSRF токен отсутствует'))
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return next(ApiError.forbidden('Недействительный CSRF токен'))
  }

  next()
}

export function ensureCsrfToken(req, res, next) {
  if (!req.cookies[CSRF_COOKIE_NAME]) setCsrfCookie(res, generateCsrfToken())
  next()
}
