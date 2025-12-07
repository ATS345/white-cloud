import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// 加载环境变量
dotenv.config()

// 确保database目录存在
const dbDirectory = path.join(process.cwd(), 'database')
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true })
}

// 创建Sequelize实例
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database/muyu_game.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+08:00',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// 测试数据库连接（可选，失败不影响服务器启动）
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
  } catch (error) {
    console.warn('数据库连接失败，服务器将继续运行但部分功能可能受限:', error.message)
    // 记录详细错误但不退出进程
    console.debug('详细错误:', error)
  }
}

// 延迟执行连接测试，允许服务器先启动
setTimeout(testConnection, 1000)

export default sequelize