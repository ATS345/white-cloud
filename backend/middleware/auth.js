import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 认证中间件 - 验证JWT令牌
export const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供有效的认证令牌',
      });
    }

    // 提取令牌
    const token = authHeader.replace('Bearer ', '');

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ['password_hash'], // 不返回密码哈希
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '认证失败，用户不存在',
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期',
      });
    }

    res.status(500).json({
      success: false,
      message: '认证过程中发生错误',
      error: error.message,
    });
  }
};

// 权限中间件 - 检查用户角色
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: '权限不足，无法访问此资源',
    });
  }

  next();
};

// 权限中间件 - 仅开发者可访问
export const isDeveloper = (req, res, next) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({
      success: false,
      message: '仅开发者可访问此资源',
    });
  }

  next();
};

// 权限中间件 - 仅管理员可访问
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '仅管理员可访问此资源',
    });
  }

  next();
};
