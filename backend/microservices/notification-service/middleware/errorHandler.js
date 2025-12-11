// 错误处理中间件 - 统一处理应用程序中的所有错误
import { BaseError } from '../utils/errors.js';

/**
 * 错误处理中间件
 * @param {Object} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
const errorHandler = (err, req, res, next) => {
  // 确保err是Error实例
  if (!(err instanceof Error)) {
    err = new Error(err);
  }

  // 默认错误配置
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = '服务器内部错误';
  let details = null;

  // 如果是自定义错误，使用自定义错误的配置
  if (err instanceof BaseError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
  } else if (err.name === 'SequelizeValidationError') {
    // 处理Sequelize验证错误
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = '请求参数验证失败';
    details = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    // 处理Sequelize唯一约束错误
    statusCode = 409;
    errorCode = 'CONFLICT_ERROR';
    message = '资源已存在';
    details = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    // 处理Sequelize外键约束错误
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = '关联资源不存在';
    details = err.message;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // 处理JWT错误
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = err.name === 'TokenExpiredError' ? '令牌已过期' : '无效的认证令牌';
  } else if (err.statusCode && err.message) {
    // 处理其他具有statusCode和message的错误
    statusCode = err.statusCode;
    message = err.message;
  }

  // 在开发环境下，输出完整的错误栈
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR HANDLER] 错误详情:', err);
  }

  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // 返回错误响应
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
