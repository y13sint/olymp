import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Layout,
  Menu,
  Button,
  Typography,
  Avatar,
  Dropdown,
  Space,
  Badge,
  List,
  Empty,
  Skeleton,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  TeamOutlined,
  FileTextOutlined,
  InboxOutlined,
  CoffeeOutlined,
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  GroupOutlined,
  CalendarOutlined,
  SendOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuthStore } from '@features/auth'
import { ROUTES, ROLES, ROLE_LABELS } from '@shared/config'
import { notificationApi } from '@shared/api'
import { REFETCH_INTERVALS, LAYOUT, SPACING, FONT_SIZES, BORDER_RADIUS } from '@shared/constants'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { TextArea } = Input

const menuItems = {
  [ROLES.STUDENT]: [
    { key: ROUTES.STUDENT.MENU, icon: <CoffeeOutlined />, label: 'Меню' },
    { key: ROUTES.STUDENT.ORDERS, icon: <CheckCircleOutlined />, label: 'Мои заказы' },
    { key: ROUTES.STUDENT.PAYMENTS, icon: <ShoppingCartOutlined />, label: 'Оплата' },
    { key: ROUTES.STUDENT.PROFILE, icon: <UserOutlined />, label: 'Профиль' },
    { key: ROUTES.STUDENT.REVIEWS, icon: <FileTextOutlined />, label: 'Отзывы' },
  ],
  [ROLES.COOK]: [
    { key: ROUTES.COOK.MEALS, icon: <CoffeeOutlined />, label: 'Выдача блюд' },
    { key: ROUTES.COOK.INVENTORY, icon: <InboxOutlined />, label: 'Склад' },
    { key: ROUTES.COOK.RECIPES, icon: <ExperimentOutlined />, label: 'Рецептура' },
    { key: ROUTES.COOK.REQUESTS, icon: <UnorderedListOutlined />, label: 'Заявки' },
  ],
  [ROLES.ADMIN]: [
    { key: ROUTES.ADMIN.DASHBOARD, icon: <BarChartOutlined />, label: 'Статистика' },
    { key: ROUTES.ADMIN.REQUESTS, icon: <UnorderedListOutlined />, label: 'Заявки' },
    { key: ROUTES.ADMIN.REPORTS, icon: <FileTextOutlined />, label: 'Отчёты' },
    {
      key: 'menu-group',
      icon: <CoffeeOutlined />,
      label: 'Меню',
      children: [
        { key: ROUTES.ADMIN.MENU, icon: <CoffeeOutlined />, label: 'Расписание' },
        { key: ROUTES.ADMIN.TEMPLATES, icon: <CopyOutlined />, label: 'Шаблоны дней' },
        { key: ROUTES.ADMIN.TEMPLATE_GROUPS, icon: <GroupOutlined />, label: 'Группы (shuffle)' },
        { key: ROUTES.ADMIN.WEEK_TEMPLATES, icon: <CalendarOutlined />, label: 'Недельные' },
      ],
    },
    { key: ROUTES.ADMIN.USERS, icon: <TeamOutlined />, label: 'Пользователи' },
  ],
}

const BROADCAST_ROLE_OPTIONS = [
  { value: '', label: 'Всем пользователям' },
  { value: 'student', label: 'Только ученикам' },
  { value: 'cook', label: 'Только поварам' },
  { value: 'admin', label: 'Только администраторам' },
]


export function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const queryClient = useQueryClient()

  const items = menuItems[user?.role] || []
  const isAdmin = user?.role === ROLES.ADMIN

  // Загрузка уведомлений (ошибки не показываем - это фоновый запрос)
  const { data: notifData, isPending: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications({}),
    refetchInterval: REFETCH_INTERVALS.NOTIFICATIONS,
  })

  // Отметить все как прочитанные
  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Рассылка уведомлений
  const broadcastMutation = useMutation({
    mutationFn: notificationApi.broadcast,
    onSuccess: (data) => {
      message.success(data.message)
      setBroadcastModal(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка при отправке')
    },
  })

  const notifications = notifData?.notifications || []
  const unreadCount = notifData?.unreadCount || 0

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const handleBroadcastSubmit = async () => {
    try {
      const values = await form.validateFields()
      broadcastMutation.mutate({
        title: values.title,
        message: values.message,
        role: values.role || undefined,
      })
    } catch {
      // Validation failed
    }
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout,
    },
  ]

  const notificationContent = (
    <div style={{
      width: LAYOUT.SIDER_WIDTH,
      maxHeight: LAYOUT.NOTIFICATION_MAX_HEIGHT,
      overflow: 'auto',
      background: '#fff',
      borderRadius: BORDER_RADIUS.MD,
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{
        padding: `${SPACING.MD}px ${SPACING.LG}px`,
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong>Уведомления</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            Прочитать все
          </Button>
        )}
      </div>
      {notifLoading ? (
        <div style={{ padding: SPACING.LG }}>
          <Skeleton active avatar paragraph={{ rows: 1 }} />
          <Skeleton active avatar paragraph={{ rows: 1 }} style={{ marginTop: SPACING.MD }} />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="Нет уведомлений"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: SPACING.XL }}
        />
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: `${SPACING.MD}px ${SPACING.LG}px`,
                background: item.isRead ? '#fff' : '#e6f7ff',
              }}
            >
              <List.Item.Meta
                title={<Text strong={!item.isRead}>{item.title}</Text>}
                description={
                  <>
                    <Text type="secondary" style={{ fontSize: FONT_SIZES.SM }}>
                      {item.message}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: FONT_SIZES.XS }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: LAYOUT.HEADER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 20 : FONT_SIZES.XL,
            fontWeight: 600,
          }}
        >
          {collapsed ? '🍽️' : '🍽️ Столовая'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: `0 ${SPACING.XL}px`,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space size="middle">
            {isAdmin && (
              <Tooltip title="Отправить уведомление">
                <Button
                  type="text"
                  icon={<SendOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setBroadcastModal(true)}
                />
              </Tooltip>
            )}
            <Dropdown
              dropdownRender={() => notificationContent}
              trigger={['click']}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                />
              </Badge>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong>{user?.fullName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: FONT_SIZES.SM }}>
                    {ROLE_LABELS[user?.role]?.text}
                    {user?.classNumber && ` · ${user.classNumber}${user.classLetter}`}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: SPACING.XL,
            padding: LAYOUT.CONTENT_PADDING,
            background: '#fff',
            borderRadius: BORDER_RADIUS.MD,
            minHeight: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title={
          <Space>
            <SendOutlined />
            <span>Отправить уведомление</span>
          </Space>
        }
        open={broadcastModal}
        onCancel={() => {
          setBroadcastModal(false)
          form.resetFields()
        }}
        onOk={handleBroadcastSubmit}
        okText="Отправить"
        cancelText="Отмена"
        confirmLoading={broadcastMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="role"
            label="Получатели"
            initialValue=""
          >
            <Select options={BROADCAST_ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input placeholder="Важное объявление" maxLength={200} />
          </Form.Item>
          <Form.Item
            name="message"
            label="Сообщение"
            rules={[{ required: true, message: 'Введите текст сообщения' }]}
          >
            <TextArea
              rows={4}
              placeholder="Текст уведомления..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
