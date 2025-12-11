// 游戏服务 - 错误处理中间件
import logger from '../config/logger.js';

// 自定义错误类
export class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (err, req, res) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`[ErrorHandler] 错误信息: ${err.message}`, {
    stack: err.stack,
    code: error.code,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous',
  });

  // 处理特定类型的错误
  if (err.name === 'SequelizeValidationError') {
    // Sequelize 验证错误
    const message = '数据验证失败';
    const validationErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError(message, 400, 'VALIDATION_ERROR', validationErrors);
  }

  if (err.name === 'SequelizeDatabaseError') {
    // Sequelize 数据库错误
    const message = '数据库操作失败';
    error = new AppError(message, 500, 'DATABASE_ERROR', process.env.NODE_ENV === 'development' ? err.message : null);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    // 外键约束错误
    const message = '数据关联错误';
    error = new AppError(message, 400, 'FOREIGN_KEY_ERROR', process.env.NODE_ENV === 'development' ? err.message : null);
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT 验证错误
    const message = '无效的认证令牌';
    error = new AppError(message, 401, 'INVALID_TOKEN', process.env.NODE_ENV === 'development' ? err.message : null);
  }

  if (err.name === 'TokenExpiredError') {
    // JWT 过期错误
    const message = '认证令牌已过期';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  if (err.name === 'TypeError') {
    // 类型错误
    const message = '服务器内部错误';
    error = new AppError(message, 500, 'TYPE_ERROR', process.env.NODE_ENV === 'development' ? err.message : null);
  }

  // 设置默认状态码和错误码
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // 构建响应
  const response = {
    success: false,
    error: {
      code,
      message: error.message || '服务器内部错误',
    },
  };

  // 开发环境下添加详细错误信息
  if (process.env.NODE_ENV === 'development' && error.details) {
    response.error.details = error.details;
  }

  // 返回响应
  return res.status(statusCode).json(response);
};

// 404 处理中间件
export const notFoundHandler = (req, res) => {
  logger.warn(`[NotFoundHandler] 404 - 请求路径: ${req.originalUrl}, 方法: ${req.method}, IP: ${req.ip}`);

  const response = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
    },
  };

  return res.status(404).json(response);
};
