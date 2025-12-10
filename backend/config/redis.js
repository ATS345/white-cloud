import redis from 'redis';
import logger from './logger.js';
import { REDIS_URL } from './envConfig.js';

// 创建Redis客户端
let redisClient = {
  _cache: new Map(),
  _name: 'MemoryCache',

  // 默认返回未连接状态
  get isConnected() {
    return false;
  },

  // 基础缓存操作
  async set(key, value, options = {}) {
    try {
      let expiresAt = null;

      // 支持多种过期时间格式
      if (options.EX) {
        expiresAt = Date.now() + (options.EX * 1000);
      } else if (options.PX) {
        expiresAt = Date.now() + options.PX;
      } else if (options.EXAT) {
        expiresAt = options.EXAT * 1000;
      } else if (options.PXAT) {
        expiresAt = options.PXAT;
      }

      this._cache.set(key, {
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        expiresAt,
        createdAt: Date.now(),
      });
      return 'OK';
    } catch (error) {
      logger.error(`[REDIS CACHE] set操作失败: ${error.message}`);
      return null;
    }
  },

  async get(key) {
    try {
      const item = this._cache.get(key);
      if (!item) return null;

      // 检查是否过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this._cache.delete(key);
        return null;
      }

      // 尝试解析JSON
      try {
        return JSON.parse(item.value);
      } catch {
        return item.value;
      }
    } catch (error) {
      logger.error(`[REDIS CACHE] get操作失败: ${error.message}`);
      return null;
    }
  },

  async del(key) {
    try {
      this._cache.delete(key);
      return 1;
    } catch (error) {
      logger.error(`[REDIS CACHE] del操作失败: ${error.message}`);
      return 0;
    }
  },

  async disconnect() {
    try {
      this._cache.clear();
      logger.info('[REDIS CACHE] 内存缓存已清空');
    } catch (error) {
      logger.error(`[REDIS CACHE] 断开连接失败: ${error.message}`);
    }
  },
};

const redisState = {
  isConnected: false,
  retryAttempts: 0,
  connectionError: null,
  lastHeartbeat: null,
  heartbeatInterval: null,
};

// 配置常量
const MAX_RETRY_ATTEMPTS = 10; // 增加最大重试次数
const RETRY_DELAY_BASE = 1000; // 初始重试延迟（毫秒）
const HEARTBEAT_INTERVAL = 30000; // 心跳检查间隔（30秒）
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 缓存清理间隔（10分钟）

// Redis连接配置
const redisConfig = {
  url: REDIS_URL,
  connectTimeout: 10000, // 增加连接超时时间
  maxRetriesPerRequest: 5, // 增加每个请求的最大重试次数
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > MAX_RETRY_ATTEMPTS) {
        logger.error(`[REDIS] 达到最大重连尝试次数 (${MAX_RETRY_ATTEMPTS})，停止重连`);
        connectionError = new Error('达到最大重连尝试次数');
        return connectionError;
      }
      // 改进的指数退避策略，增加随机性，修复延迟计算中的NaN问题
      const baseDelay = RETRY_DELAY_BASE * 2 ** retries;
      const randomDelay = Math.random() * 2000;
      const delay = Math.min(baseDelay + randomDelay, 60000); // 最大延迟60秒
      logger.info(`[REDIS] 尝试重连 (${retries}/${MAX_RETRY_ATTEMPTS})，延迟 ${Math.round(delay)}ms`);
      return delay;
    },
    keepAlive: 60, // 保持连接活跃
    noDelay: true, // 禁用Nagle算法，提高响应速度
  },
};

// 内存缓存清理函数 - 定期清理过期数据
const cleanupExpiredCache = () => {
  if (redisClient && !redisState.isConnected && redisClient._cache) {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, value] of redisClient._cache.entries()) {
      if (value.expiresAt && now > value.expiresAt) {
        redisClient._cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`[REDIS CACHE] 清理了 ${deletedCount} 个过期缓存项`);
      logger.info(`[REDIS CACHE] 当前缓存大小: ${redisClient._cache.size} 项`);
    }
  }
};

// 心跳检查函数
const heartbeatCheck = async () => {
  if (!redisClient || !redisState.isConnected) {
    return;
  }

  try {
    const startTime = Date.now();
    await redisClient.ping();
    const latency = Date.now() - startTime;
    redisState.lastHeartbeat = Date.now();

    logger.debug(`[REDIS HEARTBEAT] 心跳检查成功，延迟: ${latency}ms`);

    // 如果延迟过高，记录警告
    if (latency > 1000) {
      logger.warn(`[REDIS HEARTBEAT] 心跳延迟过高: ${latency}ms，可能存在网络问题`);
    }
  } catch (error) {
    logger.error(`[REDIS HEARTBEAT] 心跳检查失败: ${error.message}`);
    // 心跳失败，触发重新连接
    if (redisClient.disconnect) {
      await redisClient.disconnect();
      await initRedis();
    }
  }
};

// 启动心跳检查
const startHeartbeatCheck = () => {
  if (redisState.heartbeatInterval) {
    clearInterval(redisState.heartbeatInterval);
  }

  redisState.heartbeatInterval = setInterval(heartbeatCheck, HEARTBEAT_INTERVAL);
  logger.info(`[REDIS] 启动心跳检查，间隔 ${HEARTBEAT_INTERVAL / 1000} 秒`);
};

// 停止心跳检查
const stopHeartbeatCheck = () => {
  if (redisState.heartbeatInterval) {
    clearInterval(redisState.heartbeatInterval);
    redisState.heartbeatInterval = null;
    logger.info('[REDIS] 停止心跳检查');
  }
};

// 初始化Redis连接
// 回退到内存缓存的辅助函数
const fallbackToMemoryCache = () => {
  redisClient = {
    _cache: new Map(),
    _name: 'MemoryCache',

    // 获取连接状态
    get isConnected() {
      return false;
    },

    // 设置键值对，支持多种过期时间格式
    async set(key, value, options = {}) {
      try {
        let expiresAt = null;

        // 支持多种过期时间格式
        if (options.EX) {
          expiresAt = Date.now() + (options.EX * 1000);
        } else if (options.PX) {
          expiresAt = Date.now() + options.PX;
        } else if (options.EXAT) {
          expiresAt = options.EXAT * 1000;
        } else if (options.PXAT) {
          expiresAt = options.PXAT;
        }

        this._cache.set(key, {
          value: typeof value === 'object' ? JSON.stringify(value) : value,
          expiresAt,
          createdAt: Date.now(),
        });
        return 'OK';
      } catch (error) {
        logger.error(`[REDIS CACHE] set操作失败: ${error.message}`);
        return null;
      }
    },

    // 获取键值对，支持类型转换
    async get(key) {
      try {
        const item = this._cache.get(key);
        if (!item) return null;

        // 检查是否过期
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this._cache.delete(key);
          return null;
        }

        // 尝试解析JSON
        try {
          return JSON.parse(item.value);
        } catch {
          return item.value;
        }
      } catch (error) {
        logger.error(`[REDIS CACHE] get操作失败: ${error.message}`);
        return null;
      }
    },

    // 删除键值对
    async del(...keys) {
      try {
        let deletedCount = 0;
        for (const key of keys) {
          if (this._cache.delete(key)) {
            deletedCount++;
          }
        }
        return deletedCount;
      } catch (error) {
        logger.error(`[REDIS CACHE] del操作失败: ${error.message}`);
        return 0;
      }
    },

    // 检查键是否存在
    async exists(...keys) {
      try {
        let existsCount = 0;
        for (const key of keys) {
          const item = this._cache.get(key);
          if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
            existsCount++;
          }
        }
        return existsCount;
      } catch (error) {
        logger.error(`[REDIS CACHE] exists操作失败: ${error.message}`);
        return 0;
      }
    },

    // 递增操作
    async incr(key) {
      try {
        const current = parseInt(await this.get(key) || '0');
        const newValue = current + 1;
        await this.set(key, newValue.toString());
        return newValue;
      } catch (error) {
        logger.error(`[REDIS CACHE] incr操作失败: ${error.message}`);
        throw error;
      }
    },

    // 设置过期时间
    async expire(key, seconds) {
      try {
        const item = this._cache.get(key);
        if (item) {
          item.expiresAt = Date.now() + (seconds * 1000);
          this._cache.set(key, item);
          return 1;
        }
        return 0;
      } catch (error) {
        logger.error(`[REDIS CACHE] expire操作失败: ${error.message}`);
        return 0;
      }
    },

    // 设置过期时间（毫秒）
    async pexpire(key, milliseconds) {
      try {
        const item = this._cache.get(key);
        if (item) {
          item.expiresAt = Date.now() + milliseconds;
          this._cache.set(key, item);
          return 1;
        }
        return 0;
      } catch (error) {
        logger.error(`[REDIS CACHE] pexpire操作失败: ${error.message}`);
        return 0;
      }
    },

    // 获取过期时间（秒）
    async ttl(key) {
      try {
        const item = this._cache.get(key);
        if (!item) return -2; // 键不存在
        if (!item.expiresAt) return -1; // 键存在但没有过期时间

        const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
        return ttl > 0 ? ttl : -2; // 已过期返回-2
      } catch (error) {
        logger.error(`[REDIS CACHE] ttl操作失败: ${error.message}`);
        return -2;
      }
    },

    // 获取过期时间（毫秒）
    async pttl(key) {
      try {
        const item = this._cache.get(key);
        if (!item) return -2; // 键不存在
        if (!item.expiresAt) return -1; // 键存在但没有过期时间

        const pttl = item.expiresAt - Date.now();
        return pttl > 0 ? pttl : -2; // 已过期返回-2
      } catch (error) {
        logger.error(`[REDIS CACHE] pttl操作失败: ${error.message}`);
        return -2;
      }
    },

    // 断开连接
    async disconnect() {
      try {
        this._cache.clear();
        logger.info('[REDIS CACHE] 内存缓存已清空');
      } catch (error) {
        logger.error(`[REDIS CACHE] 断开连接失败: ${error.message}`);
      }
    },

    // 获取客户端信息
    async info() {
      return {
        connected_clients: 1,
        used_memory: this._cache.size * 1000, // 估算内存使用
        uptime_in_seconds: Math.floor((Date.now() - this._createdAt) / 1000),
        redis_version: 'MemoryCache v1.0',
      };
    },

    // 获取所有键
    async keys(pattern = '*') {
      try {
        const keys = [];
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));

        for (const key of this._cache.keys()) {
          if (regex.test(key)) {
            const item = this._cache.get(key);
            if (!item.expiresAt || Date.now() <= item.expiresAt) {
              keys.push(key);
            }
          }
        }

        return keys;
      } catch (error) {
        logger.error(`[REDIS CACHE] keys操作失败: ${error.message}`);
        return [];
      }
    },

    // 清空所有键
    async flushAll() {
      try {
        const { size } = this._cache;
        this._cache.clear();
        logger.info(`[REDIS CACHE] 已清空所有 ${size} 个缓存项`);
        return 'OK';
      } catch (error) {
        logger.error(`[REDIS CACHE] flushAll操作失败: ${error.message}`);
        return null;
      }
    },

    // 添加创建时间
    _createdAt: Date.now(),
  };

  // 启动内存缓存清理定时器
  if (!redisState.heartbeatInterval) {
    redisState.heartbeatInterval = setInterval(cleanupExpiredCache, CACHE_CLEANUP_INTERVAL);
    logger.info(`[REDIS CACHE] 启动内存缓存清理定时器，每 ${CACHE_CLEANUP_INTERVAL / 1000 / 60} 分钟清理一次过期数据`);
  }
};

// 初始化Redis连接
const initRedis = async () => {
  try {
    logger.info('[REDIS] 开始初始化Redis连接...');
    logger.info(`[REDIS] 连接配置：
  - 连接地址: ${REDIS_URL}
  - 连接超时: ${redisConfig.connectTimeout}ms
  - 最大重试次数: ${MAX_RETRY_ATTEMPTS}
  - 初始重试延迟: ${RETRY_DELAY_BASE}ms
  - 心跳检查: ${HEARTBEAT_INTERVAL / 1000}秒
  - 缓存清理: ${CACHE_CLEANUP_INTERVAL / 1000 / 60}分钟`);
    redisState.connectionError = null;

    // 创建新的Redis客户端
    redisClient = redis.createClient(redisConfig);

    // 连接事件处理
    redisClient.on('connect', () => {
      logger.info('[REDIS] 成功连接到Redis服务器');
      redisState.connectionError = null;
    });

    // 准备就绪事件处理
    redisClient.on('ready', () => {
      logger.info('[REDIS] Redis客户端准备就绪');
      redisState.isConnected = true;
      redisState.retryAttempts = 0;
      redisState.connectionError = null;
      redisState.lastHeartbeat = Date.now();

      // 停止内存缓存清理定时器
      if (redisState.heartbeatInterval) {
        clearInterval(redisState.heartbeatInterval);
        redisState.heartbeatInterval = null;
        logger.info('[REDIS] 停止内存缓存清理定时器，Redis已连接');
      }

      // 启动心跳检查
      startHeartbeatCheck();

      logger.info(`[REDIS] Redis连接初始化成功，详细信息：
  - 连接状态: 已连接
  - 连接地址: ${REDIS_URL}
  - 客户端ID: ${redisClient?.options?.clientName || '未知'}`);
    });

    // 错误事件处理
    redisClient.on('error', (err) => {
      redisState.connectionError = err;
      redisState.isConnected = false;

      // 根据错误类型记录不同级别的日志，提供更详细的错误信息
      if (err.code === 'ECONNREFUSED') {
        logger.error(`[REDIS ERROR] ${err.message}`);
        logger.error(`[REDIS] Redis服务器拒绝连接，详细信息：
  - 连接地址: ${REDIS_URL}
  - 错误代码: ${err.code}
  - 错误信息: ${err.message}
  - 建议: 请检查Redis服务是否正在运行，Redis配置是否正确，网络连接是否正常`);
      } else if (err.code === 'ETIMEDOUT') {
        logger.error(`[REDIS ERROR] ${err.message}`);
        logger.error(`[REDIS] 连接超时，详细信息：
  - 连接地址: ${REDIS_URL}
  - 超时时间: ${redisConfig.connectTimeout}ms
  - 错误代码: ${err.code}
  - 错误信息: ${err.message}
  - 建议: 请检查网络连接和Redis服务器状态`);
      } else if (err.code === 'ENOENT') {
        logger.error(`[REDIS ERROR] ${err.message}`);
        logger.error(`[REDIS] 配置文件不存在，详细信息：
  - 错误代码: ${err.code}
  - 错误信息: ${err.message}
  - 建议: 请检查Redis配置文件路径是否正确`);
      } else {
        logger.error(`[REDIS ERROR] ${err.message}`);
        logger.error(`[REDIS] 发生未知错误，详细信息：
  - 错误代码: ${err.code || '未知'}
  - 错误信息: ${err.message}
  - 堆栈跟踪: ${err.stack}`);
      }
    });

    // 断开连接事件处理
    redisClient.on('end', () => {
      logger.warn('[REDIS] 与Redis服务器的连接已断开');
      redisState.isConnected = false;
      stopHeartbeatCheck();

      // 回退到内存缓存
      logger.warn('[REDIS] 回退到内存缓存模式');
      fallbackToMemoryCache();
    });

    // 重连事件处理
    redisClient.on('reconnecting', (delay, attempt) => {
      redisState.retryAttempts++;
      logger.info(`[REDIS] 尝试重连 (${redisState.retryAttempts}/${MAX_RETRY_ATTEMPTS})，延迟 ${Math.round(delay)}ms`);
    });

    // 连接中断事件处理
    redisClient.on('destroyed', () => {
      logger.warn('[REDIS] Redis连接已销毁');
      redisState.isConnected = false;
      stopHeartbeatCheck();

      // 回退到内存缓存
      logger.warn('[REDIS] 回退到内存缓存模式');
      fallbackToMemoryCache();
    });

    // 连接Redis
    await redisClient.connect();
    logger.info('[REDIS] Redis连接初始化成功');

    // 测试连接
    await redisClient.ping();
    logger.info('[REDIS] 连接测试成功');
    redisState.lastHeartbeat = Date.now();
  } catch (error) {
    logger.error(`[REDIS INIT ERROR] ${error.message}`);
    logger.error(`[REDIS] Redis连接失败，详细信息：
  - 错误代码: ${error.code || '未知'}
  - 错误信息: ${error.message}
  - 堆栈跟踪: ${error.stack}
  - 回退策略: 切换到内存缓存模式`);
    logger.warn('[REDIS] Redis连接失败，回退到内存缓存模式');
    redisState.isConnected = false;
    redisState.connectionError = error;

    // 如果Redis连接失败，回退到内存缓存
    fallbackToMemoryCache();
  }
};

// 获取Redis连接状态
export const getRedisStatus = () => ({
  isConnected: redisState.isConnected,
  retryAttempts: redisState.retryAttempts,
  lastHeartbeat: redisState.lastHeartbeat,
  connectionError: redisState.connectionError ? redisState.connectionError.message : null,
  clientType: redisClient?._name || 'RedisClient',
});

// 手动测试连接
export const testConnection = async () => {
  try {
    if (!redisClient) {
      return { success: false, message: 'Redis客户端未初始化' };
    }

    if (redisState.isConnected) {
      await redisClient.ping();
      redisState.lastHeartbeat = Date.now();
      return { success: true, message: 'Redis连接正常' };
    }
    return { success: false, message: 'Redis连接已断开' };
  } catch (error) {
    return { success: false, message: `连接测试失败: ${error.message}` };
  }
};

// 启动Redis初始化（异步执行，不阻塞导出）
initRedis().catch((error) => {
  logger.error(`[REDIS INIT FATAL ERROR] ${error.message}`);
  // 保持redisClient为内存缓存，不影响服务器启动
});

// 导出Redis客户端和相关函数
export default redisClient;
