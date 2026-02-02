import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Alert,
} from 'antd'
import {
  WalletOutlined,
  PlusOutlined,
  CrownOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { studentApi } from '@shared/api'
import { useAuthStore } from '@features/auth'
import { PAYMENT_TYPE_LABELS, PAYMENT_STATUS_LABELS, SUBSCRIPTION_OPTIONS } from '@shared/config'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, VALIDATION } from '@shared/constants'

const { Title, Text } = Typography

export function StudentPaymentsPage() {
  const queryClient = useQueryClient()
  const { user, fetchUser } = useAuthStore()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [paymentForm] = Form.useForm()
  const [subscriptionForm] = Form.useForm()

  // Загрузка истории платежей
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: studentApi.getPayments,
  })

  // Пополнение баланса
  const paymentMutation = useMutation({
    mutationFn: studentApi.createPayment,
    onSuccess: (data) => {
      message.success(data.message)
      setPaymentModalOpen(false)
      paymentForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      fetchUser()
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Покупка абонемента
  const subscriptionMutation = useMutation({
    mutationFn: studentApi.createSubscription,
    onSuccess: (data) => {
      message.success(data.message)
      setSubscriptionModalOpen(false)
      subscriptionForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      fetchUser()
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const handlePayment = (values) => {
    paymentMutation.mutate(values)
  }

  const handleSubscription = (values) => {
    subscriptionMutation.mutate(values)
  }

  const columns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={PAYMENT_TYPE_LABELS[type]?.color}>
          {PAYMENT_TYPE_LABELS[type]?.text}
        </Tag>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{amount}₽</Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={PAYMENT_STATUS_LABELS[status]?.color}>
          {PAYMENT_STATUS_LABELS[status]?.text}
        </Tag>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
  ], [])

  const payments = data?.payments || []

  // Активная подписка
  const activeSubscription = user?.subscriptions?.[0]

  // Обработка ошибки загрузки
  if (error) {
    return (
      <MainLayout>
        <Title level={3}>
          <WalletOutlined /> Оплата питания
        </Title>
        <ErrorState error={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3}>
        <WalletOutlined /> Оплата питания
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Текущий баланс"
              value={user?.balance || 0}
              suffix="₽"
              valueStyle={{ color: parseFloat(user?.balance) > 0 ? '#3f8600' : '#cf1322' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setPaymentModalOpen(true)}
              style={{ marginTop: 16 }}
              block
            >
              Пополнить
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Абонемент"
              value={activeSubscription ? 'Активен' : 'Нет'}
              valueStyle={{ color: activeSubscription ? '#3f8600' : '#999' }}
            />
            {activeSubscription ? (
              <Text type="secondary">
                до {dayjs(activeSubscription.endDate).format('DD.MM.YYYY')}
              </Text>
            ) : (
              <Button
                icon={<CrownOutlined />}
                onClick={() => setSubscriptionModalOpen(true)}
                style={{ marginTop: 16 }}
                block
              >
                Купить абонемент
              </Button>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Всего платежей"
              value={payments.length}
              suffix="шт"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span>
            <HistoryOutlined /> История платежей
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={isPending}
          pagination={{ pageSize: PAGE_SIZES.SMALL }}
        />
      </Card>

      <Modal
        title="Пополнение баланса"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
      >
        <Form form={paymentForm} onFinish={handlePayment} layout="vertical">
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[
              { required: true, message: 'Введите сумму' },
              { type: 'number', min: 100, message: 'Минимум 100₽' },
            ]}
          >
            <InputNumber
              min={100}
              max={10000}
              step={100}
              addonAfter="₽"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Alert
            message="Демо-режим"
            description="В реальном приложении здесь будет оплата через платёжную систему"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            htmlType="submit"
            loading={paymentMutation.isPending}
            block
          >
            Пополнить
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Покупка абонемента"
        open={subscriptionModalOpen}
        onCancel={() => setSubscriptionModalOpen(false)}
        footer={null}
      >
        <Form form={subscriptionForm} onFinish={handleSubscription} layout="vertical">
          <Form.Item
            name="type"
            label="Тип абонемента"
            rules={[{ required: true, message: 'Выберите тип' }]}
          >
            <Select
              options={SUBSCRIPTION_OPTIONS.map((t) => ({
                value: t.value,
                label: `${t.label} (${t.price}₽/день)`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="days"
            label="Количество дней"
            rules={[
              { required: true, message: 'Введите количество дней' },
              { type: 'number', min: VALIDATION.SUBSCRIPTION.MIN_DAYS, max: VALIDATION.SUBSCRIPTION.MAX_DAYS, message: `От ${VALIDATION.SUBSCRIPTION.MIN_DAYS} до ${VALIDATION.SUBSCRIPTION.MAX_DAYS} дней` },
            ]}
          >
            <InputNumber min={VALIDATION.SUBSCRIPTION.MIN_DAYS} max={VALIDATION.SUBSCRIPTION.MAX_DAYS} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item shouldUpdate>
            {() => {
              const type = subscriptionForm.getFieldValue('type')
              const days = subscriptionForm.getFieldValue('days')
              const pricePerDay = SUBSCRIPTION_OPTIONS.find((t) => t.value === type)?.price || 0
              const total = pricePerDay * (days || 0)
              return (
                <Alert
                  message={`Итого: ${total}₽`}
                  description={`Будет списано с баланса. Ваш баланс: ${user?.balance}₽`}
                  type={parseFloat(user?.balance) >= total ? 'success' : 'warning'}
                  showIcon
                />
              )
            }}
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={subscriptionMutation.isPending}
            block
            style={{ marginTop: 16 }}
          >
            Купить
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
