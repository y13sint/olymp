import { ApiError } from '../../../shared/errors/index.js'

/**
 * Middleware для валидации запроса с помощью Joi схемы
 * @param {Object} schema - объект с Joi схемами для body, query, params
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = []

    // Валидация body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, { abortEarly: false })
      if (error) {
        errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })))
      } else {
        req.body = value
      }
    }

    // Валидация query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, { abortEarly: false })
      if (error) {
        errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })))
      } else {
        req.query = value
      }
    }

    // Валидация params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, { abortEarly: false })
      if (error) {
        errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })))
      } else {
        req.params = value
      }
    }

    if (errors.length > 0) {
      return next(ApiError.validation('Ошибка валидации', errors))
    }

    next()
  }
}
