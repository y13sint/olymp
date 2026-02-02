import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Collapse,
  Empty,
  Tooltip,
  Skeleton,
} from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { templateApi } from '@shared/api'

const { Title, Text } = Typography
const { Panel } = Collapse

const mealTypeOptions = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
]

export function AdminTemplatesPage() {
  const queryClient = useQueryClient()
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [templateForm] = Form.useForm()
  const [itemForm] = Form.useForm()

  // Загрузка шаблонов
  const { data, isPending } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates({}),
  })

  // Создание шаблона
  const createTemplateMutation = useMutation({
    mutationFn: templateApi.createTemplate,
    onSuccess: () => {
      message.success('Шаблон создан')
      setTemplateModalOpen(false)
      templateForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Обновление шаблона
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }) => templateApi.updateTemplate(id, updates),
    onSuccess: () => {
      message.success('Шаблон обновлён')
      setTemplateModalOpen(false)
      setSelectedTemplate(null)
      templateForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление шаблона
  const deleteTemplateMutation = useMutation({
    mutationFn: templateApi.deleteTemplate,
    onSuccess: () => {
      message.success('Шаблон удалён')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Добавление блюда
  const addItemMutation = useMutation({
    mutationFn: ({ templateId, itemData }) => templateApi.addTemplateItem(templateId, itemData),
    onSuccess: () => {
      message.success('Блюдо добавлено')
      setItemModalOpen(false)
      itemForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Обновление блюда
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }) => templateApi.updateTemplateItem(id, updates),
    onSuccess: () => {
      message.success('Блюдо обновлено')
      setItemModalOpen(false)
      setEditingItem(null)
      itemForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление блюда
  const deleteItemMutation = useMutation({
    mutationFn: templateApi.deleteTemplateItem,
    onSuccess: () => {
      message.success('Блюдо удалено')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openCreateTemplate = () => {
    setSelectedTemplate(null)
    templateForm.resetFields()
    setTemplateModalOpen(true)
  }

  const openEditTemplate = (template) => {
    setSelectedTemplate(template)
    templateForm.setFieldsValue({
      name: template.name,
      tags: template.tags?.join(', ') || '',
    })
    setTemplateModalOpen(true)
  }

  const openAddItem = (template) => {
    setSelectedTemplate(template)
    setEditingItem(null)
    itemForm.resetFields()
    setItemModalOpen(true)
  }

  const openEditItem = (item, template) => {
    setSelectedTemplate(template)
    setEditingItem(item)
    itemForm.setFieldsValue(item)
    setItemModalOpen(true)
  }

  const handleTemplateSubmit = (values) => {
    const tags = values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    if (selectedTemplate) {
      updateTemplateMutation.mutate({
        id: selectedTemplate.id,
        updates: { name: values.name, tags },
      })
    } else {
      createTemplateMutation.mutate({ name: values.name, tags })
    }
  }

  const handleItemSubmit = (values) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, updates: values })
    } else {
      addItemMutation.mutate({ templateId: selectedTemplate.id, itemData: values })
    }
  }

  const templates = data?.templates || []

  const itemColumns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Тип',
      dataIndex: 'mealType',
      key: 'mealType',
      render: (type) => (
        <Tag color={type === 'breakfast' ? 'orange' : 'blue'}>
          {type === 'breakfast' ? 'Завтрак' : 'Обед'}
        </Tag>
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price}₽`,
    },
    {
      title: 'Калории',
      dataIndex: 'calories',
      key: 'calories',
      render: (cal) => cal || '—',
    },
    {
      title: 'Аллергены',
      dataIndex: 'allergens',
      key: 'allergens',
      render: (allergens) => allergens || '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditItem(record, selectedTemplate)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить блюдо?"
            onConfirm={() => deleteItemMutation.mutate(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <FileTextOutlined /> Шаблоны меню
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateTemplate}
        >
          Новый шаблон
        </Button>
      </Space>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Шаблоны позволяют быстро заполнять меню на любой день.
        Создайте шаблон с блюдами и применяйте его на нужные даты.
      </Text>

      {isPending ? (
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <Empty
            description="Нет шаблонов"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={openCreateTemplate}>
              Создать первый шаблон
            </Button>
          </Empty>
        </Card>
      ) : (
        <Collapse
          defaultActiveKey={templates.slice(0, 2).map((t) => t.id.toString())}
          onChange={() => { }}
        >
          {templates.map((template) => (
            <Panel
              key={template.id}
              header={
                <Space onClick={(e) => e.stopPropagation()}>
                  <CopyOutlined />
                  <Text strong>{template.name}</Text>
                  {template.tags?.length > 0 && (
                    <Space size={4}>
                      {template.tags.map((tag) => (
                        <Tag key={tag} color="geekblue" icon={<TagsOutlined />}>
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  )}
                  <Text type="secondary">
                    ({template.items?.length || 0} блюд)
                  </Text>
                </Space>
              }
              extra={
                <Space onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditTemplate(template)
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      openAddItem(template)
                    }}
                  >
                    Добавить блюдо
                  </Button>
                  <Popconfirm
                    title="Удалить шаблон?"
                    description="Все блюда в шаблоне будут удалены"
                    onConfirm={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              }
            >
              <Table
                columns={itemColumns.map((col) =>
                  col.key === 'actions'
                    ? {
                      ...col,
                      render: (_, record) => (
                        <Space>
                          <Tooltip title="Редактировать">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openEditItem(record, template)}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Удалить блюдо?"
                            onConfirm={() => deleteItemMutation.mutate(record.id)}
                          >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      ),
                    }
                    : col
                )}
                dataSource={template.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Нет блюд в шаблоне' }}
              />
            </Panel>
          ))}
        </Collapse>
      )}

      <Modal
        title={selectedTemplate ? 'Редактировать шаблон' : 'Новый шаблон'}
        open={templateModalOpen}
        onCancel={() => {
          setTemplateModalOpen(false)
          setSelectedTemplate(null)
        }}
        footer={null}
      >
        <Form form={templateForm} onFinish={handleTemplateSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Например: Понедельник стандартный" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Теги"
            extra="Разделяйте запятой: лёгкий, вегетарианский"
          >
            <Input placeholder="завтрак, лёгкий" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            block
          >
            {selectedTemplate ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Modal>

      <Modal
        title={editingItem ? 'Редактировать блюдо' : 'Новое блюдо'}
        open={itemModalOpen}
        onCancel={() => {
          setItemModalOpen(false)
          setEditingItem(null)
        }}
        footer={null}
        width={500}
      >
        <Form form={itemForm} onFinish={handleItemSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="price"
              label="Цена"
              rules={[{ required: true, message: 'Введите цену' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} addonAfter="₽" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="mealType"
              label="Тип"
              rules={[{ required: true, message: 'Выберите тип' }]}
              style={{ flex: 1 }}
            >
              <Select options={mealTypeOptions} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="calories" label="Калории" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="allergens" label="Аллергены" style={{ flex: 1 }}>
              <Input placeholder="молоко, глютен..." />
            </Form.Item>
          </Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={addItemMutation.isPending || updateItemMutation.isPending}
            block
          >
            {editingItem ? 'Сохранить' : 'Добавить'}
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
