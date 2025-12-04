import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义GameLibrary模型
const GameLibrary = sequelize.define('GameLibrary', {
  // 购买日期
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // 最后游玩时间
  last_played_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  // 游玩时间（分钟）
  playtime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '游玩时间不能为负数'
      }
    }
  },
  // 是否已安装
  installed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // 是否需要更新
  needs_update: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // 安装状态
  installation_status: {
    type: DataTypes.ENUM('pending', 'downloading', 'installing', 'completed', 'failed'),
    allowNull: true,
    defaultValue: null
  },
  // 安装任务ID
  installation_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  // 已安装版本
  installed_version: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  // 最后更新时间
  last_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  // 模型配置
  tableName: 'game_library',
  timestamps: false,
  indexes: [
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_game_library_user_id' },
    // 游戏ID索引
    { fields: ['game_id'], name: 'idx_game_library_game_id' },
    // 联合唯一索引，确保一个用户只能拥有一个游戏一次
    { fields: ['user_id', 'game_id'], name: 'idx_game_library_user_game', unique: true }
  ]
})

// 定义模型之间的关联
GameLibrary.associate = (models) => {
  // 游戏库与用户的多对一关联
  GameLibrary.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  })
  
  // 游戏库与游戏的多对一关联
  GameLibrary.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE'
  })
}

export default GameLibrary