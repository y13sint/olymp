import { apiClient } from './index'
import { buildParams } from '@shared/lib'

export const adminApi = {
  // Статистика
  getPaymentStats: async (startDate, endDate) => {
    const params = startDate && endDate ? { startDate, endDate } : {}
    const { data } = await apiClient.get('/admin/stats/payments', { params })
    return data
  },

  getAttendanceStats: async (startDate, endDate) => {
    const params = startDate && endDate ? { startDate, endDate } : {}
    const { data } = await apiClient.get('/admin/stats/attendance', { params })
    return data
  },

  // Заявки
  getPurchaseRequests: async ({ status, page, limit } = {}) => {
    const params = buildParams(status ? { status } : {}, { page, limit })
    const { data } = await apiClient.get('/admin/purchase-requests', { params })
    return data
  },

  updatePurchaseRequest: async (id, status) => {
    const { data } = await apiClient.put(`/admin/purchase-requests/${id}`, { status })
    return data
  },

  // Отчёты
  getReport: async (startDate, endDate, pagination = {}) => {
    const params = buildParams(startDate && endDate ? { startDate, endDate } : {}, pagination)
    const { data } = await apiClient.get('/admin/reports', { params })
    return data
  },

  exportReport: async (startDate, endDate) => {
    const params = startDate && endDate ? { startDate, endDate } : {}
    const response = await apiClient.get('/admin/reports/export', {
      params,
      responseType: 'blob',
    })
    
    // Создаём ссылку для скачивания
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_${startDate || 'all'}_${endDate || 'all'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // Меню
  getMenuDays: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/admin/menu', { params })
    return data
  },

  createMenuDay: async (menuDate, isActive = true) => {
    const { data } = await apiClient.post('/admin/menu', { menuDate, isActive })
    return data
  },

  addMenuItem: async (dayId, itemData) => {
    const { data } = await apiClient.post(`/admin/menu/${dayId}/items`, itemData)
    return data
  },

  updateMenuItem: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/menu/items/${id}`, updates)
    return data
  },

  deleteMenuItem: async (id) => {
    const { data } = await apiClient.delete(`/admin/menu/items/${id}`)
    return data
  },

  // Пользователи
  getUsers: async ({ role, page, limit } = {}) => {
    const params = buildParams(role ? { role } : {}, { page, limit })
    const { data } = await apiClient.get('/admin/users', { params })
    return data
  },

  createUser: async (userData) => {
    const { data } = await apiClient.post('/admin/users', userData)
    return data
  },

  updateUser: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/users/${id}`, updates)
    return data
  },

  deleteUser: async (id) => {
    const { data } = await apiClient.delete(`/admin/users/${id}`)
    return data
  },
}
