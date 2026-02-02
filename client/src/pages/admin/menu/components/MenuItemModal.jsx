import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, Switch, Button, Space } from 'antd'
import { MEAL_TYPE_OPTIONS } from '@shared/config/labels'

export function MenuItemModal({ open, onCancel, onSubmit, editingItem, isLoading }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue(editingItem)
    } else {
      form.resetFields()
    }
  }, [editingItem, form])

  const handleFinish = (values) => {
    onSubmit(values)
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={editingItem ? 'Редактировать блюдо' : 'Новое блюдо'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Введите название' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} addonAfter="₽" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="mealType"
            label="Тип"
            rules={[{ required: true, message: 'Выберите тип' }]}
            style={{ flex: 1 }}
          >
            <Select options={MEAL_TYPE_OPTIONS} />
          </Form.Item>
        </Space>
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="calories" label="Калории" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="allergens" label="Аллергены" style={{ flex: 1 }}>
            <Input placeholder="молоко, глютен..." />
          </Form.Item>
        </Space>
        {editingItem && (
          <Form.Item name="isAvailable" label="Доступно" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          {editingItem ? 'Сохранить' : 'Добавить'}
        </Button>
      </Form>
    </Modal>
  )
}
