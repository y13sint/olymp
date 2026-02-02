import { Op } from 'sequelize'
import { ApiError } from '../../../shared/errors/index.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { MenuDay, MenuItem, Review } = db

/**
 * Получить понедельник для заданной даты
 */
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Воскресенье = 0
  return new Date(d.setDate(diff))
}

/**
 * Добавить средний рейтинг к блюдам
 */
function addRatingsToItems(menuDays) {
  return menuDays.map((day) => ({
    ...day.toJSON(),
    menuItems: (day.menuItems || []).map((item) => {
      const reviews = item.reviews || []
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null
      return {
        ...item.toJSON(),
        avgRating: avgRating ? parseFloat(avgRating) : null,
        reviewsCount: reviews.length,
        reviews: undefined,
      }
    }),
  }))
}

/**
 * Получить меню на неделю (старый API для совместимости)
 * GET /api/menu
 */
export async function getWeekMenu(req, res, next) {
  try {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const menuDays = await MenuDay.findAll({
      where: {
        menuDate: {
          [Op.between]: [today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]],
        },
        isActive: true,
      },
      include: [
        {
          association: 'menuItems',
          where: { isAvailable: true },
          required: false,
          include: [
            {
              association: 'reviews',
              attributes: ['rating'],
              required: false,
            },
          ],
        },
      ],
      order: [['menuDate', 'ASC']],
    })

    res.json({ menu: addRatingsToItems(menuDays) })
  } catch (error) {
    next(error)
  }
}

/**
 * Получить меню на неделю по стартовой дате (понедельник)
 * GET /api/menu/week?startDate=YYYY-MM-DD
 */
export async function getWeekMenuByStartDate(req, res, next) {
  try {
    const { startDate } = req.query

    // Определяем понедельник недели
    const monday = startDate
      ? getMonday(new Date(startDate))
      : getMonday(new Date())

    // Воскресенье = понедельник + 6 дней
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const startStr = monday.toISOString().split('T')[0]
    const endStr = sunday.toISOString().split('T')[0]

    const menuDays = await MenuDay.findAll({
      where: {
        menuDate: {
          [Op.between]: [startStr, endStr],
        },
        isActive: true,
      },
      include: [
        {
          association: 'menuItems',
          where: { isAvailable: true },
          required: false,
          include: [
            {
              association: 'reviews',
              attributes: ['rating'],
              required: false,
            },
          ],
        },
      ],
      order: [['menuDate', 'ASC']],
    })

    res.json({
      menu: addRatingsToItems(menuDays),
      weekStart: startStr,
      weekEnd: endStr,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Получить меню на конкретную дату
 * GET /api/menu/:date
 */
export async function getMenuByDate(req, res, next) {
  try {
    const { date } = req.params

    const menuDay = await MenuDay.findOne({
      where: {
        menuDate: date,
        isActive: true,
      },
      include: [
        {
          association: 'menuItems',
          where: { isAvailable: true },
          required: false,
          include: [
            {
              association: 'reviews',
              attributes: ['id', 'rating', 'comment', 'createdAt'],
              include: [
                {
                  association: 'user',
                  attributes: ['id', 'fullName'],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!menuDay) {
      throw ApiError.notFound('Меню на эту дату не найдено')
    }

    res.json({ menu: menuDay })
  } catch (error) {
    next(error)
  }
}

/**
 * Получить отзывы на блюдо
 * GET /api/menu/items/:id/reviews
 */
export async function getMenuItemReviews(req, res, next) {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      attributes: ['id', 'name'],
    })
    if (!menuItem) throw ApiError.notFound('Блюдо не найдено')

    const reviews = await Review.findAll({
      where: { menuItemId: req.params.id },
      include: [
        {
          association: 'user',
          attributes: ['id', 'fullName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : null

    res.json({
      menuItem,
      reviews,
      avgRating,
      reviewsCount: reviews.length,
    })
  } catch (error) {
    next(error)
  }
}
