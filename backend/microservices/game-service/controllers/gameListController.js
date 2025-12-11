// 游戏服务 - 游戏列表控制器
import Game from '../models/Game.js';
import GameCategory from '../models/GameCategory.js';
import GameTag from '../models/GameTag.js';
import redisService from '../config/redis.js';
import logger from '../config/logger.js';

// 缓存键前缀
const CACHE_PREFIX = 'game-service';

// 获取游戏列表
const getGameList = async (req, res) => {
  try {
    logger.info(`[GameListController] 获取游戏列表请求，查询参数: ${JSON.stringify(req.query)}`);

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:games:list:${JSON.stringify(req.query)}`;

    // 尝试从缓存获取
    const cachedGames = await redisService.get(cacheKey);
    if (cachedGames) {
      logger.debug(`[GameListController] 从缓存获取游戏列表，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedGames,
        message: '获取游戏列表成功',
      });
    }

    // 构建查询条件
    const {
      category, tag, search, page = 1, limit = 10,
    } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // 基础查询
    const query = {
      where: { status: 'approved' },
      include: [
        { model: GameCategory, as: 'categories', attributes: ['id', 'name'] },
        { model: GameTag, as: 'tags', attributes: ['id', 'name'] },
      ],
      attributes: {
        exclude: ['created_at', 'updated_at', 'executable_path', 'launch_parameters'],
      },
      order: [['release_date', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    };

    // 分类过滤
    if (category) {
      query.include.push({
        model: GameCategory,
        as: 'categories',
        where: { name: category },
        attributes: ['id', 'name'],
      });
    }

    // 标签过滤
    if (tag) {
      query.include.push({
        model: GameTag,
        as: 'tags',
        where: { name: tag },
        attributes: ['id', 'name'],
      });
    }

    // 搜索过滤
    if (search) {
      query.where[Game.sequelize.Op.or] = [
        { title: { [Game.sequelize.Op.like]: `%${search}%` } },
        { description: { [Game.sequelize.Op.like]: `%${search}%` } },
      ];
    }

    // 执行查询
    const { count, rows } = await Game.findAndCountAll(query);

    // 构建响应数据
    const responseData = {
      games: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },
    };

    // 缓存结果
    await redisService.set(cacheKey, responseData, 3600); // 缓存1小时
    logger.debug(`[GameListController] 缓存游戏列表，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取游戏列表成功，总数量: ${count}`);
    return res.status(200).json({
      success: true,
      data: responseData,
      message: '获取游戏列表成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取游戏列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取游戏列表失败',
        details: error.message,
      },
    });
  }
};

// 获取游戏详情
const getGameDetail = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`[GameListController] 获取游戏详情请求，游戏ID: ${id}`);

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:games:detail:${id}`;

    // 尝试从缓存获取
    const cachedGame = await redisService.get(cacheKey);
    if (cachedGame) {
      logger.debug(`[GameListController] 从缓存获取游戏详情，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedGame,
        message: '获取游戏详情成功',
      });
    }

    // 执行查询
    const game = await Game.findByPk(id, {
      include: [
        { model: GameCategory, as: 'categories', attributes: ['id', 'name'] },
        { model: GameTag, as: 'tags', attributes: ['id', 'name'] },
      ],
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    });

    if (!game) {
      logger.warn(`[GameListController] 游戏不存在，ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '游戏不存在',
        },
      });
    }

    // 缓存结果
    await redisService.set(cacheKey, game, 3600); // 缓存1小时
    logger.debug(`[GameListController] 缓存游戏详情，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取游戏详情成功，游戏ID: ${id}`);
    return res.status(200).json({
      success: true,
      data: game,
      message: '获取游戏详情成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取游戏详情失败，游戏ID: ${req.params.id}, 错误: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取游戏详情失败',
        details: error.message,
      },
    });
  }
};

// 获取游戏分类列表
const getCategories = async (req, res) => {
  try {
    logger.info('[GameListController] 获取游戏分类列表请求');

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:categories:list`;

    // 尝试从缓存获取
    const cachedCategories = await redisService.get(cacheKey);
    if (cachedCategories) {
      logger.debug(`[GameListController] 从缓存获取游戏分类列表，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedCategories,
        message: '获取游戏分类列表成功',
      });
    }

    // 执行查询
    const categories = await GameCategory.findAll({
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']],
    });

    // 缓存结果
    await redisService.set(cacheKey, categories, 3600 * 24); // 缓存24小时
    logger.debug(`[GameListController] 缓存游戏分类列表，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取游戏分类列表成功，总数量: ${categories.length}`);
    return res.status(200).json({
      success: true,
      data: categories,
      message: '获取游戏分类列表成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取游戏分类列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取游戏分类列表失败',
        details: error.message,
      },
    });
  }
};

// 获取游戏标签列表
const getTags = async (req, res) => {
  try {
    logger.info('[GameListController] 获取游戏标签列表请求');

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:tags:list`;

    // 尝试从缓存获取
    const cachedTags = await redisService.get(cacheKey);
    if (cachedTags) {
      logger.debug(`[GameListController] 从缓存获取游戏标签列表，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedTags,
        message: '获取游戏标签列表成功',
      });
    }

    // 执行查询
    const tags = await GameTag.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    // 缓存结果
    await redisService.set(cacheKey, tags, 3600 * 24); // 缓存24小时
    logger.debug(`[GameListController] 缓存游戏标签列表，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取游戏标签列表成功，总数量: ${tags.length}`);
    return res.status(200).json({
      success: true,
      data: tags,
      message: '获取游戏标签列表成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取游戏标签列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取游戏标签列表失败',
        details: error.message,
      },
    });
  }
};

// 获取热门游戏列表
const getPopularGames = async (req, res) => {
  try {
    logger.info('[GameListController] 获取热门游戏列表请求');

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:games:popular`;

    // 尝试从缓存获取
    const cachedGames = await redisService.get(cacheKey);
    if (cachedGames) {
      logger.debug(`[GameListController] 从缓存获取热门游戏列表，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedGames,
        message: '获取热门游戏列表成功',
      });
    }

    // 执行查询，按评分和评论数量排序
    const games = await Game.findAll({
      where: { status: 'approved' },
      attributes: {
        exclude: ['created_at', 'updated_at', 'executable_path', 'launch_parameters'],
      },
      order: [
        ['rating', 'DESC'],
        ['review_count', 'DESC'],
      ],
      limit: 10,
    });

    // 缓存结果
    await redisService.set(cacheKey, games, 3600); // 缓存1小时
    logger.debug(`[GameListController] 缓存热门游戏列表，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取热门游戏列表成功，数量: ${games.length}`);
    return res.status(200).json({
      success: true,
      data: games,
      message: '获取热门游戏列表成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取热门游戏列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取热门游戏列表失败',
        details: error.message,
      },
    });
  }
};

// 获取新游戏列表
const getNewGames = async (req, res) => {
  try {
    logger.info('[GameListController] 获取新游戏列表请求');

    // 构建缓存键
    const cacheKey = `${CACHE_PREFIX}:games:new`;

    // 尝试从缓存获取
    const cachedGames = await redisService.get(cacheKey);
    if (cachedGames) {
      logger.debug(`[GameListController] 从缓存获取新游戏列表，键: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedGames,
        message: '获取新游戏列表成功',
      });
    }

    // 执行查询，按发布日期排序
    const games = await Game.findAll({
      where: { status: 'approved' },
      attributes: {
        exclude: ['created_at', 'updated_at', 'executable_path', 'launch_parameters'],
      },
      order: [['release_date', 'DESC']],
      limit: 10,
    });

    // 缓存结果
    await redisService.set(cacheKey, games, 3600); // 缓存1小时
    logger.debug(`[GameListController] 缓存新游戏列表，键: ${cacheKey}`);

    logger.info(`[GameListController] 获取新游戏列表成功，数量: ${games.length}`);
    return res.status(200).json({
      success: true,
      data: games,
      message: '获取新游戏列表成功',
    });
  } catch (error) {
    logger.error(`[GameListController] 获取新游戏列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取新游戏列表失败',
        details: error.message,
      },
    });
  }
};

export {
  getGameList,
  getGameDetail,
  getCategories,
  getTags,
  getPopularGames,
  getNewGames,
};
