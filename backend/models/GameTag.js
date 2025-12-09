import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义GameTag模型
const GameTag = sequelize.define('GameTag', {
  // 标签名称
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '标签名称不能为空'
      }
    }
  }
}, {
  // 模型配置
  tableName: 'game_tags',
  timestamps: false, // 标签表不需要时间戳
  indexes: [
    // 名称索引，用于搜索
    { fields: ['name'], name: 'idx_game_tags_name' }
  ]
})

// 定义模型之间的关联
GameTag.associate = (models) => {
  // 标签与游戏的多对多关联
  GameTag.belongsToMany(models.Game, {
    through: 'game_tag_relations',
    foreignKey: 'tag_id',
    as: 'games'
  })
}

export default GameTag