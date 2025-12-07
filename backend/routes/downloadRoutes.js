import express from 'express'
import {
  generateDownloadLink,
  getVersionDownloadLink,
  getGameVersions,
  updatePlaytime,
  checkGameUpdate,
  downloadFile,
  getClientDownloadInfo,
  downloadClient
} from '../controllers/downloadController.js'
import { authenticate } from '../middleware/auth.js'
import { preventDuplicateDownloads, validateDownloadRequest, downloadRateLimit } from '../middleware/download.js'

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

// 获取客户端下载信息
router.get('/client/info', getClientDownloadInfo)

// 处理客户端下载（支持断点续传）
router.get('/client/:platform', downloadRateLimit, preventDuplicateDownloads, downloadClient)

// 处理游戏文件下载（支持断点续传）
router.get('/games/versions/:versionId/platform/:platform/download', 
  authenticate, 
  downloadRateLimit, 
  validateDownloadRequest, 
  preventDuplicateDownloads, 
  downloadFile)

export default router