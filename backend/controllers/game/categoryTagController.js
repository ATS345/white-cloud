import models from '../../models/index.js';
import logger from '../../config/logger.js';
import {
  cacheQuery,
  generateGameCategoriesCacheKey,
  generateGameTagsCacheKey,
  generateGamesByCategoryCacheKey,
  generateGamesByTagCacheKey,
  CACHE_EXPIRY,
} from '../../utils/cacheUtils.js';

// 从models中获取所有需要的模型
const { GameCategory, GameTag } = models;

/**
 * @swagger
 * /api/v1/games/categories:
 *   get:
 *     summary: 获取所有游戏分类
 *     description: 获取所有游戏分类
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 成功获取游戏分类
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 游戏分类获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameCategory'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getCategories = async (req, res) => {
  try {
    // 生成缓存键
    const cacheKey = generateGameCategoriesCacheKey();

    // 使用缓存查询
    const categories = await cacheQuery(cacheKey, CACHE_EXPIRY.LONG, () => GameCategory.findAll({
      attributes: ['id', 'name', 'description'],
    }));

    return res.status(200).json({
      success: true,
      message: '游戏分类获取成功',
      data: categories,
    });
  } catch (error) {
    logger.error('获取游戏分类错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏分类失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/tags:
 *   get:
 *     summary: 获取所有游戏标签
 *     description: 获取所有游戏标签
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: 成功获取游戏标签
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 游戏标签获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameTag'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getTags = async (req, res) => {
  try {
    // 生成缓存键
    const cacheKey = generateGameTagsCacheKey();

    // 使用缓存查询
    const tags = await cacheQuery(cacheKey, CACHE_EXPIRY.LONG, () => GameTag.findAll({
      attributes: ['id', 'name'],
    }));

    return res.status(200).json({
      success: true,
      message: '游戏标签获取成功',
      data: tags,
    });
  } catch (error) {
    logger.error('获取游戏标签错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏标签失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/categories/{categoryName}:
 *   get:
 *     summary: 按分类获取游戏
 *     description: 根据分类名称获取游戏列表
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         schema:
 *           type: string
 *         required: true
 *         description: 分类名称
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取分类下的游戏
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取动作分类下的游戏成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGamesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 生成缓存键
    const cacheKey = generateGamesByCategoryCacheKey(categoryName, { page, limit });

    // 使用缓存查询
    const result = await cacheQuery(cacheKey, CACHE_EXPIRY.MEDIUM, async () => {
      // 查找分类
      const category = await GameCategory.findOne({
        where: { name: categoryName },
      });

      if (!category) {
        return null;
      }

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 获取该分类下的游戏
      const games = await category.getGames({
        where: {
          status: 'approved',
        },
        include: [
          {
            model: GameCategory,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name'],
          },
          {
            model: GameTag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name'],
          },
        ],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });

      return { category, games };
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '分类不存在',
      });
    }

    return res.status(200).json({
      success: true,
      message: `获取${categoryName}分类下的游戏成功`,
      data: result.games,
    });
  } catch (error) {
    logger.error('按分类获取游戏错误:', error);
    return res.status(500).json({
      success: false,
      message: '按分类获取游戏失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/tags/{tagName}:
 *   get:
 *     summary: 按标签获取游戏
 *     description: 根据标签名称获取游戏列表
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: tagName
 *         schema:
 *           type: string
 *         required: true
 *         description: 标签名称
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取标签下的游戏
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取热门标签下的游戏成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGamesByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 生成缓存键
    const cacheKey = generateGamesByTagCacheKey(tagName, { page, limit });

    // 使用缓存查询
    const result = await cacheQuery(cacheKey, CACHE_EXPIRY.MEDIUM, async () => {
      // 查找标签
      const tag = await GameTag.findOne({
        where: { name: tagName },
      });

      if (!tag) {
        return null;
      }

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 获取该标签下的游戏
      const games = await tag.getGames({
        where: {
          status: 'approved',
        },
        include: [
          {
            model: GameCategory,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name'],
          },
          {
            model: GameTag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name'],
          },
        ],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });

      return { tag, games };
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '标签不存在',
      });
    }

    return res.status(200).json({
      success: true,
      message: `获取${tagName}标签下的游戏成功`,
      data: result.games,
    });
  } catch (error) {
    logger.error('按标签获取游戏错误:', error);
    return res.status(500).json({
      success: false,
      message: '按标签获取游戏失败',
      error: error.message,
    });
  }
};
