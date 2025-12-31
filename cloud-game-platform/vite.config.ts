import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 添加GitHub Pages的base路径
  base: './',
  // 添加日志级别配置，减少或消除调试日志
  logLevel: 'warn',
  build: {
    // 生成sourcemap，方便调试
    sourcemap: false,
    // 配置chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 开启CSS代码拆分
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 优化manualChunks配置，使用函数形式
        manualChunks: (id) => {
          // 核心React库和Router
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          // Redux和React Query
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('@tanstack/react-query')) {
            return 'state-vendor'
          }
          // Ant Design组件库
          if (id.includes('antd')) {
            return 'antd-vendor'
          }
          // 其他第三方库
          if (id.includes('axios') || id.includes('dayjs')) {
            return 'utils-vendor'
          }
        }
      }
    }
  }
})
