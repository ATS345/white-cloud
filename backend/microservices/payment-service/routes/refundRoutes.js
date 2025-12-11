// 退款路由 - 处理退款相关的HTTP请求
import express from 'express';
import { 
  requestRefund, 
  processRefund, 
  getRefundStatus, 
  getRefundList,
  cancelRefund 
} from '../controllers/refundController.js';

const router = express.Router();

/**
 * 退款路由定义
 */

// 申请退款
router.post('/', requestRefund);

// 处理退款申请（批准或拒绝）
router.post('/process', processRefund);

// 获取退款状态
router.get('/:orderId/status', getRefundStatus);

// 获取退款列表（支持过滤和分页）
router.get('/', getRefundList);

// 取消退款申请
router.post('/:orderId/cancel', cancelRefund);

export default router;