// 购物车服务 - Redis配置
import { createClient } from 'redis';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建Redis客户端
const redisClient = createClient({
  url: `redis://${process.env.REDIS_PASSWORD ? `${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
  socket: {
    connectTimeout: 5000,
    keepAlive: 30000,
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.error('[CART-SERVICE] Redis重连失败');
        return new Error('Redis重连失败');
      }
      return retries * 1000;
    },
  },
});

// 内存缓存 fallback
const memoryCache = new Map();

// 连接Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('[CART-SERVICE] Redis连接成功');
  } catch (error) {
    console.error('[CART-SERVICE] Redis连接失败，将使用内存缓存:', error.message);
  }
};

// 断开Redis连接
const disconnectRedis = async () => {
  try {
    if (redisClient.isReady) {
      await redisClient.disconnect();
      console.log('[CART-SERVICE] Redis连接已关闭');
    }
  } catch (error) {
    console.error('[CART-SERVICE] 关闭Redis连接时发生错误:', error.message);
  }
};

// 设置缓存
const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (redisClient.isReady) {
      await redisClient.set(key, JSON.stringify(value), { EX: expireTime });
      return;
    }
    // Redis不可用时使用内存缓存
    memoryCache.set(key, {
      value,
      expireAt: Date.now() + expireTime * 1000,
    });
  } catch (error) {
    console.error('[CART-SERVICE] 设置缓存失败:', error.message);
    // 失败时使用内存缓存
    memoryCache.set(key, {
      value,
      expireAt: Date.now() + expireTime * 1000,
    });
  }
};

// 获取缓存
const getCache = async (key) => {
  try {
    if (redisClient.isReady) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }
    // Redis不可用时使用内存缓存
    const cached = memoryCache.get(key);
    if (!cached) return null;
    // 检查缓存是否过期
    if (Date.now() > cached.expireAt) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  } catch (error) {
    console.error('[CART-SERVICE] 获取缓存失败:', error.message);
    // 失败时使用内存缓存
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expireAt) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
};

// 删除缓存
const deleteCache = async (key) => {
  try {
    if (redisClient.isReady) {
      await redisClient.del(key);
    }
    // 同时删除内存缓存
    memoryCache.delete(key);
  } catch (error) {
    console.error('[CART-SERVICE] 删除缓存失败:', error.message);
    // 失败时删除内存缓存
    memoryCache.delete(key);
  }
};

// 清空缓存
export const clearCache = async (pattern) => {
  try {
    if (redisClient.isReady) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
    // 清空匹配模式的内存缓存
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('[CART-SERVICE] 清空缓存失败:', error.message);
  }
};

// 导出Redis客户端和缓存方法
export {
  redisClient,
  connectRedis,
  disconnectRedis,
  setCache,
  getCache,
  deleteCache,
};
