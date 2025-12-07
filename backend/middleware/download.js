import redisClient from '../config/redis.js'
import logger from '../config/logger.js'

// 防重复下载中间件
export const preventDuplicateDownloads = async (req, res, next) => {
  try {
    // 获取用户ID和请求信息
    const userId = req.user?.id || 'anonymous'
    const { versionId, platform } = req.params
    const ip = req.ip || req.connection.remoteAddress
    
    // 构建唯一下载请求标识
    const downloadKey = `download:${userId}:${versionId}:${platform}:${ip}`
    
    // 检查是否在短时间内有相同的下载请求
    const existingDownload = await redisClient.get(downloadKey)
    
    if (existingDownload) {
      logger.warn(`[DOWNLOAD RATE LIMIT] User ${userId} attempted duplicate download for version ${versionId} on ${platform} from ${ip}`)
      return res.status(429).json({
        success: false,
        message: '您的下载请求过于频繁，请稍候再试',
        retryAfter: 60 // 建议重试时间（秒）
      })
    }
    
    // 记录下载请求，设置60秒过期时间
    await redisClient.set(downloadKey, 'true', { EX: 60 })
    
    // 继续处理请求
    next()
    
  } catch (error) {
    logger.error(`[DOWNLOAD MIDDLEWARE ERROR] ${error.message}`)
    // 如果中间件出错，允许请求继续处理，不阻塞正常下载
    next()
  }
}

// 下载请求验证中间件
export const validateDownloadRequest = async (req, res, next) => {
  try {
    // 获取请求参数
    const { versionId, platform } = req.params
    
    // 验证必填参数
    if (!versionId || !platform) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的下载参数'
      })
    }
    
    // 验证平台格式
    const supportedPlatforms = ['windows', 'mac', 'linux', 'android', 'ios']
    if (!supportedPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: '不支持的下载平台'
      })
    }
    
    // 验证版本ID格式
    if (!/^\d+$/.test(versionId)) {
      return res.status(400).json({
        success: false,
        message: '无效的版本ID'
      })
    }
    
    // 验证请求头
    const userAgent = req.get('User-Agent')
    if (!userAgent) {
      return res.status(400).json({
        success: false,
        message: '缺少User-Agent头'
      })
    }
    
    // 继续处理请求
    next()
    
  } catch (error) {
    logger.error(`[DOWNLOAD VALIDATION ERROR] ${error.message}`)
    return res.status(400).json({
      success: false,
      message: '下载请求验证失败'
    })
  }
}

// 下载速率限制中间件（全局）
export const downloadRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress
    const globalKey = `download:global:${ip}`
    
    // 检查IP的全局下载频率（每小时最多20次）
    const downloadCount = await redisClient.incr(globalKey)
    
    // 第一次设置过期时间
    if (downloadCount === 1) {
      await redisClient.expire(globalKey, 3600) // 1小时过期
    }
    
    // 限制每小时最多20次下载
    if (downloadCount > 20) {
      logger.warn(`[GLOBAL DOWNLOAD LIMIT] IP ${ip} exceeded hourly download limit (${downloadCount}/20)`)
      return res.status(429).json({
        success: false,
        message: '您的IP下载频率过高，请稍后再试',
        retryAfter: 3600 // 建议重试时间（秒）
      })
    }
    
    next()
    
  } catch (error) {
    logger.error(`[DOWNLOAD RATE LIMIT ERROR] ${error.message}`)
    // 如果速率限制中间件出错，允许请求继续处理
    next()
  }
}