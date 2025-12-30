import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React相关依赖
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          
          // Redux和React Query
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux-vendor'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'react-query'
          }
          
          // 进一步精细化拆分Ant Design组件
          if (id.includes('antd') && id.includes('icon')) {
            return 'antd-icons'
          }
          if (id.includes('antd') && (id.includes('modal') || id.includes('drawer') || id.includes('popover') || id.includes('tooltip'))) {
            return 'antd-overlays'
          }
          if (id.includes('antd') && (id.includes('form') || id.includes('input') || id.includes('select'))) {
            return 'antd-form'
          }
          if (id.includes('antd') && (id.includes('table') || id.includes('pagination') || id.includes('list'))) {
            return 'antd-data'
          }
          if (id.includes('antd') && (id.includes('menu') || id.includes('tabs'))) {
            return 'antd-navigation'
          }
          if (id.includes('antd')) {
            return 'antd-core'
          }
        }
      }
    }
  }
})
