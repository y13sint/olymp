import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  message,
  Popconfirm,
  Badge,
  Descriptions,
} from 'antd'
import {
  UnorderedListOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { adminApi } from '@shared/api'
import { REQUEST_STATUS_LABELS } from '@shared/config'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, TABLE_COLUMN_WIDTHS } from '@shared/constants'

const { Title, Text } = Typography

export function AdminRequestsPage() {
  const queryClient = useQueryClient()

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => adminApi.getPurchaseRequests({}),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updatePurchaseRequest(id, status),
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const requests = data?.requests || []
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const staticColumns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
      width: TABLE_COLUMN_WIDTHS.LARGE,
    },
    {
      title: 'От кого',
      key: 'creator',
      width: TABLE_COLUMN_WIDTHS.EXTRA_LARGE,
      render: (_, record) => (
        <Space style={{ whiteSpace: 'nowrap' }}>
          <UserOutlined />
          <Text ellipsis={{ tooltip: record.creator?.fullName }}>
            {record.creator?.fullName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Продукт',
      key: 'product',
      render: (_, record) => (
        <div>
          <Text strong>{record.product?.name}</Text>
          <br />
          <Text type="secondary">
            Остаток: {record.product?.quantity} {record.product?.unit}
          </Text>
        </div>
      ),
    },
    {
      title: 'Запрошено',
      key: 'quantity',
      render: (_, record) => (
        <Text>
          {record.quantity} {record.product?.unit}
        </Text>
      ),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => comment || <Text type="secondary">—</Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={REQUEST_STATUS_LABELS[status]?.color}>
          {REQUEST_STATUS_LABELS[status]?.text}
        </Tag>
      ),
    },
  ], [])

  const columns = [
    ...staticColumns,
    {
      title: 'Действия',
      key: 'actions',
      width: TABLE_COLUMN_WIDTHS.HUGE,
      render: (_, record) =>
        record.status === 'pending' && (
          <Space>
            <Popconfirm
              title="Одобрить заявку?"
              description={
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Продукт">
                    {record.product?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Количество">
                    {record.quantity} {record.product?.unit}
                  </Descriptions.Item>
                </Descriptions>
              }
              onConfirm={() =>
                updateMutation.mutate({ id: record.id, status: 'approved' })
              }
              okText="Одобрить"
              cancelText="Отмена"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                loading={updateMutation.isPending}
              >
                Одобрить
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Отклонить заявку?"
              onConfirm={() =>
                updateMutation.mutate({ id: record.id, status: 'rejected' })
              }
              okText="Отклонить"
              cancelText="Отмена"
            >
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                loading={updateMutation.isPending}
              >
                Отклонить
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ]

  return (
    <MainLayout>
      <Title level={3}>
        <UnorderedListOutlined /> Заявки на закупку
        {pendingCount > 0 && (
          <Badge
            count={pendingCount}
            style={{ marginLeft: 12 }}
          />
        )}
      </Title>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={isPending}
            pagination={{ pageSize: PAGE_SIZES.MEDIUM }}
            rowClassName={(record) =>
              record.status === 'pending' ? 'row-highlight' : ''
            }
          />
        </Card>
      )}
    </MainLayout>
  )
}
