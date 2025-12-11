// 游戏服务 - 游戏模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';

const { sequelize } = sequelizeInstance;

class Game extends Model {
  // 关联关系
  static associate(models) {
    // 游戏与游戏分类的多对多关系
    this.belongsToMany(models.GameCategory, {
      through: 'game_category_game',
      foreignKey: 'game_id',
      otherKey: 'category_id',
      as: 'categories',
    });

    // 游戏与游戏标签的多对多关系
    this.belongsToMany(models.GameTag, {
      through: 'game_tag_game',
      foreignKey: 'game_id',
      otherKey: 'tag_id',
      as: 'tags',
    });

    // 游戏与游戏版本的一对多关系
    this.hasMany(models.GameVersion, {
      foreignKey: 'game_id',
      as: 'versions',
      onDelete: 'CASCADE',
    });

    // 游戏与游戏系统需求的一对多关系
    this.hasMany(models.GameSystemRequirement, {
      foreignKey: 'game_id',
      as: 'systemRequirements',
      onDelete: 'CASCADE',
    });

    // 游戏与开发者的多对一关系
    this.belongsTo(models.Developer, {
      foreignKey: 'developer_id',
      as: 'developer',
    });
  }
}

Game.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  developer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'developers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  main_image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  executable_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  launch_parameters: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  latest_version: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  download_url: {
    type: DataTypes.STRING(255),
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
  tableName: 'games',
  modelName: 'Game',
  timestamps: true,
  underscored: true,
});

export default Game;
