import { Op } from 'sequelize';
import models from '../../models/index.js';
import logger from '../../config/logger.js';

// 从models中获取所有需要的模型
const {
  Game, GameCategory, GameTag, GameVersion, GameSystemRequirement, Developer,
} = models;

/**
 * @swagger
 * /api/v1/games:
 *   post:
 *     summary: 创建游戏
 *     description: 创建新游戏，需要开发者权限
 *     tags: [Game Management]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 游戏标题
 *               description:
 *                 type: string
 *                 description: 游戏描述
 *               price:
 *                 type: number
 *                 description: 游戏价格
 *               discount_price:
 *                 type: number
 *                 description: 游戏折扣价格
 *               release_date:
 *                 type: string
 *                 format: date-time
 *                 description: 游戏发布日期
 *               main_image_url:
 *                 type: string
 *                 description: 游戏主图URL
 *               cover_image:
 *                 type: string
 *                 description: 游戏封面图
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 游戏分类
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 游戏标签
 *               executable_path:
 *                 type: string
 *                 description: 游戏可执行文件路径
 *               launch_parameters:
 *                 type: string
 *                 description: 游戏启动参数
 *               latest_version:
 *                 type: string
 *                 description: 游戏最新版本
 *             required:
 *               - title
 *               - description
 *               - price
 *               - release_date
 *               - main_image_url
 *     responses:
 *       201:
 *         description: 游戏创建成功，等待审核
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
 *                   example: 游戏创建成功，等待审核
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 没有权限创建游戏
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const createGame = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      title,
      description,
      price,
      discount_price: discountPrice,
      release_date: releaseDate,
      main_image_url: mainImageUrl,
      cover_image: coverImage,
      categories = [],
      tags = [],
      executable_path: executablePath,
      launch_parameters: launchParameters,
      latest_version: latestVersion,
    } = req.body;

    // 1. 验证必填字段
    if (!title || !description || !price || !req.body.release_date || !req.body.main_image_url) {
      return res.status(400).json({
        success: false,
        message: '标题、描述、价格、发布日期和主图是必填项',
      });
    }

    // 2. 查找开发者信息
    const developer = await Developer.findOne({ where: { user_id: userId } });
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户',
      });
    }

    // 3. 创建游戏
    const game = await Game.create({
      developer_id: developer.id,
      title,
      description,
      price,
      discount_price: discountPrice,
      release_date: releaseDate,
      main_image_url: mainImageUrl,
      cover_image: coverImage,
      executable_path: executablePath,
      launch_parameters: launchParameters,
      latest_version: latestVersion,
      status: 'pending', // 默认状态为待审核
    });

    // 4. 处理分类关联
    if (categories.length > 0) {
      const categoryRecords = await GameCategory.findAll({
        where: { name: { [Op.in]: categories } },
      });
      await game.setCategories(categoryRecords);
    }

    // 5. 处理标签关联
    if (tags.length > 0) {
      const tagRecords = await GameTag.findAll({
        where: { name: { [Op.in]: tags } },
      });
      await game.setTags(tagRecords);
    }

    // 6. 记录创建日志
    logger.info(`Developer ${developer.id} created game ${game.id} at ${new Date().toISOString()}`);

    return res.status(201).json({
      success: true,
      message: '游戏创建成功，等待审核',
      data: game,
    });
  } catch (error) {
    logger.error('创建游戏错误:', error);
    return res.status(500).json({
      success: false,
      message: '创建游戏失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}:
 *   put:
 *     summary: 更新游戏详情
 *     description: 更新游戏详情，需要开发者权限
 *     tags: [Game Management]
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
 *               title:
 *                 type: string
 *                 description: 游戏标题
 *               description:
 *                 type: string
 *                 description: 游戏描述
 *               price:
 *                 type: number
 *                 description: 游戏价格
 *               discount_price:
 *                 type: number
 *                 description: 游戏折扣价格
 *               release_date:
 *                 type: string
 *                 format: date-time
 *                 description: 游戏发布日期
 *               main_image_url:
 *                 type: string
 *                 description: 游戏主图URL
 *               cover_image:
 *                 type: string
 *                 description: 游戏封面图
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 游戏分类
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 游戏标签
 *               executable_path:
 *                 type: string
 *                 description: 游戏可执行文件路径
 *               launch_parameters:
 *                 type: string
 *                 description: 游戏启动参数
 *               latest_version:
 *                 type: string
 *                 description: 游戏最新版本
 *     responses:
 *       200:
 *         description: 游戏更新成功
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
 *                   example: 游戏更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 没有权限更新该游戏
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const updateGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    // 1. 查找开发者信息
    const developer = await Developer.findOne({ where: { user_id: userId } });
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户',
      });
    }

    // 2. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id,
      },
    });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏',
      });
    }

    // 3. 更新游戏信息
    await game.update(updateData);

    // 4. 处理分类关联
    if (updateData.categories && updateData.categories.length > 0) {
      const categoryRecords = await GameCategory.findAll({
        where: { name: { [Op.in]: updateData.categories } },
      });
      await game.setCategories(categoryRecords);
    }

    // 5. 处理标签关联
    if (updateData.tags && updateData.tags.length > 0) {
      const tagRecords = await GameTag.findAll({
        where: { name: { [Op.in]: updateData.tags } },
      });
      await game.setTags(tagRecords);
    }

    // 6. 记录更新日志
    logger.info(`Developer ${developer.id} updated game ${game.id} at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: '游戏更新成功',
      data: game,
    });
  } catch (error) {
    logger.error('更新游戏错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新游戏失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/submit-review:
 *   post:
 *     summary: 提交游戏审核
 *     description: 提交游戏审核，需要开发者权限
 *     tags: [Game Management]
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
 *         description: 游戏已提交审核
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
 *                   example: 游戏已提交审核
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       403:
 *         description: 没有权限提交该游戏审核
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const submitGameForReview = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user;

    // 1. 查找开发者信息
    const developer = await Developer.findOne({ where: { user_id: userId } });
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户',
      });
    }

    // 2. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id,
      },
    });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏',
      });
    }

    // 3. 提交审核
    await game.update({ status: 'pending' });

    // 4. 记录审核日志
    logger.info(`Developer ${developer.id} submitted game ${game.id} for review at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: '游戏已提交审核',
      data: game,
    });
  } catch (error) {
    logger.error('提交游戏审核错误:', error);
    return res.status(500).json({
      success: false,
      message: '提交游戏审核失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/versions:
 *   post:
 *     summary: 创建游戏版本
 *     description: 创建新的游戏版本，需要开发者权限
 *     tags: [Game Management]
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
 *               version_number:
 *                 type: string
 *                 description: 版本号
 *               changelog:
 *                 type: string
 *                 description: 更新日志
 *               file_url:
 *                 type: string
 *                 description: 文件URL
 *               file_size:
 *                 type: number
 *                 description: 文件大小
 *               platform:
 *                 type: string
 *                 description: 平台
 *             required:
 *               - version_number
 *               - file_url
 *               - file_size
 *               - platform
 *     responses:
 *       201:
 *         description: 游戏版本创建成功
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
 *                   example: 游戏版本创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     game_id:
 *                       type: integer
 *                     version_number:
 *                       type: string
 *                     changelog:
 *                       type: string
 *                     file_url:
 *                       type: string
 *                     file_size:
 *                       type: number
 *                     platform:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 没有权限创建该游戏版本
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const createGameVersion = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user;
    const {
      version_number: versionNumber, changelog, file_url: fileUrl, file_size: fileSize, platform,
    } = req.body;

    // 1. 验证必填字段
    if (!req.body.version_number || !req.body.file_url || !req.body.file_size || !platform) {
      return res.status(400).json({
        success: false,
        message: '版本号、文件URL、文件大小和平台是必填项',
      });
    }

    // 2. 查找开发者信息
    const developer = await Developer.findOne({ where: { user_id: userId } });
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户',
      });
    }

    // 3. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id,
      },
    });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏',
      });
    }

    // 4. 创建游戏版本
    const gameVersion = await GameVersion.create({
      game_id: game.id,
      version_number: versionNumber,
      changelog,
      file_url: fileUrl,
      file_size: fileSize,
      platform,
    });

    // 5. 更新游戏的最新版本
    await game.update({ latest_version: versionNumber });

    // 6. 记录版本创建日志
    logger.info(`Developer ${developer.id} created version ${versionNumber} for game ${game.id} at ${new Date().toISOString()}`);

    return res.status(201).json({
      success: true,
      message: '游戏版本创建成功',
      data: gameVersion,
    });
  } catch (error) {
    logger.error('创建游戏版本错误:', error);
    return res.status(500).json({
      success: false,
      message: '创建游戏版本失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/games/{gameId}/system-requirements:
 *   post:
 *     summary: 创建游戏系统需求
 *     description: 创建游戏的系统需求，需要开发者权限
 *     tags: [Game Management]
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
 *               type:
 *                 type: string
 *                 description: 需求类型（minimum或recommended）
 *                 default: minimum
 *             required:
 *               - os
 *               - processor
 *               - memory
 *               - graphics
 *               - storage
 *     responses:
 *       201:
 *         description: 游戏系统需求创建成功
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
 *                   example: 游戏系统需求创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     game_id:
 *                       type: integer
 *                     os:
 *                       type: string
 *                     processor:
 *                       type: string
 *                     memory:
 *                       type: string
 *                     graphics:
 *                       type: string
 *                     storage:
 *                       type: string
 *                     type:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         description: 没有权限创建该游戏的系统需求
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const createGameSystemRequirement = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.user;
    const {
      os, processor, memory, graphics, storage, type = 'minimum',
    } = req.body;

    // 1. 验证必填字段
    if (!os || !processor || !memory || !graphics || !storage) {
      return res.status(400).json({
        success: false,
        message: '操作系统、处理器、内存、显卡和存储是必填项',
      });
    }

    // 2. 查找开发者信息
    const developer = await Developer.findOne({ where: { user_id: userId } });
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户',
      });
    }

    // 3. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id,
      },
    });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏',
      });
    }

    // 4. 创建系统需求
    const systemRequirement = await GameSystemRequirement.create({
      game_id: game.id,
      os,
      processor,
      memory,
      graphics,
      storage,
      type,
    });

    // 5. 记录系统需求创建日志
    logger.info(`Developer ${developer.id} created system requirement for game ${game.id} at ${new Date().toISOString()}`);

    return res.status(201).json({
      success: true,
      message: '游戏系统需求创建成功',
      data: systemRequirement,
    });
  } catch (error) {
    logger.error('创建游戏系统需求错误:', error);
    return res.status(500).json({
      success: false,
      message: '创建游戏系统需求失败',
      error: error.message,
    });
  }
};
