import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import sequelize from './config/database.js'
import logger from './config/logger.js'
import redisClient from './config/redis.js'

// 加载环境变量
dotenv.config()

// 导入模型和同步函数
import { syncModels } from './models/index.js'

// 导入路由
import authRoutes from './routes/authRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import downloadRoutes from './routes/downloadRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import gameLibraryRoutes from './routes/gameLibraryRoutes.js'
import developerRoutes from './routes/developerRoutes.js'

// 初始化Express应用
const app = express()

// 配置中间件
// 安全中间件
app.use(helmet())

// CORS中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}))

// 日志中间件
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// 解析请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查路由
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '木鱼游戏平台API运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 注册API路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/games', gameRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/download', downloadRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/library', gameLibraryRoutes)
app.use('/api/v1/developer', developerRoutes)

// 处理404错误
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.originalUrl
  })
})

// 全局错误处理中间件
app.use((err, req, res, next) => {
  logger.error('全局错误:', err)
  
  // 设置默认状态码
  const statusCode = err.statusCode || 500
  
  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    message: err.message || '服务器内部错误',
    // 仅在开发环境返回错误堆栈
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// 启动服务器
const PORT = process.env.PORT || 5000

// 启动服务器和初始化数据库
(async () => {
  try {
    console.log('开始启动服务器...')
    
    // 1. 同步数据库模型和关联
    console.log('正在初始化数据库模型和关联...')
    await syncModels()
    console.log('数据库模型和关联初始化成功')
    
    // 2. 启动服务器
    console.log('准备启动服务器...')
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 服务器启动成功！`)
      console.log(`📡 服务器地址: http://localhost:${PORT}`)
      console.log(`📝 API文档地址: http://localhost:${PORT}/api/v1/docs`)
      console.log(`🔧 环境: ${process.env.NODE_ENV}`)
      console.log(`\n按 Ctrl+C 停止服务器`)
    })
    
    // 监听进程终止信号，确保资源正确释放
    const handleShutdown = async () => {
      logger.info('[SERVER] 正在关闭服务器...')
      
      try {
        // 关闭Redis连接
        if (redisClient && redisClient.disconnect) {
          await redisClient.disconnect()
          logger.info('[REDIS] Redis连接已关闭')
        }
        
        // 关闭Sequelize连接
        if (sequelize && sequelize.close) {
          await sequelize.close()
          logger.info('[DATABASE] 数据库连接已关闭')
        }
        
        // 关闭HTTP服务器
        server.close(() => {
          logger.info('[SERVER] 服务器已成功关闭')
          process.exit(0)
        })
      } catch (error) {
        logger.error(`[SERVER SHUTDOWN ERROR] ${error.message}`)
        process.exit(1)
      }
    }
    
    // 监听SIGINT和SIGTERM信号
    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  } catch (error) {
    console.error('启动过程中发生错误:', error)
    console.error('错误堆栈:', error.stack)
    console.warn('⚠️  服务器启动失败，详细错误已打印到控制台')
    
    // 立即退出进程，显示详细错误
    process.exit(1)
  }
})()