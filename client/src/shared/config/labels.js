// Роли
export const ROLE_LABELS = {
  student: { text: 'Ученик', color: 'blue' },
  cook: { text: 'Повар', color: 'green' },
  admin: { text: 'Администратор', color: 'red' },
}

// Статусы заявок
export const REQUEST_STATUS_LABELS = {
  pending: { text: 'На рассмотрении', color: 'processing' },
  approved: { text: 'Одобрена', color: 'success' },
  rejected: { text: 'Отклонена', color: 'error' },
}

// Типы и статусы платежей
export const PAYMENT_TYPE_LABELS = {
  single: { text: 'Разовый', color: 'blue' },
  subscription: { text: 'Абонемент', color: 'purple' },
}

export const PAYMENT_STATUS_LABELS = {
  pending: { text: 'В обработке', color: 'processing' },
  completed: { text: 'Выполнен', color: 'success' },
  failed: { text: 'Ошибка', color: 'error' },
}

// Типы питания
export const MEAL_TYPE_LABELS = {
  breakfast: { text: 'Завтрак', color: 'orange' },
  lunch: { text: 'Обед', color: 'blue' },
}

// Абонементы
export const SUBSCRIPTION_TYPE_LABELS = {
  breakfast: { text: 'Завтраки', price: 80 },
  lunch: { text: 'Обеды', price: 150 },
  full: { text: 'Полное питание', price: 200 },
}

// Опции для Select
export const ROLE_OPTIONS = [
  { value: 'student', label: 'Ученик' },
  { value: 'cook', label: 'Повар' },
  { value: 'admin', label: 'Администратор' },
]

export const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
]

export const SUBSCRIPTION_OPTIONS = [
  { value: 'breakfast', label: 'Только завтраки', price: 80 },
  { value: 'lunch', label: 'Только обеды', price: 150 },
  { value: 'full', label: 'Полное питание', price: 200 },
]

// Дни недели
export const WEEK_DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

// ISO формат: 1=Пн, 7=Вс
export const WEEK_DAYS_OPTIONS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 7, label: 'Вс' },
]

// Буквы классов
export const CLASS_LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'].map((l) => ({ value: l, label: l }))
