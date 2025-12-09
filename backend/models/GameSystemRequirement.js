import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义GameSystemRequirement模型
const GameSystemRequirement = sequelize.define('GameSystemRequirement', {
  // 操作系统
  os: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '操作系统不能为空',
      },
    },
  },
  // 处理器
  processor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '处理器不能为空',
      },
    },
  },
  // 内存
  memory: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '内存不能为空',
      },
    },
  },
  // 显卡
  graphics: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '显卡不能为空',
      },
    },
  },
  // 存储
  storage: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '存储不能为空',
      },
    },
  },
  // 需求类型
  type: {
    type: DataTypes.ENUM('minimum', 'recommended'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '需求类型不能为空',
      },
    },
  },
  // 游戏ID，与Game模型关联
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'game_system_requirements',
  timestamps: false, // 系统需求表不需要时间戳
});

// 定义模型之间的关联
GameSystemRequirement.associate = (models) => {
  // 系统需求与游戏的多对一关联
  GameSystemRequirement.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE',
  });
};

export default GameSystemRequirement;
