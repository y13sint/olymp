import Joi from 'joi'

export const createPaymentSchema = {
  body: Joi.object({
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Сумма должна быть положительной',
      'any.required': 'Сумма обязательна',
    }),
    description: Joi.string().max(500).optional(),
  }),
}

export const createSubscriptionSchema = {
  body: Joi.object({
    type: Joi.string().valid('breakfast', 'lunch', 'full').required().messages({
      'any.only': 'Тип должен быть breakfast, lunch или full',
      'any.required': 'Тип абонемента обязателен',
    }),
    days: Joi.number().integer().min(1).max(90).required().messages({
      'number.min': 'Минимум 1 день',
      'number.max': 'Максимум 90 дней',
      'any.required': 'Количество дней обязательно',
    }),
  }),
}

export const pickupMealSchema = {
  body: Joi.object({
    menuItemId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID блюда обязательно',
    }),
  }),
}

export const allergySchema = {
  body: Joi.object({
    allergenName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Название аллергена минимум 2 символа',
      'any.required': 'Название аллергена обязательно',
    }),
  }),
}

export const preferenceSchema = {
  body: Joi.object({
    preferenceName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Название предпочтения минимум 2 символа',
      'any.required': 'Название предпочтения обязательно',
    }),
  }),
}

export const reviewSchema = {
  body: Joi.object({
    menuItemId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID блюда обязательно',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Рейтинг от 1 до 5',
      'number.max': 'Рейтинг от 1 до 5',
      'any.required': 'Рейтинг обязателен',
    }),
    comment: Joi.string().max(1000).optional().allow(''),
  }),
}

export const dateParamSchema = {
  params: Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
    }),
  }),
}

export const idParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
}
