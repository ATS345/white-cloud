import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义GameData模型
const GameData = sequelize.define('GameData', {
  // 数据类型：存档、设置、进度等
  data_type: {
    type: DataTypes.ENUM('save_data', 'settings', 'progress'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '数据类型不能为空'
      }
    }
  },
  // 数据名称（例如：存档1、存档2、默认设置等）
  data_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '数据名称不能为空'
      }
    }
  },
  // 数据内容（JSON格式）
  data_content: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '数据内容不能为空'
      }
    }
  },
  // 数据大小（字节）
  data_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '数据大小不能为负数'
      }
    }
  },
  // 最后修改时间
  last_modified_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  // 模型配置
  tableName: 'game_data',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_game_data_user_id' },
    // 游戏ID索引
    { fields: ['game_id'], name: 'idx_game_data_game_id' },
    // 联合索引，用于快速查找特定用户特定游戏的数据
    { fields: ['user_id', 'game_id'], name: 'idx_game_data_user_game' }
  ]
})

// 定义模型之间的关联
GameData.associate = (models) => {
  // 游戏数据与用户的多对一关联
  GameData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  })
  
  // 游戏数据与游戏的多对一关联
  GameData.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE'
  })
}

export default GameData
