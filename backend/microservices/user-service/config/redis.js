// 用户服务 - Redis配置
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// 清理过期的内存缓存
const cleanupExpiredCache = (cacheObj) => {
  const { memoryCache, cacheExpiry } = cacheObj;
  const now = Date.now();
  // 使用Array.from和forEach代替for...of循环
  Array.from(cacheExpiry.entries()).forEach(([key, expiry]) => {
    if (now > expiry) {
      delete memoryCache[key];
      cacheExpiry.delete(key);
    }
  });
};

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

// Redis客户端封装类
class RedisClient {
  constructor() {
    this.redisClient = null;
    this.isRedisConnected = false;
    this.memoryCache = {};
    this.cacheExpiry = new Map();
    this.redisConfig = redisConfig;
    this.initRedis();
  }

  // 初始化Redis连接
  async initRedis() {
    try {
      logger.info('[REDIS] 开始初始化Redis连接...');
      logger.info('[REDIS] 连接配置：', this.redisConfig);

      this.redisClient = createClient(this.redisConfig);

      // 连接事件
      this.redisClient.on('connect', () => {
        logger.info('[REDIS] Redis连接成功');
        this.isRedisConnected = true;
      });

      // 错误事件
      this.redisClient.on('error', (error) => {
        logger.error('[REDIS] Redis连接错误：', error);
        this.isRedisConnected = false;
        logger.warn('[REDIS] Redis连接失败，回退到内存缓存模式');
      });

      // 断开连接事件
      this.redisClient.on('end', () => {
        logger.info('[REDIS] Redis连接已关闭');
        this.isRedisConnected = false;
      });

      // 连接Redis
      await this.redisClient.connect();
      logger.info('[REDIS] Redis连接初始化完成');

      // 定期清理过期缓存
      setInterval(() => {
        cleanupExpiredCache({
          memoryCache: this.memoryCache,
          cacheExpiry: this.cacheExpiry,
        });
      }, 60000); // 每分钟清理一次
    } catch (error) {
      logger.error('[REDIS] Redis连接初始化失败：', error);
      logger.warn('[REDIS] Redis连接失败，回退到内存缓存模式');
      this.isRedisConnected = false;
    }
  }

  // 获取缓存
  async get(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        return await this.redisClient.get(key);
      }
      // 内存缓存模式
      const now = Date.now();
      if (this.cacheExpiry.has(key) && now > this.cacheExpiry.get(key)) {
        // 缓存已过期
        delete this.memoryCache[key];
        this.cacheExpiry.delete(key);
        return null;
      }
      return this.memoryCache[key] || null;
    } catch (error) {
      logger.error('[REDIS] 获取缓存错误：', error);
      // 回退到内存缓存
      const now = Date.now();
      if (this.cacheExpiry.has(key) && now > this.cacheExpiry.get(key)) {
        delete this.memoryCache[key];
        this.cacheExpiry.delete(key);
        return null;
      }
      return this.memoryCache[key] || null;
    }
  }

  // 设置缓存
  async set(key, value, ttl = 3600) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        return await this.redisClient.set(key, value, { EX: ttl });
      }
      // 内存缓存模式
      this.memoryCache[key] = value;
      this.cacheExpiry.set(key, Date.now() + ttl * 1000);
      return 'OK';
    } catch (error) {
      logger.error('[REDIS] 设置缓存错误：', error);
      // 回退到内存缓存
      this.memoryCache[key] = value;
      this.cacheExpiry.set(key, Date.now() + ttl * 1000);
      return 'OK';
    }
  }

  // 删除缓存
  async del(key) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        return await this.redisClient.del(key);
      }
      // 内存缓存模式
      delete this.memoryCache[key];
      this.cacheExpiry.delete(key);
      return 1;
    } catch (error) {
      logger.error('[REDIS] 删除缓存错误：', error);
      // 回退到内存缓存
      delete this.memoryCache[key];
      this.cacheExpiry.delete(key);
      return 1;
    }
  }

  // 断开连接
  async disconnect() {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.disconnect();
        this.isRedisConnected = false;
        logger.info('[REDIS] Redis连接已关闭');
      }
    } catch (error) {
      logger.error('[REDIS] 断开连接错误：', error);
    }
  }

  // 检查连接状态
  isConnected() {
    return this.isRedisConnected;
  }
}

// 导出Redis客户端实例
export default new RedisClient();
