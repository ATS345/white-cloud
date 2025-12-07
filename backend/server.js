import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import sequelize from './config/database.js'
import logger from './config/logger.js'

// 导入路由
import authRoutes from './routes/authRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import downloadRoutes from './routes/downloadRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import gameLibraryRoutes from './routes/gameLibraryRoutes.js'
import developerRoutes from './routes/developerRoutes.js'

// 加载环境变量
dotenv.config()

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

// 同步数据库模型
sequelize.sync({ alter: false, force: false }) // 生产环境应使用 migrate
  .then(() => {
    logger.info('数据库模型同步完成')
    
    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`\n🚀 服务器启动成功！`)
      logger.info(`📡 服务器地址: http://localhost:${PORT}`)
      logger.info(`📝 API文档地址: http://localhost:${PORT}/api/v1/docs`)
      logger.info(`🔧 环境: ${process.env.NODE_ENV}`)
      logger.info(`\n按 Ctrl+C 停止服务器`)
    })
  })
  .catch((error) => {
    logger.error('数据库模型同步失败:', error)
    logger.warn('⚠️  模型同步失败，但服务器将继续启动，某些功能可能受限')
    
    // 即使模型同步失败，也尝试启动服务器
    app.listen(PORT, () => {
      logger.info(`\n🚀 服务器启动成功！`)
      logger.info(`📡 服务器地址: http://localhost:${PORT}`)
      logger.info(`📝 API文档地址: http://localhost:${PORT}/api/v1/docs`)
      logger.info(`🔧 环境: ${process.env.NODE_ENV}`)
      logger.info(`\n按 Ctrl+C 停止服务器`)
      logger.warn('⚠️  注意：数据库模型同步失败，某些功能可能无法正常工作')
    })
  })