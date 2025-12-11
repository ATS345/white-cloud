// 游戏服务 - Redis配置
import { createClient } from 'redis';
import logger from './logger.js';

// 内存缓存作为Redis的fallback
const memoryCache = new Map();

// Redis客户端配置
const redisOptions = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 1000, 5000);
      logger.info(`[Redis] 尝试重新连接，第${retries}次，延迟${delay}ms`);
      return delay;
    },
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DATABASE || '0', 10),
};

// 创建Redis客户端
let redisClient;
let isRedisConnected = false;

// 初始化Redis客户端
const initRedisClient = async () => {
  try {
    redisClient = createClient(redisOptions);

    // 连接事件
    redisClient.on('connect', () => {
      logger.info('[Redis] 连接成功');
      isRedisConnected = true;
    });

    // 错误事件
    redisClient.on('error', (error) => {
      logger.error('[Redis] 连接错误:', error.message);
      isRedisConnected = false;
    });

    // 重新连接事件
    redisClient.on('reconnecting', (info) => {
      logger.info('[Redis] 正在重新连接:', info);
    });

    // 结束事件
    redisClient.on('end', () => {
      logger.info('[Redis] 连接已关闭');
      isRedisConnected = false;
    });

    // 连接到Redis
    await redisClient.connect();
    logger.info('[Redis] 初始化成功');
  } catch (error) {
    logger.error('[Redis] 初始化失败:', error.message);
    isRedisConnected = false;
  }
};

// 关闭Redis客户端
const closeRedisClient = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('[Redis] 客户端已关闭');
    }
  } catch (error) {
    logger.error('[Redis] 关闭客户端失败:', error.message);
  }
};

// Redis操作封装，带fallback到内存缓存
const redisService = {
  // 设置缓存
  async set(key, value, ttl = 3600) {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
        logger.debug(`[Redis] 设置缓存成功，键: ${key}，过期时间: ${ttl}s`);
      } else {
        // 回退到内存缓存
        memoryCache.set(key, {
          value,
          expiry: Date.now() + ttl * 1000,
        });
        logger.debug(`[MemoryCache] 设置缓存成功，键: ${key}，过期时间: ${ttl}s`);
      }
    } catch (error) {
      logger.error(`[Redis] 设置缓存失败，键: ${key}，错误: ${error.message}`);
    }
  },

  // 获取缓存
  async get(key) {
    try {
      if (isRedisConnected && redisClient) {
        const value = await redisClient.get(key);
        if (value) {
          logger.debug(`[Redis] 获取缓存成功，键: ${key}`);
          return JSON.parse(value);
        }
      } else {
        // 回退到内存缓存
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          logger.debug(`[MemoryCache] 获取缓存成功，键: ${key}`);
          return cached.value;
        } if (cached) {
          // 缓存已过期，删除
          memoryCache.delete(key);
          logger.debug(`[MemoryCache] 缓存已过期，删除键: ${key}`);
        }
      }
      return null;
    } catch (error) {
      logger.error(`[Redis] 获取缓存失败，键: ${key}，错误: ${error.message}`);
      return null;
    }
  },

  // 删除缓存
  async del(key) {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.del(key);
        logger.debug(`[Redis] 删除缓存成功，键: ${key}`);
      }
      // 同时删除内存缓存
      memoryCache.delete(key);
      logger.debug(`[MemoryCache] 删除缓存成功，键: ${key}`);
    } catch (error) {
      logger.error(`[Redis] 删除缓存失败，键: ${key}，错误: ${error.message}`);
    }
  },

  // 清空缓存
  async flushAll() {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.flushAll();
        logger.debug('[Redis] 清空所有缓存成功');
      }
      // 同时清空内存缓存
      memoryCache.clear();
      logger.debug('[MemoryCache] 清空所有缓存成功');
    } catch (error) {
      logger.error('[Redis] 清空所有缓存失败，错误:', error.message);
    }
  },

  // 过期时间设置
  async expire(key, ttl) {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.expire(key, ttl);
        logger.debug(`[Redis] 设置过期时间成功，键: ${key}，过期时间: ${ttl}s`);
      } else {
        // 回退到内存缓存
        const cached = memoryCache.get(key);
        if (cached) {
          memoryCache.set(key, {
            value: cached.value,
            expiry: Date.now() + ttl * 1000,
          });
          logger.debug(`[MemoryCache] 设置过期时间成功，键: ${key}，过期时间: ${ttl}s`);
        }
      }
    } catch (error) {
      logger.error(`[Redis] 设置过期时间失败，键: ${key}，错误: ${error.message}`);
    }
  },

  // 获取Redis连接状态
  isConnected() {
    return isRedisConnected;
  },
};

// 定期清理内存缓存中的过期数据
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;

  // 使用Array方法替代for...of循环
  Array.from(memoryCache.entries()).forEach(([key, cached]) => {
    if (cached.expiry < now) {
      memoryCache.delete(key);
      deletedCount += 1;
    }
  });

  if (deletedCount > 0) {
    logger.debug(`[MemoryCache] 清理了${deletedCount}个过期缓存项`);
  }
}, 60000); // 每分钟清理一次

// 导出Redis服务
initRedisClient();

export default redisService;
export { closeRedisClient };
