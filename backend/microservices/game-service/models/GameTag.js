// 游戏服务 - 游戏标签模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';
const sequelize = sequelizeInstance.sequelize;

class GameTag extends Model {
  // 关联关系
  static associate(models) {
    // 游戏标签与游戏的多对多关系
    this.belongsToMany(models.Game, {
      through: 'game_tag_game',
      foreignKey: 'tag_id',
      otherKey: 'game_id',
      as: 'games',
    });
  }
}

GameTag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
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
  tableName: 'game_tags',
  modelName: 'GameTag',
  timestamps: true,
  underscored: true,
});

export default GameTag;
