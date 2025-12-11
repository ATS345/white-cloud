// 购物车服务 - 认证中间件
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 验证JWT令牌
 */
export const authenticate = (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;

    // 检查Authorization头是否存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('未提供认证令牌', 'MISSING_AUTH_TOKEN');
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息存储在请求对象中
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('令牌已过期', 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('无效的令牌', 'INVALID_TOKEN'));
    }
    return next(new UnauthorizedError('认证失败', 'AUTHENTICATION_FAILED'));
  }
};

/**
 * 验证管理员权限
 */
export const authorizeAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('您没有管理员权限', 'ADMIN_ACCESS_REQUIRED');
    }
    next();
  } catch (error) {
    next(error);
  }
};
