import express from 'express'
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
  getUserBehaviorAnalytics
} from '../controllers/developerController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// 开发者路由
router.post('/register', protect, registerDeveloper) // 开发者注册
router.get('/info', protect, getDeveloperInfo) // 获取开发者信息
router.put('/info', protect, updateDeveloperInfo) // 更新开发者信息
router.get('/games', protect, getDeveloperGames) // 获取开发者游戏列表
router.get('/sales-stats', protect, getGameSalesStats) // 获取游戏销售数据统计
router.get('/earnings', protect, getDeveloperEarnings) // 获取开发者收益分析
router.post('/withdrawals', protect, createWithdrawalRequest) // 创建提现请求
router.get('/withdrawals', protect, getWithdrawalRequests) // 获取提现请求列表
router.get('/analytics', protect, getGameAnalytics) // 获取游戏数据分析
router.get('/game-comparison', protect, getGameComparison) // 获取游戏对比分析
router.get('/user-behavior', protect, getUserBehaviorAnalytics) // 获取用户行为分析

export default router