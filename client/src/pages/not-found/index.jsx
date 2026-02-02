import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@features/auth'
import { ROUTES, ROLES } from '@shared/config'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const handleGoBack = () => {
    // Если авторизован - на главную страницу роли
    if (isAuthenticated && user) {
      switch (user.role) {
        case ROLES.STUDENT:
          navigate(ROUTES.STUDENT.MENU)
          break
        case ROLES.COOK:
          navigate(ROUTES.COOK.MEALS)
          break
        case ROLES.ADMIN:
          navigate(ROUTES.ADMIN.DASHBOARD)
          break
        default:
          navigate(ROUTES.LOGIN)
      }
    } else {
      // Не авторизован - на логин
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Страница не найдена"
        extra={
          <Button type="primary" onClick={handleGoBack}>
            {isAuthenticated ? 'На главную' : 'Войти'}
          </Button>
        }
      />
    </div>
  )
}
