import { apiClient } from './index'
import { buildParams } from '@shared/lib'

export const cookApi = {
  getTodayMeals: async ({ mealType, page, limit } = {}) => {
    const params = buildParams(mealType ? { mealType } : {}, { page, limit })
    const { data } = await apiClient.get('/cook/meals/today', { params })
    return data
  },

  getTodayMenu: async () => {
    const { data } = await apiClient.get('/cook/menu/today')
    return data
  },

  getInventory: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/cook/inventory', { params })
    return data
  },

  updateInventory: async (id, { quantityChange, reason }) => {
    const { data } = await apiClient.put(`/cook/inventory/${id}`, { quantityChange, reason })
    return data
  },

  createProduct: async (productData) => {
    const { data } = await apiClient.post('/cook/products', productData)
    return data
  },

  updateProduct: async (id, productData) => {
    const { data } = await apiClient.put(`/cook/products/${id}`, productData)
    return data
  },

  deleteProduct: async (id) => {
    const { data } = await apiClient.delete(`/cook/products/${id}`)
    return data
  },

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

  getMenuItemIngredients: async (menuItemId) => {
    const { data } = await apiClient.get(`/cook/menu-items/${menuItemId}/ingredients`)
    return data
  },

  updateMenuItemIngredients: async (menuItemId, ingredients) => {
    const { data } = await apiClient.put(`/cook/menu-items/${menuItemId}/ingredients`, { ingredients })
    return data
  },
}
