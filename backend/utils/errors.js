// 自定义错误类，用于标准化错误响应
class AppError extends Error {
  constructor(statusCode, message, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // 捕获错误堆栈，不影响性能
    Error.captureStackTrace(this, this.constructor);
  }
}

// 资源未找到错误
class NotFoundError extends AppError {
  constructor(message = '资源不存在', errorCode = 'NOT_FOUND') {
    super(404, message, errorCode);
  }
}

// 验证错误
class ValidationError extends AppError {
  constructor(message = '数据验证失败', details = null, errorCode = 'VALIDATION_ERROR') {
    super(400, message, errorCode, details);
  }
}

// 授权错误
class AuthorizationError extends AppError {
  constructor(message = '您没有权限执行此操作', errorCode = 'AUTHORIZATION_ERROR') {
    super(403, message, errorCode);
  }
}

// 认证错误
class AuthenticationError extends AppError {
  constructor(message = '认证失败，请重新登录', errorCode = 'AUTHENTICATION_ERROR') {
    super(401, message, errorCode);
  }
}

// 数据库错误
class DatabaseError extends AppError {
  constructor(message = '数据库操作失败', details = null, errorCode = 'DATABASE_ERROR') {
    super(500, message, errorCode, details);
  }
}

// 服务器错误
class ServerError extends AppError {
  constructor(message = '服务器内部错误', details = null, errorCode = 'SERVER_ERROR') {
    super(500, message, errorCode, details);
  }
}

// 业务逻辑错误
class BusinessLogicError extends AppError {
  constructor(message = '业务逻辑错误', errorCode = 'BUSINESS_LOGIC_ERROR') {
    super(400, message, errorCode);
  }
}

export {
  AppError,
  NotFoundError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  DatabaseError,
  ServerError,
  BusinessLogicError
};