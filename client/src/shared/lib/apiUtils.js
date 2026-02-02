import { DEFAULT_PAGE_SIZE } from '@shared/constants'


export function buildParams(filters = {}, pagination = {}) {
  const params = { ...filters }
  if (pagination.page !== undefined) params.page = pagination.page
  if (pagination.limit !== undefined) params.limit = pagination.limit
  else if (pagination.page !== undefined) params.limit = DEFAULT_PAGE_SIZE
  return params
}
