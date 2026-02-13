import express from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 优化：使用Map存储用户，提高查找性能
const usersMap = new Map<number, any>();
const emailToIdMap = new Map<string, number>();
const usernameToIdMap = new Map<string, number>();
let nextUserId = 1;

// 密码哈希配置
const BCRYPT_SALT_ROUNDS = 12; // 增加哈希强度

// JWT配置
const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const jwtOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN as any
};

// 输入验证函数
const validateRegisterInput = (req: express.Request, res: express.Response) => {
  const { username, email, password } = req.body;

  // 基本验证
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // 用户名验证
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  // 邮箱验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // 密码验证
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // 检查邮箱是否已注册
  if (emailToIdMap.has(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // 检查用户名是否已被使用
  if (usernameToIdMap.has(username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  return null;
};

const validateLoginInput = (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  return null;
};

const validateChangePasswordInput = (req: express.Request, res: express.Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  return null;
};

// Register route
router.post('/register', async (req, res) => {
  // 验证输入
  const validationError = validateRegisterInput(req, res);
  if (validationError) {
    return validationError;
  }

  const { username, email, password } = req.body;

  try {
    // 哈希密码
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 创建新用户
    const newUser = {
      id: nextUserId++,
      username,
      email,
      passwordHash,
      avatar: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 存储用户到Map中
    usersMap.set(newUser.id, newUser);
    emailToIdMap.set(email, newUser.id);
    usernameToIdMap.set(username, newUser.id);

    // 生成JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      jwtOptions
    );

    // 优化：移除敏感信息
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      ...userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  // 验证输入
  const validationError = validateLoginInput(req, res);
  if (validationError) {
    return validationError;
  }

  const { email, password } = req.body;

  try {
    // 优化：使用Map快速查找
    const userId = emailToIdMap.get(email);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = usersMap.get(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 检查密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      jwtOptions
    );

    // 移除敏感信息
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      ...userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user route
router.get('/me', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 优化：使用Map快速查找
    const user = usersMap.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 移除敏感信息
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user route
router.put('/update', authMiddleware, (req, res) => {
  const { username, bio, avatar } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 优化：使用Map快速查找
    const user = usersMap.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 检查用户名是否已被使用
    if (username && username !== user.username && usernameToIdMap.has(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // 更新用户
    const updatedUser = {
      ...user,
      username: username || user.username,
      bio: bio || user.bio,
      avatar: avatar || user.avatar,
      updatedAt: new Date().toISOString()
    };

    // 更新Map
    usersMap.set(userId, updatedUser);
    
    // 如果用户名变更，更新usernameToIdMap
    if (username && username !== user.username) {
      usernameToIdMap.delete(user.username);
      usernameToIdMap.set(username, userId);
    }

    // 移除敏感信息
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password route
router.put('/change-password', authMiddleware, async (req, res) => {
  // 验证输入
  const validationError = validateChangePasswordInput(req, res);
  if (validationError) {
    return validationError;
  }

  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 优化：使用Map快速查找
    const user = usersMap.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 检查旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // 哈希新密码
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // 更新密码
    const updatedUser = {
      ...user,
      passwordHash: newPasswordHash,
      updatedAt: new Date().toISOString()
    };

    // 更新Map
    usersMap.set(userId, updatedUser);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;