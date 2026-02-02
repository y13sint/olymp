import { useState, useMemo } from 'react'
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
  Tabs,
  Tag,
  Button,
  message,
} from 'antd'
import {
  FileTextOutlined,
  WalletOutlined,
  CoffeeOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { adminApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, DEBOUNCE_DELAYS } from '@shared/constants'
import { useDebouncedValue } from '@shared/hooks'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export function AdminReportsPage() {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs(),
  ])
  const [exporting, setExporting] = useState(false)

  // Debounce для RangePicker
  const debouncedDateRange = useDebouncedValue(dateRange, DEBOUNCE_DELAYS.DATE_PICKER)

  const startDate = debouncedDateRange?.[0]?.format('YYYY-MM-DD')
  const endDate = debouncedDateRange?.[1]?.format('YYYY-MM-DD')

  // Экспорт отчёта в CSV
  const handleExport = async () => {
    if (!startDate || !endDate) {
      message.warning('Выберите период для экспорта')
      return
    }
    
    setExporting(true)
    try {
      await adminApi.exportReport(startDate, endDate)
      message.success('Отчёт успешно сформирован')
    } catch (err) {
      message.error('Ошибка при формировании отчёта')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  // Загрузка отчёта
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['report', startDate, endDate],
    queryFn: () => adminApi.getReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })

  const meals = data?.meals || { data: [], total: 0, revenue: 0 }
  const payments = data?.payments || { data: [], total: 0 }

  const mealsColumns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'pickupDate',
      key: 'pickupDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Ученик',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text>{record.user?.fullName}</Text>
          <br />
          <Text type="secondary">
            {record.user?.classNumber}{record.user?.classLetter}
          </Text>
        </div>
      ),
    },
    {
      title: 'Блюдо',
      key: 'meal',
      render: (_, record) => (
        <div>
          <Text>{record.menuItem?.name}</Text>
          <br />
          <Tag color={record.menuItem?.mealType === 'breakfast' ? 'orange' : 'blue'}>
            {record.menuItem?.mealType === 'breakfast' ? 'Завтрак' : 'Обед'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Цена',
      key: 'price',
      render: (_, record) => <Text>{record.menuItem?.price}₽</Text>,
    },
  ], [])

  const paymentsColumns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'subscription' ? 'purple' : 'blue'}>
          {type === 'subscription' ? 'Абонемент' : 'Разовый'}
        </Tag>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>{total}₽</Text>,
    },
    {
      title: 'Количество',
      dataIndex: 'count',
      key: 'count',
    },
  ], [])

  const tabItems = [
    {
      key: 'meals',
      label: (
        <span>
          <CoffeeOutlined /> Питание ({meals.total})
        </span>
      ),
      children: (
        <Table
          columns={mealsColumns}
          dataSource={meals.data}
          rowKey="id"
          pagination={{ pageSize: PAGE_SIZES.LARGE }}
          size="small"
        />
      ),
    },
    {
      key: 'payments',
      label: (
        <span>
          <WalletOutlined /> Платежи ({payments.data.length})
        </span>
      ),
      children: (
        <Table
          columns={paymentsColumns}
          dataSource={payments.data}
          rowKey={(record) => `${record.date}-${record.type}`}
          pagination={{ pageSize: PAGE_SIZES.LARGE }}
          size="small"
        />
      ),
    },
  ]

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
          <FileTextOutlined /> Отчёты
        </Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD.MM.YYYY"
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            disabled={!startDate || !endDate}
          >
            Скачать отчёт (CSV)
          </Button>
        </Space>
      </Space>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Выдано блюд"
                  value={meals.total}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Выручка (питание)"
                  value={meals.revenue}
                  suffix="₽"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Платежей"
                  value={payments.data.length}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Сумма платежей"
                  value={payments.total}
                  suffix="₽"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <Tabs items={tabItems} />
          </Card>
        </>
      )}
    </MainLayout>
  )
}
