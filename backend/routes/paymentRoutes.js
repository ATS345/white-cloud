import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getOrderHistory,
  getOrderDetail,
  handleStripeWebhook,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

// 创建路由器
const router = express.Router();

// 创建支付意图
router.post('/intent', authenticate, createPaymentIntent);

// 确认支付
router.post('/confirm', authenticate, confirmPayment);

// 获取订单历史
router.get('/orders', authenticate, getOrderHistory);

// 获取订单详情
router.get('/orders/:orderId', authenticate, getOrderDetail);

// Stripe Webhook
router.post('/webhook', handleStripeWebhook);

export default router;
