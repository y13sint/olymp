import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Skeleton,
  Empty,
  message,
  Alert,
  Statistic,
  Modal,
  List,
  Rate,
} from 'antd'
import {
  CoffeeOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  WarningOutlined,
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { menuApi, studentApi } from '@shared/api'
import { useAuthStore } from '@features/auth'
import { ErrorState } from '@shared/ui'
import { STALE_TIMES, FONT_SIZES } from '@shared/constants'

const { Title, Text, Paragraph } = Typography

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAY_NAMES_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

function getMonday(date) {
  return dayjs(date).isoWeekday(1)
}

function generateWeekDays(mondayDate) {
  const monday = dayjs(mondayDate)
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day').format('YYYY-MM-DD'))
}

export function StudentMenuPage() {
  const queryClient = useQueryClient()
  const { user, fetchUser } = useAuthStore()

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()).format('YYYY-MM-DD'))
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [reviewsModal, setReviewsModal] = useState({ open: false, menuItemId: null })

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['weekMenu', weekStart],
    queryFn: () => menuApi.getWeekMenuByDate(weekStart),
  })

  // Загрузка аллергий пользователя
  const { data: allergiesData } = useQuery({
    queryKey: ['allergies'],
    queryFn: studentApi.getAllergies,
    staleTime: STALE_TIMES.DEFAULT,
  })

  // Загрузка предпочтений пользователя
  const { data: preferencesData } = useQuery({
    queryKey: ['preferences'],
    queryFn: studentApi.getPreferences,
    staleTime: STALE_TIMES.DEFAULT,
  })

  // Загрузка отзывов на блюдо
  const { data: reviewsData, isPending: reviewsLoading } = useQuery({
    queryKey: ['menuItemReviews', reviewsModal.menuItemId],
    queryFn: () => menuApi.getMenuItemReviews(reviewsModal.menuItemId),
    enabled: !!reviewsModal.menuItemId,
  })

  const userAllergens = useMemo(() => {
    return (allergiesData?.allergies || []).map((a) => a.allergenName.toLowerCase())
  }, [allergiesData])

  const userPreferences = useMemo(() => {
    return (preferencesData?.preferences || []).map((p) => p.preferenceName.toLowerCase())
  }, [preferencesData])

  // Проверка: содержит ли блюдо аллерген пользователя
  const checkUserAllergen = useCallback((itemAllergens) => {
    if (!itemAllergens || userAllergens.length === 0) return null
    const itemAllergensList = itemAllergens.toLowerCase().split(',').map((a) => a.trim())
    const matched = userAllergens.find((userAllergen) =>
      itemAllergensList.some((itemAllergen) => itemAllergen.includes(userAllergen) || userAllergen.includes(itemAllergen))
    )
    return matched || null
  }, [userAllergens])

  // Проверка: соответствует ли блюдо предпочтениям пользователя (по названию и описанию)
  const checkUserPreference = useCallback((itemName, itemDescription) => {
    if (userPreferences.length === 0) return null
    const textToCheck = `${itemName || ''} ${itemDescription || ''}`.toLowerCase()
    const matched = userPreferences.find((pref) => textToCheck.includes(pref))
    return matched || null
  }, [userPreferences])

  const orderMutation = useMutation({
    mutationFn: studentApi.pickupMeal,
    onSuccess: (data) => {
      message.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['weekMenu'] })
      fetchUser()
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка при заказе')
    },
  })

  const weekDays = useMemo(() => generateWeekDays(weekStart), [weekStart])

  const menuByDate = useMemo(() => {
    const map = {}
      ; (data?.menu || []).forEach((day) => {
        map[day.menuDate] = day
      })
    return map
  }, [data?.menu])

  const today = dayjs().format('YYYY-MM-DD')

  const goToPrevWeek = () => {
    setWeekStart(dayjs(weekStart).subtract(7, 'day').format('YYYY-MM-DD'))
  }

  const goToNextWeek = () => {
    setWeekStart(dayjs(weekStart).add(7, 'day').format('YYYY-MM-DD'))
  }

  const goToCurrentWeek = () => {
    const monday = getMonday(new Date()).format('YYYY-MM-DD')
    setWeekStart(monday)
    setSelectedDate(today)
  }

  const openReviewsModal = (menuItemId) => {
    setReviewsModal({ open: true, menuItemId })
  }

  // Получить данные выбранного дня
  const selectedDayData = menuByDate[selectedDate]
  const isToday = selectedDate === today
  const isPast = dayjs(selectedDate).isBefore(today, 'day')

  if (error) {
    return (
      <MainLayout>
        <Title level={3} style={{ marginBottom: 24 }}>
          <CoffeeOutlined /> Меню столовой
        </Title>
        <ErrorState error={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <CoffeeOutlined /> Меню столовой
            </Title>
          </Col>
          <Col>
            <Statistic
              title="Ваш баланс"
              value={user?.balance || 0}
              suffix="₽"
              valueStyle={{ color: parseFloat(user?.balance) > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Col>
        </Row>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={goToPrevWeek}
            size="large"
          />

          <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
            {weekDays.map((date, index) => {
              const isSelected = date === selectedDate
              const isTodayDate = date === today
              const hasMenu = !!menuByDate[date]
              const dayOfWeek = dayjs(date)
              const isWeekend = index >= 5 // Сб, Вс

              return (
                <Button
                  key={date}
                  type={isSelected ? 'primary' : 'default'}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    minWidth: 60,
                    height: 'auto',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderColor: isTodayDate ? '#1890ff' : undefined,
                    borderWidth: isTodayDate && !isSelected ? 2 : 1,
                    opacity: hasMenu ? 1 : 0.6,
                    color: isWeekend && !isSelected ? '#ff4d4f' : undefined,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{DAY_NAMES_SHORT[index]}</span>
                  <span style={{ fontSize: 12 }}>{dayOfWeek.format('D')}</span>
                </Button>
              )
            })}
          </div>

          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={goToNextWeek}
            size="large"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary">
            {dayjs(weekStart).format('D MMM')} — {dayjs(weekStart).add(6, 'day').format('D MMM YYYY')}
          </Text>
          {weekStart !== getMonday(new Date()).format('YYYY-MM-DD') && (
            <Button type="link" size="small" onClick={goToCurrentWeek}>
              Вернуться к текущей неделе
            </Button>
          )}
        </div>
      </Card>

      {isPending ? (
        <Card>
          <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 24 }} />
          <Row gutter={[16, 16]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Card>
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      ) : (
        <DayContent
          date={selectedDate}
          dayData={selectedDayData}
          isToday={isToday}
          isPast={isPast}
          onOrder={(menuItemId) => orderMutation.mutate(menuItemId)}
          isOrdering={orderMutation.isPending}
          userBalance={user?.balance}
          checkUserAllergen={checkUserAllergen}
          checkUserPreference={checkUserPreference}
          onShowReviews={openReviewsModal}
        />
      )}

      <Modal
        title={
          reviewsData?.menuItem ? (
            <div>
              <Text strong>{reviewsData.menuItem.name}</Text>
              {reviewsData.avgRating && (
                <div style={{ marginTop: 8 }}>
                  <Rate disabled value={reviewsData.avgRating} allowHalf />
                  <Text style={{ marginLeft: 8 }}>
                    {reviewsData.avgRating} ({reviewsData.reviewsCount} отзывов)
                  </Text>
                </div>
              )}
            </div>
          ) : 'Отзывы'
        }
        open={reviewsModal.open}
        onCancel={() => setReviewsModal({ open: false, menuItemId: null })}
        footer={null}
        width={500}
      >
        {reviewsLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : reviewsData?.reviews?.length === 0 ? (
          <Empty description="Пока нет отзывов" />
        ) : (
          <List
            dataSource={reviewsData?.reviews || []}
            renderItem={(review) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{review.user?.fullName}</Text>
                      <Rate disabled value={review.rating} style={{ fontSize: FONT_SIZES.SM }} />
                    </div>
                  }
                  description={
                    <>
                      {review.comment && <Paragraph style={{ marginBottom: 4 }}>{review.comment}</Paragraph>}
                      <Text type="secondary" style={{ fontSize: FONT_SIZES.XS }}>
                        {dayjs(review.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </MainLayout>
  )
}

function DayContent({ date, dayData, isToday, isPast, onOrder, isOrdering, userBalance, checkUserAllergen, checkUserPreference, onShowReviews }) {
  const dayIndex = dayjs(date).isoWeekday() - 1
  const dayName = DAY_NAMES_FULL[dayIndex]
  const isWeekend = dayIndex >= 5

  if (!dayData) {
    return (
      <Card>
        <Empty
          description={
            <span>
              <Title level={4} style={{ marginBottom: 8 }}>
                {dayName}, {dayjs(date).format('D MMMM')}
              </Title>
              <Text type="secondary">
                {isWeekend ? 'Выходной — меню не запланировано' : 'Меню на этот день ещё не сформировано'}
              </Text>
            </span>
          }
        />
      </Card>
    )
  }

  const breakfastItems = dayData.menuItems?.filter((item) => item.mealType === 'breakfast') || []
  const lunchItems = dayData.menuItems?.filter((item) => item.mealType === 'lunch') || []

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {dayName}, {dayjs(date).format('D MMMM')}
        </Title>
      </div>

      {isToday && (
        <Alert
          message="Сегодняшнее меню"
          description="Вы можете заказать блюда на сегодня"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      {isPast && (
        <Alert
          message="Прошедший день"
          description="Заказы на прошедшие дни недоступны"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      {!isToday && !isPast && (
        <Alert
          message="Будущая дата"
          description="Заказы можно делать только на текущий день"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Title level={5}>🌅 Завтрак</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {breakfastItems.length === 0 ? (
          <Col span={24}>
            <Empty description="Нет блюд" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Col>
        ) : (
          breakfastItems.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <MenuItemCard
                item={item}
                canOrder={isToday}
                onOrder={onOrder}
                isOrdering={isOrdering}
                userBalance={userBalance}
                checkUserAllergen={checkUserAllergen}
                checkUserPreference={checkUserPreference}
                onShowReviews={onShowReviews}
              />
            </Col>
          ))
        )}
      </Row>

      <Title level={5}>☀️ Обед</Title>
      <Row gutter={[16, 16]}>
        {lunchItems.length === 0 ? (
          <Col span={24}>
            <Empty description="Нет блюд" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Col>
        ) : (
          lunchItems.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <MenuItemCard
                item={item}
                canOrder={isToday}
                onOrder={onOrder}
                isOrdering={isOrdering}
                userBalance={userBalance}
                checkUserAllergen={checkUserAllergen}
                checkUserPreference={checkUserPreference}
                onShowReviews={onShowReviews}
              />
            </Col>
          ))
        )}
      </Row>
    </div>
  )
}

function MenuItemCard({ item, canOrder, onOrder, isOrdering, userBalance, checkUserAllergen, checkUserPreference, onShowReviews }) {
  const canAfford = parseFloat(userBalance) >= parseFloat(item.price)
  const matchedAllergen = checkUserAllergen?.(item.allergens)
  const hasUserAllergen = !!matchedAllergen
  const matchedPreference = checkUserPreference?.(item.name, item.description)
  const hasUserPreference = !!matchedPreference && !hasUserAllergen // приоритет аллергии

  // Определяем стиль карточки: аллергия (красный) > предпочтение (салатовый)
  const cardStyle = hasUserAllergen ? {
    border: '2px solid #ff4d4f',
    background: '#fff2f0',
  } : hasUserPreference ? {
    border: '2px solid #b7eb8f',
    background: '#f6ffed',
  } : undefined

  return (
    <Card
      hoverable
      style={cardStyle}
      actions={
        canOrder
          ? [
            <Button
              key="order"
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => onOrder(item.id)}
              loading={isOrdering}
              disabled={!canAfford}
            >
              Заказать
            </Button>,
          ]
          : undefined
      }
    >
      {hasUserAllergen && (
        <Tag color="error" icon={<WarningOutlined />} style={{ marginBottom: 12 }}>
          Содержит ваш аллерген
        </Tag>
      )}
      {hasUserPreference && (
        <Tag color="green" icon={<HeartOutlined />} style={{ marginBottom: 12 }}>
          Соответствует вашим предпочтениям
        </Tag>
      )}
      <Card.Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.name}</span>
            <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
              {item.price}₽
            </Text>
          </div>
        }
        description={
          <>
            {item.description && (
              <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                {item.description}
              </Paragraph>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {item.calories && <Tag color="blue">{item.calories} ккал</Tag>}
              {item.avgRating ? (
                <Tag
                  color="gold"
                  icon={<StarOutlined />}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onShowReviews(item.id)}
                >
                  {item.avgRating} ({item.reviewsCount})
                </Tag>
              ) : (
                <Tag
                  color="default"
                  icon={<StarOutlined />}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onShowReviews(item.id)}
                >
                  Нет отзывов
                </Tag>
              )}
            </div>

            {item.allergens && (
              <div>
                <Text type={hasUserAllergen ? 'danger' : 'warning'}>
                  <WarningOutlined /> Аллергены: {item.allergens}
                </Text>
              </div>
            )}

            {canOrder && !canAfford && (
              <Text type="danger" style={{ display: 'block', marginTop: 8 }}>
                Недостаточно средств
              </Text>
            )}
          </>
        }
      />
    </Card>
  )
}
