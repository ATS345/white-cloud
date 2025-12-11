// 认证中间件 - 验证JWT令牌并提取用户信息
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

// 加载环境变量
dotenv.config();

/**
 * JWT认证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const authenticate = (req, res, next) => {
  try {
    // 从请求头获取Authorization令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('缺少认证令牌', 'MISSING_AUTH_TOKEN');
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 将解码的用户信息附加到请求对象
    req.user = {
      id: decoded.id,
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'USER',
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('令牌已过期', 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('无效的认证令牌', 'INVALID_TOKEN'));
    } else {
      next(new UnauthorizedError('认证失败', 'AUTHENTICATION_FAILED'));
    }
  }
};

/**
 * 角色授权中间件
 * @param {Array} allowedRoles - 允许访问的角色列表
 */
export const authorize = (allowedRoles) => (req, res, next) => {
  try {
    // 检查用户角色是否在允许的角色列表中
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('没有足够的权限访问此资源', 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  } catch (error) {
    next(error);
  }
};
