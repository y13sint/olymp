import { Layout, Typography } from 'antd'

const { Content } = Layout
const { Title } = Typography

export function AuthLayout({ children, title }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            padding: 32,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            🍽️ Школьная столовая
          </Title>
          {title && (
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
              {title}
            </Title>
          )}
          {children}
        </div>
      </Content>
    </Layout>
  )
}
