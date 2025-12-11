// 购物车服务 - 错误处理工具

// 基础错误类
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message, errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message, errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message, errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message, errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message, errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

// 422 Unprocessable Entity
export class UnprocessableEntityError extends AppError {
  constructor(message, errorCode = 'UNPROCESSABLE_ENTITY') {
    super(message, 422, errorCode);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, errorCode);
  }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message, errorCode = 'SERVICE_UNAVAILABLE') {
    super(message, 503, errorCode);
  }
}
