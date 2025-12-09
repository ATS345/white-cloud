import express from 'express';
import {
  registerDeveloper,
  getDeveloperInfo,
  updateDeveloperInfo,
  getDeveloperGames,
  getGameSalesStats,
  getDeveloperEarnings,
  createWithdrawalRequest,
  getWithdrawalRequests,
  getGameAnalytics,
  getGameComparison,
  getUserBehaviorAnalytics,
} from '../controllers/developerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 开发者路由
router.post('/register', authenticate, registerDeveloper); // 开发者注册
router.get('/info', authenticate, getDeveloperInfo); // 获取开发者信息
router.put('/info', authenticate, updateDeveloperInfo); // 更新开发者信息
router.get('/games', authenticate, getDeveloperGames); // 获取开发者游戏列表
router.get('/sales-stats', authenticate, getGameSalesStats); // 获取游戏销售数据统计
router.get('/earnings', authenticate, getDeveloperEarnings); // 获取开发者收益分析
router.post('/withdrawals', authenticate, createWithdrawalRequest); // 创建提现请求
router.get('/withdrawals', authenticate, getWithdrawalRequests); // 获取提现请求列表
router.get('/analytics', authenticate, getGameAnalytics); // 获取游戏数据分析
router.get('/game-comparison', authenticate, getGameComparison); // 获取游戏对比分析
router.get('/user-behavior', authenticate, getUserBehaviorAnalytics); // 获取用户行为分析

export default router;
