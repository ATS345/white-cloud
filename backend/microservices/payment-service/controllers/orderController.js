// 订单控制器 - 处理订单相关的业务逻辑
import Order from '../models/Order.js';
import { BadRequestError, NotFoundError, DatabaseError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * 创建新订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const createOrder = async (req, res, next) => {
  try {
    const { userId, gameId, amount, paymentMethod, gameTitle, gamePrice, gameImage } = req.body;

    // 验证必要字段
    if (!userId || !gameId || !amount || !paymentMethod || !gameTitle || !gamePrice) {
      throw new BadRequestError('缺少必要的订单信息', 'MISSING_ORDER_INFO');
    }

    // 创建订单
    const order = await Order.create({
      userId,
      gameId,
      gameTitle,
      gamePrice,
      gameImage,
      amount,
      paymentMethod,
      status: 'PENDING', // 初始状态为待支付
      transactionId: null,
      paymentDetails: null,
      refundStatus: 'NOT_REQUESTED',
      refundAmount: 0,
      refundReason: null,
      refundDate: null
    });

    logger.info(`[ORDER CONTROLLER] 已创建新订单: ${order.id}`);
    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: order
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 创建订单失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取订单列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getOrders = async (req, res, next) => {
  try {
    const { userId, gameId, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // 构建查询条件
    const where = {};
    if (userId) where.userId = userId;
    if (gameId) where.gameId = gameId;
    if (status) where.status = status;

    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder]];

    // 查询订单
    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order,
      attributes: {
        exclude: ['paymentDetails', 'createdAt', 'updatedAt', 'deletedAt']
      }
    });

    logger.info(`[ORDER CONTROLLER] 获取订单列表成功，共 ${count} 条记录`);
    res.status(200).json({
      success: true,
      message: '获取订单列表成功',
      data: {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 获取订单列表失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取单个订单详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询订单
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${id}`, 'ORDER_NOT_FOUND');
    }

    logger.info(`[ORDER CONTROLLER] 获取订单详情成功: ${id}`);
    res.status(200).json({
      success: true,
      message: '获取订单详情成功',
      data: order
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 获取订单详情失败: ${error.message}`);
    next(error);
  }
};

/**
 * 更新订单信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 验证订单是否存在
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${id}`, 'ORDER_NOT_FOUND');
    }

    // 更新订单
    await order.update(updateData);

    logger.info(`[ORDER CONTROLLER] 更新订单成功: ${id}`);
    res.status(200).json({
      success: true,
      message: '订单更新成功',
      data: order
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 更新订单失败: ${error.message}`);
    next(error);
  }
};

/**
 * 删除订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 验证订单是否存在
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${id}`, 'ORDER_NOT_FOUND');
    }

    // 只有待支付的订单才能被删除
    if (order.status !== 'PENDING') {
      throw new BadRequestError('只有待支付的订单才能被删除', 'ORDER_CANNOT_BE_DELETED');
    }

    // 删除订单（软删除）
    await order.destroy();

    logger.info(`[ORDER CONTROLLER] 删除订单成功: ${id}`);
    res.status(200).json({
      success: true,
      message: '订单删除成功'
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 删除订单失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取用户的订单统计信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // 统计订单数量和金额
    const stats = await Order.findAll({
      where: { userId },
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('amount')), 'totalAmount']
      ],
      group: ['status']
    });

    // 计算总订单数和总金额
    const totalOrders = stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0);
    const totalAmount = stats.reduce((sum, stat) => sum + parseFloat(stat.dataValues.totalAmount || 0), 0);

    logger.info(`[ORDER CONTROLLER] 获取用户订单统计成功: ${userId}`);
    res.status(200).json({
      success: true,
      message: '获取订单统计信息成功',
      data: {
        stats,
        totalOrders,
        totalAmount
      }
    });
  } catch (error) {
    logger.error(`[ORDER CONTROLLER] 获取订单统计失败: ${error.message}`);
    next(error);
  }
};