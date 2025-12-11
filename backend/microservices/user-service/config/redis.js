// 用户服务 - Redis配置
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// Redis连接配置
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  connectTimeout: 10000,
  maxRetriesPerRequest: 5,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('[REDIS] Redis连接重试次数超过上限');
        return new Error('Redis连接重试次数超过上限');
      }
      return Math.min(retries * 1000, 5000);
    },
    keepAlive: 30,
  },
};

// 创建Redis客户端
let redisClient;
let isRedisConnected = false;
let memoryCache = {};
let cacheExpiry = new Map();

// 初始化Redis连接
const initRedis = async () => {
  try {
    logger.info('[REDIS] 开始初始化Redis连接...');
    logger.info('[REDIS] 连接配置：', redisConfig);
    
    redisClient = createClient(redisConfig);
    
    // 连接事件
    redisClient.on('connect', () => {
      logger.info('[REDIS] Redis连接成功');
      isRedisConnected = true;
    });
    
    // 错误事件
    redisClient.on('error', (error) => {
      logger.error('[REDIS] Redis连接错误：', error);
      isRedisConnected = false;
      logger.warn('[REDIS] Redis连接失败，回退到内存缓存模式');
    });
    
    // 断开连接事件
    redisClient.on('end', () => {
      logger.info('[REDIS] Redis连接已关闭');
      isRedisConnected = false;
    });
    
    // 连接Redis
    await redisClient.connect();
    logger.info('[REDIS] Redis连接初始化完成');
    
    // 定期清理过期缓存
    setInterval(() => {
      cleanupExpiredCache();
    }, 60000); // 每分钟清理一次
    
  } catch (error) {
    logger.error('[REDIS] Redis连接初始化失败：', error);
    logger.warn('[REDIS] Redis连接失败，回退到内存缓存模式');
    isRedisConnected = false;
  }
};

// 清理过期的内存缓存
const cleanupExpiredCache = () => {
  const now = Date.now();
  for (const [key, expiry] of cacheExpiry.entries()) {
    if (now > expiry) {
      delete memoryCache[key];
      cacheExpiry.delete(key);
    }
  }
};

// Redis客户端封装类
class RedisClient {
  constructor() {
    this.isConnected = isRedisConnected;
  }
  
  // 获取缓存
  async get(key) {
    try {
      if (isRedisConnected && redisClient) {
        return await redisClient.get(key);
      } else {
        // 内存缓存模式
        const now = Date.now();
        if (cacheExpiry.has(key) && now > cacheExpiry.get(key)) {
          // 缓存已过期
          delete memoryCache[key];
          cacheExpiry.delete(key);
          return null;
        }
        return memoryCache[key] || null;
      }
    } catch (error) {
      logger.error('[REDIS] 获取缓存错误：', error);
      // 回退到内存缓存
      const now = Date.now();
      if (cacheExpiry.has(key) && now > cacheExpiry.get(key)) {
        delete memoryCache[key];
        cacheExpiry.delete(key);
        return null;
      }
      return memoryCache[key] || null;
    }
  }
  
  // 设置缓存
  async set(key, value, ttl = 3600) {
    try {
      if (isRedisConnected && redisClient) {
        return await redisClient.set(key, value, { EX: ttl });
      } else {
        // 内存缓存模式
        memoryCache[key] = value;
        cacheExpiry.set(key, Date.now() + ttl * 1000);
        return 'OK';
      }
    } catch (error) {
      logger.error('[REDIS] 设置缓存错误：', error);
      // 回退到内存缓存
      memoryCache[key] = value;
      cacheExpiry.set(key, Date.now() + ttl * 1000);
      return 'OK';
    }
  }
  
  // 删除缓存
  async del(key) {
    try {
      if (isRedisConnected && redisClient) {
        return await redisClient.del(key);
      } else {
        // 内存缓存模式
        delete memoryCache[key];
        cacheExpiry.delete(key);
        return 1;
      }
    } catch (error) {
      logger.error('[REDIS] 删除缓存错误：', error);
      // 回退到内存缓存
      delete memoryCache[key];
      cacheExpiry.delete(key);
      return 1;
    }
  }
  
  // 断开连接
  async disconnect() {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.disconnect();
        isRedisConnected = false;
        logger.info('[REDIS] Redis连接已关闭');
      }
    } catch (error) {
      logger.error('[REDIS] 断开连接错误：', error);
    }
  }
  
  // 检查连接状态
  isConnected() {
    return isRedisConnected;
  }
}

// 初始化Redis连接
initRedis();

// 导出Redis客户端实例
export default new RedisClient();
