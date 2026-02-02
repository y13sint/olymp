import { apiClient } from './index'
import { buildParams } from '@shared/lib'

export const studentApi = {
  // Платежи
  createPayment: async (data) => {
    const response = await apiClient.post('/student/payments', data)
    return response.data
  },

  getPayments: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/student/payments', { params })
    return data
  },

  createSubscription: async (data) => {
    const response = await apiClient.post('/student/subscriptions', data)
    return response.data
  },

  // Питание
  pickupMeal: async (menuItemId) => {
    const { data } = await apiClient.post('/student/meals/pickup', { menuItemId })
    return data
  },

  getMyMeals: async ({ date, page, limit } = {}) => {
    const params = buildParams(date ? { date } : {}, { page, limit })
    const { data } = await apiClient.get('/student/meals', { params })
    return data
  },

  confirmMealReceived: async (pickupId) => {
    const { data } = await apiClient.post(`/student/meals/${pickupId}/confirm`)
    return data
  },

  // Аллергии
  getAllergies: async () => {
    const { data } = await apiClient.get('/student/allergies')
    return data
  },

  addAllergy: async (allergenName) => {
    const { data } = await apiClient.post('/student/allergies', { allergenName })
    return data
  },

  deleteAllergy: async (id) => {
    const { data } = await apiClient.delete(`/student/allergies/${id}`)
    return data
  },

  // Предпочтения
  getPreferences: async () => {
    const { data } = await apiClient.get('/student/preferences')
    return data
  },

  addPreference: async (preferenceName) => {
    const { data } = await apiClient.post('/student/preferences', { preferenceName })
    return data
  },

  deletePreference: async (id) => {
    const { data } = await apiClient.delete(`/student/preferences/${id}`)
    return data
  },

  // Отзывы
  getMyReviews: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/student/reviews', { params })
    return data
  },

  createReview: async (reviewData) => {
    const { data } = await apiClient.post('/student/reviews', reviewData)
    return data
  },

  deleteReview: async (id) => {
    const { data } = await apiClient.delete(`/student/reviews/${id}`)
    return data
  },
}
