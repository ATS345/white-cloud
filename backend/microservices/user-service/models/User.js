// 用户服务 - User模型
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../config/logger.js';

// User模型定义
const User = sequelize.define('User', {
  // 基本信息
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID',
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '用户名不能为空',
      },
      len: {
        args: [3, 50],
        msg: '用户名长度必须在3到50个字符之间',
      },
    },
    comment: '用户名',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '邮箱不能为空',
      },
      isEmail: {
        msg: '邮箱格式不正确',
      },
    },
    comment: '用户邮箱',
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
    comment: '密码哈希',
  },
  role: {
    type: DataTypes.ENUM('user', 'developer', 'admin'),
    allowNull: false,
    defaultValue: 'user',
    comment: '用户角色',
  },
  // 个人信息
  avatarUrl: {
    type: DataTypes.STRING(255),
    field: 'avatar_url',
    allowNull: true,
    comment: '头像URL',
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '昵称',
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
    comment: '性别',
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '生日',
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '所在地',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '个人简介',
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '个人网站',
  },
  // 认证信息
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_verified',
    comment: '是否已验证邮箱',
  },
  verificationToken: {
    type: DataTypes.STRING(255),
    field: 'verification_token',
    allowNull: true,
    comment: '验证令牌',
  },
  verificationExpiresAt: {
    type: DataTypes.DATE,
    field: 'verification_expires_at',
    allowNull: true,
    comment: '验证令牌过期时间',
  },
  // 安全信息
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    field: 'reset_password_token',
    allowNull: true,
    comment: '重置密码令牌',
  },
  resetPasswordExpiresAt: {
    type: DataTypes.DATE,
    field: 'reset_password_expires_at',
    allowNull: true,
    comment: '重置密码令牌过期时间',
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at',
    allowNull: true,
    comment: '最后登录时间',
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'failed_login_attempts',
    comment: '登录失败尝试次数',
  },
  lockedUntil: {
    type: DataTypes.DATE,
    field: 'locked_until',
    allowNull: true,
    comment: '账户锁定截止时间',
  },
  // 状态信息
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'banned'),
    allowNull: false,
    defaultValue: 'active',
    comment: '账户状态',
  },
  // 时间戳
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at',
    comment: '删除时间',
  },
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['username'] },
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ],
  hooks: {
    beforeCreate: (user) => {
      logger.info(`[USER] 创建新用户: ${user.username} (${user.email})`);
    },
    beforeUpdate: (user) => {
      logger.info(`[USER] 更新用户: ${user.id} - ${user.username}`);
    },
    beforeDestroy: (user) => {
      logger.info(`[USER] 删除用户: ${user.id} - ${user.username}`);
    },
  },
});

// 模型同步
const syncUserModel = async () => {
  try {
    logger.info('[DATABASE] 开始同步User模型...');
    await User.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('[DATABASE] User模型同步成功');
  } catch (error) {
    logger.error('[DATABASE] User模型同步失败:', error);
    logger.error('[DATABASE] 错误堆栈:', error.stack);
    throw error;
  }
};

// 导出模型和同步函数
export { User, syncUserModel };
export default User;
