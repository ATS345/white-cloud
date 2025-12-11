// Redis配置 - 实现Redis客户端连接和内存缓存fallback
import { createClient } from 'redis';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 内存缓存fallback - 当Redis不可用时使用
const memoryCache = new Map();
let redisClient = null;
let isRedisConnected = false;

/**
 * 初始化Redis客户端
 */
const initRedisClient = async () => {
  try {
    // 创建Redis客户端
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          console.log(`[REDIS CONFIG] 尝试重新连接Redis... (${retries})`);
          return Math.min(retries * 500, 10000);
        },
        connectTimeout: 10000,
      },
    });

    // 监听Redis事件
    redisClient.on('connect', () => {
      console.log('[REDIS CONFIG] Redis连接成功');
      isRedisConnected = true;
    });

    redisClient.on('error', (error) => {
      console.error('[REDIS CONFIG] Redis连接错误:', error.message);
      isRedisConnected = false;
    });

    redisClient.on('end', () => {
      console.log('[REDIS CONFIG] Redis连接已关闭');
      isRedisConnected = false;
    });

    // 连接Redis
    await redisClient.connect();
  } catch (error) {
    console.error('[REDIS CONFIG] Redis初始化失败:', error.message);
    isRedisConnected = false;
  }
};

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} expireTime - 过期时间（秒）
 */
const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), { EX: expireTime });
    } else {
      // 使用内存缓存fallback
      memoryCache.set(key, {
        value,
        expiry: Date.now() + expireTime * 1000,
      });
    }
  } catch (error) {
    console.error('[REDIS CONFIG] 设置缓存失败:', error.message);
  }
};

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any} 缓存值或null
 */
const getCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }
    // 使用内存缓存fallback
    const cachedItem = memoryCache.get(key);
    if (cachedItem) {
      if (Date.now() < cachedItem.expiry) {
        return cachedItem.value;
      }
      // 缓存已过期，删除它
      memoryCache.delete(key);
      return null;
    }
    return null;
  } catch (error) {
    console.error('[REDIS CONFIG] 获取缓存失败:', error.message);
    return null;
  }
};

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
const deleteCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      // 删除内存缓存
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('[REDIS CONFIG] 删除缓存失败:', error.message);
  }
};

/**
 * 清空缓存
 */
const clearCache = async () => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.flushAll();
    } else {
      // 清空内存缓存
      memoryCache.clear();
    }
  } catch (error) {
    console.error('[REDIS CONFIG] 清空缓存失败:', error.message);
  }
};

// 初始化Redis客户端
initRedisClient();

// 导出Redis相关功能
export {
  redisClient,
  isRedisConnected,
  setCache,
  getCache,
  deleteCache,
  clearCache,
};
