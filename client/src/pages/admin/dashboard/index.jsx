import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Space,
  Spin,
} from 'antd'
import {
  BarChartOutlined,
  WalletOutlined,
  TeamOutlined,
  CoffeeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { adminApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, TIME_PERIODS, DEBOUNCE_DELAYS } from '@shared/constants'
import { useDebouncedValue } from '@shared/hooks'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(TIME_PERIODS.STATISTICS_DAYS, 'day'),
    dayjs(),
  ])

  // Debounce для RangePicker
  const debouncedDateRange = useDebouncedValue(dateRange, DEBOUNCE_DELAYS.DATE_PICKER)

  const startDate = debouncedDateRange?.[0]?.format('YYYY-MM-DD')
  const endDate = debouncedDateRange?.[1]?.format('YYYY-MM-DD')

  // Статистика платежей
  const { data: paymentData, isPending: paymentLoading, error: paymentError, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-stats', startDate, endDate],
    queryFn: () => adminApi.getPaymentStats(startDate, endDate),
  })

  // Статистика посещаемости
  const { data: attendanceData, isPending: attendanceLoading, error: attendanceError, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance-stats', startDate, endDate],
    queryFn: () => adminApi.getAttendanceStats(startDate, endDate),
  })

  const handleRetry = useCallback(() => {
    refetchPayment()
    refetchAttendance()
  }, [refetchPayment, refetchAttendance])

  const paymentStats = paymentData?.stats || []
  const summary = paymentData?.summary || { totalAmount: 0, totalCount: 0 }
  const byMealType = attendanceData?.byMealType || []
  const byDate = attendanceData?.byDate || []

  const singlePayments = paymentStats.find((p) => p.type === 'single')
  const subscriptionPayments = paymentStats.find((p) => p.type === 'subscription')

  const breakfastCount = byMealType.find((m) => m.mealType === 'breakfast')?.dataValues?.count || 0
  const lunchCount = byMealType.find((m) => m.mealType === 'lunch')?.dataValues?.count || 0

  const isLoading = paymentLoading || attendanceLoading
  const hasError = paymentError || attendanceError

  const attendanceColumns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'pickupDate',
      key: 'pickupDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Выдано блюд',
      key: 'count',
      render: (_, record) => record.dataValues?.count || record.count,
    },
  ], [])

  return (
    <MainLayout>
      <Space
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined /> Статистика
        </Title>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD.MM.YYYY"
        />
      </Space>

      {hasError ? (
        <ErrorState error={paymentError || attendanceError} onRetry={handleRetry} />
      ) : isLoading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Title level={4}>
            <WalletOutlined /> Финансы
          </Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Общий доход"
                  value={summary.totalAmount}
                  suffix="₽"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Всего платежей"
                  value={summary.totalCount}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Разовые платежи"
                  value={singlePayments?.dataValues?.total || 0}
                  suffix="₽"
                />
                <Text type="secondary">
                  {singlePayments?.dataValues?.count || 0} шт
                </Text>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Абонементы"
                  value={subscriptionPayments?.dataValues?.total || 0}
                  suffix="₽"
                />
                <Text type="secondary">
                  {subscriptionPayments?.dataValues?.count || 0} шт
                </Text>
              </Card>
            </Col>
          </Row>

          <Title level={4}>
            <TeamOutlined /> Посещаемость
          </Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={12} sm={8}>
              <Card>
                <Statistic
                  title="Завтраков выдано"
                  value={breakfastCount}
                  prefix={<CoffeeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Statistic
                  title="Обедов выдано"
                  value={lunchCount}
                  prefix={<CoffeeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Всего выдач"
                  value={parseInt(breakfastCount) + parseInt(lunchCount)}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Выдачи по дням">
            <Table
              columns={attendanceColumns}
              dataSource={byDate}
              rowKey="pickupDate"
              pagination={{ pageSize: PAGE_SIZES.SMALL }}
              size="small"
            />
          </Card>
        </>
      )}
    </MainLayout>
  )
}
