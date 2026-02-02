import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const AUTH_STORAGE_KEY = 'auth-storage'
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

// Refresh token: защита от параллельных запросов
let isRefreshing = false
let refreshSubscribers = []

// Access token в памяти 
let memoryAccessToken = null

function getCsrfToken() {
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`))
  return match ? match[2] : null
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

export function getAccessToken() {
  return memoryAccessToken
}

export function setAccessToken(token) {
  memoryAccessToken = token
}

export function clearAccessToken() {
  memoryAccessToken = null
}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  memoryAccessToken = null
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
})

export { authApi } from './auth.api'
export { menuApi } from './menu.api'
export { studentApi } from './student.api'
export { cookApi } from './cook.api'
export { adminApi } from './admin.api'
export { notificationApi } from './notification.api'
export { templateApi } from './template.api'

// Добавляем токены к запросам
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    const mutatingMethods = ['post', 'put', 'patch', 'delete']
    if (mutatingMethods.includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken()
      if (csrfToken) config.headers[CSRF_HEADER_NAME] = csrfToken
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Обработка ошибок + автоматический refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      const networkError = new Error('Сервер недоступен. Проверьте подключение к сети.')
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        setAccessToken(data.accessToken)
        onRefreshed(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
