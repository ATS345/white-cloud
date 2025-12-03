import express from 'express'
import {
  registerDeveloper,
  getDeveloperInfo,
  updateDeveloperInfo,
  getDeveloperGames,
  getGameSalesStats,
  getDeveloperEarnings,
  createWithdrawalRequest,
  getWithdrawalRequests
} from '../controllers/developerController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// 开发者路由
router.post('/register', protect, registerDeveloper) // 注册开发者账户
router.get('/info', protect, getDeveloperInfo) // 获取开发者信息
router.put('/info', protect, updateDeveloperInfo) // 更新开发者信息
router.get('/games', protect, getDeveloperGames) // 获取开发者游戏列表
router.get('/sales-stats', protect, getGameSalesStats) // 获取游戏销售数据统计
router.get('/earnings', protect, getDeveloperEarnings) // 获取开发者收益分析
router.post('/withdrawal', protect, createWithdrawalRequest) // 创建提现请求
router.get('/withdrawal-requests', protect, getWithdrawalRequests) // 获取提现请求列表

export default router