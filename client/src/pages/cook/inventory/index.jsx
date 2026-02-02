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
  Select,
  Checkbox,
  message,
  Space,
  Progress,
  Popconfirm,
} from 'antd'
import {
  InboxOutlined,
  PlusOutlined,
  MinusOutlined,
  WarningOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { cookApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { TABLE_COLUMN_WIDTHS, VALIDATION, INVENTORY } from '@shared/constants'

const { Title, Text } = Typography

const UNIT_OPTIONS = [
  { value: 'кг', label: 'кг (килограммы)' },
  { value: 'л', label: 'л (литры)' },
  { value: 'шт', label: 'шт (штуки)' },
  { value: 'г', label: 'г (граммы)' },
  { value: 'мл', label: 'мл (миллилитры)' },
  { value: 'уп', label: 'уп (упаковки)' },
]

export function CookInventoryPage() {
  const queryClient = useQueryClient()
  const [quantityModalOpen, setQuantityModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [quantityForm] = Form.useForm()
  const [productForm] = Form.useForm()

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: cookApi.getInventory,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantityChange, reason }) =>
      cookApi.updateInventory(id, { quantityChange, reason }),
    onSuccess: (data) => {
      message.success(data.message)
      setQuantityModalOpen(false)
      quantityForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const createProductMutation = useMutation({
    mutationFn: cookApi.createProduct,
    onSuccess: (data) => {
      message.success(data.message)
      setProductModalOpen(false)
      productForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }) => cookApi.updateProduct(id, data),
    onSuccess: (data) => {
      message.success(data.message)
      setProductModalOpen(false)
      productForm.resetFields()
      setEditMode(false)
      setSelectedProduct(null)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: cookApi.deleteProduct,
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openQuantityModal = (product, isAdding) => {
    setSelectedProduct({ ...product, isAdding })
    quantityForm.setFieldsValue({ quantity: VALIDATION.INVENTORY.MIN_QUANTITY, reason: '' })
    setQuantityModalOpen(true)
  }

  const openCreateModal = () => {
    setEditMode(false)
    setSelectedProduct(null)
    productForm.resetFields()
    setProductModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditMode(true)
    setSelectedProduct(product)
    productForm.setFieldsValue({
      name: product.name,
      unit: product.unit,
      minQuantity: parseFloat(product.minQuantity),
    })
    setProductModalOpen(true)
  }

  const handleQuantitySubmit = (values) => {
    const qty = parseFloat(values.quantity)
    if (!qty || qty <= 0 || isNaN(qty)) {
      message.error('Введите корректное количество')
      return
    }
    const quantityChange = selectedProduct.isAdding ? qty : -qty

    updateMutation.mutate({
      id: selectedProduct.id,
      quantityChange,
      reason: values.reason,
    })
  }

  const handleProductSubmit = (values) => {
    if (editMode) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        name: values.name,
        unit: values.unit,
        minQuantity: values.minQuantity,
      })
    } else {
      createProductMutation.mutate(values)
    }
  }

  const products = data?.products || []

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

  const columns = [
    ...staticColumns,
    {
      title: 'Действия',
      key: 'actions',
      width: TABLE_COLUMN_WIDTHS.HUGE + 80,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openQuantityModal(record, true)}
          >
            Приход
          </Button>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => openQuantityModal(record, false)}
            danger
          >
            Расход
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Удалить продукт?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteProductMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              loading={deleteProductMutation.isPending}
            />
          </Popconfirm>
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

      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Добавить продукт
          </Button>
        }
      >
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
        open={quantityModalOpen}
        onCancel={() => setQuantityModalOpen(false)}
        footer={null}
      >
        <Form form={quantityForm} onFinish={handleQuantitySubmit} layout="vertical">
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

      <Modal
        title={editMode ? 'Редактировать продукт' : 'Добавить продукт'}
        open={productModalOpen}
        onCancel={() => {
          setProductModalOpen(false)
          setEditMode(false)
          setSelectedProduct(null)
          productForm.resetFields()
        }}
        footer={null}
      >
        <Form form={productForm} onFinish={handleProductSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Например: Молоко" />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Единица измерения"
            rules={[{ required: true, message: 'Выберите единицу измерения' }]}
          >
            <Select options={UNIT_OPTIONS} placeholder="Выберите" />
          </Form.Item>
          {!editMode && (
            <Form.Item
              name="quantity"
              label="Начальный остаток"
              initialValue={0}
            >
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          )}
          <Form.Item
            name="minQuantity"
            label="Минимальный остаток (для уведомлений)"
            initialValue={0}
          >
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          {!editMode && (
            <>
              <Form.Item
                name="createPurchaseRequest"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox>Создать заявку на закупку</Checkbox>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.createPurchaseRequest !== curr.createPurchaseRequest}
              >
                {({ getFieldValue }) =>
                  getFieldValue('createPurchaseRequest') && (
                    <>
                      <Form.Item
                        name="purchaseQuantity"
                        label="Количество для закупки"
                        rules={[{ required: true, message: 'Введите количество' }]}
                      >
                        <InputNumber min={1} step={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item name="purchaseComment" label="Комментарий к заявке">
                        <Input.TextArea rows={2} placeholder="Срочность, особые требования..." />
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>
            </>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={createProductMutation.isPending || updateProductMutation.isPending}
            block
          >
            {editMode ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
