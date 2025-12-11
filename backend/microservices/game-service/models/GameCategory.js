// 游戏服务 - 游戏分类模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';

const { sequelize } = sequelizeInstance;

class GameCategory extends Model {
  // 关联关系
  static associate(models) {
    // 游戏分类与游戏的多对多关系
    this.belongsToMany(models.Game, {
      through: 'game_category_game',
      foreignKey: 'category_id',
      otherKey: 'game_id',
      as: 'games',
    });
  }
}

GameCategory.init({
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  tableName: 'game_categories',
  modelName: 'GameCategory',
  timestamps: true,
  underscored: true,
});

export default GameCategory;
