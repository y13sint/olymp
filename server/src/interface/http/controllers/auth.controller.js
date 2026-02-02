import { ApiError } from '../../../shared/errors/index.js'
import { hashPassword, comparePassword } from '../../../shared/services/password.service.js'
import {
  generateTokens,
  verifyRefreshToken,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  REFRESH_TOKEN_LIFETIME,
} from '../../../shared/services/jwt.service.js'
import { generateCsrfToken, setCsrfCookie } from '../middleware/index.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { User } = db

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TOKEN_LIFETIME,
  path: '/api/auth',
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS)
}

function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', { path: '/api/auth' })
}

function clearCsrfCookie(res) {
  res.clearCookie('XSRF-TOKEN', { path: '/' })
}

export async function register(req, res, next) {
  try {
    const { email, password, fullName, classNumber, classLetter } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) throw ApiError.conflict('Пользователь с таким email уже существует')

    const passwordHash = await hashPassword(password)
    const user = await User.create({
      email, passwordHash, fullName, role: 'student',
      classNumber: classNumber || null,
      classLetter: classLetter ? classLetter.toUpperCase() : null,
      balance: 0,
    })

    const { accessToken, refreshToken } = generateTokens(user)
    await saveRefreshToken(user.id, refreshToken)
    setRefreshTokenCookie(res, refreshToken)
    setCsrfCookie(res, generateCsrfToken())

    res.status(201).json({ message: 'Регистрация успешна', user: user.toJSON(), accessToken })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) throw ApiError.unauthorized('Неверный email или пароль')

    const isValidPassword = await comparePassword(password, user.passwordHash)
    if (!isValidPassword) throw ApiError.unauthorized('Неверный email или пароль')

    const { accessToken, refreshToken } = generateTokens(user)
    await saveRefreshToken(user.id, refreshToken)
    setRefreshTokenCookie(res, refreshToken)
    setCsrfCookie(res, generateCsrfToken())

    res.json({ message: 'Авторизация успешна', user: user.toJSON(), accessToken })
  } catch (error) {
    next(error)
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!refreshToken) throw ApiError.unauthorized('Refresh token не предоставлен')

    const storedToken = await findRefreshToken(refreshToken)
    if (!storedToken) throw ApiError.unauthorized('Refresh token не найден или отозван')

    if (storedToken.isExpired()) {
      await deleteRefreshToken(refreshToken)
      clearRefreshTokenCookie(res)
      throw ApiError.unauthorized('Refresh token истёк')
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      await deleteRefreshToken(refreshToken)
      clearRefreshTokenCookie(res)
      throw ApiError.unauthorized('Недействительный refresh token')
    }

    const user = await User.findByPk(payload.id)
    if (!user) {
      await deleteRefreshToken(refreshToken)
      clearRefreshTokenCookie(res)
      throw ApiError.unauthorized('Пользователь не найден')
    }

    await deleteRefreshToken(refreshToken)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)
    await saveRefreshToken(user.id, newRefreshToken)
    setRefreshTokenCookie(res, newRefreshToken)
    setCsrfCookie(res, generateCsrfToken())

    res.json({ message: 'Токены обновлены', accessToken })
  } catch (error) {
    next(error)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { association: 'allergies', attributes: ['id', 'allergenName'] },
        { association: 'subscriptions', where: { isActive: true }, required: false, attributes: ['id', 'type', 'startDate', 'endDate', 'isActive'] },
      ],
    })
    if (!user) throw ApiError.notFound('Пользователь не найден')
    res.json({ user: user.toJSON() })
  } catch (error) {
    next(error)
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) await deleteRefreshToken(refreshToken)
    clearRefreshTokenCookie(res)
    clearCsrfCookie(res)
    res.json({ message: 'Выход выполнен успешно' })
  } catch (error) {
    next(error)
  }
}

export async function logoutAll(req, res, next) {
  try {
    await deleteAllUserRefreshTokens(req.user.id)
    clearRefreshTokenCookie(res)
    clearCsrfCookie(res)
    res.json({ message: 'Выход со всех устройств выполнен' })
  } catch (error) {
    next(error)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user) throw ApiError.notFound('Пользователь не найден')

    const isValidPassword = await comparePassword(currentPassword, user.passwordHash)
    if (!isValidPassword) throw ApiError.badRequest('Неверный текущий пароль')

    await user.update({ passwordHash: await hashPassword(newPassword) })
    res.json({ message: 'Пароль успешно изменён' })
  } catch (error) {
    next(error)
  }
}
