import { Op } from 'sequelize'
import db from '../../infrastructure/database/models/index.cjs'

const { MenuTemplate, MenuTemplateItem, TemplateGroup, WeekTemplate, WeekTemplateSlot, ShuffleUsage, MenuDay, MenuItem } = db

export function formatDate(date) {
  if (typeof date === 'string') return date
  return date.toISOString().split('T')[0]
}

export function getDayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  return day === 0 ? 7 : day
}

export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export async function applyTemplateToDate(templateId, date, options = {}) {
  const { overwrite = true } = options
  const transaction = await db.sequelize.transaction()

  try {
    const template = await MenuTemplate.findByPk(templateId, {
      include: [{ model: MenuTemplateItem, as: 'items' }],
      transaction,
    })

    if (!template) {
      await transaction.rollback()
      throw new Error(`Шаблон с ID ${templateId} не найден`)
    }

    let menuDay = await MenuDay.findOne({ where: { menuDate: date }, transaction })

    if (menuDay) {
      if (!overwrite) {
        await transaction.rollback()
        throw new Error(`Меню на ${date} уже существует`)
      }
      await MenuItem.destroy({ where: { menuDayId: menuDay.id }, transaction })
    } else {
      menuDay = await MenuDay.create({ menuDate: date, isActive: true }, { transaction })
    }

    const items = template.items.map(item => ({
      menuDayId: menuDay.id,
      name: item.name,
      description: item.description,
      price: item.price,
      mealType: item.mealType,
      allergens: item.allergens,
      calories: item.calories,
      isAvailable: true,
    }))

    await MenuItem.bulkCreate(items, { transaction })
    await transaction.commit()
    return menuDay
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function pickShuffleTemplate(groupId) {
  const group = await TemplateGroup.findByPk(groupId, { include: [{ model: MenuTemplate, as: 'templates' }] })
  if (!group || !group.templates.length) return null

  const templateIds = group.templates.map(t => t.id)
  const usedTemplates = await ShuffleUsage.findAll({ where: { groupId }, attributes: ['templateId'] })
  const usedIds = usedTemplates.map(u => u.templateId)

  let availableIds = templateIds.filter(id => !usedIds.includes(id))

  if (availableIds.length === 0) {
    await ShuffleUsage.destroy({ where: { groupId } })
    availableIds = templateIds
  }

  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)]
  return MenuTemplate.findByPk(randomId)
}

export async function applyShuffleToDate(groupId, date, options = {}) {
  const template = await pickShuffleTemplate(groupId)
  if (!template) throw new Error(`Группа ${groupId} не содержит шаблонов`)

  const menuDay = await applyTemplateToDate(template.id, date, options)
  await ShuffleUsage.create({ groupId, templateId: template.id, usedDate: date })

  return { menuDay, usedTemplate: template }
}

export async function applyWeekTemplate(weekTemplateId, startDate, options = {}) {
  const weekTemplate = await WeekTemplate.findByPk(weekTemplateId, {
    include: [{
      model: WeekTemplateSlot, as: 'slots',
      include: [{ model: MenuTemplate, as: 'template' }, { model: TemplateGroup, as: 'group' }],
    }],
  })

  if (!weekTemplate) throw new Error(`Недельный шаблон ${weekTemplateId} не найден`)

  const monday = getMonday(startDate)
  const results = []

  for (const slot of weekTemplate.slots) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + slot.dayOfWeek - 1)
    const dateStr = formatDate(date)

    try {
      let result
      if (slot.groupId) {
        result = await applyShuffleToDate(slot.groupId, dateStr, options)
      } else if (slot.templateId) {
        const menuDay = await applyTemplateToDate(slot.templateId, dateStr, options)
        result = { menuDay, usedTemplate: slot.template }
      } else {
        continue
      }
      results.push({ date: dateStr, dayOfWeek: slot.dayOfWeek, ...result })
    } catch (error) {
      results.push({ date: dateStr, dayOfWeek: slot.dayOfWeek, error: error.message })
    }
  }

  return results
}

export async function bulkApply(params, options = {}) {
  const { templateId, groupId, mode, target } = params
  const results = []
  let dates = []

  if (target.type === 'dates') {
    dates = target.dates
  } else if (target.type === 'period') {
    const from = new Date(target.period.from)
    const to = new Date(target.period.to)

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d)
      const dayOfWeek = getDayOfWeek(d)
      if (!target.weekdays || target.weekdays.includes(dayOfWeek)) {
        dates.push(dateStr)
      }
    }
  } else if (target.type === 'weekdays') {
    const weeksAhead = target.weeksAhead || 4
    const today = new Date()

    for (let w = 0; w < weeksAhead; w++) {
      for (const dayOfWeek of target.weekdays) {
        const date = new Date(today)
        const currentDay = getDayOfWeek(today)
        let diff = dayOfWeek - currentDay
        if (diff < 0) diff += 7
        date.setDate(date.getDate() + diff + w * 7)
        dates.push(formatDate(date))
      }
    }
  }

  if (mode === 'shuffle') {
    for (const date of dates) {
      try {
        const result = await applyShuffleToDate(groupId, date, options)
        results.push({ date, success: true, ...result })
      } catch (error) {
        results.push({ date, success: false, error: error.message })
      }
    }
  } else {
    const template = await MenuTemplate.findByPk(templateId)
    const promises = dates.map(async (date) => {
      try {
        const menuDay = await applyTemplateToDate(templateId, date, options)
        return { date, success: true, menuDay, usedTemplate: template }
      } catch (error) {
        return { date, success: false, error: error.message }
      }
    })
    results.push(...await Promise.all(promises))
  }

  return results
}

export async function getShuffleStats(groupId) {
  const group = await TemplateGroup.findByPk(groupId, { include: [{ model: MenuTemplate, as: 'templates' }] })
  if (!group) return null

  const usages = await ShuffleUsage.findAll({ where: { groupId }, order: [['usedDate', 'DESC']] })

  const totalTemplates = group.templates.length
  const usedCount = new Set(usages.map(u => u.templateId)).size
  const remainingCount = totalTemplates - usedCount

  return {
    groupId,
    groupName: group.name,
    totalTemplates,
    usedCount,
    remainingCount,
    willResetOnNext: remainingCount === 0,
    lastUsages: usages.slice(0, 10),
  }
}
