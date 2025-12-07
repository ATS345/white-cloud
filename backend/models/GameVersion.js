import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义GameVersion模型
const GameVersion = sequelize.define('GameVersion', {
  // 版本号
  version_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '版本号不能为空'
      }
    }
  },
  // 发布日期
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // 更新日志
  changelog: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 文件URL
  file_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '文件URL不能为空'
      }
    }
  },
  // 文件大小
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '文件大小不能为负数'
      }
    }
  },
  // 平台
  platform: {
    type: DataTypes.ENUM('windows', 'mac', 'linux'),
    allowNull: false
  },
  // 游戏ID，与Game模型关联
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  // 模型配置
  tableName: 'game_versions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 游戏ID索引
    { fields: ['game_id'], name: 'idx_game_versions_game_id' },
    // 平台索引
    { fields: ['platform'], name: 'idx_game_versions_platform' }
  ]
})

// 定义模型之间的关联
GameVersion.associate = (models) => {
  // 游戏版本与游戏的多对一关联
  GameVersion.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE'
  })
}

export default GameVersion