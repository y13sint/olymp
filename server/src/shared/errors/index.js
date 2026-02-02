export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.status = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') { super(message, 400) }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401) }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403) }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404) }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409) }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation error', details = null) {
    super(message, 400)
    this.details = details
  }
}

export class ApiError {
  static badRequest(message, details = null) {
    const error = new BadRequestError(message)
    error.details = details
    return error
  }

  static unauthorized(message = 'Не авторизован') {
    return new UnauthorizedError(message)
  }

  static forbidden(message = 'Доступ запрещён') {
    return new ForbiddenError(message)
  }

  static notFound(message = 'Не найдено') {
    return new NotFoundError(message)
  }

  static conflict(message = 'Конфликт данных') {
    return new ConflictError(message)
  }

  static validation(message, details = null) {
    return new ValidationError(message, details)
  }

  static internal(message = 'Внутренняя ошибка сервера') {
    return new AppError(message, 500)
  }
}
