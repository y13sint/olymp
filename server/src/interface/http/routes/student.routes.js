import { Router } from 'express'
import {
  createPayment,
  createSubscription,
  getPayments,
  pickupMeal,
  getMyMeals,
  confirmMealReceived,
  getAllergies,
  addAllergy,
  deleteAllergy,
  getPreferences,
  addPreference,
  deletePreference,
  createReview,
  getMyReviews,
  deleteReview,
} from '../controllers/student.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  createPaymentSchema,
  createSubscriptionSchema,
  pickupMealSchema,
  allergySchema,
  preferenceSchema,
  reviewSchema,
  idParamSchema,
} from '../validators/student.validator.js'

const router = Router()

// Все роуты требуют авторизации ученика
router.use(authMiddleware)
router.use(roleMiddleware('student'))

// Платежи
router.post('/payments', validate(createPaymentSchema), createPayment)
router.get('/payments', getPayments)

// Абонементы
router.post('/subscriptions', validate(createSubscriptionSchema), createSubscription)

// Питание
router.post('/meals/pickup', validate(pickupMealSchema), pickupMeal)
router.get('/meals', getMyMeals)
router.post('/meals/:id/confirm', validate(idParamSchema), confirmMealReceived)

// Аллергии
router.get('/allergies', getAllergies)
router.post('/allergies', validate(allergySchema), addAllergy)
router.delete('/allergies/:id', validate(idParamSchema), deleteAllergy)

// Предпочтения
router.get('/preferences', getPreferences)
router.post('/preferences', validate(preferenceSchema), addPreference)
router.delete('/preferences/:id', validate(idParamSchema), deletePreference)

// Отзывы
router.get('/reviews', getMyReviews)
router.post('/reviews', validate(reviewSchema), createReview)
router.delete('/reviews/:id', validate(idParamSchema), deleteReview)

export default router
