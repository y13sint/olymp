import { Link } from 'react-router-dom'
import { Typography } from 'antd'
import { AuthLayout } from '@widgets/layouts'
import { LoginForm } from '@features/auth'
import { ROUTES } from '@shared/config'

const { Text } = Typography

export function LoginPage() {
  return (
    <AuthLayout title="Вход">
      <LoginForm />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Нет аккаунта?{' '}
          <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
        </Text>
      </div>
    </AuthLayout>
  )
}
