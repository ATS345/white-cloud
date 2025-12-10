import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 注册新用户
 *     description: 注册新用户，支持普通用户和开发者角色
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱
 *               password:
 *                 type: string
 *                 description: 用户密码
 *               role:
 *                 type: string
 *                 description: 用户角色（user或developer）
 *                 default: user
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: 用户注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 用户注册成功
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = 'user',
    } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码是必填项',
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被注册',
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册',
      });
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role,
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // 返回响应
    return res.status(201).json({
      success: true,
      message: '用户注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logger.error('注册错误:', error);
    return res.status(500).json({
      success: false,
      message: '注册过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 用户登录获取JWT令牌
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: 邮箱或密码不正确
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码是必填项',
      });
    }

    // 查找用户
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确',
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确',
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // 返回响应
    return res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.error('登录错误:', error);
    return res.status(500).json({
      success: false,
      message: '登录过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的详细信息
 *     tags: [Authentication]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getCurrentUser = async (req, res) => {
  try {
    // 从请求对象获取用户信息
    const { user } = req;

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('获取用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户信息过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: 更新用户信息
 *     description: 更新当前登录用户的个人信息
 *     tags: [Authentication]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱
 *               avatar_url:
 *                 type: string
 *                 description: 用户头像URL
 *     responses:
 *       200:
 *         description: 用户信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 用户信息更新成功
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      username,
      email,
      avatar_url,
    } = req.body;

    // 查找用户
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 更新用户名（如果提供且不同）
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUsername = await User.findOne({
        where: { username },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被注册',
        });
      }

      user.username = username;
    }

    // 更新邮箱（如果提供且不同）
    if (email && email !== user.email) {
      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册',
        });
      }

      user.email = email;
    }

    // 更新头像URL（如果提供）
    if (avatar_url) {
      user.avatar_url = avatar_url;
    }

    // 保存更新
    await user.save();

    // 返回响应
    return res.status(200).json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('更新用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新用户信息过程中发生错误',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/password:
 *   put:
 *     summary: 修改密码
 *     description: 修改当前登录用户的密码
 *     tags: [Authentication]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 当前密码
 *               newPassword:
 *                 type: string
 *                 description: 新密码
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 密码修改成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      currentPassword,
      newPassword,
    } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码和新密码是必填项',
      });
    }

    // 查找用户
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码不正确',
      });
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // 更新密码
    user.password_hash = password_hash;
    await user.save();

    // 返回响应
    return res.status(200).json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    logger.error('修改密码错误:', error);
    return res.status(500).json({
      success: false,
      message: '修改密码过程中发生错误',
      error: error.message,
    });
  }
};
