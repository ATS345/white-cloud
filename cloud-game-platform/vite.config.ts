import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 添加GitHub Pages的base路径
  base: './',
  // 添加日志级别配置，减少或消除调试日志
  logLevel: 'warn',
  // 添加开发服务器配置
  server: {
    port: 3000,
    open: true,
    // 添加API代理配置
    proxy: {
      '/api': {
        target: 'https://api.cloud-game-platform.com',
        changeOrigin: true,
        // 开发环境下允许http代理
        secure: false,
        // 如果后端API使用了不同的路径，可以配置重写
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // 生成sourcemap，方便调试
    sourcemap: false,
    // 配置chunk大小警告阈值
    chunkSizeWarningLimit: 300,
    // 开启CSS代码拆分
    cssCodeSplit: true,
    // 启用terser压缩
    minify: 'terser',
    // 开启模块合并
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      // 启用tree-shaking
      treeshake: {
        moduleSideEffects: false
      },
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
          // Sentry相关
          if (id.includes('@sentry')) {
            return 'sentry-vendor'
          }
          // 测试相关（仅在开发环境使用）
          if (id.includes('@testing-library') || id.includes('vitest')) {
            return 'test-vendor'
          }
        },
        // 优化chunk命名，使用哈希值
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
