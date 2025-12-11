import { Op } from 'sequelize';
import models from '../../models/index.js';
import logger from '../../config/logger.js';
import { cacheQuery, generateRecommendationCacheKey, CACHE_EXPIRY } from '../../utils/cacheUtils.js';

// 从models中获取所有需要的模型
const {
  Game, GameCategory, GameTag, GameLibrary,
} = models;

/**
 * 获取热门游戏 - 基于评分和最近活跃度
 */
const getTrendingGames = async (limit, excludeGameIds = []) => {
  try {
    return await Game.findAll({
      where: {
        id: { [Op.notIn]: excludeGameIds || [] },
        status: 'approved',
      },
      include: [
        { model: GameCategory, as: 'categories', through: { attributes: [] } },
        { model: GameTag, as: 'tags', through: { attributes: [] } },
      ],
      limit,
      order: [
        ['rating', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  } catch (error) {
    logger.error('获取热门游戏错误:', error);
    throw error;
  }
};

/**
 * 获取个性化游戏推荐 - 基于用户行为
 */
const getPersonalizedRecommendations = async (userId, limit) => {
  try {
    // 1. 获取用户已拥有的游戏ID
    const userLibrary = await GameLibrary.findAll({
      where: { user_id: userId },
      attributes: ['game_id'],
    });

    const ownedGameIds = userLibrary.map((item) => item.game_id);

    // 2. 获取用户的游戏兴趣标签和分类
    const userGames = await Game.findAll({
      where: { id: { [Op.in]: ownedGameIds } },
      include: [
        { model: GameCategory, as: 'categories', through: { attributes: [] } },
        { model: GameTag, as: 'tags', through: { attributes: [] } },
      ],
    });

    // 3. 统计用户的兴趣标签和分类
    const categoryCounts = {};
    const tagCounts = {};

    userGames.forEach((game) => {
      // 统计分类
      game.categories.forEach((category) => {
        categoryCounts[category.name] = (categoryCounts[category.name] || 0) + 1;
      });

      // 统计标签
      game.tags.forEach((tag) => {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      });
    });

    // 4. 提取用户最感兴趣的前5个分类和标签
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    // 5. 查询符合用户兴趣的游戏，但排除已拥有的游戏
    const recommendedGames = await Game.findAll({
      where: {
        id: { [Op.notIn]: ownedGameIds || [] },
        status: 'approved',
      },
      include: [
        {
          model: GameCategory,
          as: 'categories',
          through: { attributes: [] },
          where: { name: { [Op.in]: topCategories } },
        },
        {
          model: GameTag,
          as: 'tags',
          through: { attributes: [] },
          where: { name: { [Op.in]: topTags } },
        },
      ],
      limit,
      order: [['rating', 'DESC']],
    });

    // 6. 如果推荐数量不足，补充热门游戏
    if (recommendedGames.length < limit) {
      const remainingLimit = limit - recommendedGames.length;
      const trendingGames = await getTrendingGames(remainingLimit, ownedGameIds);
      return [...recommendedGames, ...trendingGames];
    }

    return recommendedGames;
  } catch (error) {
    logger.error('获取个性化推荐错误:', error);
    // 失败时返回热门游戏
    return getTrendingGames(limit);
  }
};

/**
 * 获取相似游戏 - 基于游戏的分类、标签和开发者
 */
const getSimilarGames = async (gameId, limit, userId) => {
  try {
    // 1. 获取当前游戏的信息
    const currentGame = await Game.findByPk(gameId, {
      include: [
        { model: GameCategory, as: 'categories', through: { attributes: [] } },
        { model: GameTag, as: 'tags', through: { attributes: [] } },
      ],
    });

    if (!currentGame) {
      throw new Error('游戏不存在');
    }

    // 2. 获取用户已拥有的游戏ID（如果有用户）
    let ownedGameIds = [];
    if (userId) {
      const userLibrary = await GameLibrary.findAll({
        where: { user_id: userId },
        attributes: ['game_id'],
      });
      ownedGameIds = userLibrary.map((item) => item.game_id);
    }

    // 3. 提取当前游戏的分类和标签
    const currentCategories = currentGame.categories.map((cat) => cat.name);
    const currentTags = currentGame.tags.map((tag) => tag.name);

    // 4. 查询相似游戏
    const similarGames = await Game.findAll({
      where: {
        id: { [Op.notIn]: [...ownedGameIds, gameId] },
        status: 'approved',
        developer_id: currentGame.developer_id,
      },
      include: [
        {
          model: GameCategory,
          as: 'categories',
          through: { attributes: [] },
          where: { name: { [Op.in]: currentCategories } },
        },
        {
          model: GameTag,
          as: 'tags',
          through: { attributes: [] },
          where: { name: { [Op.in]: currentTags } },
        },
      ],
      limit,
      order: [
        ['rating', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    // 5. 如果相似游戏数量不足，补充基于分类和标签的推荐
    if (similarGames.length < limit) {
      const remainingLimit = limit - similarGames.length;
      const categoryTagSimilarGames = await Game.findAll({
        where: {
          id: { [Op.notIn]: [...ownedGameIds, gameId, ...similarGames.map((g) => g.id)] },
          status: 'approved',
        },
        include: [
          {
            model: GameCategory,
            as: 'categories',
            through: { attributes: [] },
            where: { name: { [Op.in]: currentCategories } },
          },
          {
            model: GameTag,
            as: 'tags',
            through: { attributes: [] },
            where: { name: { [Op.in]: currentTags } },
          },
        ],
        limit: remainingLimit,
        order: [
          ['rating', 'DESC'],
          ['created_at', 'DESC'],
        ],
      });

      return [...similarGames, ...categoryTagSimilarGames];
    }

    return similarGames;
  } catch (error) {
    logger.error('获取相似游戏错误:', error);
    throw error;
  }
};

/**
 * @swagger
 * /api/v1/games/recommendations:
 *   get:
 *     summary: 获取个性化游戏推荐
 *     description: 根据用户的购买历史、游玩时间和评分获取个性化游戏推荐
 *     tags: [Games]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 推荐游戏数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [personalized, trending, similar]
 *           default: personalized
 *         description: 推荐类型
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         description: 当type为similar时，需要指定游戏ID
 *     responses:
 *       200:
 *         description: 成功获取推荐游戏列表
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
 *                   example: 推荐游戏获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getRecommendedGames = async (req, res) => {
  try {
    const { limit = 10, type = 'personalized', gameId } = req.query;
    const userId = req.user?.userId;

    // 生成缓存键
    const cacheKey = generateRecommendationCacheKey({
      userId,
      type,
      gameId,
      limit,
    });

    // 使用缓存查询
    const recommendedGames = await cacheQuery(cacheKey, CACHE_EXPIRY.MEDIUM, async () => {
      let games;

      switch (type) {
      case 'personalized':
        if (!userId) {
          // 未登录用户返回热门游戏
          games = await getTrendingGames(limit);
        } else {
          // 登录用户返回个性化推荐
          games = await getPersonalizedRecommendations(userId, limit);
        }
        break;

      case 'trending':
        games = await getTrendingGames(limit);
        break;

      case 'similar':
        if (!gameId) {
          throw new Error('获取相似游戏时需要指定gameId');
        }
        games = await getSimilarGames(gameId, limit, userId);
        break;

      default:
        throw new Error('无效的推荐类型');
      }

      return games;
    });

    return res.status(200).json({
      success: true,
      message: '推荐游戏获取成功',
      data: recommendedGames,
    });
  } catch (error) {
    logger.error('获取推荐游戏错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取推荐游戏失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/recommendations/trending:
 *   get:
 *     summary: 获取热门游戏推荐
 *     description: 获取当前热门游戏推荐，基于评分和最近活跃度
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 推荐游戏数量
 *     responses:
 *       200:
 *         description: 成功获取热门游戏列表
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
 *                   example: 热门游戏获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getTrendingGamesController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trendingGames = await getTrendingGames(limit);

    return res.status(200).json({
      success: true,
      message: '热门游戏获取成功',
      data: trendingGames,
    });
  } catch (error) {
    logger.error('获取热门游戏控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取热门游戏失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/recommendations/similar/{gameId}:
 *   get:
 *     summary: 获取相似游戏推荐
 *     description: 根据指定游戏获取相似游戏推荐
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 游戏ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 推荐游戏数量
 *     responses:
 *       200:
 *         description: 成功获取相似游戏列表
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
 *                   example: 相似游戏获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getSimilarGamesController = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user?.userId;

    const similarGames = await getSimilarGames(gameId, limit, userId);

    return res.status(200).json({
      success: true,
      message: '相似游戏获取成功',
      data: similarGames,
    });
  } catch (error) {
    logger.error('获取相似游戏控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取相似游戏失败',
      error: error.message,
    });
  }
};
