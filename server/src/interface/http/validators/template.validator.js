import Joi from 'joi'

// ==================== ШАБЛОНЫ ДНЕЙ ====================

export const createTemplateSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'any.required': 'Название шаблона обязательно',
      'string.min': 'Название минимум 2 символа',
    }),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
}

export const updateTemplateSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
}

export const addTemplateItemSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
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

export const updateTemplateItemSchema = {
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
  }),
}

// ==================== ГРУППЫ ШАБЛОНОВ ====================

export const createGroupSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'any.required': 'Название группы обязательно',
    }),
    dayOfWeek: Joi.number().integer().min(1).max(7).optional().allow(null),
    templateIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  }),
}

export const updateGroupSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    dayOfWeek: Joi.number().integer().min(1).max(7).optional().allow(null),
    templateIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  }),
}

// ==================== НЕДЕЛЬНЫЕ ШАБЛОНЫ ====================

const weekSlotSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(1).max(7).required(),
  templateId: Joi.number().integer().positive().optional().allow(null),
  groupId: Joi.number().integer().positive().optional().allow(null),
}).custom((value, helpers) => {
  // XOR валидация: либо templateId, либо groupId, но не оба одновременно
  const hasTemplate = value.templateId !== null && value.templateId !== undefined
  const hasGroup = value.groupId !== null && value.groupId !== undefined

  if (hasTemplate && hasGroup) {
    return helpers.error('any.custom', {
      message: 'Слот может содержать либо templateId, либо groupId, но не оба одновременно',
    })
  }

  return value
}).messages({
  'any.custom': '{{#message}}',
})

export const createWeekTemplateSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'any.required': 'Название недельного шаблона обязательно',
    }),
    slots: Joi.array().items(weekSlotSchema).optional(),
  }),
}

export const updateWeekTemplateSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    slots: Joi.array().items(weekSlotSchema).optional(),
  }),
}

// ==================== ПРИМЕНЕНИЕ ШАБЛОНОВ ====================

export const applyDaySchema = {
  body: Joi.object({
    templateId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID шаблона обязателен',
    }),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
      'any.required': 'Дата обязательна',
    }),
    overwrite: Joi.boolean().optional().default(true),
  }),
}

export const applyWeekSchema = {
  body: Joi.object({
    weekTemplateId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID недельного шаблона обязателен',
    }),
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Дата должна быть в формате YYYY-MM-DD',
      'any.required': 'Дата начала обязательна',
    }),
    overwrite: Joi.boolean().optional().default(true),
  }),
}

export const applyBulkSchema = {
  body: Joi.object({
    templateId: Joi.number().integer().positive().when('mode', {
      is: 'template',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    groupId: Joi.number().integer().positive().when('mode', {
      is: 'shuffle',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    mode: Joi.string().valid('template', 'shuffle').required().messages({
      'any.only': 'Режим должен быть template или shuffle',
      'any.required': 'Режим обязателен',
    }),
    target: Joi.object({
      type: Joi.string().valid('weekdays', 'dates', 'period').required(),
      weekdays: Joi.array().items(Joi.number().integer().min(1).max(7)).when('type', {
        is: Joi.valid('weekdays', 'period'),
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
      weeksAhead: Joi.number().integer().min(1).max(52).when('type', {
        is: 'weekdays',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
      dates: Joi.array().items(Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)).when('type', {
        is: 'dates',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      period: Joi.object({
        from: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        to: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
      }).when('type', {
        is: 'period',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    }).required(),
    overwrite: Joi.boolean().optional().default(true),
  }),
}

export const idParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
}
