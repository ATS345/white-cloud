// 游戏服务 - 游戏系统需求模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';
const sequelize = sequelizeInstance.sequelize;

class GameSystemRequirement extends Model {
  // 关联关系
  static associate(models) {
    // 游戏系统需求与游戏的多对一关系
    this.belongsTo(models.Game, {
      foreignKey: 'game_id',
      as: 'game',
      onDelete: 'CASCADE',
    });
  }
}

GameSystemRequirement.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  type: {
    type: DataTypes.ENUM('minimum', 'recommended'),
    allowNull: false,
    defaultValue: 'minimum',
  },
  os: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  processor: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  memory: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  graphics: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  storage: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'game_system_requirements',
  modelName: 'GameSystemRequirement',
  timestamps: true,
  underscored: true,
});

export default GameSystemRequirement;
