import { apiClient } from './index'
import { buildParams } from '@shared/lib'

export const cookApi = {
  // Учёт выданных блюд (только просмотр)
  getTodayMeals: async ({ mealType, page, limit } = {}) => {
    const params = buildParams(mealType ? { mealType } : {}, { page, limit })
    const { data } = await apiClient.get('/cook/meals/today', { params })
    return data
  },

  // Склад
  getInventory: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/cook/inventory', { params })
    return data
  },

  updateInventory: async (id, { quantityChange, reason }) => {
    const { data } = await apiClient.put(`/cook/inventory/${id}`, { quantityChange, reason })
    return data
  },

  // Заявки
  getPurchaseRequests: async ({ status, page, limit } = {}) => {
    const params = buildParams(status ? { status } : {}, { page, limit })
    const { data } = await apiClient.get('/cook/purchase-requests', { params })
    return data
  },

  createPurchaseRequest: async (requestData) => {
    const { data } = await apiClient.post('/cook/purchase-requests', requestData)
    return data
  },

  deletePurchaseRequest: async (id) => {
    const { data } = await apiClient.delete(`/cook/purchase-requests/${id}`)
    return data
  },
}
