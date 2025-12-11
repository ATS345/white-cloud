// 游戏服务 - JWT 认证中间件
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 角色常量
export const ROLES = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  USER: 'user',
};

/**
 * JWT 认证中间件
 * @param {Array} allowedRoles - 允许访问的角色列表
 */
export const authenticateJWT = (allowedRoles = []) => async (req, res, next) => {
  try {
    // 获取 Authorization 头
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('[AuthMiddleware] 缺少 Authorization 头');
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_AUTH_HEADER',
          message: '缺少认证令牌',
        },
      });
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('[AuthMiddleware] 无效的 Authorization 格式');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: '认证令牌格式无效',
        },
      });
    }

    // 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.warn(`[AuthMiddleware] JWT 验证失败: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '认证令牌无效或已过期',
        },
      });
    }

    // 验证角色
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      logger.warn(`[AuthMiddleware] 角色权限不足，用户角色: ${decoded.role}，允许角色: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '权限不足，无法访问该资源',
        },
      });
    }

    // 将用户信息存储到请求对象
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      developerId: decoded.developerId,
    };

    logger.debug(`[AuthMiddleware] 认证成功，用户ID: ${decoded.id}，角色: ${decoded.role}`);
    return next();
  } catch (error) {
    logger.error(`[AuthMiddleware] 认证过程发生错误: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '认证过程发生错误',
      },
    });
  }
};

/**
 * 生成 JWT 令牌
 * @param {Object} user - 用户信息
 * @returns {string} JWT 令牌
 */
export const generateToken = (user) => {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      developerId: user.developer_id,
      createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    logger.debug(`[AuthUtils] 生成 JWT 令牌，用户ID: ${user.id}`);
    return token;
  } catch (error) {
    logger.error(`[AuthUtils] 生成 JWT 令牌失败: ${error.message}`);
    throw error;
  }
};

/**
 * 验证 JWT 令牌
 * @param {string} token - JWT 令牌
 * @returns {Object} 解码后的令牌数据
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error(`[AuthUtils] 验证 JWT 令牌失败: ${error.message}`);
    throw error;
  }
};
