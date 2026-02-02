import { Form, Input, Button, Alert, Select, InputNumber, Space } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../model/auth.store'
import { ROUTES, CLASS_LETTERS } from '@shared/config'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      await register(values)
      navigate(ROUTES.STUDENT.MENU)
    } catch (err) {
      // Ошибка уже в store
    }
  }

  return (
    <Form
      form={form}
      name="register"
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
        name="fullName"
        rules={[
          { required: true, message: 'Введите ФИО' },
          { min: 2, message: 'Минимум 2 символа' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="ФИО"
          autoComplete="name"
        />
      </Form.Item>

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
        rules={[
          { required: true, message: 'Введите пароль' },
          { min: 6, message: 'Минимум 6 символов' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Пароль"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Подтвердите пароль' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Пароли не совпадают'))
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Подтвердите пароль"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item label="Класс" style={{ marginBottom: 0 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name="classNumber"
            style={{ width: '50%', marginBottom: 24 }}
          >
            <InputNumber
              min={1}
              max={11}
              placeholder="Номер"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="classLetter"
            style={{ width: '50%', marginBottom: 24 }}
          >
            <Select placeholder="Буква" options={CLASS_LETTERS} allowClear />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Зарегистрироваться
        </Button>
      </Form.Item>
    </Form>
  )
}
