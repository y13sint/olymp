import { Collapse, Table, Button, Space, Tag, Empty, Popconfirm, Typography } from 'antd'
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Panel } = Collapse
const { Text } = Typography

export function MenuDaysList({ menuDays, onAddItem, onEditItem, onDeleteItem, deletingItemId }) {
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
      title: 'Доступно',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (available) => (
        <Tag color={available ? 'success' : 'default'}>
          {available ? 'Да' : 'Нет'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEditItem(record)} />
          <Popconfirm title="Удалить блюдо?" onConfirm={() => onDeleteItem(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} loading={deletingItemId === record.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (menuDays.length === 0) {
    return <Empty description="Нет дней меню" />
  }

  return (
    <Collapse defaultActiveKey={menuDays.slice(0, 3).map((d) => d.id.toString())}>
      {menuDays.map((day) => (
        <Panel
          key={day.id}
          header={
            <Space>
              <CalendarOutlined />
              <Text strong>{dayjs(day.menuDate).format('DD MMMM YYYY (dddd)')}</Text>
              <Tag color={day.isActive ? 'success' : 'default'}>
                {day.isActive ? 'Активно' : 'Неактивно'}
              </Tag>
              <Text type="secondary">{day.menuItems?.length || 0} блюд</Text>
            </Space>
          }
          extra={
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                onAddItem(day)
              }}
            >
              Добавить блюдо
            </Button>
          }
        >
          <Table
            columns={itemColumns}
            dataSource={day.menuItems || []}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Panel>
      ))}
    </Collapse>
  )
}
