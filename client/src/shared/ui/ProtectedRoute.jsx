import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth'
import { ROUTES, getDefaultPathByRole } from '@shared/config'
import { Spin } from 'antd'

// Защищённый маршрут — только для авторизованных с нужной ролью
export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultPathByRole(user?.role)} replace />
  }

  return children
}

// Публичный маршрут — только для неавторизованных
export function PublicRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore()

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />
  }

  return children
}
