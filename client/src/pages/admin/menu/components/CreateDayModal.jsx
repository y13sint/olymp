import { Modal, Form, DatePicker, Switch, Button } from 'antd'

export function CreateDayModal({ open, onCancel, onSubmit, isLoading }) {
  const [form] = Form.useForm()

  const handleFinish = (values) => {
    onSubmit({
      menuDate: values.menuDate.format('YYYY-MM-DD'),
      isActive: values.isActive,
    })
    form.resetFields()
  }

  return (
    <Modal
      title="Новый день меню"
      open={open}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="menuDate"
          label="Дата"
          rules={[{ required: true, message: 'Выберите дату' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
        </Form.Item>
        <Form.Item name="isActive" label="Активно" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Создать
        </Button>
      </Form>
    </Modal>
  )
}
