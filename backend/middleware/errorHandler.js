import logger from '../config/logger.js';
import { AppError } from '../utils/errors.js';

// 开发环境错误处理
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    errorCode: err.errorCode,
    details: err.details,
    stack: err.stack
  });
};

// 生产环境错误处理
const sendErrorProd = (err, res) => {
  // 只处理操作错误，不暴露编程错误的细节
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      details: err.details || undefined
    });
  }

  // 编程错误：不暴露细节给客户端
  logger.error('未处理的编程错误:', err);
  
  return res.status(500).json({
    success: false,
    message: '服务器内部错误，请稍后再试'
  });
};

// 数据库错误处理
const handleDatabaseError = (err) => {
  let message = '数据库操作失败';
  let errorCode = 'DATABASE_ERROR';
  let details = null;

  if (err.name === 'SequelizeUniqueConstraintError') {
    message = '数据已存在';
    errorCode = 'DUPLICATE_DATA';
    details = err.errors.map(e => e.message);
  } else if (err.name === 'SequelizeValidationError') {
    message = '数据验证失败';
    errorCode = 'VALIDATION_ERROR';
    details = err.errors.map(e => e.message);
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    message = '外键约束错误';
    errorCode = 'FOREIGN_KEY_ERROR';
    details = err.message;
  } else if (err.name === 'SequelizeDatabaseError') {
    message = '数据库查询错误';
    errorCode = 'QUERY_ERROR';
  }

  return new AppError(400, message, errorCode, details);
};

// JWT错误处理
const handleJWTError = () => {
  return new AppError(401, '认证失败，请重新登录', 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError(401, '登录已过期，请重新登录', 'TOKEN_EXPIRED');
};

// 主要错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 设置默认错误状态码和消息
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 记录所有错误
  logger.error('错误处理中间件捕获到错误:', {
    message: err.message,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: err.stack
  });

  // 根据环境选择错误响应格式
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // 在生产环境中，将非操作错误转换为操作错误
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // 根据错误类型处理
    if (err.name.startsWith('Sequelize')) {
      error = handleDatabaseError(error);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.code === 'ENOENT') {
      error = new AppError(404, '文件不存在', 'FILE_NOT_FOUND');
    }

    sendErrorProd(error, res);
  }
};

export default errorHandler;