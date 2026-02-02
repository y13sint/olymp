import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Avatar,
} from 'antd'
import {
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { adminApi } from '@shared/api'
import { ROLE_LABELS, ROLE_OPTIONS, CLASS_LETTERS } from '@shared/config'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, VALIDATION, DEBOUNCE_DELAYS, FONT_SIZES, TABLE_COLUMN_WIDTHS } from '@shared/constants'
import { useDebouncedValue } from '@shared/hooks'

const { Title, Text } = Typography

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState('')
  const [form] = Form.useForm()

  // Debounce для фильтра
  const debouncedRoleFilter = useDebouncedValue(roleFilter, DEBOUNCE_DELAYS.FILTER)

  // Загрузка пользователей
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['admin-users', debouncedRoleFilter],
    queryFn: () => adminApi.getUsers({ role: debouncedRoleFilter || undefined }),
  })

  // Создание
  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      message.success('Пользователь создан')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Обновление
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => adminApi.updateUser(id, updates),
    onSuccess: () => {
      message.success('Пользователь обновлён')
      setModalOpen(false)
      setEditingUser(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      message.success('Пользователь удалён')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalOpen(true)
  }

  const handleSubmit = (values) => {
    if (editingUser) {
      const { password, ...updates } = values
      updateMutation.mutate({ id: editingUser.id, updates })
    } else {
      createMutation.mutate(values)
    }
  }

  const users = data?.users || []

  // Колонки содержат callbacks, поэтому useMemo не даёт пользы
  const columns = [
    {
      title: 'Пользователь',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: FONT_SIZES.SM }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={ROLE_LABELS[role]?.color}>
          {ROLE_LABELS[role]?.text}
        </Tag>
      ),
    },
    {
      title: 'Класс',
      key: 'class',
      render: (_, record) =>
        record.classNumber ? (
          <Text>{record.classNumber}{record.classLetter}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Баланс',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => (
        <Text style={{ color: parseFloat(balance) > 0 ? '#3f8600' : undefined }}>
          {balance}₽
        </Text>
      ),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Удалить пользователя?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <Title level={3}>
        <TeamOutlined /> Пользователи
      </Title>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card
          extra={
            <Space>
              <Select
                placeholder="Все роли"
                allowClear
                style={{ width: TABLE_COLUMN_WIDTHS.LARGE }}
                options={ROLE_OPTIONS}
                value={roleFilter || undefined}
                onChange={(value) => setRoleFilter(value || '')}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                Добавить
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={isPending}
            pagination={{ pageSize: PAGE_SIZES.MEDIUM }}
          />
        </Card>
      )}

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: !editingUser, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: VALIDATION.PASSWORD_MIN_LENGTH, message: `Минимум ${VALIDATION.PASSWORD_MIN_LENGTH} символов` },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="fullName"
            label="ФИО"
            rules={[{ required: true, message: 'Введите ФИО' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="classNumber" label="Класс" style={{ flex: 1 }}>
              <InputNumber min={VALIDATION.CLASS_NUMBER.MIN} max={VALIDATION.CLASS_NUMBER.MAX} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item 
              name="classLetter" 
              label="Буква" 
              style={{ flex: 1 }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const validLetters = CLASS_LETTERS.map(l => l.value)
                    if (validLetters.includes(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Допустимые буквы: А, Б, В, Г, Д, Е'))
                  }
                }
              ]}
            >
              <Select 
                options={CLASS_LETTERS} 
                allowClear 
                placeholder="Выберите"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Space>
          {editingUser && (
            <Form.Item name="balance" label="Баланс">
              <InputNumber min={0} addonAfter="₽" style={{ width: '100%' }} />
            </Form.Item>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            block
          >
            {editingUser ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
