// 更完整的测试脚本，用于检查服务器的数据库和模型功能
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

// 加载环境变量
dotenv.config()

// 初始化Express应用
const app = express()

// 配置中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}))
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
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

// 测试数据库连接
app.get('/api/v1/test-db', async (req, res) => {
  try {
    // 动态导入数据库配置，避免启动时崩溃
    const sequelize = await import('./config/database.js').then(m => m.default)
    
    // 测试数据库连接
    await sequelize.authenticate()
    
    res.status(200).json({
      success: true,
      message: '数据库连接成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// 测试模型导入
app.get('/api/v1/test-models', async (req, res) => {
  try {
    // 动态导入模型，避免启动时崩溃
    const models = await import('./models/index.js').then(m => m.default)
    const { syncModels } = await import('./models/index.js')
    
    // 测试模型初始化
    await syncModels()
    
    res.status(200).json({
      success: true,
      message: '模型初始化成功',
      models: Object.keys(models),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '模型初始化失败',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }
})

// 启动服务器
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`\n🚀 测试服务器2启动成功！`)
  console.log(`📡 服务器地址: http://localhost:${PORT}`)
  console.log(`📝 API文档地址: http://localhost:${PORT}/api/v1/docs`)
  console.log(`🔧 环境: ${process.env.NODE_ENV}`)
  console.log(`\n按 Ctrl+C 停止服务器`)
})
