import { Router } from 'express'
import {
  // Шаблоны дней
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
  // Группы шаблонов
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  // Недельные шаблоны
  getAllWeekTemplates,
  getWeekTemplateById,
  createWeekTemplate,
  updateWeekTemplate,
  deleteWeekTemplate,
  // Применение
  applyTemplateDay,
  applyTemplateWeek,
  applyTemplateBulk,
} from '../controllers/template.controller.js'
import { authMiddleware, roleMiddleware, validate } from '../middleware/index.js'
import {
  createTemplateSchema,
  updateTemplateSchema,
  addTemplateItemSchema,
  updateTemplateItemSchema,
  createGroupSchema,
  updateGroupSchema,
  createWeekTemplateSchema,
  updateWeekTemplateSchema,
  applyDaySchema,
  applyWeekSchema,
  applyBulkSchema,
  idParamSchema,
} from '../validators/template.validator.js'

const router = Router()

// Все роуты требуют авторизации админа
router.use(authMiddleware)
router.use(roleMiddleware('admin'))

// ==================== ШАБЛОНЫ ДНЕЙ ====================
router.get('/templates', getAllTemplates)
router.get('/templates/:id', validate(idParamSchema), getTemplateById)
router.post('/templates', validate(createTemplateSchema), createTemplate)
router.put('/templates/:id', validate(updateTemplateSchema), updateTemplate)
router.delete('/templates/:id', validate(idParamSchema), deleteTemplate)

// Блюда в шаблонах
router.post('/templates/:id/items', validate(addTemplateItemSchema), addTemplateItem)
router.put('/templates/items/:id', validate(updateTemplateItemSchema), updateTemplateItem)
router.delete('/templates/items/:id', validate(idParamSchema), deleteTemplateItem)

// ==================== ГРУППЫ ШАБЛОНОВ (SHUFFLE) ====================
router.get('/template-groups', getAllGroups)
router.get('/template-groups/:id', validate(idParamSchema), getGroupById)
router.post('/template-groups', validate(createGroupSchema), createGroup)
router.put('/template-groups/:id', validate(updateGroupSchema), updateGroup)
router.delete('/template-groups/:id', validate(idParamSchema), deleteGroup)

// ==================== НЕДЕЛЬНЫЕ ШАБЛОНЫ ====================
router.get('/week-templates', getAllWeekTemplates)
router.get('/week-templates/:id', validate(idParamSchema), getWeekTemplateById)
router.post('/week-templates', validate(createWeekTemplateSchema), createWeekTemplate)
router.put('/week-templates/:id', validate(updateWeekTemplateSchema), updateWeekTemplate)
router.delete('/week-templates/:id', validate(idParamSchema), deleteWeekTemplate)

// ==================== ПРИМЕНЕНИЕ ШАБЛОНОВ ====================
router.post('/menu/apply/day', validate(applyDaySchema), applyTemplateDay)
router.post('/menu/apply/week', validate(applyWeekSchema), applyTemplateWeek)
router.post('/menu/apply/bulk', validate(applyBulkSchema), applyTemplateBulk)

export default router
