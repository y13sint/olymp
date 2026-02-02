import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Space, message } from 'antd'
import { CoffeeOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { MainLayout } from '@widgets/layouts'
import { adminApi, templateApi } from '@shared/api'
import {
  CreateDayModal,
  MenuItemModal,
  ApplyTemplateModal,
  MenuDaysList,
} from './components'

const { Title } = Typography

export function AdminMenuPage() {
  const queryClient = useQueryClient()
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItemId, setDeletingItemId] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: ['admin-menu'],
    queryFn: adminApi.getMenuDays,
  })

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates({}),
  })

  const { data: groupsData } = useQuery({
    queryKey: ['template-groups'],
    queryFn: () => templateApi.getGroups(),
  })

  const { data: weekTemplatesData } = useQuery({
    queryKey: ['week-templates'],
    queryFn: () => templateApi.getWeekTemplates(),
  })

  const createDayMutation = useMutation({
    mutationFn: ({ menuDate, isActive }) => adminApi.createMenuDay(menuDate, isActive),
    onSuccess: () => {
      message.success('День меню создан')
      setDayModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const addItemMutation = useMutation({
    mutationFn: ({ dayId, itemData }) => adminApi.addMenuItem(dayId, itemData),
    onSuccess: () => {
      message.success('Блюдо добавлено')
      setItemModalOpen(false)
      setSelectedDay(null)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }) => adminApi.updateMenuItem(id, updates),
    onSuccess: () => {
      message.success('Блюдо обновлено')
      setItemModalOpen(false)
      setEditingItem(null)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: adminApi.deleteMenuItem,
    onSuccess: () => {
      message.success('Блюдо удалено')
      setDeletingItemId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      setDeletingItemId(null)
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const applyDayMutation = useMutation({
    mutationFn: ({ templateId, date }) => templateApi.applyTemplateToDay(templateId, date, true),
    onSuccess: () => {
      message.success('Шаблон применён')
      setApplyModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const applyWeekMutation = useMutation({
    mutationFn: ({ weekTemplateId, startDate }) =>
      templateApi.applyWeekTemplate(weekTemplateId, startDate, true),
    onSuccess: (data) => {
      message.success(data.message || 'Недельный шаблон применён')
      setApplyModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const bulkApplyMutation = useMutation({
    mutationFn: templateApi.bulkApply,
    onSuccess: (data) => {
      message.success(data.message || 'Применено')
      setApplyModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] })
    },
    onError: (error) => {
      message.error(error.response?.data?.error || 'Ошибка')
    },
  })

  const handleAddItem = (day) => {
    setSelectedDay(day)
    setEditingItem(null)
    setItemModalOpen(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setItemModalOpen(true)
  }

  const handleItemSubmit = (values) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, updates: values })
    } else {
      addItemMutation.mutate({ dayId: selectedDay.id, itemData: values })
    }
  }

  const handleApplySubmit = (data) => {
    if (data.type === 'day') {
      applyDayMutation.mutate({ templateId: data.templateId, date: data.date })
    } else if (data.type === 'week') {
      applyWeekMutation.mutate({ weekTemplateId: data.weekTemplateId, startDate: data.startDate })
    } else if (data.type === 'bulk') {
      bulkApplyMutation.mutate({
        templateId: data.templateId,
        groupId: data.groupId,
        mode: data.mode,
        target: data.target,
        overwrite: data.overwrite,
      })
    }
  }

  const menuDays = data?.menuDays || []
  const templates = templatesData?.templates || []
  const groups = groupsData?.groups || []
  const weekTemplates = weekTemplatesData?.weekTemplates || []

  const isApplying =
    applyDayMutation.isPending || applyWeekMutation.isPending || bulkApplyMutation.isPending

  return (
    <MainLayout>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <CoffeeOutlined /> Управление меню
        </Title>
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={() => setApplyModalOpen(true)}>
            Применить шаблон
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDayModalOpen(true)}>
            Новый день
          </Button>
        </Space>
      </Space>

      {!isPending && (
        <MenuDaysList
          menuDays={menuDays}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={(id) => {
            setDeletingItemId(id)
            deleteItemMutation.mutate(id)
          }}
          deletingItemId={deletingItemId}
        />
      )}

      <CreateDayModal
        open={dayModalOpen}
        onCancel={() => setDayModalOpen(false)}
        onSubmit={(data) => createDayMutation.mutate(data)}
        isLoading={createDayMutation.isPending}
      />

      <MenuItemModal
        open={itemModalOpen}
        onCancel={() => {
          setItemModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleItemSubmit}
        editingItem={editingItem}
        isLoading={addItemMutation.isPending || updateItemMutation.isPending}
      />

      <ApplyTemplateModal
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
        templates={templates}
        groups={groups}
        weekTemplates={weekTemplates}
        isLoading={isApplying}
      />
    </MainLayout>
  )
}
