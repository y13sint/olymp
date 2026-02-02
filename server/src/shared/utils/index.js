export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export function parsePagination(query, defaultLimit = DEFAULT_PAGE_SIZE) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  let limit = parseInt(query.limit, 10) || defaultLimit
  limit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE)
  const offset = (page - 1) * limit
  return { limit, offset, page }
}

export function paginatedResponse(rows, count, page, limit) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasMore: page * limit < count,
    },
  }
}
