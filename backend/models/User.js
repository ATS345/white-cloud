import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义User模型
const User = sequelize.define('User', {
  // 用户名
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
  },
  // 邮箱
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '邮箱不能为空',
      },
      isEmail: {
        msg: '请输入有效的邮箱地址',
      },
    },
  },
  // 密码哈希
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '密码不能为空',
      },
      len: {
        args: [6, 255],
        msg: '密码长度必须至少为6个字符',
      },
    },
  },
  // 头像URL
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  // 角色
  role: {
    type: DataTypes.ENUM('user', 'developer', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  // 模型配置
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // 在创建用户前进行的操作
    beforeCreate: () => {
      // 可以在这里添加额外的逻辑，比如生成默认头像等
    },
  },
});

// 定义模型之间的关联
User.associate = (models) => {
  // 用户与开发者的一对一关联
  User.hasOne(models.Developer, {
    foreignKey: 'user_id',
    as: 'developer',
    onDelete: 'CASCADE',
  });

  // 用户与游戏库的一对多关联
  User.hasMany(models.GameLibrary, {
    foreignKey: 'user_id',
    as: 'library',
    onDelete: 'CASCADE',
  });

  // 用户与评价的一对多关联
  User.hasMany(models.Review, {
    foreignKey: 'user_id',
    as: 'reviews',
    onDelete: 'CASCADE',
  });

  // 用户与订单的一对多关联
  User.hasMany(models.Order, {
    foreignKey: 'user_id',
    as: 'orders',
    onDelete: 'CASCADE',
  });
};

export default User;
