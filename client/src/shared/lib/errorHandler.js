import { message } from 'antd'

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
}

const ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'Некорректный запрос',
  [HTTP_STATUS.UNAUTHORIZED]: 'Необходима авторизация',
  [HTTP_STATUS.FORBIDDEN]: 'Нет доступа к этому ресурсу',
  [HTTP_STATUS.NOT_FOUND]: 'Ресурс не найден',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Ошибка валидации данных',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Ошибка сервера. Попробуйте позже.',
  network: 'Сервер недоступен. Проверьте подключение к сети.',
  unknown: 'Произошла неизвестная ошибка',
}

export function getErrorMessage(error) {
  if (error?.isNetworkError || !error?.response) {
    return ERROR_MESSAGES.network
  }

  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error || error?.response?.data?.message

  if (serverMessage) return serverMessage
  if (status && ERROR_MESSAGES[status]) return ERROR_MESSAGES[status]
  if (status >= 500) return ERROR_MESSAGES[HTTP_STATUS.INTERNAL_SERVER_ERROR]

  return error?.message || ERROR_MESSAGES.unknown
}

export function showErrorMessage(error, customMessage) {
  message.error(customMessage || getErrorMessage(error))
}

export function handleMutationError(error) {
  if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED) return
  showErrorMessage(error)
}

export function handleQueryError(error) {
  if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED) return
  console.error('Query error:', error)
}

export function isNetworkError(error) {
  return error?.isNetworkError || !error?.response
}

export function isUnauthorizedError(error) {
  return error?.response?.status === HTTP_STATUS.UNAUTHORIZED
}

export function isForbiddenError(error) {
  return error?.response?.status === HTTP_STATUS.FORBIDDEN
}

export function isNotFoundError(error) {
  return error?.response?.status === HTTP_STATUS.NOT_FOUND
}

export function isValidationError(error) {
  const status = error?.response?.status
  return status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY
}
