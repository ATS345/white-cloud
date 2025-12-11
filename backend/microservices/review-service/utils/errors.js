// 错误处理工具类 - 定义各种自定义错误类型

/**
 * 基础错误类
 */
export class BaseError extends Error {
  constructor(message, code = 'INTERNAL_SERVER_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误 - 当请求参数不符合要求时抛出
 */
export class ValidationError extends BaseError {
  constructor(message, code = 'VALIDATION_ERROR', statusCode = 400) {
    super(message, code, statusCode);
  }
}

/**
 * 授权错误 - 当用户没有权限访问资源时抛出
 */
export class UnauthorizedError extends BaseError {
  constructor(message, code = 'UNAUTHORIZED', statusCode = 401) {
    super(message, code, statusCode);
  }
}

/**
 * 禁止访问错误 - 当用户没有权限访问资源时抛出
 */
export class ForbiddenError extends BaseError {
  constructor(message, code = 'FORBIDDEN', statusCode = 403) {
    super(message, code, statusCode);
  }
}

/**
 * 资源不存在错误 - 当请求的资源不存在时抛出
 */
export class NotFoundError extends BaseError {
  constructor(message, code = 'NOT_FOUND', statusCode = 404) {
    super(message, code, statusCode);
  }
}

/**
 * 数据库错误 - 当数据库操作失败时抛出
 */
export class DatabaseError extends BaseError {
  constructor(message, code = 'DATABASE_ERROR', statusCode = 500) {
    super(message, code, statusCode);
  }
}

/**
 * 冲突错误 - 当请求与现有资源冲突时抛出
 */
export class ConflictError extends BaseError {
  constructor(message, code = 'CONFLICT', statusCode = 409) {
    super(message, code, statusCode);
  }
}

/**
 * 请求过多错误 - 当用户请求频率过高时抛出
 */
export class TooManyRequestsError extends BaseError {
  constructor(message, code = 'TOO_MANY_REQUESTS', statusCode = 429) {
    super(message, code, statusCode);
  }
}

/**
 * 服务不可用错误 - 当服务暂时不可用时抛出
 */
export class ServiceUnavailableError extends BaseError {
  constructor(message, code = 'SERVICE_UNAVAILABLE', statusCode = 503) {
    super(message, code, statusCode);
  }
}

// 配置ESLint，允许在单个文件中定义多个类
/* eslint-disable max-classes-per-file */
