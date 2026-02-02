import { apiClient } from './index.js'
import dayjs from 'dayjs'

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

  getTodayMenu: async () => {
    const today = dayjs().format('YYYY-MM-DD')
    const { data } = await apiClient.get('/menu')
    const todayMenu = data.menuDays?.find(day => day.menuDate === today)
    return { menu: todayMenu || null, menuItems: todayMenu?.menuItems || [] }
  },

  getMenuItemReviews: async (menuItemId) => {
    const { data } = await apiClient.get(`/menu/items/${menuItemId}/reviews`)
    return data
  },
}
