import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import * as Sentry from '@sentry/react'
import './index.css'
import { store } from './store'
import { queryClient } from './lib/react-query'
import router from './routes'

// 初始化Sentry监控系统
if (import.meta.env.VITE_ENV === 'production') {
  Sentry.init({
    // 请替换为您的真实Sentry DSN
    dsn: import.meta.env.VITE_SENTRY_DSN || 'https://example@sentry.io/123456',
    environment: import.meta.env.VITE_ENV || 'production',
    tracesSampleRate: 1.0,
    // Sentry React SDK v7+ 不再需要 reactOptions，React 集成自动启用
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </ConfigProvider>
  </StrictMode>,
)
