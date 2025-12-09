import dotenv from 'dotenv'
import logger from './logger.js'

// 只加载一次环境变量
dotenv.config()

// 环境变量管理类
class EnvConfig {
  constructor() {
    this.environment = {
      // 服务器配置
      PORT: this.getNumber('PORT', 5000),
      NODE_ENV: this.getString('NODE_ENV', 'development'),
      
      // 数据库配置
      DB_DIALECT: this.getString('DB_DIALECT', 'sqlite'),
      DB_NAME: this.getString('DB_NAME', 'muyu_game.db'),
      DB_STORAGE: this.getString('DB_STORAGE', './database/muyu_game.db'),
      DB_HOST: this.getString('DB_HOST', 'localhost'),
      DB_PORT: this.getNumber('DB_PORT', 5432),
      DB_USER: this.getString('DB_USER', 'postgres'),
      DB_PASSWORD: this.getString('DB_PASSWORD', ''),
      
      // JWT配置
      JWT_SECRET: this.getString('JWT_SECRET', 'muyu_game_platform_jwt_secret_key_2025'),
      JWT_EXPIRES_IN: this.getString('JWT_EXPIRES_IN', '7d'),
      
      // CORS配置
      CORS_ORIGIN: this.getString('CORS_ORIGIN', 'http://localhost:3000'),
      
      // AWS S3配置
      AWS_ACCESS_KEY_ID: this.getString('AWS_ACCESS_KEY_ID', ''),
      AWS_SECRET_ACCESS_KEY: this.getString('AWS_SECRET_ACCESS_KEY', ''),
      AWS_REGION: this.getString('AWS_REGION', 'us-east-1'),
      AWS_S3_BUCKET: this.getString('AWS_S3_BUCKET', ''),
      
      // Stripe配置
      STRIPE_SECRET_KEY: this.getString('STRIPE_SECRET_KEY', ''),
      STRIPE_WEBHOOK_SECRET: this.getString('STRIPE_WEBHOOK_SECRET', ''),
      
      // Redis配置
      REDIS_HOST: this.getString('REDIS_HOST', 'localhost'),
      REDIS_PORT: this.getNumber('REDIS_PORT', 6379),
      REDIS_PASSWORD: this.getString('REDIS_PASSWORD', ''),
      REDIS_URL: this.getString('REDIS_URL', 'redis://localhost:6379'),
      
      // 邮箱配置
      SMTP_HOST: this.getString('SMTP_HOST', 'smtp.gmail.com'),
      SMTP_PORT: this.getNumber('SMTP_PORT', 587),
      SMTP_USER: this.getString('SMTP_USER', ''),
      SMTP_PASSWORD: this.getString('SMTP_PASSWORD', ''),
      
      // 日志配置
      LOG_LEVEL: this.getString('LOG_LEVEL', 'info')
    }
    
    this.validate()
  }
  
  // 获取字符串类型的环境变量
  getString(key, defaultValue) {
    const value = process.env[key]
    return value !== undefined ? value : defaultValue
  }
  
  // 获取数字类型的环境变量
  getNumber(key, defaultValue) {
    const value = process.env[key]
    if (value === undefined) {
      return defaultValue
    }
    
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  
  // 获取布尔类型的环境变量
  getBoolean(key, defaultValue) {
    const value = process.env[key]
    if (value === undefined) {
      return defaultValue
    }
    
    return value.toLowerCase() === 'true' || value === '1'
  }
  
  // 获取数组类型的环境变量
  getArray(key, defaultValue, separator = ',') {
    const value = process.env[key]
    if (value === undefined) {
      return defaultValue
    }
    
    return value.split(separator).map(item => item.trim()).filter(Boolean)
  }
  
  // 验证环境变量
  validate() {
    // 验证必需的环境变量
    const requiredEnvVars = [
      'JWT_SECRET'
    ]
    
    const missingEnvVars = []
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar] && !this.environment[envVar]) {
        missingEnvVars.push(envVar)
      }
    }
    
    if (missingEnvVars.length > 0) {
      logger.warn(`缺少必需的环境变量: ${missingEnvVars.join(', ')}，将使用默认值`)
    }
    
    // 验证NODE_ENV
    const validEnvs = ['development', 'production', 'test']
    if (!validEnvs.includes(this.environment.NODE_ENV)) {
      logger.warn(`无效的NODE_ENV值: ${this.environment.NODE_ENV}，将使用默认值: development`)
      this.environment.NODE_ENV = 'development'
    }
    
    // 验证日志级别
    const validLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
    if (!validLogLevels.includes(this.environment.LOG_LEVEL)) {
      logger.warn(`无效的LOG_LEVEL值: ${this.environment.LOG_LEVEL}，将使用默认值: info`)
      this.environment.LOG_LEVEL = 'info'
    }
    
    // 验证数据库方言
    const validDBDialects = ['sqlite', 'postgres', 'mysql', 'mssql']
    if (!validDBDialects.includes(this.environment.DB_DIALECT)) {
      logger.warn(`无效的DB_DIALECT值: ${this.environment.DB_DIALECT}，将使用默认值: sqlite`)
      this.environment.DB_DIALECT = 'sqlite'
    }
  }
  
  // 获取所有环境变量
  getAll() {
    return this.environment
  }
  
  // 获取单个环境变量
  get(key) {
    return this.environment[key]
  }
  
  // 检查环境是否为开发环境
  isDevelopment() {
    return this.environment.NODE_ENV === 'development'
  }
  
  // 检查环境是否为生产环境
  isProduction() {
    return this.environment.NODE_ENV === 'production'
  }
  
  // 检查环境是否为测试环境
  isTest() {
    return this.environment.NODE_ENV === 'test'
  }
}

// 创建并导出环境变量实例
const envConfig = new EnvConfig()

export default envConfig

export const {
  PORT,
  NODE_ENV,
  
  DB_DIALECT,
  DB_NAME,
  DB_STORAGE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  
  JWT_SECRET,
  JWT_EXPIRES_IN,
  
  CORS_ORIGIN,
  
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_URL,
  
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  
  LOG_LEVEL
} = envConfig.getAll()
