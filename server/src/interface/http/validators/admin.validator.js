import Joi from 'joi'

export const dateRangeQuerySchema = {
  query: Joi.object({
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
}

export const purchaseRequestStatusSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'any.only': 'Статус должен быть approved или rejected',
      'any.required': 'Статус обязателен',
    }),
  }),
}

export const createMenuDaySchema = {
  body: Joi.object({
    menuDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
      'any.required': 'Дата обязательна',
    }),
    isActive: Joi.boolean().optional(),
  }),
}

export const addMenuItemSchema = {
  params: Joi.object({
    dayId: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'any.required': 'Название блюда обязательно',
    }),
    description: Joi.string().max(1000).optional().allow(''),
    price: Joi.number().positive().required().messages({
      'any.required': 'Цена обязательна',
    }),
    mealType: Joi.string().valid('breakfast', 'lunch').required().messages({
      'any.only': 'Тип должен быть breakfast или lunch',
      'any.required': 'Тип блюда обязателен',
    }),
    allergens: Joi.string().max(500).optional().allow('', null),
    calories: Joi.number().integer().positive().optional().allow(null),
  }),
}

export const updateMenuItemSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).optional().allow(''),
    price: Joi.number().positive().optional(),
    mealType: Joi.string().valid('breakfast', 'lunch').optional(),
    allergens: Joi.string().max(500).optional().allow('', null),
    calories: Joi.number().integer().positive().optional().allow(null),
    isAvailable: Joi.boolean().optional(),
  }),
}

export const createUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Некорректный email',
      'any.required': 'Email обязателен',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Пароль минимум 6 символов',
      'any.required': 'Пароль обязателен',
    }),
    fullName: Joi.string().min(2).max(255).required().messages({
      'any.required': 'ФИО обязательно',
    }),
    role: Joi.string().valid('student', 'cook', 'admin').required().messages({
      'any.only': 'Роль должна быть student, cook или admin',
      'any.required': 'Роль обязательна',
    }),
  }),
}

export const updateUserSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    fullName: Joi.string().min(2).max(255).optional(),
    role: Joi.string().valid('student', 'cook', 'admin').optional(),
    classNumber: Joi.number().integer().min(1).max(11).optional().allow(null),
    classLetter: Joi.string().length(1).optional().allow(null),
    balance: Joi.number().min(0).optional(),
  }),
}
