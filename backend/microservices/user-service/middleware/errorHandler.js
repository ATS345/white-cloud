// 用户服务 - 错误处理中间件
import logger from '../config/logger.js';
import { isCustomError, InternalServerError } from '../utils/errors.js';

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  try {
    let error = err;
    
    // 如果不是自定义错误，转换为内部服务器错误
    if (!isCustomError(error)) {
      logger.error('[ERROR] 未捕获的错误:', error);
      logger.error('[ERROR] 错误堆栈:', error.stack);
      
      error = new InternalServerError(
        '服务器内部错误',
        'UNHANDLED_ERROR',
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
    
    // 记录错误日志
    logger.error('[ERROR] 处理的错误:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });
    
    // 构建响应
    const response = {
      success: false,
      message: error.message,
      code: error.code,
      status: error.statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || req.id,
    };
    
    // 在开发环境中包含错误详情
    if (process.env.NODE_ENV === 'development' && error.details) {
      response.details = error.details;
    }
    
    // 在开发环境中包含错误堆栈
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
    }
    
    // 返回响应
    res.status(error.statusCode).json(response);
  } catch (error) {
    // 处理错误处理中间件自身的错误
    logger.error('[ERROR] 错误处理中间件自身发生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || req.id,
    });
  }
};

export default errorHandler;