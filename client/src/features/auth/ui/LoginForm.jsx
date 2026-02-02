import { Form, Input, Button, Alert } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../model/auth.store'
import { getDefaultPathByRole } from '@shared/config'

export function LoginForm() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const data = await login(values)
      navigate(getDefaultPathByRole(data.user.role))
    } catch (err) {
      // Ошибка уже в store
    }
  }

  return (
    <Form
      form={form}
      name="login"
      onFinish={onFinish}
      layout="vertical"
      size="large"
      onChange={clearError}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Введите email' },
          { type: 'email', message: 'Некорректный email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Введите пароль' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Пароль"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Войти
        </Button>
      </Form.Item>
    </Form>
  )
}
