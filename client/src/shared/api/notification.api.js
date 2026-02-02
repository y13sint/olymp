import { apiClient } from './index'
import { DEFAULT_PAGE_SIZE } from '@shared/constants'

export const notificationApi = {
  getNotifications: async ({ unreadOnly = false, page, limit } = {}) => {
    const params = {}
    if (unreadOnly) params.unreadOnly = 'true'
    if (page !== undefined) params.page = page
    if (limit !== undefined) params.limit = limit
    else if (page !== undefined) params.limit = DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get('/notifications', { params })
    return data
  },

  markAsRead: async (id) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`)
    return data
  },

  markAllAsRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all')
    return data
  },

  deleteNotification: async (id) => {
    const { data } = await apiClient.delete(`/notifications/${id}`)
    return data
  },

  broadcast: async ({ title, message, role }) => {
    const { data } = await apiClient.post('/notifications/broadcast', { title, message, role })
    return data
  },
}
