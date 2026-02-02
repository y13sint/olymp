import Joi from 'joi'

export const createNotificationSchema = {
  body: Joi.object({
    userId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID пользователя обязателен',
    }),
    title: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Заголовок минимум 2 символа',
      'any.required': 'Заголовок обязателен',
    }),
    message: Joi.string().min(2).max(2000).required().messages({
      'string.min': 'Сообщение минимум 2 символа',
      'any.required': 'Сообщение обязательно',
    }),
  }),
}

export const broadcastNotificationSchema = {
  body: Joi.object({
    title: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Заголовок минимум 2 символа',
      'any.required': 'Заголовок обязателен',
    }),
    message: Joi.string().min(2).max(2000).required().messages({
      'string.min': 'Сообщение минимум 2 символа',
      'any.required': 'Сообщение обязательно',
    }),
    role: Joi.string().valid('student', 'cook', 'admin').optional().messages({
      'any.only': 'Роль должна быть student, cook или admin',
    }),
  }),
}
