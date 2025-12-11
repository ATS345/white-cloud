// 订单路由 - 处理订单相关的HTTP请求
import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  deleteOrder,
  getOrderStats 
} from '../controllers/orderController.js';

const router = express.Router();

/**
 * 订单路由定义
 */

// 创建新订单
router.post('/', createOrder);

// 获取订单列表（支持过滤和分页）
router.get('/', getOrders);

// 获取单个订单详情
router.get('/:id', getOrderById);

// 更新订单信息
router.put('/:id', updateOrder);

// 删除订单
router.delete('/:id', deleteOrder);

// 获取用户订单统计
router.get('/stats/:userId', getOrderStats);

export default router;