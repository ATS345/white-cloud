import redis from 'redis'
import dotenv from 'dotenv'
import logger from './logger.js'

// 加载环境变量
dotenv.config()

// 创建Redis客户端
let redisClient

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  connectTimeout: 5000,
  maxRetriesPerRequest: 3
}

// 初始化Redis连接
const initRedis = async () => {
  try {
    redisClient = redis.createClient(redisConfig)
    
    redisClient.on('error', (err) => {
      logger.error(`[REDIS ERROR] ${err.message}`)
    })
    
    redisClient.on('connect', () => {
      logger.info('[REDIS] Successfully connected to Redis server')
    })
    
    redisClient.on('end', () => {
      logger.warn('[REDIS] Disconnected from Redis server')
    })
    
    await redisClient.connect()
    
    // 测试连接
    await redisClient.ping()
    logger.info('[REDIS] Connection test successful')
    
  } catch (error) {
    logger.error(`[REDIS INIT ERROR] ${error.message}`)
    logger.warn('[REDIS] Redis connection failed, falling back to memory cache')
    
    // 如果Redis连接失败，使用内存模拟Redis功能
    redisClient = {
      _cache: new Map(),
      async set(key, value, options) {
        this._cache.set(key, {
          value,
          expiresAt: options?.EX ? Date.now() + (options.EX * 1000) : null
        })
      },
      async get(key) {
        const item = this._cache.get(key)
        if (!item) return null
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this._cache.delete(key)
          return null
        }
        return item.value
      },
      async del(key) {
        this._cache.delete(key)
      },
      async exists(key) {
        const item = this._cache.get(key)
        if (!item) return 0
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this._cache.delete(key)
          return 0
        }
        return 1
      },
      async incr(key) {
        const current = parseInt(await this.get(key) || '0')
        await this.set(key, (current + 1).toString())
        return current + 1
      },
      async expire(key, seconds) {
        const item = this._cache.get(key)
        if (item) {
          item.expiresAt = Date.now() + (seconds * 1000)
          this._cache.set(key, item)
        }
      },
      async disconnect() {
        this._cache.clear()
      }
    }
  }
}

// 初始化Redis连接
initRedis()

export default redisClient