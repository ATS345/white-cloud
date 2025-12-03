import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义GameCategory模型
const GameCategory = sequelize.define('GameCategory', {
  // 分类名称
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '分类名称不能为空'
      }
    }
  },
  // 分类描述
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  // 模型配置
  tableName: 'game_categories',
  timestamps: false // 分类表不需要时间戳
})

// 定义模型之间的关联
GameCategory.associate = (models) => {
  // 分类与游戏的多对多关联
  GameCategory.belongsToMany(models.Game, {
    through: 'game_category_relations',
    foreignKey: 'category_id',
    as: 'games'
  })
}

export default GameCategory