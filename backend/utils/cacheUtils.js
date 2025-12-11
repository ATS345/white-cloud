import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

// 缓存前缀常量
const CACHE_PREFIXES = {
  GAME_LIST: 'game:list:',
  GAME_DETAIL: 'game:detail:',
  GAME_CATEGORIES: 'game:categories:',
  GAME_TAGS: 'game:tags:',
  GAME_REVIEWS: 'game:reviews:',
  GAME_BY_CATEGORY: 'game:by_category:',
  GAME_BY_TAG: 'game:by_tag:',
  SYSTEM_REQUIREMENTS: 'system_requirements:',
  GAME_RECOMMENDATIONS: 'game:recommendations:',
};

// 缓存过期时间（秒）
const CACHE_EXPIRY = {
  SHORT: 60 * 5, // 5分钟
  MEDIUM: 60 * 30, // 30分钟
  LONG: 60 * 60 * 24, // 24小时
};

// 生成缓存键
const generateCacheKey = (prefix, identifier, options = {}) => {
  let key = `${prefix}${identifier}`;

  // 添加选项到缓存键
  if (options) {
    const sortedOptions = Object.entries(options).sort(([a], [b]) => a.localeCompare(b));
    if (sortedOptions.length > 0) {
      key += `:${sortedOptions.map(([k, v]) => `${k}=${v}`).join('_')}`;
    }
  }

  return key;
};

// 缓存查询结果
export const cacheQuery = async (cacheKey, expirySeconds, queryFn) => {
  try {
    // 先尝试从缓存获取数据
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      logger.debug(`[CACHE] 从缓存获取数据: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    // 缓存未命中，执行查询
    logger.debug(`[CACHE] 缓存未命中，执行查询: ${cacheKey}`);
    const data = await queryFn();

    // 将结果存入缓存
    if (data !== null && data !== undefined) {
      await redisClient.set(cacheKey, JSON.stringify(data), { EX: expirySeconds });
      logger.debug(`[CACHE] 数据存入缓存: ${cacheKey}，过期时间: ${expirySeconds}秒`);
    }

    return data;
  } catch (error) {
    logger.error(`[CACHE] 缓存操作失败: ${error.message}`);
    // 缓存操作失败时，直接返回查询结果
    return queryFn();
  }
};

// 清除缓存
export const clearCache = async (cacheKey) => {
  try {
    await redisClient.del(cacheKey);
    logger.debug(`[CACHE] 缓存已清除: ${cacheKey}`);
  } catch (error) {
    logger.error(`[CACHE] 清除缓存失败: ${error.message}`);
  }
};

// 清除匹配模式的所有缓存
export const clearCacheByPattern = async (pattern) => {
  try {
    // 如果是Redis客户端，使用keys命令
    if (redisClient.keys) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.debug(`[CACHE] 已清除匹配模式 ${pattern} 的 ${keys.length} 个缓存项`);
      }
    } else if (redisClient._cache) {
      // 如果是内存缓存，遍历所有键并删除匹配的

      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let deletedCount = 0;
      // 使用Array.from转换Map的键为数组，然后使用forEach迭代
      // eslint-disable-next-line no-underscore-dangle
      Array.from(redisClient._cache.keys()).forEach((key) => {
        if (regex.test(key)) {
          // eslint-disable-next-line no-underscore-dangle
          redisClient._cache.delete(key);
          deletedCount += 1;
        }
      });
      logger.debug(`[CACHE] 已清除匹配模式 ${pattern} 的 ${deletedCount} 个内存缓存项`);
    }
  } catch (error) {
    logger.error(`[CACHE] 清除缓存失败: ${error.message}`);
  }
};

// 生成游戏列表缓存键
export const generateGameListCacheKey = (options) => generateCacheKey(
  CACHE_PREFIXES.GAME_LIST,
  'all',
  {
    page: options.page || 1,
    limit: options.limit || 20,
    search: options.search || '',
    categories: options.categories?.join(',') || '',
    tags: options.tags?.join(',') || '',
    minPrice: options.minPrice || 0,
    maxPrice: options.maxPrice || 1000,
    sortBy: options.sortBy || 'release_date',
    sortOrder: options.sortOrder || 'desc',
    status: options.status || 'approved',
  },
);

// 生成游戏详情缓存键
export const generateGameDetailCacheKey = (gameId) => generateCacheKey(CACHE_PREFIXES.GAME_DETAIL, gameId);

// 生成游戏分类缓存键
export const generateGameCategoriesCacheKey = () => generateCacheKey(CACHE_PREFIXES.GAME_CATEGORIES, 'all');

// 生成游戏标签缓存键
export const generateGameTagsCacheKey = () => generateCacheKey(CACHE_PREFIXES.GAME_TAGS, 'all');

// 生成游戏评论缓存键
export const generateGameReviewsCacheKey = (gameId, options) => generateCacheKey(CACHE_PREFIXES.GAME_REVIEWS, gameId, {
  page: options.page || 1,
  limit: options.limit || 10,
  sortBy: options.sortBy || 'created_at',
  sortOrder: options.sortOrder || 'desc',
});

// 生成按分类查询游戏缓存键
export const generateGamesByCategoryCacheKey = (categoryName, options) => generateCacheKey(CACHE_PREFIXES.GAME_BY_CATEGORY, categoryName, {
  page: options.page || 1,
  limit: options.limit || 20,
});

// 生成按标签查询游戏缓存键
export const generateGamesByTagCacheKey = (tagName, options) => generateCacheKey(CACHE_PREFIXES.GAME_BY_TAG, tagName, {
  page: options.page || 1,
  limit: options.limit || 20,
});

// 生成系统需求缓存键
export const generateSystemRequirementsCacheKey = (gameId) => generateCacheKey(CACHE_PREFIXES.SYSTEM_REQUIREMENTS, gameId);

// 生成游戏推荐缓存键
export const generateRecommendationCacheKey = (options) => generateCacheKey(
  CACHE_PREFIXES.GAME_RECOMMENDATIONS,
  options.userId || 'anonymous',
  {
    type: options.type || 'personalized',
    gameId: options.gameId || '',
    limit: options.limit || 10,
  },
);

// 清除游戏相关的所有缓存
export const clearGameCache = async (gameId) => {
  try {
    // 清除游戏详情缓存
    await clearCache(generateGameDetailCacheKey(gameId));

    // 清除游戏评论缓存（所有分页）
    await clearCacheByPattern(`${CACHE_PREFIXES.GAME_REVIEWS}${gameId}:*`);

    // 清除系统需求缓存
    await clearCache(generateSystemRequirementsCacheKey(gameId));

    // 清除游戏列表缓存（所有筛选条件）
    await clearCacheByPattern(`${CACHE_PREFIXES.GAME_LIST}*`);

    // 清除按分类和标签查询的缓存
    await clearCacheByPattern(`${CACHE_PREFIXES.GAME_BY_CATEGORY}*`);
    await clearCacheByPattern(`${CACHE_PREFIXES.GAME_BY_TAG}*`);

    logger.debug(`[CACHE] 已清除游戏 ${gameId} 的所有相关缓存`);
  } catch (error) {
    logger.error(`[CACHE] 清除游戏缓存失败: ${error.message}`);
  }
};

// 清除所有游戏列表相关缓存
export const clearGameListCache = async () => {
  await clearCacheByPattern(`${CACHE_PREFIXES.GAME_LIST}*`);
  logger.debug('[CACHE] 已清除所有游戏列表缓存');
};

// 清除所有游戏分类和标签缓存
export const clearGameCategoriesCache = async () => {
  await clearCache(generateGameCategoriesCacheKey());
  await clearCache(generateGameTagsCacheKey());
  logger.debug('[CACHE] 已清除所有游戏分类和标签缓存');
};

// 清除所有缓存
export const clearAllCache = async () => {
  try {
    // 使用flushAll命令清除所有缓存
    await redisClient.flushAll();
    logger.info('[CACHE] 已清除所有缓存');
  } catch (error) {
    logger.error(`[CACHE] 清除所有缓存失败: ${error.message}`);
  }
};

// 导出缓存过期时间
export { CACHE_EXPIRY };
