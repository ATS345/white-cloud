import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    // 开发服务器配置：当找不到资源时，返回index.html，支持SPA应用的路由
    historyApiFallback: true
  },
  preview: {
    port: 4173,
    // 预览服务器配置：当找不到资源时，返回index.html，支持SPA应用的路由
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 生产环境禁用sourcemap，减小构建产物大小
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方依赖分离到单独的chunk中
          vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material', '@reduxjs/toolkit', 'react-redux'],
          form: ['formik', 'yup'],
          animation: ['framer-motion'],
          network: ['axios', 'socket.io-client']
        }
      }
    }
  }
})