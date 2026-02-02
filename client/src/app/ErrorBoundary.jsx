import { Component } from 'react'
import { Result, Button } from 'antd'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5'
        }}>
          <Result
            status="error"
            title="Что-то пошло не так"
            subTitle="Произошла непредвиденная ошибка. Попробуйте обновить страницу."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Обновить страницу
              </Button>,
              <Button key="home" onClick={this.handleGoHome}>
                На главную
              </Button>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}
