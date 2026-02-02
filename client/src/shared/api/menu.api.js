import { apiClient } from './index.js'

export const menuApi = {
  getWeekMenu: async () => {
    const { data } = await apiClient.get('/menu')
    return data
  },

  getWeekMenuByDate: async (startDate) => {
    const params = startDate ? { startDate } : {}
    const { data } = await apiClient.get('/menu/week', { params })
    return data
  },

  getMenuByDate: async (date) => {
    const { data } = await apiClient.get(`/menu/${date}`)
    return data
  },

  getMenuItemReviews: async (menuItemId) => {
    const { data } = await apiClient.get(`/menu/items/${menuItemId}/reviews`)
    return data
  },
}
