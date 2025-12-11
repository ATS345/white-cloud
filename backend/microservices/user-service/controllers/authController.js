// 用户服务 - 认证控制器
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../config/logger.js';
import User from '../models/User.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import redisClient from '../config/redis.js';

dotenv.config();

/**
 * 生成JWT令牌
 */
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  
  // 访问令牌（短期）
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  // 刷新令牌（长期）
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

/**
 * 用户注册
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      throw new BadRequestError('用户名、邮箱和密码不能为空', 'MISSING_REQUIRED_FIELDS');
    }
    
    // 检查用户名是否已存在
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      throw new ConflictError('用户名已存在', 'USERNAME_ALREADY_EXISTS');
    }
    
    // 检查邮箱是否已存在
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictError('邮箱已存在', 'EMAIL_ALREADY_EXISTS');
    }
    
    // 密码哈希
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await User.create({
      username,
      email,
      passwordHash,
      isVerified: false,
    });
    
    // 生成验证令牌（这里简化处理，实际应该发送邮件）
    // const verificationToken = generateVerificationToken(user);
    
    res.status(201).json({
      success: true,
      message: '注册成功，请查收邮件验证您的邮箱',
      data: {
        userId: user.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 验证输入
    if (!email || !password) {
      throw new BadRequestError('邮箱和密码不能为空', 'MISSING_REQUIRED_FIELDS');
    }
    
    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('邮箱或密码错误', 'INVALID_CREDENTIALS');
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedError('用户状态异常，无法登录', 'USER_STATUS_INVALID');
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // 记录登录失败次数
      await user.update({
        failedLoginAttempts: user.failedLoginAttempts + 1,
      });
      
      throw new UnauthorizedError('邮箱或密码错误', 'INVALID_CREDENTIALS');
    }
    
    // 重置登录失败次数
    if (user.failedLoginAttempts > 0) {
      await user.update({
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      });
    } else {
      await user.update({
        lastLoginAt: new Date(),
      });
    }
    
    // 生成令牌
    const { accessToken, refreshToken } = generateTokens(user);
    
    // 将用户信息存入Redis（可选，用于会话管理）
    await redisClient.set(`user:${user.id}`, JSON.stringify(user), 3600);
    
    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          nickname: user.nickname,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 刷新访问令牌
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    // 从req.user获取用户信息（由refreshToken中间件设置）
    const user = req.user;
    
    // 生成新的访问令牌
    const { accessToken } = generateTokens(user);
    
    res.status(200).json({
      success: true,
      message: '刷新令牌成功',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登出
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // 从Redis中删除用户信息（可选，用于会话管理）
    await redisClient.del(`user:${userId}`);
    
    res.status(200).json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 验证邮箱
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      throw new BadRequestError('缺少验证令牌', 'MISSING_VERIFICATION_TOKEN');
    }
    
    // 验证令牌（这里简化处理，实际应该从数据库或Redis中获取验证令牌）
    // const user = await User.findOne({ where: { verificationToken: token } });
    // if (!user) {
    //   throw new BadRequestError('无效的验证令牌', 'INVALID_VERIFICATION_TOKEN');
    // }
    
    // if (user.verificationExpiresAt < new Date()) {
    //   throw new BadRequestError('验证令牌已过期', 'EXPIRED_VERIFICATION_TOKEN');
    // }
    
    // 更新用户状态
    // await user.update({
    //   isVerified: true,
    //   verificationToken: null,
    //   verificationExpiresAt: null,
    // });
    
    res.status(200).json({
      success: true,
      message: '邮箱验证成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 忘记密码
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new BadRequestError('邮箱不能为空', 'MISSING_EMAIL');
    }
    
    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // 出于安全考虑，不提示用户不存在
      return res.status(200).json({
        success: true,
        message: '重置密码邮件已发送，请查收',
      });
    }
    
    // 生成重置密码令牌（这里简化处理，实际应该发送邮件）
    // const resetToken = generateResetToken(user);
    
    res.status(200).json({
      success: true,
      message: '重置密码邮件已发送，请查收',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 重置密码
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw new BadRequestError('缺少重置密码令牌或新密码', 'MISSING_REQUIRED_FIELDS');
    }
    
    // 验证令牌（这里简化处理，实际应该从数据库或Redis中获取重置令牌）
    // const user = await User.findOne({ where: { resetPasswordToken: token } });
    // if (!user) {
    //   throw new BadRequestError('无效的重置密码令牌', 'INVALID_RESET_TOKEN');
    // }
    // 
    // if (user.resetPasswordExpiresAt < new Date()) {
    //   throw new BadRequestError('重置密码令牌已过期', 'EXPIRED_RESET_TOKEN');
    // }
    
    // 密码哈希
    // const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    // await user.update({
    //   passwordHash,
    //   resetPasswordToken: null,
    //   resetPasswordExpiresAt: null,
    // });
    
    res.status(200).json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 修改密码
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('当前密码和新密码不能为空', 'MISSING_REQUIRED_FIELDS');
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestError('当前密码错误', 'INVALID_CURRENT_PASSWORD');
    }
    
    // 密码哈希
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await user.update({
      passwordHash,
    });
    
    res.status(200).json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    next(error);
  }
};