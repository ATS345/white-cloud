// 支付服务 - 错误处理中间件
import logger from '../config/logger.js';
import { isCustomError, InternalServerError } from '../utils/errors.js';

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res) => {
  try {
    let error = err;

    // 如果不是自定义错误，转换为内部服务器错误
    if (!isCustomError(error)) {
      error = new InternalServerError(
        process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误',
        'INTERNAL_SERVER_ERROR',
        500,
        process.env.NODE_ENV === 'development' ? error.stack : undefined,
      );
    }

    // 记录错误日志
    if (error.statusCode >= 500) {
      logger.error(`[ERROR] ${error.name}: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        user: req.user?.id || 'anonymous',
        details: error.details,
        stack: error.stack,
      });
    } else {
      logger.warn(`[WARNING] ${error.name}: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        user: req.user?.id || 'anonymous',
        details: error.details,
      });
    }

    // 构建错误响应
    const errorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? { details: error.details } : {}),
      },
      timestamp: new Date().toISOString(),
    };

    // 返回错误响应
    res.status(error.statusCode).json(errorResponse);
  } catch (error) {
    // 确保总是返回响应
    logger.error('[ERROR] 错误处理中间件内部出错:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export default errorHandler;
