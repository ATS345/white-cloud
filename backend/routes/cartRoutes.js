import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkoutFromCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

// 创建路由器
const router = express.Router();

// 获取购物车内容路由
router.get('/', authenticate, getCart);

// 添加商品到购物车路由
router.post('/', authenticate, addToCart);

// 更新购物车商品数量路由
router.put('/:cartItemId', authenticate, updateCartItem);

// 删除购物车商品路由
router.delete('/:cartItemId', authenticate, removeCartItem);

// 清空购物车路由
router.delete('/', authenticate, clearCart);

// 从购物车结算路由
router.post('/checkout', authenticate, checkoutFromCart);

export default router;
