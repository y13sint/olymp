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
  Select,
  message,
  Space,
  Popconfirm,
  Empty,
  Progress,
  Tooltip,
  List,
  Alert,
  Skeleton,
} from 'antd'
import {
  GroupOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { templateApi } from '@shared/api'

const { Title, Text } = Typography

const WEEK_DAYS = [
  { value: null, label: 'Любой день' },
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 7, label: 'Воскресенье' },
]

const getDayName = (dayOfWeek) => {
  const day = WEEK_DAYS.find((d) => d.value === dayOfWeek)
  return day?.label || 'Любой день'
}

export function AdminTemplateGroupsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailGroup, setDetailGroup] = useState(null)
  const [form] = Form.useForm()

  // Загрузка групп
  const { data: groupsData, isPending: groupsLoading } = useQuery({
    queryKey: ['template-groups'],
    queryFn: () => templateApi.getGroups(),
  })

  // Загрузка шаблонов для выбора
  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates({}),
  })

  // Создание группы
  const createGroupMutation = useMutation({
    mutationFn: templateApi.createGroup,
    onSuccess: () => {
      message.success('Группа создана')
      setModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['template-groups'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Обновление группы
  const updateGroupMutation = useMutation({
    mutationFn: ({ id, updates }) => templateApi.updateGroup(id, updates),
    onSuccess: () => {
      message.success('Группа обновлена')
      setModalOpen(false)
      setSelectedGroup(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['template-groups'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Удаление группы
  const deleteGroupMutation = useMutation({
    mutationFn: templateApi.deleteGroup,
    onSuccess: () => {
      message.success('Группа удалена')
      queryClient.invalidateQueries({ queryKey: ['template-groups'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  // Загрузка деталей группы
  const { data: groupDetailData, isPending: detailLoading } = useQuery({
    queryKey: ['template-group', detailGroup?.id],
    queryFn: () => templateApi.getGroupById(detailGroup?.id),
    enabled: !!detailGroup?.id,
  })

  const openCreate = () => {
    setSelectedGroup(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (group) => {
    setSelectedGroup(group)
    form.setFieldsValue({
      name: group.name,
      dayOfWeek: group.dayOfWeek,
      templateIds: group.templates?.map((t) => t.id) || [],
    })
    setModalOpen(true)
  }

  const openDetail = (group) => {
    setDetailGroup(group)
    setDetailModalOpen(true)
  }

  const handleSubmit = (values) => {
    const data = {
      name: values.name,
      dayOfWeek: values.dayOfWeek || null,
      templateIds: values.templateIds || [],
    }

    if (selectedGroup) {
      updateGroupMutation.mutate({ id: selectedGroup.id, updates: data })
    } else {
      createGroupMutation.mutate(data)
    }
  }

  const groups = groupsData?.groups || []
  const templates = templatesData?.templates || []

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <SwapOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'День недели',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day) => (
        <Tag color={day ? 'blue' : 'default'}>
          {getDayName(day)}
        </Tag>
      ),
    },
    {
      title: 'Шаблонов',
      dataIndex: 'templates',
      key: 'templates',
      render: (templates) => (
        <Tag color="green">{templates?.length || 0}</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Подробнее">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => openDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить группу?"
            description="История shuffle будет очищена"
            onConfirm={() => deleteGroupMutation.mutate(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const shuffleStats = groupDetailData?.shuffleStats

  return (
    <MainLayout>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <GroupOutlined /> Группы шаблонов (Shuffle)
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          Новая группа
        </Button>
      </Space>

      <Alert
        type="info"
        showIcon
        icon={<SwapOutlined />}
        message="Режим Shuffle"
        description="Группы используются для случайного выбора шаблонов. При применении система выбирает случайный неиспользованный шаблон из группы. Когда все шаблоны использованы — цикл начинается заново."
        style={{ marginBottom: 16 }}
      />

      <Card>
        {groupsLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : groups.length === 0 ? (
          <Empty
            description="Нет групп шаблонов"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={openCreate}>
              Создать первую группу
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={groups}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title={selectedGroup ? 'Редактировать группу' : 'Новая группа'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedGroup(null)
        }}
        footer={null}
        width={500}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Например: Понедельники разные" />
          </Form.Item>
          <Form.Item
            name="dayOfWeek"
            label="День недели"
            extra="Опционально. Для удобства фильтрации."
          >
            <Select
              options={WEEK_DAYS}
              allowClear
              placeholder="Выберите день"
            />
          </Form.Item>
          <Form.Item
            name="templateIds"
            label="Шаблоны в группе"
            rules={[{ required: true, message: 'Выберите хотя бы один шаблон' }]}
          >
            <Select
              mode="multiple"
              placeholder="Выберите шаблоны"
              optionFilterProp="label"
              options={templates.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.items?.length || 0} блюд)`,
              }))}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={createGroupMutation.isPending || updateGroupMutation.isPending}
            block
          >
            {selectedGroup ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <SwapOutlined />
            {detailGroup?.name}
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false)
          setDetailGroup(null)
        }}
        footer={null}
        width={600}
      >
        {detailLoading ? (
          <Text>Загрузка...</Text>
        ) : (
          <>
            {shuffleStats && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Статистика Shuffle</Text>
                  <Progress
                    percent={Math.round(
                      ((shuffleStats.totalTemplates - shuffleStats.remainingCount) /
                        shuffleStats.totalTemplates) *
                      100
                    )}
                    format={() =>
                      `${shuffleStats.totalTemplates - shuffleStats.remainingCount} / ${shuffleStats.totalTemplates}`
                    }
                  />
                  <Space>
                    <Text type="secondary">Использовано:</Text>
                    <Tag color="blue">{shuffleStats.usedCount}</Tag>
                    <Text type="secondary">Осталось:</Text>
                    <Tag color="green">{shuffleStats.remainingCount}</Tag>
                  </Space>
                  {shuffleStats.willResetOnNext && (
                    <Alert
                      type="warning"
                      message="При следующем применении цикл начнётся заново"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            )}

            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Шаблоны в группе:
            </Text>
            <List
              size="small"
              bordered
              dataSource={groupDetailData?.group?.templates || []}
              renderItem={(template) => (
                <List.Item>
                  <Space>
                    <Text>{template.name}</Text>
                    <Tag>{template.items?.length || 0} блюд</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </MainLayout>
  )
}
