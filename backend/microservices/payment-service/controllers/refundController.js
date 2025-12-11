// 退款控制器 - 处理退款相关的业务逻辑
import Order from '../models/Order.js';
import { BadRequestError, NotFoundError, RefundError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * 申请退款
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const requestRefund = async (req, res, next) => {
  try {
    const { orderId, reason, amount } = req.body;

    // 验证必要字段
    if (!orderId || !reason) {
      throw new BadRequestError('缺少必要的退款信息', 'MISSING_REFUND_INFO');
    }

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 检查订单状态
    if (order.status !== 'COMPLETED') {
      throw new BadRequestError(`订单状态无效，当前状态: ${order.status}，只有已完成的订单才能申请退款`, 'INVALID_ORDER_STATUS');
    }

    // 检查退款状态
    if (order.refundStatus === 'PROCESSING' || order.refundStatus === 'COMPLETED') {
      throw new BadRequestError(`退款状态无效，当前状态: ${order.refundStatus}`, 'INVALID_REFUND_STATUS');
    }

    // 计算退款金额（默认全额退款）
    const refundAmount = amount || order.amount;
    if (refundAmount > order.amount) {
      throw new BadRequestError('退款金额不能超过订单总金额', 'INVALID_REFUND_AMOUNT');
    }

    // 更新订单退款状态
    await order.update({
      refundStatus: 'REQUESTED',
      refundReason: reason,
      refundAmount,
      refundRequestedAt: new Date()
    });

    logger.info(`[REFUND CONTROLLER] 已收到退款申请: ${orderId}，金额: ${refundAmount}`);
    res.status(200).json({
      success: true,
      message: '退款申请已提交',
      data: {
        orderId: order.id,
        refundStatus: 'REQUESTED',
        refundAmount,
        refundReason: reason,
        refundRequestedAt: new Date()
      }
    });
  } catch (error) {
    logger.error(`[REFUND CONTROLLER] 退款申请失败: ${error.message}`);
    next(error);
  }
};

/**
 * 处理退款
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const processRefund = async (req, res, next) => {
  try {
    const { orderId, action, notes } = req.body;

    // 验证必要字段
    if (!orderId || !action) {
      throw new BadRequestError('缺少必要的退款处理信息', 'MISSING_REFUND_PROCESS_INFO');
    }

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 检查退款状态
    if (order.refundStatus !== 'REQUESTED') {
      throw new BadRequestError(`退款状态无效，当前状态: ${order.refundStatus}，只有已申请的退款才能处理`, 'INVALID_REFUND_STATUS');
    }

    // 模拟退款处理（实际项目中应调用第三方支付API）
    logger.info(`[REFUND CONTROLLER] 处理退款申请: ${orderId}，操作: ${action}`);

    let newRefundStatus = order.refundStatus;
    let updatedOrder = null;

    if (action === 'approve') {
      // 批准退款
      newRefundStatus = 'COMPLETED';
      updatedOrder = await order.update({
        refundStatus: newRefundStatus,
        refundProcessedAt: new Date(),
        refundNotes: notes
      });

      logger.info(`[REFUND CONTROLLER] 退款已批准: ${orderId}，金额: ${order.refundAmount}`);
    } else if (action === 'reject') {
      // 拒绝退款
      newRefundStatus = 'REJECTED';
      updatedOrder = await order.update({
        refundStatus: newRefundStatus,
        refundProcessedAt: new Date(),
        refundNotes: notes
      });

      logger.info(`[REFUND CONTROLLER] 退款已拒绝: ${orderId}，原因: ${notes}`);
    } else {
      throw new BadRequestError(`无效的退款操作: ${action}`, 'INVALID_REFUND_ACTION');
    }

    res.status(200).json({
      success: true,
      message: `退款已${action === 'approve' ? '批准' : '拒绝'}`,
      data: {
        orderId: updatedOrder.id,
        refundStatus: updatedOrder.refundStatus,
        refundAmount: updatedOrder.refundAmount,
        refundReason: updatedOrder.refundReason,
        refundProcessedAt: updatedOrder.refundProcessedAt,
        refundNotes: updatedOrder.refundNotes
      }
    });
  } catch (error) {
    logger.error(`[REFUND CONTROLLER] 退款处理失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取退款状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getRefundStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 提取退款相关信息
    const refundStatus = {
      orderId: order.id,
      orderStatus: order.status,
      refundStatus: order.refundStatus,
      refundAmount: order.refundAmount,
      refundReason: order.refundReason,
      refundRequestedAt: order.refundRequestedAt,
      refundProcessedAt: order.refundProcessedAt,
      refundNotes: order.refundNotes
    };

    logger.info(`[REFUND CONTROLLER] 获取退款状态成功: ${orderId}`);
    res.status(200).json({
      success: true,
      message: '获取退款状态成功',
      data: refundStatus
    });
  } catch (error) {
    logger.error(`[REFUND CONTROLLER] 获取退款状态失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取退款列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getRefundList = async (req, res, next) => {
  try {
    const { userId, refundStatus, page = 1, limit = 10, sortBy = 'refundRequestedAt', sortOrder = 'desc' } = req.query;

    // 构建查询条件（只查询已申请退款的订单）
    const where = {
      refundStatus: { [Order.sequelize.Op.ne]: 'NOT_REQUESTED' }
    };
    if (userId) where.userId = userId;
    if (refundStatus) where.refundStatus = refundStatus;

    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const orderBy = [[sortBy, sortOrder]];

    // 查询退款订单
    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: orderBy,
      attributes: {
        exclude: ['paymentDetails', 'createdAt', 'updatedAt', 'deletedAt']
      }
    });

    logger.info(`[REFUND CONTROLLER] 获取退款列表成功，共 ${count} 条记录`);
    res.status(200).json({
      success: true,
      message: '获取退款列表成功',
      data: {
        refunds: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error(`[REFUND CONTROLLER] 获取退款列表失败: ${error.message}`);
    next(error);
  }
};

/**
 * 取消退款申请
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const cancelRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 检查退款状态
    if (order.refundStatus !== 'REQUESTED') {
      throw new BadRequestError(`退款状态无效，当前状态: ${order.refundStatus}，只有已申请的退款才能取消`, 'INVALID_REFUND_STATUS');
    }

    // 更新订单退款状态为取消
    await order.update({
      refundStatus: 'CANCELLED',
      refundCancelledAt: new Date()
    });

    logger.info(`[REFUND CONTROLLER] 退款申请已取消: ${orderId}`);
    res.status(200).json({
      success: true,
      message: '退款申请已取消',
      data: {
        orderId: order.id,
        refundStatus: order.refundStatus,
        refundCancelledAt: order.refundCancelledAt
      }
    });
  } catch (error) {
    logger.error(`[REFUND CONTROLLER] 取消退款申请失败: ${error.message}`);
    next(error);
  }
};