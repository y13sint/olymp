import { Alert, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { getErrorMessage, isNetworkError } from '@shared/lib'

// Блок ошибки с кнопкой "Повторить"
export function ErrorState({ error, onRetry, title }) {
  const errorMessage = getErrorMessage(error)
  const isNetwork = isNetworkError(error)

  return (
    <Alert
      type="error"
      showIcon
      message={title || (isNetwork ? 'Ошибка сети' : 'Ошибка загрузки')}
      description={errorMessage}
      action={
        onRetry && (
          <Button
            size="small"
            type="primary"
            danger
            icon={<ReloadOutlined />}
            onClick={onRetry}
          >
            Повторить
          </Button>
        )
      }
      style={{ marginBottom: 16 }}
    />
  )
}
