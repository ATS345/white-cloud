// 支付服务 - 错误处理工具

/**
 * 自定义错误基类
 */
/* eslint max-classes-per-file: 0 */
export class CustomError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isCustomError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - 错误请求
 */
export class BadRequestError extends CustomError {
  constructor(message = '请求参数错误', code = 'BAD_REQUEST', details = null) {
    super(message, code, 400, details);
  }
}

/**
 * 401 - 未授权
 */
export class UnauthorizedError extends CustomError {
  constructor(message = '未授权访问', code = 'UNAUTHORIZED', details = null) {
    super(message, code, 401, details);
  }
}

/**
 * 403 - 禁止访问
 */
export class ForbiddenError extends CustomError {
  constructor(message = '禁止访问', code = 'FORBIDDEN', details = null) {
    super(message, code, 403, details);
  }
}

/**
 * 404 - 资源不存在
 */
export class NotFoundError extends CustomError {
  constructor(message = '资源不存在', code = 'NOT_FOUND', details = null) {
    super(message, code, 404, details);
  }
}

/**
 * 409 - 冲突
 */
export class ConflictError extends CustomError {
  constructor(message = '资源冲突', code = 'CONFLICT', details = null) {
    super(message, code, 409, details);
  }
}

/**
 * 429 - 请求过多
 */
export class TooManyRequestsError extends CustomError {
  constructor(message = '请求过于频繁', code = 'TOO_MANY_REQUESTS', details = null) {
    super(message, code, 429, details);
  }
}

/**
 * 500 - 服务器内部错误
 */
export class InternalServerError extends CustomError {
  constructor(message = '服务器内部错误', code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message, code, 500, details);
  }
}

/**
 * 502 - 网关错误
 */
export class BadGatewayError extends CustomError {
  constructor(message = '网关错误', code = 'BAD_GATEWAY', details = null) {
    super(message, code, 502, details);
  }
}

/**
 * 503 - 服务不可用
 */
export class ServiceUnavailableError extends CustomError {
  constructor(message = '服务不可用', code = 'SERVICE_UNAVAILABLE', details = null) {
    super(message, code, 503, details);
  }
}

/**
 * 504 - 网关超时
 */
export class GatewayTimeoutError extends CustomError {
  constructor(message = '网关超时', code = 'GATEWAY_TIMEOUT', details = null) {
    super(message, code, 504, details);
  }
}

/**
 * 错误类型映射
 */
export const ERROR_TYPES = {
  BAD_REQUEST: BadRequestError,
  UNAUTHORIZED: UnauthorizedError,
  FORBIDDEN: ForbiddenError,
  NOT_FOUND: NotFoundError,
  CONFLICT: ConflictError,
  TOO_MANY_REQUESTS: TooManyRequestsError,
  INTERNAL_SERVER_ERROR: InternalServerError,
  BAD_GATEWAY: BadGatewayError,
  SERVICE_UNAVAILABLE: ServiceUnavailableError,
  GATEWAY_TIMEOUT: GatewayTimeoutError,
};

/**
 * 创建错误实例
 */
export const createError = (type, message, details = null) => {
  const ErrorClass = ERROR_TYPES[type] || InternalServerError;
  return new ErrorClass(message, type, undefined, details);
};

/**
 * 验证错误是否为自定义错误
 */
export const isCustomError = (error) => error && error.isCustomError === true;
