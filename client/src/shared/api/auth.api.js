import { apiClient } from './index.js'

export const authApi = {
  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials)
    return data
  },

  register: async (userData) => {
    const { data } = await apiClient.post('/auth/register', userData)
    return data
  },

  refresh: async () => {
    const { data } = await apiClient.post('/auth/refresh')
    return data
  },

  getMe: async () => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  logout: async () => {
    const { data } = await apiClient.post('/auth/logout')
    return data
  },

  logoutAll: async () => {
    const { data } = await apiClient.post('/auth/logout-all')
    return data
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await apiClient.post('/auth/change-password', { currentPassword, newPassword })
    return data
  },
}
