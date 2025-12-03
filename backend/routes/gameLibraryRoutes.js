import express from 'express'
import { 
  getUserGameLibrary, 
  updateGameLibrary, 
  getGameLibraryStats, 
  checkGameOwnership, 
  updatePlaytime 
} from '../controllers/gameLibraryController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// 游戏库路由
router.get('/', protect, getUserGameLibrary) // 获取用户游戏库
router.put('/:gameId', protect, updateGameLibrary) // 更新游戏库信息
router.get('/stats', protect, getGameLibraryStats) // 获取游戏库统计信息
router.get('/check/:gameId', protect, checkGameOwnership) // 检查游戏是否在用户库中
router.put('/:gameId/playtime', protect, updatePlaytime) // 更新游戏游玩时间

export default router