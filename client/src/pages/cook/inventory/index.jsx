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
  InputNumber,
  Input,
  message,
  Space,
  Progress,
} from 'antd'
import {
  InboxOutlined,
  PlusOutlined,
  MinusOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { cookApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { TABLE_COLUMN_WIDTHS, VALIDATION, INVENTORY } from '@shared/constants'

const { Title, Text } = Typography

export function CookInventoryPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form] = Form.useForm()

  // Загрузка продуктов
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: cookApi.getInventory,
  })

  // Обновление остатка
  const updateMutation = useMutation({
    mutationFn: ({ id, quantityChange, reason }) =>
      cookApi.updateInventory(id, { quantityChange, reason }),
    onSuccess: (data) => {
      message.success(data.message)
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openModal = (product, isAdding) => {
    setSelectedProduct({ ...product, isAdding })
    form.setFieldsValue({ quantity: 0, reason: '' })
    setModalOpen(true)
  }

  const handleSubmit = (values) => {
    const quantityChange = selectedProduct.isAdding
      ? Math.abs(values.quantity)
      : -Math.abs(values.quantity)

    updateMutation.mutate({
      id: selectedProduct.id,
      quantityChange,
      reason: values.reason,
    })
  }

  const products = data?.products || []

  // Статические колонки мемоизируем
  const staticColumns = useMemo(() => [
    {
      title: 'Продукт',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          {record.isLow && <WarningOutlined style={{ color: '#faad14' }} />}
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Остаток',
      key: 'quantity',
      render: (_, record) => {
        const percent = Math.min(
          INVENTORY.MAX_PERCENTAGE,
          (parseFloat(record.quantity) / (parseFloat(record.minQuantity) * INVENTORY.LOW_STOCK_MULTIPLIER)) * 100
        )
        return (
          <Space direction="vertical" size={0} style={{ width: TABLE_COLUMN_WIDTHS.MEDIUM }}>
            <Text>
              {record.quantity} {record.unit}
            </Text>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              status={record.isLow ? 'exception' : 'normal'}
            />
          </Space>
        )
      },
    },
    {
      title: 'Минимум',
      key: 'minQuantity',
      render: (_, record) => (
        <Text type="secondary">
          {record.minQuantity} {record.unit}
        </Text>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) =>
        record.isLow ? (
          <Tag color="warning" icon={<WarningOutlined />}>
            Мало
          </Tag>
        ) : (
          <Tag color="success">В норме</Tag>
        ),
    },
  ], [])

  // Колонка с callbacks
  const columns = [
    ...staticColumns,
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openModal(record, true)}
          >
            Приход
          </Button>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => openModal(record, false)}
            danger
          >
            Расход
          </Button>
        </Space>
      ),
    },
  ]

  if (error) {
    return (
      <MainLayout>
        <Title level={3}>
          <InboxOutlined /> Склад продуктов
        </Title>
        <ErrorState error={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3}>
        <InboxOutlined /> Склад продуктов
      </Title>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={isPending}
          pagination={false}
          rowClassName={(record) => (record.isLow ? 'row-warning' : '')}
        />
      </Card>

      <Modal
        title={
          selectedProduct?.isAdding
            ? `Приход: ${selectedProduct?.name}`
            : `Расход: ${selectedProduct?.name}`
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="quantity"
            label="Количество"
            rules={[
              { required: true, message: 'Введите количество' },
              { type: 'number', min: VALIDATION.INVENTORY.MIN_QUANTITY, message: `Минимум ${VALIDATION.INVENTORY.MIN_QUANTITY}` },
            ]}
          >
            <InputNumber
              min={VALIDATION.INVENTORY.MIN_QUANTITY}
              step={VALIDATION.INVENTORY.QUANTITY_STEP}
              addonAfter={selectedProduct?.unit}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="reason" label="Причина">
            <Input.TextArea
              placeholder={
                selectedProduct?.isAdding
                  ? 'Например: Поступление от поставщика'
                  : 'Например: Использовано для приготовления'
              }
              rows={2}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}
            block
          >
            {selectedProduct?.isAdding ? 'Добавить' : 'Списать'}
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
