import {
  Modal,
  Form,
  Radio,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
  Space,
  Alert,
  Divider,
  Typography,
  Tag,
} from 'antd'
import {
  ThunderboltOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { WEEK_DAYS_OPTIONS } from '@shared/config/labels'

const { Text } = Typography

export function ApplyTemplateModal({
  open,
  onCancel,
  onSubmit,
  templates,
  groups,
  weekTemplates,
  isLoading,
}) {
  const [form] = Form.useForm()

  const handleFinish = (values) => {
    const { applyType, templateId, groupId, weekTemplateId, targetType, date, weekdays, period, weeksAhead } = values

    if (applyType === 'day') {
      onSubmit({
        type: 'day',
        templateId,
        date: date.format('YYYY-MM-DD'),
      })
    } else if (applyType === 'week') {
      onSubmit({
        type: 'week',
        weekTemplateId,
        startDate: date.format('YYYY-MM-DD'),
      })
    } else if (applyType === 'bulk') {
      const mode = groupId ? 'shuffle' : 'template'
      const target = { type: targetType }

      if (targetType === 'weekdays') {
        target.weekdays = weekdays
        target.weeksAhead = weeksAhead || 4
      } else if (targetType === 'period') {
        target.period = {
          from: period[0].format('YYYY-MM-DD'),
          to: period[1].format('YYYY-MM-DD'),
        }
        if (weekdays?.length) {
          target.weekdays = weekdays
        }
      }

      onSubmit({
        type: 'bulk',
        templateId: mode === 'template' ? templateId : undefined,
        groupId: mode === 'shuffle' ? groupId : undefined,
        mode,
        target,
        overwrite: true,
      })
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined />
          Применить шаблон
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{ applyType: 'day', targetType: 'weekdays', weeksAhead: 4 }}
      >
        <Form.Item name="applyType" label="Тип применения">
          <Radio.Group>
            <Radio.Button value="day">
              <FileTextOutlined /> На день
            </Radio.Button>
            <Radio.Button value="week">
              <CalendarOutlined /> Недельный
            </Radio.Button>
            <Radio.Button value="bulk">
              <ThunderboltOutlined /> Массовое
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.applyType !== curr.applyType}>
          {({ getFieldValue }) => {
            const applyType = getFieldValue('applyType')

            if (applyType === 'day') {
              return (
                <>
                  <Form.Item
                    name="templateId"
                    label="Шаблон"
                    rules={[{ required: true, message: 'Выберите шаблон' }]}
                  >
                    <Select
                      placeholder="Выберите шаблон"
                      options={templates.map((t) => ({
                        value: t.id,
                        label: (
                          <Space>
                            <FileTextOutlined />
                            {t.name}
                            <Tag>{t.items?.length || 0} блюд</Tag>
                          </Space>
                        ),
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    name="date"
                    label="Дата"
                    rules={[{ required: true, message: 'Выберите дату' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </>
              )
            }

            if (applyType === 'week') {
              return (
                <>
                  <Form.Item
                    name="weekTemplateId"
                    label="Недельный шаблон"
                    rules={[{ required: true, message: 'Выберите шаблон' }]}
                  >
                    <Select
                      placeholder="Выберите недельный шаблон"
                      options={weekTemplates.map((wt) => ({
                        value: wt.id,
                        label: (
                          <Space>
                            <CalendarOutlined />
                            {wt.name}
                            <Tag>{wt.slots?.length || 0} дней</Tag>
                          </Space>
                        ),
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    name="date"
                    label="Понедельник недели"
                    rules={[{ required: true, message: 'Выберите дату' }]}
                    extra="Выберите понедельник недели, на которую применить"
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      disabledDate={(current) => current && current.day() !== 1}
                    />
                  </Form.Item>
                </>
              )
            }

            if (applyType === 'bulk') {
              return (
                <>
                  <Alert
                    type="info"
                    message="Массовое применение"
                    description="Применить шаблон или shuffle-группу на несколько дат"
                    style={{ marginBottom: 16 }}
                  />

                  <Form.Item label="Источник" required>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item name="templateId" noStyle>
                        <Select
                          placeholder="Шаблон (или выберите группу ниже)"
                          allowClear
                          options={templates.map((t) => ({
                            value: t.id,
                            label: `${t.name} (${t.items?.length || 0} блюд)`,
                          }))}
                          onChange={() => form.setFieldValue('groupId', undefined)}
                        />
                      </Form.Item>
                      <Text type="secondary">или</Text>
                      <Form.Item name="groupId" noStyle>
                        <Select
                          placeholder="Shuffle группа"
                          allowClear
                          options={groups.map((g) => ({
                            value: g.id,
                            label: (
                              <Space>
                                <SwapOutlined />
                                {g.name}
                                <Tag>{g.templates?.length || 0} шаблонов</Tag>
                              </Space>
                            ),
                          }))}
                          onChange={() => form.setFieldValue('templateId', undefined)}
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>

                  <Divider />

                  <Form.Item name="targetType" label="Целевые даты">
                    <Radio.Group>
                      <Radio value="weekdays">По дням недели</Radio>
                      <Radio value="period">За период</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.targetType !== curr.targetType}
                  >
                    {({ getFieldValue: getValue }) => {
                      const targetType = getValue('targetType')

                      if (targetType === 'weekdays') {
                        return (
                          <>
                            <Form.Item
                              name="weekdays"
                              label="Дни недели"
                              rules={[{ required: true, message: 'Выберите дни' }]}
                            >
                              <Checkbox.Group options={WEEK_DAYS_OPTIONS} />
                            </Form.Item>
                            <Form.Item name="weeksAhead" label="На сколько недель вперёд">
                              <InputNumber min={1} max={52} />
                            </Form.Item>
                          </>
                        )
                      }

                      if (targetType === 'period') {
                        return (
                          <>
                            <Form.Item
                              name="period"
                              label="Период"
                              rules={[{ required: true, message: 'Выберите период' }]}
                            >
                              <DatePicker.RangePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="weekdays" label="Только дни недели (опционально)">
                              <Checkbox.Group options={WEEK_DAYS_OPTIONS} />
                            </Form.Item>
                          </>
                        )
                      }

                      return null
                    }}
                  </Form.Item>
                </>
              )
            }

            return null
          }}
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Применить
        </Button>
      </Form>
    </Modal>
  )
}
