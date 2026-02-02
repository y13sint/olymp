import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Empty,
  Row,
  Col,
  Divider,
  Alert,
  Skeleton,
} from 'antd'
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { templateApi } from '@shared/api'

const { Title, Text } = Typography

const WEEK_DAYS = [
  { value: 1, label: 'Пн', full: 'Понедельник' },
  { value: 2, label: 'Вт', full: 'Вторник' },
  { value: 3, label: 'Ср', full: 'Среда' },
  { value: 4, label: 'Чт', full: 'Четверг' },
  { value: 5, label: 'Пт', full: 'Пятница' },
  { value: 6, label: 'Сб', full: 'Суббота' },
  { value: 7, label: 'Вс', full: 'Воскресенье' },
]

const getDayFull = (dayOfWeek) => {
  return WEEK_DAYS.find((d) => d.value === dayOfWeek)?.full || ''
}

export function AdminWeekTemplatesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedWeekTemplate, setSelectedWeekTemplate] = useState(null)
  const [form] = Form.useForm()

  // Загрузка недельных шаблонов
  const { data: weekTemplatesData, isPending } = useQuery({
    queryKey: ['week-templates'],
    queryFn: () => templateApi.getWeekTemplates(),
  })

  // Загрузка шаблонов дней
  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates({}),
  })

  // Загрузка групп
  const { data: groupsData } = useQuery({
    queryKey: ['template-groups'],
    queryFn: () => templateApi.getGroups(),
  })

  // Создание недельного шаблона
  const createMutation = useMutation({
    mutationFn: templateApi.createWeekTemplate,
    onSuccess: () => {
      message.success('Недельный шаблон создан')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['week-templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Обновление
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => templateApi.updateWeekTemplate(id, updates),
    onSuccess: () => {
      message.success('Недельный шаблон обновлён')
      setModalOpen(false)
      setSelectedWeekTemplate(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['week-templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление
  const deleteMutation = useMutation({
    mutationFn: templateApi.deleteWeekTemplate,
    onSuccess: () => {
      message.success('Недельный шаблон удалён')
      queryClient.invalidateQueries({ queryKey: ['week-templates'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const openCreate = () => {
    setSelectedWeekTemplate(null)
    form.resetFields()
    // Инициализируем пустые слоты
    const initialSlots = {}
    WEEK_DAYS.forEach((day) => {
      initialSlots[`slot_${day.value}_type`] = 'none'
      initialSlots[`slot_${day.value}_id`] = null
    })
    form.setFieldsValue(initialSlots)
    setModalOpen(true)
  }

  const openEdit = (weekTemplate) => {
    setSelectedWeekTemplate(weekTemplate)
    const values = { name: weekTemplate.name }

    // Заполняем слоты
    WEEK_DAYS.forEach((day) => {
      const slot = weekTemplate.slots?.find((s) => s.dayOfWeek === day.value)
      if (slot?.templateId) {
        values[`slot_${day.value}_type`] = 'template'
        values[`slot_${day.value}_id`] = slot.templateId
      } else if (slot?.groupId) {
        values[`slot_${day.value}_type`] = 'shuffle'
        values[`slot_${day.value}_id`] = slot.groupId
      } else {
        values[`slot_${day.value}_type`] = 'none'
        values[`slot_${day.value}_id`] = null
      }
    })

    form.setFieldsValue(values)
    setModalOpen(true)
  }

  const handleSubmit = (values) => {
    const slots = WEEK_DAYS.map((day) => {
      const type = values[`slot_${day.value}_type`]
      const id = values[`slot_${day.value}_id`]

      return {
        dayOfWeek: day.value,
        templateId: type === 'template' ? id : null,
        groupId: type === 'shuffle' ? id : null,
      }
    }).filter((slot) => slot.templateId || slot.groupId)

    const data = { name: values.name, slots }

    if (selectedWeekTemplate) {
      updateMutation.mutate({ id: selectedWeekTemplate.id, updates: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const weekTemplates = weekTemplatesData?.weekTemplates || []
  const templates = templatesData?.templates || []
  const groups = groupsData?.groups || []

  // Компонент для отображения слота
  const SlotCard = ({ slot, dayOfWeek }) => {
    if (!slot) {
      return (
        <Card size="small" style={{ background: '#fafafa', minHeight: 60 }}>
          <Text type="secondary">Пусто</Text>
        </Card>
      )
    }

    if (slot.template) {
      return (
        <Card size="small" style={{ background: '#e6f7ff', minHeight: 60 }}>
          <Space direction="vertical" size={0}>
            <Space>
              <FileTextOutlined />
              <Text strong>{slot.template.name}</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {slot.template.items?.length || 0} блюд
            </Text>
          </Space>
        </Card>
      )
    }

    if (slot.group) {
      return (
        <Card size="small" style={{ background: '#fff7e6', minHeight: 60 }}>
          <Space direction="vertical" size={0}>
            <Space>
              <SwapOutlined />
              <Text strong>{slot.group.name}</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Shuffle ({slot.group.templates?.length || 0} вариантов)
            </Text>
          </Space>
        </Card>
      )
    }

    return null
  }

  return (
    <MainLayout>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <CalendarOutlined /> Недельные шаблоны
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          Новый недельный шаблон
        </Button>
      </Space>

      <Alert
        type="info"
        showIcon
        message="Недельные шаблоны"
        description="Настройте меню на всю неделю. Для каждого дня можно выбрать конкретный шаблон или группу для случайного выбора (shuffle)."
        style={{ marginBottom: 16 }}
      />

      {isPending ? (
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : weekTemplates.length === 0 ? (
        <Card>
          <Empty
            description="Нет недельных шаблонов"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={openCreate}>
              Создать первый
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {weekTemplates.map((wt) => (
            <Card
              key={wt.id}
              title={
                <Space>
                  <CalendarOutlined />
                  <Text strong>{wt.name}</Text>
                </Space>
              }
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(wt)}
                  >
                    Редактировать
                  </Button>
                  <Popconfirm
                    title="Удалить недельный шаблон?"
                    onConfirm={() => deleteMutation.mutate(wt.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              }
            >
              <Row gutter={8}>
                {WEEK_DAYS.map((day) => {
                  const slot = wt.slots?.find((s) => s.dayOfWeek === day.value)
                  return (
                    <Col key={day.value} span={Math.floor(24 / 7)}>
                      <div style={{ textAlign: 'center', marginBottom: 4 }}>
                        <Tag color={day.value >= 6 ? 'red' : 'blue'}>{day.label}</Tag>
                      </div>
                      <SlotCard slot={slot} dayOfWeek={day.value} />
                    </Col>
                  )
                })}
              </Row>
            </Card>
          ))}
        </Space>
      )}

      <Modal
        title={selectedWeekTemplate ? 'Редактировать недельный шаблон' : 'Новый недельный шаблон'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedWeekTemplate(null)
        }}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Например: Стандартная неделя" />
          </Form.Item>

          <Divider>Дни недели</Divider>

          {WEEK_DAYS.map((day) => (
            <Row key={day.value} gutter={16} style={{ marginBottom: 12 }}>
              <Col span={4}>
                <Tag
                  color={day.value >= 6 ? 'red' : 'blue'}
                  style={{ marginTop: 8, width: '100%', textAlign: 'center' }}
                >
                  {day.full}
                </Tag>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={`slot_${day.value}_type`}
                  style={{ marginBottom: 0 }}
                  initialValue="none"
                >
                  <Select
                    options={[
                      { value: 'none', label: 'Пусто' },
                      { value: 'template', label: 'Шаблон' },
                      { value: 'shuffle', label: 'Shuffle (группа)' },
                    ]}
                    onChange={() => {
                      form.setFieldValue(`slot_${day.value}_id`, null)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev[`slot_${day.value}_type`] !== curr[`slot_${day.value}_type`]
                  }
                >
                  {({ getFieldValue }) => {
                    const type = getFieldValue(`slot_${day.value}_type`)
                    if (type === 'template') {
                      return (
                        <Form.Item name={`slot_${day.value}_id`} style={{ marginBottom: 0 }}>
                          <Select
                            placeholder="Выберите шаблон"
                            allowClear
                            options={templates.map((t) => ({
                              value: t.id,
                              label: `${t.name} (${t.items?.length || 0} блюд)`,
                            }))}
                          />
                        </Form.Item>
                      )
                    }
                    if (type === 'shuffle') {
                      return (
                        <Form.Item name={`slot_${day.value}_id`} style={{ marginBottom: 0 }}>
                          <Select
                            placeholder="Выберите группу"
                            allowClear
                            options={groups.map((g) => ({
                              value: g.id,
                              label: `${g.name} (${g.templates?.length || 0} шаблонов)`,
                            }))}
                          />
                        </Form.Item>
                      )
                    }
                    return null
                  }}
                </Form.Item>
              </Col>
            </Row>
          ))}

          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            block
            style={{ marginTop: 16 }}
          >
            {selectedWeekTemplate ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Modal>
    </MainLayout>
  )
}
