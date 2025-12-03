import express from 'express'
import {
  generateDownloadLink,
  getVersionDownloadLink,
  getGameVersions,
  updatePlaytime,
  checkGameUpdate
} from '../controllers/downloadController.js'
import { authenticate } from '../middleware/auth.js'

// 创建路由器
const router = express.Router()

// 生成游戏下载链接
router.get('/games/:gameId/download', authenticate, generateDownloadLink)

// 获取特定版本下载链接
router.get('/games/:gameId/versions/:versionId/download', authenticate, getVersionDownloadLink)

// 获取游戏可用版本列表
router.get('/games/:gameId/versions', authenticate, getGameVersions)

// 更新游戏游玩时间
router.put('/games/:gameId/playtime', authenticate, updatePlaytime)

// 检查游戏更新
router.post('/games/:gameId/check-update', authenticate, checkGameUpdate)

export default router