import Joi from 'joi'

export const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Некорректный email',
      'any.required': 'Email обязателен',
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'any.required': 'Пароль обязателен',
    }),
    confirmPassword: Joi.string().optional().strip(),
    fullName: Joi.string().min(2).max(255).required().messages({
      'string.min': 'ФИО должно содержать минимум 2 символа',
      'any.required': 'ФИО обязательно',
    }),
    classNumber: Joi.number().integer().min(1).max(11).optional().allow(null).messages({
      'number.min': 'Класс должен быть от 1 до 11',
      'number.max': 'Класс должен быть от 1 до 11',
    }),
    classLetter: Joi.string().length(1).uppercase().optional().allow(null, '').messages({
      'string.length': 'Буква класса должна быть одним символом',
    }),
  }),
}

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Некорректный email',
      'any.required': 'Email обязателен',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Пароль обязателен',
    }),
  }),
}

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
}

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Текущий пароль обязателен',
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'any.required': 'Новый пароль обязателен',
    }),
  }),
}
