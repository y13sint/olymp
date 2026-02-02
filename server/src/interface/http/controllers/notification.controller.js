import { Op } from 'sequelize'
import { ApiError } from '../../../shared/errors/index.js'
import { parsePagination, paginatedResponse } from '../../../shared/utils/index.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { Notification, User } = db

/**
 * Получить уведомления текущего пользователя (с пагинацией)
 * GET /api/notifications?page=1&limit=20&unreadOnly=true
 */
export async function getMyNotifications(req, res, next) {
  try {
    const userId = req.user.id
    const { unreadOnly } = req.query
    const { limit, offset, page } = parsePagination(req.query)

    const where = { userId }
    if (unreadOnly === 'true') {
      where.isRead = false
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    })

    res.json({
      notifications: rows,
      unreadCount,
      ...paginatedResponse(rows, count, page, limit).pagination,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Отметить уведомление как прочитанное
 * PUT /api/notifications/:id/read
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const notification = await Notification.findOne({
      where: { id, userId },
    })

    if (!notification) {
      throw ApiError.notFound('Уведомление не найдено')
    }

    notification.isRead = true
    await notification.save()

    res.json({ message: 'Уведомление прочитано', notification })
  } catch (error) {
    next(error)
  }
}

/**
 * Отметить все уведомления как прочитанные
 * PUT /api/notifications/read-all
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    )

    res.json({ message: 'Все уведомления прочитаны' })
  } catch (error) {
    next(error)
  }
}

/**
 * Удалить уведомление
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const deleted = await Notification.destroy({
      where: { id, userId },
    })

    if (!deleted) {
      throw ApiError.notFound('Уведомление не найдено')
    }

    res.json({ message: 'Уведомление удалено' })
  } catch (error) {
    next(error)
  }
}

/**
 * Создать уведомление (для внутреннего использования / админа)
 * POST /api/notifications (admin only)
 */
export async function createNotification(req, res, next) {
  try {
    const { userId, title, message } = req.body

    // Проверяем существование пользователя
    const user = await User.findByPk(userId)
    if (!user) {
      throw ApiError.notFound('Пользователь не найден')
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      isRead: false,
    })

    res.status(201).json({ notification })
  } catch (error) {
    next(error)
  }
}

/**
 * Отправить уведомление всем пользователям с определённой ролью
 * POST /api/notifications/broadcast (admin only)
 */
export async function broadcastNotification(req, res, next) {
  try {
    const { title, message, role } = req.body

    const where = {}
    if (role) {
      where.role = role
    }

    const users = await User.findAll({ where, attributes: ['id'] })

    const notifications = await Notification.bulkCreate(
      users.map((user) => ({
        userId: user.id,
        title,
        message,
        isRead: false,
      }))
    )

    res.status(201).json({
      message: `Уведомление отправлено ${notifications.length} пользователям`,
      count: notifications.length,
    })
  } catch (error) {
    next(error)
  }
}
