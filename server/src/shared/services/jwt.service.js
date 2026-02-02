import jwt from 'jsonwebtoken'
import db from '../../infrastructure/database/models/index.cjs'
import logger from './logger.service.js'

const { RefreshToken } = db

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN = '15m',
  JWT_REFRESH_EXPIRES_IN = '7d',
  MAX_SESSIONS: MAX_SESSIONS_ENV = '5',
} = process.env

const REFRESH_TOKEN_LIFETIME_MS = parseRefreshExpiry(JWT_REFRESH_EXPIRES_IN)
const MAX_SESSIONS_PER_USER = parseInt(MAX_SESSIONS_ENV, 10)

function parseRefreshExpiry(expiry) {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const value = parseInt(match[1])
  const unit = match[2]
  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return 7 * 24 * 60 * 60 * 1000
  }
}

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  logger.fatal('JWT_SECRET and JWT_REFRESH_SECRET must be set in .env!')
  process.exit(1)
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

export function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role }
  return { accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) }
}

export function verifyAccessToken(token) {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export function verifyRefreshToken(token) {
  try { return jwt.verify(token, JWT_REFRESH_SECRET) } catch { return null }
}

async function enforceSessionLimit(userId) {
  const tokens = await RefreshToken.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
  if (tokens.length >= MAX_SESSIONS_PER_USER) {
    const idsToDelete = tokens.slice(MAX_SESSIONS_PER_USER - 1).map(t => t.id)
    if (idsToDelete.length > 0) {
      const { Op } = db.Sequelize
      await RefreshToken.destroy({ where: { id: { [Op.in]: idsToDelete } } })
    }
  }
}

export async function saveRefreshToken(userId, token) {
  await enforceSessionLimit(userId)
  return RefreshToken.create({ userId, token, expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS) })
}

export async function findRefreshToken(token) {
  return RefreshToken.findOne({ where: { token } })
}

export async function deleteRefreshToken(token) {
  return RefreshToken.destroy({ where: { token } })
}

export async function deleteAllUserRefreshTokens(userId) {
  return RefreshToken.destroy({ where: { userId } })
}

export async function cleanupExpiredTokens() {
  const { Op } = db.Sequelize
  return RefreshToken.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } })
}

let cleanupIntervalId = null

export function startTokenCleanupJob(intervalMs = 60 * 60 * 1000) {
  cleanupExpiredTokens()
    .then((count) => count > 0 && logger.info({ count }, 'Cleaned up expired tokens'))
    .catch((err) => logger.error({ err }, 'Token cleanup failed'))

  cleanupIntervalId = setInterval(async () => {
    try {
      const count = await cleanupExpiredTokens()
      if (count > 0) logger.info({ count }, 'Cleaned up expired tokens')
    } catch (err) {
      logger.error({ err }, 'Token cleanup failed')
    }
  }, intervalMs)
}

export function stopTokenCleanupJob() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId)
    cleanupIntervalId = null
  }
}

export const REFRESH_TOKEN_LIFETIME = REFRESH_TOKEN_LIFETIME_MS
export const MAX_SESSIONS = MAX_SESSIONS_PER_USER
