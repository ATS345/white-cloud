// 用户服务 - 认证中间件
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../config/logger.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import User from '../models/User.js';

dotenv.config();

/**
 * 认证中间件 - 验证JWT令牌
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('[AUTH] 缺少授权头或授权头格式不正确');
      throw new UnauthorizedError('缺少授权头或授权头格式不正确', 'MISSING_OR_INVALID_AUTH_HEADER');
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('[AUTH] 令牌已过期');
        throw new UnauthorizedError('令牌已过期', 'TOKEN_EXPIRED');
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('[AUTH] 令牌无效');
        throw new UnauthorizedError('令牌无效', 'INVALID_TOKEN');
      } else {
        logger.error('[AUTH] 令牌验证失败:', error);
        throw new UnauthorizedError('令牌验证失败', 'TOKEN_VERIFICATION_FAILED');
      }
    }
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      logger.warn(`[AUTH] 用户不存在: ${decoded.userId}`);
      throw new UnauthorizedError('用户不存在', 'USER_NOT_FOUND');
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      logger.warn(`[AUTH] 用户状态异常: ${user.id} - ${user.status}`);
      throw new UnauthorizedError('用户状态异常', 'USER_STATUS_INVALID');
    }
    
    // 将用户信息挂载到请求对象上
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 授权中间件 - 验证用户角色
 */
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('[AUTH] 未认证用户尝试访问受保护资源');
        throw new UnauthorizedError('请先登录', 'NOT_LOGGED_IN');
      }
      
      // 检查用户角色是否在允许列表中
      if (!roles.includes(req.user.role)) {
        logger.warn(`[AUTH] 用户权限不足: ${req.user.id} - ${req.user.role} - 所需角色: ${roles.join(', ')}`);
        throw new ForbiddenError('权限不足，无法访问此资源', 'INSUFFICIENT_PERMISSIONS');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 可选认证中间件 - 尝试获取用户信息，但不强制要求
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (user && user.status === 'active') {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // 令牌无效或已过期，不影响请求继续
        logger.debug('[AUTH] 可选认证令牌无效:', error.message);
      }
    }
    
    next();
  } catch (error) {
    // 发生错误，不影响请求继续
    logger.error('[AUTH] 可选认证发生错误:', error);
    next();
  }
};

/**
 * 刷新令牌中间件 - 验证刷新令牌
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new UnauthorizedError('缺少刷新令牌', 'MISSING_REFRESH_TOKEN');
    }
    
    // 验证刷新令牌（这里简化处理，实际应该在数据库中存储和验证刷新令牌）
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError('刷新令牌无效', 'INVALID_REFRESH_TOKEN');
    }
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('用户不存在或状态异常', 'USER_NOT_FOUND_OR_INVALID');
    }
    
    // 将用户信息挂载到请求对象上
    req.user = user;
    req.refreshToken = refreshToken;
    
    next();
  } catch (error) {
    next(error);
  }
};
