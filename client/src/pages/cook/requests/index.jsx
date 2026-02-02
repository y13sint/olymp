import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  message,
  Space,
  Popconfirm,
  Empty,
} from 'antd'
import {
  UnorderedListOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { cookApi } from '@shared/api'
import { REQUEST_STATUS_LABELS } from '@shared/config'
import { ErrorState } from '@shared/ui'
import { PAGE_SIZES, TABLE_COLUMN_WIDTHS } from '@shared/constants'

const { Title, Text } = Typography

export function CookRequestsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Загрузка заявок
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['cook-requests'],
    queryFn: () => cookApi.getPurchaseRequests({}),
  })

  // Загрузка продуктов для селекта
  const { data: inventoryData, error: inventoryError } = useQuery({
    queryKey: ['inventory'],
    queryFn: cookApi.getInventory,
  })

  // Создание заявки
  const createMutation = useMutation({
    mutationFn: cookApi.createPurchaseRequest,
    onSuccess: (data) => {
      message.success(data.message)
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['cook-requests'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление заявки
  const deleteMutation = useMutation({
    mutationFn: cookApi.deletePurchaseRequest,
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['cook-requests'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const requests = data?.requests || []
  const products = inventoryData?.products || []

  // Статические колонки мемоизируем
  const staticColumns = useMemo(() => [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
      width: TABLE_COLUMN_WIDTHS.LARGE,
    },
    {
      title: 'Продукт',
      key: 'product',
      render: (_, record) => (
        <Text strong>{record.product?.name}</Text>
      ),
    },
    {
      title: 'Количество',
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

  // Колонка с callback
  const columns = [
    ...staticColumns,
    {
      title: 'Действие',
      key: 'action',
      width: TABLE_COLUMN_WIDTHS.SMALL,
      render: (_, record) =>
        record.status === 'pending' && (
          <Popconfirm
            title="Удалить заявку?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
        ),
    },
  ]

  const hasError = error || inventoryError

  if (hasError) {
    return (
      <MainLayout>
        <Title level={3}>
          <UnorderedListOutlined /> Заявки на закупку
        </Title>
        <ErrorState error={error || inventoryError} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3}>
        <UnorderedListOutlined /> Заявки на закупку
      </Title>

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Новая заявка
          </Button>
        }
      >
        {requests.length === 0 && !isPending ? (
          <Empty description="Нет заявок" />
        ) : (
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={isPending}
            pagination={{ pageSize: PAGE_SIZES.SMALL }}
          />
        )}
      </Card>

      <Modal
        title="Новая заявка на закупку"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={createMutation.mutate} layout="vertical">
          <Form.Item
            name="productId"
            label="Продукт"
            rules={[{ required: true, message: 'Выберите продукт' }]}
          >
            <Select
              placeholder="Выберите продукт"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (остаток: ${p.quantity} ${p.unit})`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Количество"
            rules={[
              { required: true, message: 'Введите количество' },
              { type: 'number', min: 1, message: 'Минимум 1' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea
              placeholder="Причина закупки, срочность..."
              rows={2}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending}
            block
          >
            Создать заявку
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
