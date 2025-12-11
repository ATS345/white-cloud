// 游戏服务 - 游戏版本模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';
const sequelize = sequelizeInstance.sequelize;

class GameVersion extends Model {
  // 关联关系
  static associate(models) {
    // 游戏版本与游戏的多对一关系
    this.belongsTo(models.Game, {
      foreignKey: 'game_id',
      as: 'game',
      onDelete: 'CASCADE',
    });
  }
}

GameVersion.init({
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
  version_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  changelog: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  platform: {
    type: DataTypes.ENUM('windows', 'mac', 'linux'),
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
  tableName: 'game_versions',
  modelName: 'GameVersion',
  timestamps: true,
  underscored: true,
});

export default GameVersion;
