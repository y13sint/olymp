import { Router } from 'express'
import { getWeekMenu, getWeekMenuByStartDate, getMenuByDate, getMenuItemReviews } from '../controllers/menu.controller.js'
import { validate } from '../middleware/index.js'
import { dateParamSchema, weekQuerySchema, menuItemIdSchema } from '../validators/menu.validator.js'

const router = Router()

// GET /api/menu - Меню на неделю (старый API)
router.get('/', getWeekMenu)

// GET /api/menu/week - Меню на неделю по стартовой дате
router.get('/week', validate(weekQuerySchema), getWeekMenuByStartDate)

// GET /api/menu/items/:id/reviews - Отзывы на блюдо
router.get('/items/:id/reviews', validate(menuItemIdSchema), getMenuItemReviews)

// GET /api/menu/:date - Меню на дату
router.get('/:date', validate(dateParamSchema), getMenuByDate)

export default router
