export const SUBSCRIPTION_PRICES = { breakfast: 80, lunch: 150, full: 200 }
export const SUBSCRIPTION_NAMES = { breakfast: 'Завтраки', lunch: 'Обеды', full: 'Полное питание' }

export function calculateSubscriptionPrice(type, days) {
  const pricePerDay = SUBSCRIPTION_PRICES[type]
  if (!pricePerDay) throw new Error(`Неизвестный тип абонемента: ${type}`)
  return pricePerDay * days
}

export function calculateSubscriptionDates(days) {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + days)
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

export function hasEnoughBalance(balance, amount) {
  return parseFloat(balance) >= amount
}

export function formatSubscriptionDescription(type, days) {
  return `Абонемент "${SUBSCRIPTION_NAMES[type] || type}" на ${days} дней`
}
