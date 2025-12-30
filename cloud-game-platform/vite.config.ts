import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('@tanstack/react-query')) {
            return 'redux-vendor'
          }
          // 进一步拆分antd，将不同组件库分离
          if (id.includes('antd') && id.includes('icon')) {
            return 'antd-icons'
          }
          if (id.includes('antd') && (id.includes('modal') || id.includes('drawer') || id.includes('popover'))) {
            return 'antd-overlays'
          }
          if (id.includes('antd')) {
            return 'antd-core'
          }
        }
      }
    }
  }
})
