import { Op, fn, col } from 'sequelize';
import Developer from '../models/Developer.js';
import Game from '../models/Game.js';
import GameVersion from '../models/GameVersion.js';
import GameSystemRequirement from '../models/GameSystemRequirement.js';
import GameCategory from '../models/GameCategory.js';
import GameTag from '../models/GameTag.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import DeveloperFinance from '../models/DeveloperFinance.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import logger from '../config/logger.js';

/**
 * @swagger
 * /api/v1/developers/register:
 *   post:
 *     summary: 开发者注册
 *     description: 注册开发者账户，需要用户已登录
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 description: 公司名称
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: 联系邮箱
 *               website:
 *                 type: string
 *                 description: 公司网站
 *               bio:
 *                 type: string
 *                 description: 公司简介
 *             required:
 *               - company_name
 *               - contact_email
 *     responses:
 *       201:
 *         description: 开发者账户注册成功
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
 *                   example: 开发者账户注册成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     company_name:
 *                       type: string
 *                     contact_email:
 *                       type: string
 *                     website:
 *                       type: string
 *                     bio:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const registerDeveloper = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_name,
      contact_email,
      website,
      bio,
    } = req.body;

    // 验证必填字段
    if (!company_name || !contact_email) {
      return res.status(400).json({
        success: false,
        message: '公司名称和联系邮箱是必填项',
      });
    }

    // 检查开发者账户是否已存在
    const existingDeveloper = await Developer.findOne({
      where: { user_id: userId },
    });

    if (existingDeveloper) {
      return res.status(400).json({
        success: false,
        message: '您已经注册了开发者账户',
      });
    }

    // 创建开发者账户
    const developer = await Developer.create({
      user_id: userId,
      company_name,
      contact_email,
      website,
      bio,
    });

    return res.status(201).json({
      success: true,
      message: '开发者账户注册成功',
      data: developer,
    });
  } catch (error) {
    logger.error('注册开发者错误:', error);
    return res.status(500).json({
      success: false,
      message: '注册开发者过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/me:
 *   get:
 *     summary: 获取开发者信息
 *     description: 获取当前登录开发者的详细信息
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 成功获取开发者信息
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
 *                   example: 获取开发者信息成功
 *                 data:
 *                   $ref: '#/components/schemas/Developer'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getDeveloperInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取开发者信息
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      message: '获取开发者信息成功',
      data: developer,
    });
  } catch (error) {
    logger.error('获取开发者信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取开发者信息过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/me:
 *   put:
 *     summary: 更新开发者信息
 *     description: 更新当前登录开发者的个人信息
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 description: 公司名称
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 description: 联系邮箱
 *               website:
 *                 type: string
 *                 description: 公司网站
 *               bio:
 *                 type: string
 *                 description: 公司简介
 *     responses:
 *       200:
 *         description: 开发者信息更新成功
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
 *                   example: 开发者信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Developer'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const updateDeveloperInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company_name,
      contact_email,
      website,
      bio,
    } = req.body;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 更新开发者信息
    await developer.update({
      company_name: company_name || developer.company_name,
      contact_email: contact_email || developer.contact_email,
      website: website || developer.website,
      bio: bio || developer.bio,
    });

    return res.status(200).json({
      success: true,
      message: '开发者信息更新成功',
      data: developer,
    });
  } catch (error) {
    logger.error('更新开发者信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新开发者信息过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/games:
 *   get:
 *     summary: 获取开发者游戏列表
 *     description: 获取当前开发者发布的所有游戏
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 游戏状态（可选）
 *     responses:
 *       200:
 *         description: 成功获取开发者游戏列表
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
 *                   example: 获取开发者游戏列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Game'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getDeveloperGames = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 构建查询条件
    const whereClause = { developer_id: developer.id };
    if (status) {
      whereClause.status = status;
    }

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 获取开发者游戏列表
    const games = await Game.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GameCategory,
          as: 'categories',
          attributes: ['id', 'name'],
        },
        {
          model: GameTag,
          as: 'tags',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'desc']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: '获取开发者游戏列表成功',
      data: {
        games: games.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: games.count,
          totalPages: Math.ceil(games.count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('获取开发者游戏列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取开发者游戏列表过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/games/sales-stats:
 *   get:
 *     summary: 获取游戏销售数据统计
 *     description: 获取当前开发者游戏的销售数据统计
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         description: 游戏ID（可选，用于获取单个游戏的销售数据）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期（可选）
 *     responses:
 *       200:
 *         description: 成功获取游戏销售数据统计
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
 *                   example: 获取游戏销售数据统计成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     daily_stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           total_sales:
 *                             type: integer
 *                             description: 总销量
 *                           total_revenue:
 *                             type: number
 *                             description: 总销售额
 *                           date:
 *                             type: string
 *                             description: 日期
 *                     total_stats:
 *                       type: object
 *                       properties:
 *                         total_sales:
 *                           type: integer
 *                           description: 总销量
 *                         total_revenue:
 *                           type: number
 *                           description: 总销售额
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGameSalesStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, startDate, endDate } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 构建查询条件
    const whereClause = {
      '$OrderItem.game.developer_id$': developer.id,
    };

    if (gameId) {
      whereClause.game_id = gameId;
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    // 获取销售数据统计
    const salesStats = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title'],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'created_at', 'status'],
        },
      ],
      attributes: [
        [fn('COUNT', col('id')), 'total_sales'],
        [fn('SUM', col('price')), 'total_revenue'],
        [fn('DATE', col('Order.created_at')), 'date'],
      ],
      group: ['date', 'game.id', 'game.title', 'order.id', 'order.created_at', 'order.status'],
      order: [[fn('DATE', col('Order.created_at')), 'asc']],
    });

    // 获取总销售额和总销量
    const totalStats = await OrderItem.findOne({
      where: whereClause,
      attributes: [
        [fn('COUNT', col('id')), 'total_sales'],
        [fn('SUM', col('price')), 'total_revenue'],
      ],
    });

    return res.status(200).json({
      success: true,
      message: '获取游戏销售数据统计成功',
      data: {
        daily_stats: salesStats,
        total_stats: {
          total_sales: parseInt(totalStats?.dataValues.total_sales) || 0,
          total_revenue: parseFloat(totalStats?.dataValues.total_revenue) || 0,
        },
      },
    });
  } catch (error) {
    logger.error('获取游戏销售数据统计错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏销售数据统计过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/earnings:
 *   get:
 *     summary: 获取开发者收益分析
 *     description: 获取当前开发者的收益分析数据
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: monthly
 *         description: 收益周期（daily, weekly, monthly等）
 *     responses:
 *       200:
 *         description: 成功获取开发者收益分析
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
 *                   example: 获取开发者收益分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     earnings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           developer_id:
 *                             type: integer
 *                           period_start:
 *                             type: string
 *                             format: date-time
 *                           period_end:
 *                             type: string
 *                             format: date-time
 *                           total_revenue:
 *                             type: number
 *                           platform_fee:
 *                             type: number
 *                           developer_earnings:
 *                             type: number
 *                           status:
 *                             type: string
 *                     current_balance:
 *                       type: number
 *                       description: 当前可用余额
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getDeveloperEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly' } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 获取开发者收益分析
    const earnings = await DeveloperFinance.findAll({
      where: { developer_id: developer.id },
      order: [['period_start', 'desc']],
    });

    // 获取当前可用余额
    const currentBalance = await DeveloperFinance.findOne({
      where: {
        developer_id: developer.id,
        status: 'processed',
      },
      attributes: [
        [fn('SUM', col('developer_earnings')), 'total_earnings'],
      ],
    });

    return res.status(200).json({
      success: true,
      message: '获取开发者收益分析成功',
      data: {
        earnings,
        current_balance: parseFloat(currentBalance?.dataValues.total_earnings) || 0,
      },
    });
  } catch (error) {
    logger.error('获取开发者收益分析错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取开发者收益分析过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/withdrawals:
 *   post:
 *     summary: 创建提现请求
 *     description: 创建开发者提现请求，需要有足够的可用余额
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: 提现金额
 *               payment_method:
 *                 type: string
 *                 description: 支付方式
 *               payment_account:
 *                 type: string
 *                 description: 支付账户
 *             required:
 *               - amount
 *               - payment_method
 *               - payment_account
 *     responses:
 *       201:
 *         description: 提现请求创建成功
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
 *                   example: 提现请求创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     developer_id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     payment_method:
 *                       type: string
 *                     payment_account:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const createWithdrawalRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, payment_method, payment_account } = req.body;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 验证提现金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '提现金额必须大于0',
      });
    }

    // 检查可用余额
    const currentBalance = await DeveloperFinance.findOne({
      where: {
        developer_id: developer.id,
        status: 'processed',
      },
      attributes: [
        [fn('SUM', col('developer_earnings')), 'total_earnings'],
      ],
    });

    const availableBalance = parseFloat(currentBalance?.dataValues.total_earnings) || 0;
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: '提现金额超过可用余额',
      });
    }

    // 创建提现请求
    const withdrawalRequest = await WithdrawalRequest.create({
      developer_id: developer.id,
      amount,
      payment_method,
      payment_account,
    });

    return res.status(201).json({
      success: true,
      message: '提现请求创建成功',
      data: withdrawalRequest,
    });
  } catch (error) {
    logger.error('创建提现请求错误:', error);
    return res.status(500).json({
      success: false,
      message: '创建提现请求过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/withdrawals:
 *   get:
 *     summary: 获取提现请求列表
 *     description: 获取开发者的提现请求列表
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 提现请求状态（可选）
 *     responses:
 *       200:
 *         description: 成功获取提现请求列表
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
 *                   example: 获取提现请求列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           developer_id:
 *                             type: integer
 *                           amount:
 *                             type: number
 *                           payment_method:
 *                             type: string
 *                           payment_account:
 *                             type: string
 *                           status:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getWithdrawalRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 构建查询条件
    const whereClause = { developer_id: developer.id };
    if (status) {
      whereClause.status = status;
    }

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 获取提现请求列表
    const withdrawalRequests = await WithdrawalRequest.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'desc']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: '获取提现请求列表成功',
      data: {
        requests: withdrawalRequests.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: withdrawalRequests.count,
          totalPages: Math.ceil(withdrawalRequests.count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('获取提现请求列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取提现请求列表过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/games/analytics:
 *   get:
 *     summary: 获取游戏数据分析
 *     description: 获取游戏数据分析，支持不同指标类型
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         description: 游戏ID（可选）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期（可选）
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           description: 指标类型（sales, revenue, downloads, active_users, rating）
 *           default: sales
 *     responses:
 *       200:
 *         description: 成功获取游戏数据分析
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
 *                   example: 获取游戏数据分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     metric:
 *                       type: string
 *                       description: 指标类型
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: 日期
 *                           value:
 *                             type: number
 *                             description: 指标值
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGameAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      gameId, startDate, endDate, metric = 'sales',
    } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 构建查询条件
    const whereClause = {
      '$OrderItem.game.developer_id$': developer.id,
    };

    if (gameId) {
      whereClause.game_id = gameId;
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    // 根据指标类型获取不同的数据
    let analyticsData = [];
    const groupBy = ['date'];
    const attributes = [
      [sequelize.fn('DATE', sequelize.col('Order.created_at')), 'date'],
    ];

    switch (metric) {
    case 'sales':
      attributes.push(
        [fn('COUNT', col('id')), 'value'],
      );
      break;
    case 'revenue':
      attributes.push(
        [fn('SUM', col('price')), 'value'],
      );
      break;
    case 'downloads':
      // 这里需要根据实际的下载记录模型进行调整
      attributes.push(
        [fn('COUNT', col('id')), 'value'],
      );
      break;
    case 'active_users':
      // 这里需要根据实际的用户活动记录模型进行调整
      attributes.push(
        [fn('COUNT', fn('DISTINCT', col('Order.user_id'))), 'value'],
      );
      break;
    case 'rating':
      // 这里需要根据实际的评价记录模型进行调整
      attributes.push(
        [fn('AVG', col('rating')), 'value'],
      );
      break;
    default:
      attributes.push(
        [fn('COUNT', col('id')), 'value'],
      );
    }

    // 获取数据分析数据
    analyticsData = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title'],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'created_at', 'status', 'user_id'],
        },
      ],
      attributes,
      group: groupBy,
      order: [[fn('DATE', col('Order.created_at')), 'asc']],
    });

    // 格式化数据
    const formattedData = analyticsData.map((item) => ({
      date: item.dataValues.date,
      value: parseFloat(item.dataValues.value) || 0,
    }));

    return res.status(200).json({
      success: true,
      message: '获取游戏数据分析成功',
      data: {
        metric,
        data: formattedData,
      },
    });
  } catch (error) {
    logger.error('获取游戏数据分析错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏数据分析过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/games/comparison:
 *   get:
 *     summary: 获取游戏对比分析
 *     description: 获取多个游戏之间的对比分析数据
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: gameIds
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         description: 游戏ID列表（可选）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期（可选）
 *     responses:
 *       200:
 *         description: 成功获取游戏对比分析
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
 *                   example: 获取游戏对比分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           game_id:
 *                             type: integer
 *                           game_title:
 *                             type: string
 *                           total_sales:
 *                             type: integer
 *                             description: 总销量
 *                           total_revenue:
 *                             type: number
 *                             description: 总销售额
 *                           avg_price:
 *                             type: number
 *                             description: 平均价格
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGameComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameIds = [], startDate, endDate } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 构建查询条件
    const whereClause = {
      '$OrderItem.game.developer_id$': developer.id,
    };

    if (gameIds.length > 0) {
      whereClause.game_id = {
        [sequelize.Op.in]: gameIds,
      };
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    // 获取游戏对比数据
    const comparisonData = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title'],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'created_at', 'status'],
        },
      ],
      attributes: [
        'game_id',
        [sequelize.col('game.title'), 'game_title'],
        [fn('COUNT', col('id')), 'total_sales'],
        [fn('SUM', col('price')), 'total_revenue'],
        [fn('AVG', col('price')), 'avg_price'],
      ],
      group: ['game_id', 'game.title'],
      order: [[fn('SUM', col('price')), 'desc']],
    });

    return res.status(200).json({
      success: true,
      message: '获取游戏对比分析成功',
      data: {
        comparison: comparisonData,
      },
    });
  } catch (error) {
    logger.error('获取游戏对比分析错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取游戏对比分析过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/developers/games/user-behavior:
 *   get:
 *     summary: 获取用户行为分析
 *     description: 获取游戏的用户行为分析数据
 *     tags: [Developer]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         description: 游戏ID（可选）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期（可选）
 *     responses:
 *       200:
 *         description: 成功获取用户行为分析
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
 *                   example: 获取用户行为分析成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     daily_active_users:
 *                       type: array
 *                       description: 日活跃用户数据
 *                     monthly_active_users:
 *                       type: array
 *                       description: 月活跃用户数据
 *                     user_retention:
 *                       type: array
 *                       description: 用户留存数据
 *                     user_acquisition:
 *                       type: array
 *                       description: 用户获取数据
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getUserBehaviorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, startDate, endDate } = req.query;

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在',
      });
    }

    // 这里可以根据实际的用户行为记录模型进行调整
    // 以下是一个示例实现，需要根据实际数据模型进行修改
    const behaviorData = {
      daily_active_users: [],
      monthly_active_users: [],
      user_retention: [],
      user_acquisition: [],
    };

    return res.status(200).json({
      success: true,
      message: '获取用户行为分析成功',
      data: behaviorData,
    });
  } catch (error) {
    logger.error('获取用户行为分析错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户行为分析过程中发生错误',
      error: error.message,
    });
  }
};
