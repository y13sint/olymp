import { Link } from 'react-router-dom'
import { Typography } from 'antd'
import { AuthLayout } from '@widgets/layouts'
import { RegisterForm } from '@features/auth'
import { ROUTES } from '@shared/config'

const { Text } = Typography

export function RegisterPage() {
  return (
    <AuthLayout title="Регистрация">
      <RegisterForm />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Уже есть аккаунт?{' '}
          <Link to={ROUTES.LOGIN}>Войти</Link>
        </Text>
      </div>
    </AuthLayout>
  )
}
