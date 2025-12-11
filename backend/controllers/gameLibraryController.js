import { fn, col } from 'sequelize';
import GameLibrary from '../models/GameLibrary.js';
import Game from '../models/Game.js';
import logger from '../config/logger.js';

// 获取用户游戏库
export const getUserGameLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1, limit = 20, sortBy = 'purchase_date', sortOrder = 'desc',
    } = req.query;

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 获取用户游戏库
    const gameLibrary = await GameLibrary.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: [
            'id', 'title', 'main_image_url', 'price', 'discount_price', 'rating',
            'release_date', 'developer_id', 'status',
          ],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: '获取用户游戏库成功',
      data: {
        games: gameLibrary.rows,
        pagination: {
          currentPage: parseInt(page, 10),
          pageSize: parseInt(limit, 10),
          totalItems: gameLibrary.count,
          totalPages: Math.ceil(gameLibrary.count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('获取用户游戏库错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户游戏库失败',
      error: error.message,
    });
  }
};

// 更新游戏库信息（如游玩时间、最后游玩时间）
export const updateGameLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { playtime, lastPlayedAt } = req.body;

    // 查找游戏库记录
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(404).json({
        success: false,
        message: '游戏不在用户库中',
      });
    }

    // 更新游戏库信息
    const updates = {};
    if (playtime !== undefined) {
      updates.playtime = playtime;
    }
    if (lastPlayedAt !== undefined) {
      updates.last_played_at = lastPlayedAt;
    }

    await gameLibrary.update(updates);

    return res.status(200).json({
      success: true,
      message: '游戏库信息更新成功',
      data: gameLibrary,
    });
  } catch (error) {
    logger.error('更新游戏库信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新游戏库信息失败',
      error: error.message,
    });
  }
};

// 获取游戏库统计信息
export const getGameLibraryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取游戏库统计
    const stats = await GameLibrary.findOne({
      where: { user_id: userId },
      attributes: [
        [fn('COUNT', col('id')), 'total_games'],
        [fn('SUM', col('playtime')), 'total_playtime'],
      ],
    });

    // 获取最近购买的游戏
    const recentGames = await GameLibrary.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'main_image_url'],
        },
      ],
      order: [['purchase_date', 'desc']],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      message: '获取游戏库统计信息成功',
      data: {
        totalGames: parseInt(stats.dataValues.total_games, 10) || 0,
        totalPlaytime: parseInt(stats.dataValues.total_playtime, 10) || 0,
        recentGames,
      },
    });
  } catch (error) {
    logger.error('获取游戏库统计信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏库统计信息失败',
      error: error.message,
    });
  }
};

// 检查游戏是否在用户库中
export const checkGameOwnership = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    // 检查游戏所有权
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    return res.status(200).json({
      success: true,
      message: '检查游戏所有权成功',
      data: {
        owned: !!gameLibrary,
      },
    });
  } catch (error) {
    logger.error('检查游戏所有权错误:', error);
    return res.status(500).json({
      success: false,
      message: '检查游戏所有权失败',
      error: error.message,
    });
  }
};

// 更新游戏游玩时间
export const updatePlaytime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { additionalPlaytime } = req.body;

    if (!additionalPlaytime || additionalPlaytime <= 0) {
      return res.status(400).json({
        success: false,
        message: '游玩时间必须是正数',
      });
    }

    // 查找游戏库记录
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibrary) {
      return res.status(404).json({
        success: false,
        message: '游戏不在用户库中',
      });
    }

    // 更新游玩时间和最后游玩时间
    await gameLibrary.update({
      playtime: gameLibrary.playtime + parseInt(additionalPlaytime, 10),
      last_played_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: '游玩时间更新成功',
      data: gameLibrary,
    });
  } catch (error) {
    logger.error('更新游玩时间错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新游玩时间失败',
      error: error.message,
    });
  }
};
