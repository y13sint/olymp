import Joi from 'joi'

export const updateInventorySchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    quantityChange: Joi.number().required().messages({
      'any.required': 'Изменение количества обязательно',
    }),
    reason: Joi.string().max(500).optional(),
  }),
}

export const createPurchaseRequestSchema = {
  body: Joi.object({
    productId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID продукта обязательно',
    }),
    quantity: Joi.number().positive().required().messages({
      'number.positive': 'Количество должно быть положительным',
      'any.required': 'Количество обязательно',
    }),
    comment: Joi.string().max(1000).optional(),
  }),
}

export const mealTypeQuerySchema = {
  query: Joi.object({
    mealType: Joi.string().valid('breakfast', 'lunch').optional(),
  }),
}
