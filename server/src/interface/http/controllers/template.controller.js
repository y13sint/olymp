import { ApiError } from '../../../shared/errors/index.js'
import { applyTemplateToDate, applyWeekTemplate, bulkApply, getShuffleStats } from '../../../shared/services/template.service.js'
import db from '../../../infrastructure/database/models/index.cjs'

const { MenuTemplate, MenuTemplateItem, TemplateGroup, TemplateGroupItem, WeekTemplate, WeekTemplateSlot } = db

export async function getAllTemplates(req, res, next) {
  try {
    const { tag } = req.query
    const templates = await MenuTemplate.findAll({
      include: [{ model: MenuTemplateItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    })
    const filtered = tag ? templates.filter(t => t.tags?.includes(tag)) : templates
    res.json({ templates: filtered })
  } catch (error) {
    next(error)
  }
}

export async function getTemplateById(req, res, next) {
  try {
    const template = await MenuTemplate.findByPk(req.params.id, { include: [{ model: MenuTemplateItem, as: 'items' }] })
    if (!template) throw ApiError.notFound('Шаблон не найден')
    res.json({ template })
  } catch (error) {
    next(error)
  }
}

export async function createTemplate(req, res, next) {
  try {
    const { name, tags } = req.body
    const template = await MenuTemplate.create({ name, tags: tags || [] })
    res.status(201).json({ template })
  } catch (error) {
    next(error)
  }
}

export async function updateTemplate(req, res, next) {
  try {
    const template = await MenuTemplate.findByPk(req.params.id)
    if (!template) throw ApiError.notFound('Шаблон не найден')
    await template.update(req.body)
    res.json({ template })
  } catch (error) {
    next(error)
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    const templateId = req.params.id
    const groupUsage = await TemplateGroupItem.count({ where: { templateId } })
    if (groupUsage > 0) throw ApiError.conflict('Шаблон используется в группах')
    const slotUsage = await WeekTemplateSlot.count({ where: { templateId } })
    if (slotUsage > 0) throw ApiError.conflict('Шаблон используется в недельных шаблонах')
    const deleted = await MenuTemplate.destroy({ where: { id: templateId } })
    if (!deleted) throw ApiError.notFound('Шаблон не найден')
    res.json({ message: 'Шаблон удалён' })
  } catch (error) {
    next(error)
  }
}

export async function addTemplateItem(req, res, next) {
  try {
    const template = await MenuTemplate.findByPk(req.params.id)
    if (!template) throw ApiError.notFound('Шаблон не найден')
    const { name, description, price, mealType, allergens, calories } = req.body
    const item = await MenuTemplateItem.create({ templateId: template.id, name, description, price, mealType, allergens, calories })
    res.status(201).json({ item })
  } catch (error) {
    next(error)
  }
}

export async function updateTemplateItem(req, res, next) {
  try {
    const item = await MenuTemplateItem.findByPk(req.params.id)
    if (!item) throw ApiError.notFound('Блюдо не найдено')
    const allowedFields = ['name', 'description', 'price', 'mealType', 'allergens', 'calories']
    const updateData = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field]
    }
    await item.update(updateData)
    res.json({ item })
  } catch (error) {
    next(error)
  }
}

export async function deleteTemplateItem(req, res, next) {
  try {
    const deleted = await MenuTemplateItem.destroy({ where: { id: req.params.id } })
    if (!deleted) throw ApiError.notFound('Блюдо не найдено')
    res.json({ message: 'Блюдо удалено' })
  } catch (error) {
    next(error)
  }
}

export async function getAllGroups(req, res, next) {
  try {
    const groups = await TemplateGroup.findAll({
      include: [{ model: MenuTemplate, as: 'templates', through: { attributes: [] } }],
      order: [['createdAt', 'DESC']],
    })
    res.json({ groups })
  } catch (error) {
    next(error)
  }
}

export async function getGroupById(req, res, next) {
  try {
    const group = await TemplateGroup.findByPk(req.params.id, {
      include: [{ model: MenuTemplate, as: 'templates', through: { attributes: [] }, include: [{ model: MenuTemplateItem, as: 'items' }] }],
    })
    if (!group) throw ApiError.notFound('Группа не найдена')
    const stats = await getShuffleStats(group.id)
    res.json({ group, shuffleStats: stats })
  } catch (error) {
    next(error)
  }
}

export async function createGroup(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { name, dayOfWeek, templateIds } = req.body

    if (templateIds?.length > 0) {
      const existing = await MenuTemplate.findAll({ where: { id: templateIds }, attributes: ['id'], transaction })
      const existingIds = existing.map(t => t.id)
      const missing = templateIds.filter(id => !existingIds.includes(id))
      if (missing.length > 0) {
        await transaction.rollback()
        throw ApiError.badRequest(`Шаблоны с ID ${missing.join(', ')} не найдены`)
      }
    }

    const group = await TemplateGroup.create({ name, dayOfWeek }, { transaction })
    if (templateIds?.length > 0) {
      await TemplateGroupItem.bulkCreate(templateIds.map(templateId => ({ groupId: group.id, templateId })), { transaction })
    }

    await transaction.commit()
    const result = await TemplateGroup.findByPk(group.id, { include: [{ model: MenuTemplate, as: 'templates', through: { attributes: [] } }] })
    res.status(201).json({ group: result })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function updateGroup(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const group = await TemplateGroup.findByPk(req.params.id, { transaction })
    if (!group) {
      await transaction.rollback()
      throw ApiError.notFound('Группа не найдена')
    }

    const { name, dayOfWeek, templateIds } = req.body

    if (templateIds?.length > 0) {
      const existing = await MenuTemplate.findAll({ where: { id: templateIds }, attributes: ['id'], transaction })
      const existingIds = existing.map(t => t.id)
      const missing = templateIds.filter(id => !existingIds.includes(id))
      if (missing.length > 0) {
        await transaction.rollback()
        throw ApiError.badRequest(`Шаблоны с ID ${missing.join(', ')} не найдены`)
      }
    }

    await group.update({ name: name ?? group.name, dayOfWeek: dayOfWeek ?? group.dayOfWeek }, { transaction })

    if (templateIds !== undefined) {
      await TemplateGroupItem.destroy({ where: { groupId: group.id }, transaction })
      if (templateIds.length > 0) {
        await TemplateGroupItem.bulkCreate(templateIds.map(templateId => ({ groupId: group.id, templateId })), { transaction })
      }
    }

    await transaction.commit()
    const result = await TemplateGroup.findByPk(group.id, { include: [{ model: MenuTemplate, as: 'templates', through: { attributes: [] } }] })
    res.json({ group: result })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function deleteGroup(req, res, next) {
  try {
    const deleted = await TemplateGroup.destroy({ where: { id: req.params.id } })
    if (!deleted) throw ApiError.notFound('Группа не найдена')
    res.json({ message: 'Группа удалена' })
  } catch (error) {
    next(error)
  }
}

export async function getAllWeekTemplates(req, res, next) {
  try {
    const weekTemplates = await WeekTemplate.findAll({
      include: [{ model: WeekTemplateSlot, as: 'slots', include: [{ model: MenuTemplate, as: 'template' }, { model: TemplateGroup, as: 'group' }] }],
      order: [['createdAt', 'DESC']],
    })
    res.json({ weekTemplates })
  } catch (error) {
    next(error)
  }
}

export async function getWeekTemplateById(req, res, next) {
  try {
    const weekTemplate = await WeekTemplate.findByPk(req.params.id, {
      include: [{
        model: WeekTemplateSlot, as: 'slots',
        include: [
          { model: MenuTemplate, as: 'template', include: [{ model: MenuTemplateItem, as: 'items' }] },
          { model: TemplateGroup, as: 'group', include: [{ model: MenuTemplate, as: 'templates', through: { attributes: [] } }] },
        ],
      }],
    })
    if (!weekTemplate) throw ApiError.notFound('Недельный шаблон не найден')
    res.json({ weekTemplate })
  } catch (error) {
    next(error)
  }
}

async function validateSlots(slots, transaction) {
  if (!slots?.length) return
  const templateIds = slots.filter(s => s.templateId).map(s => s.templateId)
  const groupIds = slots.filter(s => s.groupId).map(s => s.groupId)

  if (templateIds.length > 0) {
    const existing = await MenuTemplate.findAll({ where: { id: templateIds }, attributes: ['id'], transaction })
    const missing = templateIds.filter(id => !existing.map(t => t.id).includes(id))
    if (missing.length > 0) throw ApiError.badRequest(`Шаблоны с ID ${missing.join(', ')} не найдены`)
  }

  if (groupIds.length > 0) {
    const existing = await TemplateGroup.findAll({ where: { id: groupIds }, attributes: ['id'], transaction })
    const missing = groupIds.filter(id => !existing.map(g => g.id).includes(id))
    if (missing.length > 0) throw ApiError.badRequest(`Группы с ID ${missing.join(', ')} не найдены`)
  }
}

export async function createWeekTemplate(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const { name, slots } = req.body
    await validateSlots(slots, transaction)

    const weekTemplate = await WeekTemplate.create({ name }, { transaction })
    if (slots?.length > 0) {
      const slotData = slots.map(s => ({ weekTemplateId: weekTemplate.id, dayOfWeek: s.dayOfWeek, templateId: s.templateId || null, groupId: s.groupId || null }))
      await WeekTemplateSlot.bulkCreate(slotData, { transaction })
    }

    await transaction.commit()
    const result = await WeekTemplate.findByPk(weekTemplate.id, {
      include: [{ model: WeekTemplateSlot, as: 'slots', include: [{ model: MenuTemplate, as: 'template' }, { model: TemplateGroup, as: 'group' }] }],
    })
    res.status(201).json({ weekTemplate: result })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function updateWeekTemplate(req, res, next) {
  const transaction = await db.sequelize.transaction()
  try {
    const weekTemplate = await WeekTemplate.findByPk(req.params.id, { transaction })
    if (!weekTemplate) {
      await transaction.rollback()
      throw ApiError.notFound('Недельный шаблон не найден')
    }

    const { name, slots } = req.body
    await validateSlots(slots, transaction)

    if (name) await weekTemplate.update({ name }, { transaction })

    if (slots !== undefined) {
      await WeekTemplateSlot.destroy({ where: { weekTemplateId: weekTemplate.id }, transaction })
      if (slots.length > 0) {
        const slotData = slots.map(s => ({ weekTemplateId: weekTemplate.id, dayOfWeek: s.dayOfWeek, templateId: s.templateId || null, groupId: s.groupId || null }))
        await WeekTemplateSlot.bulkCreate(slotData, { transaction })
      }
    }

    await transaction.commit()
    const result = await WeekTemplate.findByPk(weekTemplate.id, {
      include: [{ model: WeekTemplateSlot, as: 'slots', include: [{ model: MenuTemplate, as: 'template' }, { model: TemplateGroup, as: 'group' }] }],
    })
    res.json({ weekTemplate: result })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

export async function deleteWeekTemplate(req, res, next) {
  try {
    const deleted = await WeekTemplate.destroy({ where: { id: req.params.id } })
    if (!deleted) throw ApiError.notFound('Недельный шаблон не найден')
    res.json({ message: 'Недельный шаблон удалён' })
  } catch (error) {
    next(error)
  }
}

export async function applyTemplateDay(req, res, next) {
  try {
    const { templateId, date, overwrite } = req.body
    const menuDay = await applyTemplateToDate(templateId, date, { overwrite })
    res.json({ message: 'Шаблон применён', menuDay })
  } catch (error) {
    next(error)
  }
}

export async function applyTemplateWeek(req, res, next) {
  try {
    const { weekTemplateId, startDate, overwrite } = req.body
    const results = await applyWeekTemplate(weekTemplateId, startDate, { overwrite })
    res.json({ message: 'Недельный шаблон применён', results })
  } catch (error) {
    next(error)
  }
}

export async function applyTemplateBulk(req, res, next) {
  try {
    const { templateId, groupId, mode, target, overwrite } = req.body
    const results = await bulkApply({ templateId, groupId, mode, target }, { overwrite })
    const success = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    res.json({ message: `Применено: ${success}, ошибок: ${failed}`, results })
  } catch (error) {
    next(error)
  }
}
