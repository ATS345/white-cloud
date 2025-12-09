import models from '../../models/index.js';
import logger from '../../config/logger.js';

// 从models中获取所有需要的模型
const { Game, GameLibrary, GameSystemRequirement } = models;

/**
 * @swagger
 * /api/v1/games/{gameId}/launch:
 *   post:
 *     summary: 启动游戏
 *     description: 启动游戏，需要用户拥有该游戏且已安装
 *     tags: [Game Launch]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 游戏启动成功
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
 *                   example: 游戏启动成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: integer
 *                     gameTitle:
 *                       type: string
 *                     launchTime:
 *                       type: string
 *                       format: date-time
 *                     launchCommand:
 *                       type: string
 *                     executablePath:
 *                       type: string
 *                     launchParameters:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 您没有购买该游戏，无法启动
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const launchGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user; // 从JWT中获取用户ID

    // 查找游戏
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法启动',
      });
    }

    // 2. 检查游戏是否已安装
    if (!gameLibraryEntry.installed) {
      return res.status(400).json({
        success: false,
        message: '游戏尚未安装，请先安装游戏',
      });
    }

    // 3. 检查游戏是否需要更新
    if (gameLibraryEntry.needs_update) {
      return res.status(400).json({
        success: false,
        message: '游戏需要更新，请先更新游戏',
      });
    }

    // 4. 生成游戏启动命令
    const launchCommand = game.executable_path;
    const launchParams = game.launch_parameters || '';

    // 5. 记录游戏启动日志（可以添加到数据库或日志文件）
    logger.info(`User ${userId} launched game ${gameId} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: '游戏启动成功',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        launchTime: new Date().toISOString(),
        launchCommand: `${launchCommand} ${launchParams}`,
        executablePath: launchCommand,
        launchParameters: launchParams,
      },
    });
  } catch (error) {
    logger.error('游戏启动错误:', error);
    return res.status(500).json({
      success: false,
      message: '游戏启动失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/install:
 *   post:
 *     summary: 安装游戏
 *     description: 安装游戏，需要用户拥有该游戏
 *     tags: [Game Launch]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 游戏安装任务已创建
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
 *                   example: 游戏安装任务已创建
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: integer
 *                     gameTitle:
 *                       type: string
 *                     installationId:
 *                       type: string
 *                     downloadUrl:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                     latestVersion:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 您没有购买该游戏，无法安装
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const installGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user;

    // 查找游戏
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法安装',
      });
    }

    // 2. 检查游戏是否已安装
    if (gameLibraryEntry.installed) {
      return res.status(400).json({
        success: false,
        message: '游戏已安装，无需重复安装',
      });
    }

    // 3. 创建安装任务ID
    const installationId = `install_${Date.now()}_${gameId}`;

    // 4. 更新游戏库状态，标记为正在安装
    await gameLibraryEntry.update({
      installation_status: 'downloading',
      installation_id: installationId,
    });

    // 5. 记录游戏安装日志
    logger.info(`User ${userId} started installing game ${gameId} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: '游戏安装任务已创建',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        installationId,
        downloadUrl: game.download_url,
        fileSize: game.latest_version?.file_size || 0,
        latestVersion: game.latest_version,
      },
    });
  } catch (error) {
    logger.error('游戏安装错误:', error);
    return res.status(500).json({
      success: false,
      message: '游戏安装失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/update:
 *   post:
 *     summary: 更新游戏
 *     description: 更新游戏，需要用户拥有该游戏
 *     tags: [Game Launch]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 游戏更新任务已创建
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
 *                   example: 游戏更新任务已创建
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: integer
 *                     gameTitle:
 *                       type: string
 *                     updateId:
 *                       type: string
 *                     latestVersion:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    // 查找游戏
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 这里可以添加游戏更新的逻辑，例如：
    // 1. 检查游戏是否有可用更新
    // 2. 开始游戏更新下载过程
    // 3. 返回更新任务ID，用于查询更新进度

    return res.status(200).json({
      success: true,
      message: '游戏更新任务已创建',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        updateId: `update_${Date.now()}_${gameId}`,
        // 实际应用中，这里应该返回真实的更新任务ID和相关信息
        latestVersion: game.latest_version,
      },
    });
  } catch (error) {
    logger.error('游戏更新错误:', error);
    return res.status(500).json({
      success: false,
      message: '游戏更新失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/installations/{installationId}:
 *   get:
 *     summary: 查询游戏安装状态
 *     description: 根据安装ID查询游戏安装状态
 *     tags: [Game Launch]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: installationId
 *         schema:
 *           type: string
 *         required: true
 *         description: 安装任务ID
 *     responses:
 *       200:
 *         description: 查询安装状态成功
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
 *                   example: 查询安装状态成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     installationId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       description: 安装状态（pending, downloading, installing, completed, failed）
 *                       example: downloading
 *                     progress:
 *                       type: integer
 *                       description: 安装进度百分比
 *                       example: 45
 *                     downloadSpeed:
 *                       type: string
 *                       description: 下载速度
 *                       example: 12.5 MB/s
 *                     estimatedTime:
 *                       type: string
 *                       description: 预计剩余时间
 *                       example: 15 minutes
 *                     error:
 *                       type: string
 *                       description: 错误信息（如果有）
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGameInstallationStatus = async (req, res) => {
  try {
    const { installationId } = req.params;

    // 这里可以添加查询游戏安装状态的逻辑，例如：
    // 1. 根据安装任务ID查询安装进度
    // 2. 返回安装状态、进度、下载速度等信息

    return res.status(200).json({
      success: true,
      message: '查询安装状态成功',
      data: {
        installationId,
        status: 'downloading', // 可选值：pending, downloading, installing, completed, failed
        progress: 45, // 安装进度百分比
        downloadSpeed: '12.5 MB/s',
        estimatedTime: '15 minutes',
        // 实际应用中，这里应该返回真实的安装状态信息
        error: null,
      },
    });
  } catch (error) {
    logger.error('查询安装状态错误:', error);
    return res.status(500).json({
      success: false,
      message: '查询安装状态失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/check-requirements:
 *   post:
 *     summary: 检测系统需求
 *     description: 检测用户系统是否满足游戏的系统需求
 *     tags: [Game Launch]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 游戏ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               os:
 *                 type: string
 *                 description: 操作系统
 *               processor:
 *                 type: string
 *                 description: 处理器
 *               memory:
 *                 type: string
 *                 description: 内存
 *               graphics:
 *                 type: string
 *                 description: 显卡
 *               storage:
 *                 type: string
 *                 description: 存储
 *             required:
 *               - os
 *               - processor
 *               - memory
 *               - graphics
 *               - storage
 *     responses:
 *       200:
 *         description: 系统需求检测成功
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
 *                   example: 系统需求检测成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     gameId:
 *                       type: integer
 *                     gameTitle:
 *                       type: string
 *                     meetsMinimum:
 *                       type: boolean
 *                     meetsRecommended:
 *                       type: boolean
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: 问题类型
 *                           message:
 *                             type: string
 *                             description: 问题描述
 *                           required:
 *                             type: string
 *                             description: 所需配置
 *                           available:
 *                             type: string
 *                             description: 可用配置
 *                           requirementType:
 *                             type: string
 *                             description: 需求类型（minimum或recommended）
 *                     systemRequirements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GameSystemRequirement'
 *                     detectedSystem:
 *                       type: object
 *                       properties:
 *                         os:
 *                           type: string
 *                         processor:
 *                           type: string
 *                         memory:
 *                           type: integer
 *                         graphics:
 *                           type: string
 *                         storage:
 *                           type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const checkSystemRequirements = async (req, res) => {
  try {
    const { gameId } = req.params;
    const systemInfo = req.body; // 前端发送的系统信息

    // 查找游戏
    const game = await Game.findByPk(gameId, {
      include: [{
        model: GameSystemRequirement,
        as: 'system_requirements',
        attributes: ['id', 'os', 'processor', 'memory', 'graphics', 'storage', 'type'],
      }],
    });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在',
      });
    }

    // 1. 分离最低需求和推荐需求
    const minimumRequirements = game.system_requirements.find((requirement) => requirement.type === 'minimum');
    const recommendedRequirements = game.system_requirements.find((requirement) => requirement.type === 'recommended');

    if (!minimumRequirements) {
      return res.status(400).json({
        success: false,
        message: '该游戏尚未设置最低系统需求',
      });
    }

    // 2. 解析系统信息
    const parsedSystemInfo = {
      os: systemInfo.os || '',
      processor: systemInfo.processor || '',
      memory: parseInt(systemInfo.memory?.match(/\d+/)[0], 10) || 0, // 提取内存大小（GB）
      graphics: systemInfo.graphics || '',
      storage: parseInt(systemInfo.storage?.match(/\d+/)[0], 10) || 0, // 提取存储大小（GB）
    };

    // 3. 解析需求信息
    const parsedMinimumRequirements = {
      os: minimumRequirements.os,
      processor: minimumRequirements.processor,
      memory: parseInt(minimumRequirements.memory?.match(/\d+/)[0], 10) || 0,
      graphics: minimumRequirements.graphics,
      storage: parseInt(minimumRequirements.storage?.match(/\d+/)[0], 10) || 0,
    };

    const parsedRecommendedRequirements = recommendedRequirements ? {
      os: recommendedRequirements.os,
      processor: recommendedRequirements.processor,
      memory: parseInt(recommendedRequirements.memory?.match(/\d+/)[0], 10) || 0,
      graphics: recommendedRequirements.graphics,
      storage: parseInt(recommendedRequirements.storage?.match(/\d+/)[0], 10) || 0,
    } : null;

    // 4. 对比系统信息和需求
    const issues = [];

    // 检查最低需求
    if (parsedSystemInfo.memory < parsedMinimumRequirements.memory) {
      issues.push({
        type: 'memory',
        message: `内存不足，建议升级到至少${parsedMinimumRequirements.memory} GB`,
        required: minimumRequirements.memory,
        available: `${parsedSystemInfo.memory} GB`,
        requirementType: 'minimum',
      });
    }

    if (parsedSystemInfo.storage < parsedMinimumRequirements.storage) {
      issues.push({
        type: 'storage',
        message: `存储空间不足，建议至少${parsedMinimumRequirements.storage} GB可用空间`,
        required: minimumRequirements.storage,
        available: `${parsedSystemInfo.storage} GB`,
        requirementType: 'minimum',
      });
    }

    // 检查推荐需求
    if (parsedRecommendedRequirements) {
      if (parsedSystemInfo.memory < parsedRecommendedRequirements.memory) {
        issues.push({
          type: 'memory',
          message: `内存低于推荐配置，建议升级到${parsedRecommendedRequirements.memory} GB以获得最佳体验`,
          required: recommendedRequirements.memory,
          available: `${parsedSystemInfo.memory} GB`,
          requirementType: 'recommended',
        });
      }

      if (parsedSystemInfo.storage < parsedRecommendedRequirements.storage) {
        issues.push({
          type: 'storage',
          message: `存储空间低于推荐配置，建议至少${parsedRecommendedRequirements.storage} GB可用空间以获得最佳体验`,
          required: recommendedRequirements.storage,
          available: `${parsedSystemInfo.storage} GB`,
          requirementType: 'recommended',
        });
      }

      // 检查操作系统（简单匹配）
      if (!parsedSystemInfo.os.toLowerCase().includes(parsedRecommendedRequirements.os.toLowerCase().split(' ')[0].toLowerCase())) {
        issues.push({
          type: 'os',
          message: `操作系统建议使用${parsedRecommendedRequirements.os}以获得最佳体验`,
          required: recommendedRequirements.os,
          available: parsedSystemInfo.os,
          requirementType: 'recommended',
        });
      }
    }

    // 5. 确定检测结果
    const meetsMinimum = issues.filter((issue) => issue.requirementType === 'minimum').length === 0;
    const meetsRecommended = recommendedRequirements
      ? issues.filter((issue) => issue.requirementType === 'recommended').length === 0
      : null;

    // 6. 记录检测日志
    logger.info(`System requirements check for game ${gameId} by user ${req.user?.userId || 'anonymous'}`);

    return res.status(200).json({
      success: true,
      message: '系统需求检测成功',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        meetsMinimum,
        meetsRecommended,
        issues,
        systemRequirements: game.system_requirements,
        detectedSystem: parsedSystemInfo,
      },
    });
  } catch (error) {
    logger.error('系统需求检测错误:', error);
    return res.status(500).json({
      success: false,
      message: '系统需求检测失败',
      error: error.message,
    });
  }
};
