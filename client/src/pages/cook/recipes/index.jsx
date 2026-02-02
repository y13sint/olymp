import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Space,
  Tag,
  Empty,
  Divider,
} from 'antd'
import {
  ExperimentOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { cookApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { MEAL_TYPE_LABELS } from '@shared/config'

const { Title, Text } = Typography

export function CookRecipesPage() {
  const queryClient = useQueryClient()
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [ingredients, setIngredients] = useState([])
  const [form] = Form.useForm()

  const { data: menuData, isPending: menuPending, error: menuError, refetch } = useQuery({
    queryKey: ['cook-today-menu'],
    queryFn: cookApi.getTodayMenu,
  })

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: cookApi.getInventory,
  })

  const updateIngredientsMutation = useMutation({
    mutationFn: ({ menuItemId, ingredients }) =>
      cookApi.updateMenuItemIngredients(menuItemId, ingredients),
    onSuccess: (data) => {
      message.success(data.message)
      setModalOpen(false)
      setSelectedMenuItem(null)
      setIngredients([])
      queryClient.invalidateQueries({ queryKey: ['cook-today-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openIngredientsModal = async (menuItem) => {
    setSelectedMenuItem(menuItem)
    try {
      const data = await cookApi.getMenuItemIngredients(menuItem.id)
      const loadedIngredients = data.ingredients.map((ing) => ({
        productId: ing.product.id,
        quantity: parseFloat(ing.quantity),
        productName: ing.product.name,
        productUnit: ing.product.unit,
      }))
      setIngredients(loadedIngredients)
    } catch {
      setIngredients([])
    }
    setModalOpen(true)
  }

  const addIngredient = (values) => {
    const product = products.find((p) => p.id === values.productId)
    if (!product) return

    const exists = ingredients.find((i) => i.productId === values.productId)
    if (exists) {
      message.warning('Этот продукт уже добавлен')
      return
    }

    setIngredients([
      ...ingredients,
      {
        productId: values.productId,
        quantity: values.quantity,
        productName: product.name,
        productUnit: product.unit,
      },
    ])
    form.resetFields()
  }

  const removeIngredient = (productId) => {
    setIngredients(ingredients.filter((i) => i.productId !== productId))
  }

  const saveIngredients = () => {
    updateIngredientsMutation.mutate({
      menuItemId: selectedMenuItem.id,
      ingredients: ingredients.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    })
  }

  const products = inventoryData?.products || []
  const menuItems = menuData?.menuItems || []

  const breakfastItems = useMemo(
    () => menuItems.filter((item) => item.mealType === 'breakfast'),
    [menuItems]
  )
  const lunchItems = useMemo(
    () => menuItems.filter((item) => item.mealType === 'lunch'),
    [menuItems]
  )

  const columns = [
    {
      title: 'Блюдо',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} ₽`,
    },
    {
      title: 'Статус',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable) =>
        isAvailable ? (
          <Tag color="success">Доступно</Tag>
        ) : (
          <Tag color="error">Недоступно</Tag>
        ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => openIngredientsModal(record)}
        >
          Ингредиенты
        </Button>
      ),
    },
  ]

  if (menuError) {
    return (
      <MainLayout>
        <Title level={3}>
          <ExperimentOutlined /> Рецептура блюд
        </Title>
        <ErrorState error={menuError} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Title level={3}>
        <ExperimentOutlined /> Рецептура блюд
      </Title>

      <Card title={MEAL_TYPE_LABELS.breakfast.text} style={{ marginBottom: 16 }}>
        {breakfastItems.length === 0 ? (
          <Empty description="Нет блюд на завтрак" />
        ) : (
          <Table
            columns={columns}
            dataSource={breakfastItems}
            rowKey="id"
            loading={menuPending}
            pagination={false}
          />
        )}
      </Card>

      <Card title={MEAL_TYPE_LABELS.lunch.text}>
        {lunchItems.length === 0 ? (
          <Empty description="Нет блюд на обед" />
        ) : (
          <Table
            columns={columns}
            dataSource={lunchItems}
            rowKey="id"
            loading={menuPending}
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title={`Ингредиенты: ${selectedMenuItem?.name || ''}`}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedMenuItem(null)
          setIngredients([])
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Отмена
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={saveIngredients}
            loading={updateIngredientsMutation.isPending}
          >
            Сохранить
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="inline" onFinish={addIngredient} style={{ marginBottom: 16 }}>
          <Form.Item
            name="productId"
            rules={[{ required: true, message: 'Выберите продукт' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Выберите продукт"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.quantity} ${p.unit})`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            rules={[
              { required: true, message: 'Кол-во' },
              { type: 'number', min: 0.001, message: 'Мин. 0.001' },
            ]}
          >
            <InputNumber placeholder="Кол-во" min={0.001} step={0.1} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Добавить
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '12px 0' }} />

        {ingredients.length === 0 ? (
          <Empty description="Нет ингредиентов" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            dataSource={ingredients}
            rowKey="productId"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Продукт',
                dataIndex: 'productName',
                key: 'productName',
              },
              {
                title: 'Количество',
                key: 'quantity',
                render: (_, record) => `${record.quantity} ${record.productUnit}`,
              },
              {
                title: '',
                key: 'actions',
                width: 50,
                render: (_, record) => (
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeIngredient(record.productId)}
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </MainLayout>
  )
}
