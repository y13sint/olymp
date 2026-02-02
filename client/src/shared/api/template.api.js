import { apiClient } from './index'
import { buildParams } from '@shared/lib'

export const templateApi = {
  // Шаблоны дней
  getTemplates: async ({ tag, page, limit } = {}) => {
    const params = buildParams(tag ? { tag } : {}, { page, limit })
    const { data } = await apiClient.get('/admin/templates', { params })
    return data
  },

  getTemplateById: async (id) => {
    const { data } = await apiClient.get(`/admin/templates/${id}`)
    return data
  },

  createTemplate: async (templateData) => {
    const { data } = await apiClient.post('/admin/templates', templateData)
    return data
  },

  updateTemplate: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/templates/${id}`, updates)
    return data
  },

  deleteTemplate: async (id) => {
    const { data } = await apiClient.delete(`/admin/templates/${id}`)
    return data
  },

  addTemplateItem: async (templateId, itemData) => {
    const { data } = await apiClient.post(`/admin/templates/${templateId}/items`, itemData)
    return data
  },

  updateTemplateItem: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/templates/items/${id}`, updates)
    return data
  },

  deleteTemplateItem: async (id) => {
    const { data } = await apiClient.delete(`/admin/templates/items/${id}`)
    return data
  },

  // Группы (shuffle)
  getGroups: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/admin/template-groups', { params })
    return data
  },

  getGroupById: async (id) => {
    const { data } = await apiClient.get(`/admin/template-groups/${id}`)
    return data
  },

  createGroup: async (groupData) => {
    const { data } = await apiClient.post('/admin/template-groups', groupData)
    return data
  },

  updateGroup: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/template-groups/${id}`, updates)
    return data
  },

  deleteGroup: async (id) => {
    const { data } = await apiClient.delete(`/admin/template-groups/${id}`)
    return data
  },

  // Недельные шаблоны
  getWeekTemplates: async (pagination = {}) => {
    const params = buildParams({}, pagination)
    const { data } = await apiClient.get('/admin/week-templates', { params })
    return data
  },

  getWeekTemplateById: async (id) => {
    const { data } = await apiClient.get(`/admin/week-templates/${id}`)
    return data
  },

  createWeekTemplate: async (templateData) => {
    const { data } = await apiClient.post('/admin/week-templates', templateData)
    return data
  },

  updateWeekTemplate: async (id, updates) => {
    const { data } = await apiClient.put(`/admin/week-templates/${id}`, updates)
    return data
  },

  deleteWeekTemplate: async (id) => {
    const { data } = await apiClient.delete(`/admin/week-templates/${id}`)
    return data
  },

  // Применение
  applyTemplateToDay: async (templateId, date, overwrite = true) => {
    const { data } = await apiClient.post('/admin/menu/apply/day', { templateId, date, overwrite })
    return data
  },

  applyWeekTemplate: async (weekTemplateId, startDate, overwrite = true) => {
    const { data } = await apiClient.post('/admin/menu/apply/week', { weekTemplateId, startDate, overwrite })
    return data
  },

  bulkApply: async (params) => {
    const { data } = await apiClient.post('/admin/menu/apply/bulk', params)
    return data
  },
}
