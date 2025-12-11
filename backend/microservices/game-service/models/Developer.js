// 游戏服务 - 开发者模型
import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '../config/database.js';

const { sequelize } = sequelizeInstance;

class Developer extends Model {
  // 关联关系
  static associate(models) {
    // 开发者与游戏的一对多关系
    this.hasMany(models.Game, {
      foreignKey: 'developer_id',
      as: 'games',
      onDelete: 'CASCADE',
    });
  }
}

Developer.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  company_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bio: {
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
  tableName: 'developers',
  modelName: 'Developer',
  timestamps: true,
  underscored: true,
});

export default Developer;
