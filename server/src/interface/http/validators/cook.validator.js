import Joi from 'joi'

export const updateInventorySchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    quantityChange: Joi.number().not(0).required().messages({
      'any.required': 'Изменение количества обязательно',
      'any.invalid': 'Изменение количества не может быть 0',
    }),
    reason: Joi.string().max(500).allow('').optional(),
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

export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().required().max(255).messages({
      'any.required': 'Название продукта обязательно',
      'string.max': 'Название не должно превышать 255 символов',
    }),
    unit: Joi.string().required().max(50).messages({
      'any.required': 'Единица измерения обязательна',
      'string.max': 'Единица измерения не должна превышать 50 символов',
    }),
    quantity: Joi.number().min(0).default(0).messages({
      'number.min': 'Количество не может быть отрицательным',
    }),
    minQuantity: Joi.number().min(0).default(0).messages({
      'number.min': 'Минимальное количество не может быть отрицательным',
    }),
    createPurchaseRequest: Joi.boolean().default(false),
    purchaseQuantity: Joi.number().min(1).when('createPurchaseRequest', {
      is: true,
      then: Joi.required().messages({
        'any.required': 'Укажите количество для заявки',
      }),
    }),
    purchaseComment: Joi.string().max(500).optional(),
  }),
}

export const updateProductSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().max(255).optional(),
    unit: Joi.string().max(50).optional(),
    minQuantity: Joi.number().min(0).optional(),
  }),
}

export const idParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
}

export const updateIngredientsSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    ingredients: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required().messages({
          'any.required': 'ID продукта обязательно',
        }),
        quantity: Joi.number().positive().required().messages({
          'number.positive': 'Количество должно быть положительным',
          'any.required': 'Количество обязательно',
        }),
      })
    ).required().messages({
      'any.required': 'Список ингредиентов обязателен',
    }),
  }),
}
