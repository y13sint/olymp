import db from '../../infrastructure/database/models/index.cjs'

const { Notification, User } = db

export async function notifyUser(userId, title, message) {
  return Notification.create({ userId, title, message, isRead: false })
}

export async function notifyByRole(role, title, message) {
  const users = await User.findAll({ where: { role }, attributes: ['id'] })
  if (users.length === 0) return []
  return Notification.bulkCreate(users.map(user => ({ userId: user.id, title, message, isRead: false })))
}

export async function notifyAdmins(title, message) {
  return notifyByRole('admin', title, message)
}

export async function notifyCooks(title, message) {
  return notifyByRole('cook', title, message)
}

export async function notifyPurchaseRequestDecision(cookId, productName, quantity, unit, approved) {
  const title = approved ? 'Заявка одобрена' : 'Заявка отклонена'
  const message = `Ваша заявка на закупку "${productName}" (${quantity} ${unit}) ${approved ? 'одобрена' : 'отклонена'}.`
  return notifyUser(cookId, title, message)
}

export async function notifyLowStock(productName, currentQuantity, minQuantity, unit) {
  return notifyAdmins('Низкий остаток продукта', `"${productName}": ${currentQuantity} ${unit}. Минимум: ${minQuantity} ${unit}.`)
}

export async function notifyNewPurchaseRequest(cookName, productName, quantity, unit) {
  return notifyAdmins('Новая заявка на закупку', `${cookName}: "${productName}" — ${quantity} ${unit}.`)
}
