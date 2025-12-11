// 游戏服务 - 游戏管理控制器
import Game from '../models/Game.js';
import GameCategory from '../models/GameCategory.js';
import GameTag from '../models/GameTag.js';
import Developer from '../models/Developer.js';
import redisService from '../config/redis.js';
import logger from '../config/logger.js';

// 缓存键前缀
const CACHE_PREFIX = 'game-service';

// 创建游戏
const createGame = async (req, res) => {
  try {
    const { developerId, ...gameData } = req.body;
    logger.info(`[GameManagementController] 创建游戏请求，开发者ID: ${developerId}，游戏数据: ${JSON.stringify(gameData)}`);

    // 验证开发者是否存在
    const developer = await Developer.findByPk(developerId);
    if (!developer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEVELOPER_NOT_FOUND',
          message: '开发者不存在',
        },
      });
    }

    // 创建游戏
    const game = await Game.create({
      ...gameData,
      developer_id: developerId,
    });

    // 清理相关缓存
    await redisService.del(`${CACHE_PREFIX}:games:*`);
    await redisService.del(`${CACHE_PREFIX}:categories:*`);
    await redisService.del(`${CACHE_PREFIX}:tags:*`);

    logger.info(`[GameManagementController] 创建游戏成功，游戏ID: ${game.id}`);
    return res.status(201).json({
      success: true,
      data: game,
      message: '游戏创建成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 创建游戏失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '创建游戏失败',
        details: error.message,
      },
    });
  }
};

// 更新游戏
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const gameData = req.body;
    logger.info(`[GameManagementController] 更新游戏请求，游戏ID: ${id}，游戏数据: ${JSON.stringify(gameData)}`);

    // 查找游戏
    const game = await Game.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: '游戏不存在',
        },
      });
    }

    // 更新游戏
    await game.update(gameData);

    // 清理相关缓存
    await redisService.del(`${CACHE_PREFIX}:games:*`);
    await redisService.del(`${CACHE_PREFIX}:games:detail:${id}`);

    logger.info(`[GameManagementController] 更新游戏成功，游戏ID: ${id}`);
    return res.status(200).json({
      success: true,
      data: game,
      message: '游戏更新成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 更新游戏失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '更新游戏失败',
        details: error.message,
      },
    });
  }
};

// 删除游戏
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`[GameManagementController] 删除游戏请求，游戏ID: ${id}`);

    // 查找游戏
    const game = await Game.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: '游戏不存在',
        },
      });
    }

    // 删除游戏
    await game.destroy();

    // 清理相关缓存
    await redisService.del(`${CACHE_PREFIX}:games:*`);
    await redisService.del(`${CACHE_PREFIX}:games:detail:${id}`);

    logger.info(`[GameManagementController] 删除游戏成功，游戏ID: ${id}`);
    return res.status(200).json({
      success: true,
      message: '游戏删除成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 删除游戏失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '删除游戏失败',
        details: error.message,
      },
    });
  }
};

// 批量删除游戏
const batchDeleteGames = async (req, res) => {
  try {
    const { ids } = req.body;
    logger.info(`[GameManagementController] 批量删除游戏请求，游戏ID列表: ${JSON.stringify(ids)}`);

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: '无效的游戏ID列表',
        },
      });
    }

    // 批量删除游戏
    const result = await Game.destroy({
      where: { id: ids },
    });

    // 清理相关缓存
    await redisService.del(`${CACHE_PREFIX}:games:*`);
    ids.forEach(async (id) => {
      await redisService.del(`${CACHE_PREFIX}:games:detail:${id}`);
    });

    logger.info(`[GameManagementController] 批量删除游戏成功，删除数量: ${result}`);
    return res.status(200).json({
      success: true,
      data: { deletedCount: result },
      message: '游戏批量删除成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 批量删除游戏失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量删除游戏失败',
        details: error.message,
      },
    });
  }
};

// 更新游戏状态
const updateGameStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    logger.info(`[GameManagementController] 更新游戏状态请求，游戏ID: ${id}，状态: ${status}`);

    // 验证状态值
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '无效的游戏状态',
        },
      });
    }

    // 查找游戏
    const game = await Game.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: '游戏不存在',
        },
      });
    }

    // 更新游戏状态
    await game.update({ status });

    // 清理相关缓存
    await redisService.del(`${CACHE_PREFIX}:games:*`);
    await redisService.del(`${CACHE_PREFIX}:games:detail:${id}`);

    logger.info(`[GameManagementController] 更新游戏状态成功，游戏ID: ${id}，新状态: ${status}`);
    return res.status(200).json({
      success: true,
      data: game,
      message: '游戏状态更新成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 更新游戏状态失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '更新游戏状态失败',
        details: error.message,
      },
    });
  }
};

// 获取开发者游戏列表
const getDeveloperGames = async (req, res) => {
  try {
    const { developerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    logger.info(`[GameManagementController] 获取开发者游戏列表请求，开发者ID: ${developerId}，查询参数: ${JSON.stringify(req.query)}`);

    // 构建查询条件
    const query = {
      where: { developer_id: developerId },
      include: [
        { model: GameCategory, as: 'categories', attributes: ['id', 'name'] },
        { model: GameTag, as: 'tags', attributes: ['id', 'name'] },
      ],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      order: [['created_at', 'DESC']],
    };

    // 添加状态过滤
    if (status) {
      query.where.status = status;
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

    logger.info(`[GameManagementController] 获取开发者游戏列表成功，开发者ID: ${developerId}，总数量: ${count}`);
    return res.status(200).json({
      success: true,
      data: responseData,
      message: '获取开发者游戏列表成功',
    });
  } catch (error) {
    logger.error(`[GameManagementController] 获取开发者游戏列表失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取开发者游戏列表失败',
        details: error.message,
      },
    });
  }
};

export {
  createGame,
  updateGame,
  deleteGame,
  batchDeleteGames,
  updateGameStatus,
  getDeveloperGames,
};
