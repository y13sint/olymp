import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@shared/api/auth.api'
import { setAccessToken, clearAccessToken, getAccessToken } from '@shared/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authApi.login(credentials)
          setAccessToken(data.accessToken)
          set({ user: data.user, isAuthenticated: true, isLoading: false })
          return data
        } catch (error) {
          const message = error.response?.data?.error || 'Ошибка авторизации'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authApi.register(userData)
          setAccessToken(data.accessToken)
          set({ user: data.user, isAuthenticated: true, isLoading: false })
          return data
        } catch (error) {
          const message = error.response?.data?.error || 'Ошибка регистрации'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const data = await authApi.getMe()
          set({ user: data.user, isAuthenticated: true, isLoading: false })
          return data.user
        } catch (error) {
          clearAccessToken()
          set({ user: null, isAuthenticated: false, isLoading: false })
          return null
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          //error
        }
        clearAccessToken()
        set({ user: null, isAuthenticated: false, error: null })
      },

      hasToken: () => !!getAccessToken(),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
