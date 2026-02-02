import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Input,
  Space,
  message,
  Empty,
  Skeleton,
  Divider,
  Modal,
  Form,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  WalletOutlined,
  WarningOutlined,
  PlusOutlined,
  LockOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { studentApi, authApi } from '@shared/api'
import { useAuthStore } from '@features/auth'
import { ErrorState } from '@shared/ui'
import { SPACING, VALIDATION } from '@shared/constants'
import { SUBSCRIPTION_TYPE_LABELS } from '@shared/config'

const { Title, Text } = Typography

export function StudentProfilePage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [newAllergy, setNewAllergy] = useState('')
  const [newPreference, setNewPreference] = useState('')
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm] = Form.useForm()

  // Загрузка аллергий
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['allergies'],
    queryFn: studentApi.getAllergies,
  })

  // Добавление аллергии
  const addMutation = useMutation({
    mutationFn: studentApi.addAllergy,
    onSuccess: () => {
      message.success('Аллергия добавлена')
      setNewAllergy('')
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление аллергии
  const deleteMutation = useMutation({
    mutationFn: studentApi.deleteAllergy,
    onSuccess: () => {
      message.success('Аллергия удалена')
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Загрузка предпочтений
  const { data: prefData, isPending: prefPending, error: prefError, refetch: prefRefetch } = useQuery({
    queryKey: ['preferences'],
    queryFn: studentApi.getPreferences,
  })

  // Добавление предпочтения
  const addPrefMutation = useMutation({
    mutationFn: studentApi.addPreference,
    onSuccess: () => {
      message.success('Предпочтение добавлено')
      setNewPreference('')
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление предпочтения
  const deletePrefMutation = useMutation({
    mutationFn: studentApi.deletePreference,
    onSuccess: () => {
      message.success('Предпочтение удалено')
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Смена пароля
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      message.success('Пароль успешно изменён')
      setPasswordModalOpen(false)
      passwordForm.resetFields()
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка при смене пароля')
    },
  })

  const handleChangePassword = (values) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      addMutation.mutate(newAllergy.trim())
    }
  }

  const handleAddPreference = () => {
    if (newPreference.trim()) {
      addPrefMutation.mutate(newPreference.trim())
    }
  }

  const allergies = data?.allergies || []
  const preferences = prefData?.preferences || []

  return (
    <MainLayout>
      <Title level={3}>
        <UserOutlined /> Профиль
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Личные данные">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<><UserOutlined /> ФИО</>}>
                {user?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> Класс</>}>
                {user?.classNumber && user?.classLetter
                  ? `${user.classNumber}${user.classLetter}`
                  : 'Не указан'}
              </Descriptions.Item>
              <Descriptions.Item label={<><WalletOutlined /> Баланс</>}>
                <Text
                  strong
                  style={{ color: parseFloat(user?.balance) > 0 ? '#3f8600' : '#cf1322' }}
                >
                  {user?.balance}₽
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Зарегистрирован">
                {dayjs(user?.createdAt).format('DD.MM.YYYY')}
              </Descriptions.Item>
            </Descriptions>

            {user?.subscriptions?.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Активный абонемент</Title>
                {user.subscriptions.map((sub) => (
                  <Card size="small" key={sub.id} style={{ marginTop: 8 }}>
                    <Row justify="space-between">
                      <Col>
                        <Tag color="purple">
                          {SUBSCRIPTION_TYPE_LABELS[sub.type]?.text || sub.type}
                        </Tag>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          до {dayjs(sub.endDate).format('DD.MM.YYYY')}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}

            <Divider />
            <Button
              icon={<LockOutlined />}
              onClick={() => setPasswordModalOpen(true)}
            >
              Сменить пароль
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <WarningOutlined style={{ color: '#faad14' }} /> Пищевые аллергии
              </span>
            }
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Укажите продукты или ингредиенты, на которые у вас аллергия.
              Блюда с этими аллергенами будут помечены в меню.
            </Text>

            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Input
                placeholder="Например: молоко, глютен, орехи..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onPressEnter={handleAddAllergy}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddAllergy}
                loading={addMutation.isPending}
              >
                Добавить
              </Button>
            </Space.Compact>

            {error ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : isPending ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : allergies.length === 0 ? (
              <Empty
                description="Аллергии не указаны"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.SM }}>
                {allergies.map((allergy) => (
                  <Tag
                    key={allergy.id}
                    color="orange"
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      deleteMutation.mutate(allergy.id)
                    }}
                    style={{ marginBottom: 0 }}
                  >
                    {allergy.allergenName}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                <HeartOutlined style={{ color: '#52c41a' }} /> Пищевые предпочтения
              </span>
            }
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Укажите ваши пищевые предпочтения (например: вегетарианец, без свинины, люблю рыбу).
              Блюда, соответствующие вашим предпочтениям, будут выделены в меню.
            </Text>

            <Space.Compact style={{ width: '100%', maxWidth: 500, marginBottom: 16 }}>
              <Input
                placeholder="Например: вегетарианец, без свинины..."
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                onPressEnter={handleAddPreference}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPreference}
                loading={addPrefMutation.isPending}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Добавить
              </Button>
            </Space.Compact>

            {prefError ? (
              <ErrorState error={prefError} onRetry={prefRefetch} />
            ) : prefPending ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : preferences.length === 0 ? (
              <Empty
                description="Предпочтения не указаны"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.SM }}>
                {preferences.map((pref) => (
                  <Tag
                    key={pref.id}
                    color="green"
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      deletePrefMutation.mutate(pref.id)
                    }}
                    style={{ marginBottom: 0 }}
                  >
                    {pref.preferenceName}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Смена пароля"
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        footer={null}
      >
        <Form form={passwordForm} onFinish={handleChangePassword} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Текущий пароль"
            rules={[{ required: true, message: 'Введите текущий пароль' }]}
          >
            <Input.Password placeholder="Введите текущий пароль" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Новый пароль"
            rules={[
              { required: true, message: 'Введите новый пароль' },
              { min: VALIDATION.PASSWORD_MIN_LENGTH, message: `Минимум ${VALIDATION.PASSWORD_MIN_LENGTH} символов` },
            ]}
          >
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Подтвердите пароль"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Пароли не совпадают'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите новый пароль" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={changePasswordMutation.isPending}
            block
          >
            Сменить пароль
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
