import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Statistic,
  DatePicker,
  message,
  Alert,
  Space,
  Modal,
  Rate,
  Input,
  Form,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  StarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { studentApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { MEAL_TYPE_LABELS } from '@shared/config'
import { REFETCH_INTERVALS } from '@shared/constants'

const { Title, Text } = Typography
const { TextArea } = Input

export function StudentOrdersPage() {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const today = dayjs().format('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState(today)
  const [reviewModal, setReviewModal] = useState({ open: false, meal: null })

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['myMeals', selectedDate],
    queryFn: () => studentApi.getMyMeals({ date: selectedDate }),
    refetchInterval: selectedDate === today ? REFETCH_INTERVALS.COOK_MEALS : false,
  })

  const confirmMutation = useMutation({
    mutationFn: studentApi.confirmMealReceived,
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['myMeals'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка при подтверждении')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: studentApi.createReview,
    onSuccess: (data) => {
      message.success(data.message)
      setReviewModal({ open: false, meal: null })
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['myReviews'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка при отправке отзыва')
    },
  })

  const meals = data?.meals || []

  const stats = useMemo(() => ({
    total: meals.length,
    received: meals.filter((m) => m.isReceived).length,
    pending: meals.filter((m) => !m.isReceived).length,
  }), [meals])

  const isToday = selectedDate === today

  const openReviewModal = (meal) => {
    setReviewModal({ open: true, meal })
    form.setFieldsValue({ rating: 5, comment: '' })
  }

  const handleReviewSubmit = async () => {
    try {
      const values = await form.validateFields()
      reviewMutation.mutate({
        menuItemId: reviewModal.meal.menuItem.id,
        rating: values.rating,
        comment: values.comment || '',
      })
    } catch {
      // Validation failed
    }
  }

  const columns = useMemo(() => [
    {
      title: 'Блюдо',
      dataIndex: ['menuItem', 'name'],
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Тип',
      dataIndex: ['menuItem', 'mealType'],
      key: 'mealType',
      width: 120,
      render: (type) => (
        <Tag color={MEAL_TYPE_LABELS[type]?.color}>
          {MEAL_TYPE_LABELS[type]?.text}
        </Tag>
      ),
    },
    {
      title: 'Цена',
      dataIndex: ['menuItem', 'price'],
      key: 'price',
      width: 100,
      render: (price) => <Text>{price}₽</Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'isReceived',
      key: 'status',
      width: 140,
      render: (isReceived) => (
        isReceived ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Получено</Tag>
        ) : (
          <Tag color="processing" icon={<ClockCircleOutlined />}>Ожидает</Tag>
        )
      ),
    },
    {
      title: 'Действие',
      key: 'action',
      width: 220,
      render: (_, record) => {
        if (record.isReceived) {
          return (
            <Space>
              <Text type="secondary">
                {dayjs(record.receivedAt).format('HH:mm')}
              </Text>
              <Button
                type="link"
                icon={<StarOutlined />}
                onClick={() => openReviewModal(record)}
                size="small"
              >
                Отзыв
              </Button>
            </Space>
          )
        }
        if (!isToday) {
          return <Text type="secondary">—</Text>
        }
        return (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => confirmMutation.mutate(record.id)}
            loading={confirmMutation.isPending}
            size="small"
          >
            Подтвердить
          </Button>
        )
      },
    },
  ], [isToday, confirmMutation])

  if (error) {
    return (
      <MainLayout>
        <Title level={3}>
          <CheckCircleOutlined /> Мои заказы
        </Title>
        <ErrorState error={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3} style={{ marginBottom: 24 }}>
        <CheckCircleOutlined /> Мои заказы
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Всего заказов"
              value={stats.total}
              suffix="шт"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Получено"
              value={stats.received}
              suffix="шт"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ожидает получения"
              value={stats.pending}
              suffix="шт"
              valueStyle={{ color: stats.pending > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Заказы на {dayjs(selectedDate).format('D MMMM YYYY')}</span>
          </Space>
        }
        extra={
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={(date) => setSelectedDate(date?.format('YYYY-MM-DD') || today)}
            allowClear={false}
            format="DD.MM.YYYY"
          />
        }
      >
        {isToday && stats.pending > 0 && (
          <Alert
            message="У вас есть неподтверждённые заказы"
            description="После получения питания в столовой нажмите кнопку «Подтвердить» для отметки"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {!isToday && selectedDate < today && (
          <Alert
            message="Прошедшая дата"
            description="Подтверждение получения возможно только в день заказа"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={meals}
          rowKey="id"
          loading={isPending}
          pagination={false}
          locale={{ emptyText: 'Нет заказов на выбранную дату' }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <StarOutlined />
            <span>Оставить отзыв</span>
          </Space>
        }
        open={reviewModal.open}
        onCancel={() => {
          setReviewModal({ open: false, meal: null })
          form.resetFields()
        }}
        onOk={handleReviewSubmit}
        okText="Отправить"
        cancelText="Отмена"
        confirmLoading={reviewMutation.isPending}
      >
        {reviewModal.meal && (
          <>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>
              {reviewModal.meal.menuItem.name}
            </Text>
            <Form form={form} layout="vertical">
              <Form.Item
                name="rating"
                label="Оценка"
                rules={[{ required: true, message: 'Поставьте оценку' }]}
                initialValue={5}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Комментарий (необязательно)"
              >
                <TextArea
                  rows={4}
                  placeholder="Расскажите о вашем впечатлении..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </MainLayout>
  )
}
