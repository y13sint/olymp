import { Op } from 'sequelize'
import db from '../../infrastructure/database/models/index.cjs'

const { MealPickup, Subscription } = db

export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export async function findExistingPickup(userId, mealType, date = getTodayDate(), transaction = null) {
  return MealPickup.findOne({
    where: { userId, pickupDate: date, mealType },
    ...(transaction && { transaction }),
  })
}

export async function findActiveSubscription(userId, mealType, date = getTodayDate(), transaction = null) {
  return Subscription.findOne({
    where: {
      userId,
      isActive: true,
      startDate: { [Op.lte]: date },
      endDate: { [Op.gte]: date },
      type: { [Op.in]: [mealType, 'full'] },
    },
    ...(transaction && { transaction }),
  })
}

export async function createMealPickup(data, transaction = null) {
  return MealPickup.create({
    userId: data.userId,
    menuItemId: data.menuItemId,
    pickupDate: data.pickupDate || getTodayDate(),
    mealType: data.mealType,
    paidBy: data.paidBy || 'balance',
    isReceived: false,
  }, transaction ? { transaction } : undefined)
}

export async function confirmPickup(pickup) {
  pickup.isReceived = true
  pickup.receivedAt = new Date()
  await pickup.save()
  return pickup
}

export function getMealTypeName(mealType) {
  return { breakfast: 'завтрак', lunch: 'обед' }[mealType] || mealType
}
