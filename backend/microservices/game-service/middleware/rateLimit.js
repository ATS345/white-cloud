// 游戏服务 - API 速率限制中间件
import { createClient } from 'redis';
import logger from '../config/logger.js';

// 内存存储作为 Redis 降级方案
const memoryStore = {
  data: new Map(),

  async get(key) {
    const item = this.data.get(key);
    if (!item) return null;

    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  },

  async set(key, value, options) {
    const expiry = Date.now() + (options.EX * 1000);
    this.data.set(key, { value, expiry });
    return 'OK';
  },
};

// Redis 客户端
let redisClient;

// 初始化 Redis 客户端
const initRedis = async () => {
  if (!redisClient) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB, 10) || 0,
      });

      await redisClient.connect();
      logger.info('[RateLimitMiddleware] Redis 客户端连接成功');
    } catch (error) {
      logger.error(`[RateLimitMiddleware] Redis 连接失败: ${error.message}`);
      // 使用内存存储作为降级方案
      redisClient = {
        get: async (key) => memoryStore.get(key),
        set: async (key, value, options) => memoryStore.set(key, value, options),
        disconnect: async () => {},
      };
      logger.warn('[RateLimitMiddleware] 降级为内存存储');
    }
  }
};

// 初始化 Redis 客户端
initRedis().catch((error) => {
  logger.error(`[RateLimitMiddleware] 初始化失败: ${error.message}`);
});

/**
 * API 速率限制中间件
 * @param {Object} options - 配置选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 每个窗口最大请求数
 * @param {string} options.message - 超出限制时的消息
 * @param {number} options.statusCode - 超出限制时的状态码
 * @param {string} options.keyGenerator - 生成键的函数
 * @param {string} options.handler - 自定义处理函数
 */
export const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 默认 1 分钟
    max = 60, // 默认 60 个请求
    message = '请求过于频繁，请稍后重试',
    statusCode = 429,
    keyGenerator = (req) => req.ip,
    handler = null,
  } = options;

  return async (req, res, next) => {
    try {
      // 生成限流键
      const key = `rate-limit:${keyGenerator(req)}`;
      const windowSeconds = Math.ceil(windowMs / 1000);

      // 获取当前请求计数
      const current = await redisClient.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= max) {
        // 超出限制
        logger.warn(`[RateLimitMiddleware] 速率限制触发，IP: ${keyGenerator(req)}, 计数: ${count}`);

        if (handler) {
          return handler(req, res);
        }

        return res.status(statusCode).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            retryAfter: windowSeconds,
          },
        });
      }

      // 增加计数
      if (count === 0) {
        // 设置新键，带过期时间
        await redisClient.set(key, '1', { EX: windowSeconds });
      } else {
        // 增加计数
        await redisClient.set(key, (count + 1).toString(), { EX: windowSeconds });
      }

      // 设置响应头
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - count - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + windowMs) / 1000));

      logger.debug(`[RateLimitMiddleware] 速率限制检查通过，IP: ${keyGenerator(req)}, 计数: ${count + 1}`);
      return next();
    } catch (error) {
      logger.error(`[RateLimitMiddleware] 处理请求失败: ${error.message}`);
      // 限流中间件错误不应该阻止请求，继续执行
      return next();
    }
  };
};

/**
 * 基于路径的速率限制中间件
 * @param {Object} limits - 路径限制配置
 * @example
 * const limits = {
 *   '/api/games': { windowMs: 60000, max: 60 },
 *   '/api/admin': { windowMs: 60000, max: 20 },
 * };
 */
export const rateLimitByPath = (limits = {}) => (req, res, next) => {
  // 查找匹配的路径
  let matchedPath = null;

  // 使用Object.keys和forEach替代for...of循环
  const paths = Object.keys(limits);
  paths.some((path) => {
    if (req.path.startsWith(path)) {
      matchedPath = path;
      return true;
    }
    return false;
  });

  if (matchedPath) {
    // 使用匹配路径的限制配置
    const limitConfig = limits[matchedPath];
    return rateLimit(limitConfig)(req, res, next);
  }

  // 没有匹配路径，继续执行
  return next();
};

/**
 * 基于角色的速率限制中间件
 * @param {Object} limits - 角色限制配置
 * @example
 * const limits = {
 *   'admin': { windowMs: 60000, max: 100 },
 *   'developer': { windowMs: 60000, max: 50 },
 *   'user': { windowMs: 60000, max: 20 },
 * };
 */
export const rateLimitByRole = (limits = {}) => (req, res, next) => {
  // 检查是否已经通过认证
  if (!req.user || !req.user.role) {
    // 未认证用户使用默认限制
    return rateLimit(limits.default || { windowMs: 60000, max: 10 })(req, res, next);
  }

  // 使用角色对应的限制配置
  const limitConfig = limits[req.user.role] || limits.default || { windowMs: 60000, max: 60 };
  return rateLimit(limitConfig)(req, res, next);
};
