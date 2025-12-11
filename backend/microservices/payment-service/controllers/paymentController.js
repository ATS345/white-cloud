// 支付控制器 - 处理支付相关的业务逻辑
import Order from '../models/Order.js';
import { BadRequestError, NotFoundError, PaymentError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * 处理支付请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const processPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId, paymentDetails } = req.body;

    // 验证必要字段
    if (!orderId || !transactionId) {
      throw new BadRequestError('缺少必要的支付信息', 'MISSING_PAYMENT_INFO');
    }

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 检查订单状态
    if (order.status !== 'PENDING') {
      throw new BadRequestError(`订单状态无效，当前状态: ${order.status}`, 'INVALID_ORDER_STATUS');
    }

    // 模拟支付处理（实际项目中应调用第三方支付API）
    // 这里可以添加调用第三方支付API的逻辑
    logger.info(`[PAYMENT CONTROLLER] 调用第三方支付API处理订单: ${orderId}`);

    // 更新订单状态为已支付
    await order.update({
      status: 'COMPLETED',
      transactionId,
      paymentDetails,
      paidAt: new Date()
    });

    logger.info(`[PAYMENT CONTROLLER] 订单支付成功: ${orderId}, 交易ID: ${transactionId}`);
    res.status(200).json({
      success: true,
      message: '支付处理成功',
      data: {
        orderId: order.id,
        status: order.status,
        transactionId: order.transactionId,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    logger.error(`[PAYMENT CONTROLLER] 支付处理失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取支付状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 提取支付相关信息
    const paymentStatus = {
      orderId: order.id,
      orderStatus: order.status,
      transactionId: order.transactionId,
      paymentMethod: order.paymentMethod,
      amount: order.amount,
      paidAt: order.paidAt,
      paymentDetails: order.paymentDetails
    };

    logger.info(`[PAYMENT CONTROLLER] 获取支付状态成功: ${orderId}`);
    res.status(200).json({
      success: true,
      message: '获取支付状态成功',
      data: paymentStatus
    });
  } catch (error) {
    logger.error(`[PAYMENT CONTROLLER] 获取支付状态失败: ${error.message}`);
    next(error);
  }
};

/**
 * 取消支付
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const cancelPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError(`订单不存在: ${orderId}`, 'ORDER_NOT_FOUND');
    }

    // 检查订单状态
    if (order.status !== 'PENDING') {
      throw new BadRequestError(`订单状态无效，当前状态: ${order.status}，无法取消支付`, 'INVALID_ORDER_STATUS');
    }

    // 更新订单状态为已取消
    await order.update({
      status: 'CANCELLED',
      cancelledAt: new Date()
    });

    logger.info(`[PAYMENT CONTROLLER] 支付取消成功: ${orderId}`);
    res.status(200).json({
      success: true,
      message: '支付取消成功',
      data: {
        orderId: order.id,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });
  } catch (error) {
    logger.error(`[PAYMENT CONTROLLER] 支付取消失败: ${error.message}`);
    next(error);
  }
};

/**
 * 验证支付结果（用于第三方支付回调）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const verifyPayment = async (req, res, next) => {
  try {
    // 从请求体或查询参数中获取支付结果
    const { orderId, transactionId, status, amount, paymentDetails } = req.body;

    logger.info(`[PAYMENT CONTROLLER] 收到第三方支付回调，订单ID: ${orderId}，状态: ${status}`);

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      logger.error(`[PAYMENT CONTROLLER] 支付回调失败：订单不存在 ${orderId}`);
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 验证支付金额
    if (amount && parseFloat(amount) !== parseFloat(order.amount)) {
      logger.error(`[PAYMENT CONTROLLER] 支付回调失败：金额不匹配 ${orderId}，预期: ${order.amount}，实际: ${amount}`);
      return res.status(400).json({
        success: false,
        message: '支付金额不匹配'
      });
    }

    // 更新订单状态
    let newStatus = order.status;
    if (status === 'success' || status === 'completed') {
      newStatus = 'COMPLETED';
    } else if (status === 'failed' || status === 'cancelled') {
      newStatus = 'FAILED';
    }

    if (newStatus !== order.status) {
      await order.update({
        status: newStatus,
        transactionId: transactionId || order.transactionId,
        paymentDetails: paymentDetails || order.paymentDetails,
        paidAt: newStatus === 'COMPLETED' ? new Date() : order.paidAt
      });

      logger.info(`[PAYMENT CONTROLLER] 订单状态已更新：${orderId}，新状态: ${newStatus}`);
    }

    // 返回成功响应给第三方支付平台
    res.status(200).json({
      success: true,
      message: '支付结果已处理',
      orderId
    });
  } catch (error) {
    logger.error(`[PAYMENT CONTROLLER] 支付验证失败: ${error.message}`);
    // 支付回调需要返回明确的响应，即使发生错误
    res.status(500).json({
      success: false,
      message: '支付验证失败'
    });
  }
};