// 支付路由 - 处理支付相关的HTTP请求
import express from 'express';
import { 
  processPayment, 
  getPaymentStatus, 
  cancelPayment, 
  verifyPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * 支付路由定义
 */

// 处理支付请求
router.post('/', processPayment);

// 获取支付状态
router.get('/:orderId/status', getPaymentStatus);

// 取消支付
router.post('/:orderId/cancel', cancelPayment);

// 验证支付结果（用于第三方支付回调）
router.post('/verify', verifyPayment);

export default router;