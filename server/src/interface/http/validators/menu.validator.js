import Joi from 'joi'

export const weekQuerySchema = {
  query: Joi.object({
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
    }),
  }),
}

export const dateParamSchema = {
  params: Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
    }),
  }),
}

export const menuItemIdSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
}
