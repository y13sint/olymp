import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { BrowserRouter } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'
import isoWeek from 'dayjs/plugin/isoWeek'
import { AppRouter } from './router'
import { useAuthStore } from '@features/auth'
import { ErrorBoundary } from './ErrorBoundary'
import { handleMutationError, handleQueryError } from '@shared/lib'
import { STALE_TIMES } from '@shared/constants'

dayjs.locale('ru')
dayjs.extend(relativeTime)
dayjs.extend(isoWeek)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, 
      retry: 1,
      staleTime: STALE_TIMES.DEFAULT,
      meta: { onError: handleQueryError },
    },
    mutations: {
      onError: handleMutationError,
    },
  },
})

// Восстановление сессии при загрузке страницы
function AppInitializer({ children }) {
  const { fetchUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={ruRU}>
          <BrowserRouter>
            <AppInitializer>
              <AppRouter />
            </AppInitializer>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
