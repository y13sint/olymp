import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Radio,
  Badge,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  UserOutlined,
  WarningOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { cookApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { REFETCH_INTERVALS, TABLE_COLUMN_WIDTHS, FONT_SIZES } from '@shared/constants'

const { Title, Text } = Typography

const mealTypeOptions = [
  { label: 'Все', value: '' },
  { label: '🌅 Завтраки', value: 'breakfast' },
  { label: '☀️ Обеды', value: 'lunch' },
]

export function CookMealsPage() {
  const [mealType, setMealType] = useState('')

  // Загрузка заказов (только просмотр/учёт)
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['cook-meals', mealType],
    queryFn: () => cookApi.getTodayMeals({ mealType: mealType || undefined }),
    refetchInterval: REFETCH_INTERVALS.COOK_MEALS,
  })

  const meals = data?.meals || []
  const stats = data?.stats || { total: 0, received: 0, pending: 0 }

  // Колонки таблицы (только просмотр - учёт выданных блюд)
  const columns = useMemo(() => [
    {
      title: 'Ученик',
      key: 'student',
      render: (_, record) => {
        const allergies = record.user?.allergies || []
        const preferences = record.user?.foodPreferences || []
        return (
          <Space direction="vertical" size={4}>
            <Space>
              <UserOutlined />
              <div>
                <Text strong>{record.user?.fullName}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: FONT_SIZES.SM }}>
                  {record.user?.classNumber}{record.user?.classLetter} класс
                </Text>
              </div>
            </Space>
            {(allergies.length > 0 || preferences.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {allergies.map((a) => (
                  <Tag key={a.id} color="error" icon={<WarningOutlined />} style={{ margin: 0 }}>
                    {a.allergenName}
                  </Tag>
                ))}
                {preferences.map((p) => (
                  <Tag key={p.id} color="green" icon={<HeartOutlined />} style={{ margin: 0 }}>
                    {p.preferenceName}
                  </Tag>
                ))}
              </div>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Блюдо',
      key: 'meal',
      render: (_, record) => (
        <Space>
          <CoffeeOutlined />
          <div>
            <Text>{record.menuItem?.name}</Text>
            <br />
            <Tag color={record.menuItem?.mealType === 'breakfast' ? 'orange' : 'blue'}>
              {record.menuItem?.mealType === 'breakfast' ? 'Завтрак' : 'Обед'}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Время заказа',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('HH:mm'),
      width: TABLE_COLUMN_WIDTHS.SMALL,
    },
    {
      title: 'Статус',
      dataIndex: 'isReceived',
      key: 'status',
      width: TABLE_COLUMN_WIDTHS.MEDIUM,
      render: (isReceived, record) =>
        isReceived ? (
          <Space direction="vertical" size={0}>
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Получено
            </Tag>
            <Text type="secondary" style={{ fontSize: FONT_SIZES.XS }}>
              {record.receivedAt ? dayjs(record.receivedAt).format('HH:mm') : ''}
            </Text>
          </Space>
        ) : (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Ожидает
          </Tag>
        ),
    },
  ], [])

  if (error) {
    return (
      <MainLayout>
        <Title level={3}>
          <CoffeeOutlined /> Учёт выдач — {dayjs().format('DD MMMM')}
        </Title>
        <ErrorState error={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3}>
        <CoffeeOutlined /> Учёт выдач — {dayjs().format('DD MMMM')}
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card>
            <Statistic title="Всего заказов" value={stats.total} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <Statistic
              title="Ожидают получения"
              value={stats.pending}
              valueStyle={{ color: stats.pending > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <Statistic
              title="Получено"
              value={stats.received}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <span>Заказы на сегодня</span>
            <Badge count={stats.pending} showZero={false} />
          </Space>
        }
        extra={
          <Radio.Group
            options={mealTypeOptions}
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          />
        }
      >
        <Table
          columns={columns}
          dataSource={meals}
          rowKey="id"
          loading={isPending}
          pagination={false}
          rowClassName={(record) => (record.isReceived ? 'row-disabled' : '')}
        />
      </Card>
    </MainLayout>
  )
}
