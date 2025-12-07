import express from 'express'
import { 
  getUserGameLibrary, 
  updateGameLibrary, 
  getGameLibraryStats, 
  checkGameOwnership, 
  updatePlaytime 
} from '../controllers/gameLibraryController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// 游戏库路由
router.get('/', authenticate, getUserGameLibrary) // 获取用户游戏库
router.put('/:gameId', authenticate, updateGameLibrary) // 更新游戏库信息
router.get('/stats', authenticate, getGameLibraryStats) // 获取游戏库统计信息
router.get('/check/:gameId', authenticate, checkGameOwnership) // 检查游戏是否在用户库中
router.put('/:gameId/playtime', authenticate, updatePlaytime) // 更新游戏游玩时间

export default router