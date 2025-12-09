import { validationResult } from 'express-validator'
import logger from '../config/logger.js'

// 验证结果处理中间件
export const handleValidationErrors = (req, res, next) => {
  try {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      // 提取错误信息
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
      
      // 记录验证错误日志
      logger.warn('验证错误:', { 
        errors: errorMessages,
        url: req.originalUrl,
        method: req.method
      })
      
      // 返回400错误响应
      return res.status(400).json({
        success: false,
        message: '请求参数验证失败',
        errors: errorMessages
      })
    }
    
    // 验证通过，继续执行下一个中间件
    next()
  } catch (error) {
    logger.error('处理验证错误时发生异常:', error)
    res.status(500).json({
      success: false,
      message: '验证过程中发生错误'
    })
  }
}