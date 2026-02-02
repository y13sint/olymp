import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Card,
  List,
  Rate,
  Button,
  Empty,
  Skeleton,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd'
import { StarOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { MainLayout } from '@widgets/layouts'
import { studentApi } from '@shared/api'
import { ErrorState } from '@shared/ui'
import { FONT_SIZES } from '@shared/constants'

const { Title, Text, Paragraph } = Typography

export function StudentReviewsPage() {
  const queryClient = useQueryClient()

  // Загрузка отзывов
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['myReviews'],
    queryFn: studentApi.getMyReviews,
  })

  // Удаление отзыва
  const deleteMutation = useMutation({
    mutationFn: studentApi.deleteReview,
    onSuccess: () => {
      message.success('Отзыв удалён')
      queryClient.invalidateQueries({ queryKey: ['myReviews'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const reviews = data?.reviews || []

  return (
    <MainLayout>
      <Title level={3}>
        <StarOutlined /> Мои отзывы
      </Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Здесь отображаются ваши отзывы о блюдах. Оставить отзыв можно на странице меню.
      </Text>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : reviews.length === 0 ? (
        <Empty description="У вас пока нет отзывов" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{review.menuItem?.name || 'Блюдо удалено'}</span>
                    <Rate disabled defaultValue={review.rating} style={{ fontSize: FONT_SIZES.MD }} />
                  </div>
                }
                extra={
                  <Popconfirm
                    title="Удалить отзыв?"
                    onConfirm={() => deleteMutation.mutate(review.id)}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deleteMutation.isPending}
                    />
                  </Popconfirm>
                }
              >
                {review.comment ? (
                  <Paragraph ellipsis={{ rows: 3 }}>{review.comment}</Paragraph>
                ) : (
                  <Text type="secondary" italic>
                    Без комментария
                  </Text>
                )}
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: FONT_SIZES.SM }}>
                    {dayjs(review.createdAt).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </MainLayout>
  )
}
