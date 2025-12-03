import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义ReviewReply模型
const ReviewReply = sequelize.define('ReviewReply', {
  // 回复内容
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '回复内容不能为空'
      },
      len: {
        args: [5, 1000],
        msg: '回复内容长度必须在5到1000个字符之间'
      }
    }
  }
}, {
  // 模型配置
  tableName: 'review_replies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 评论ID索引
    { fields: ['review_id'], name: 'idx_review_replies_review_id' },
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_review_replies_user_id' },
    // 创建时间索引
    { fields: ['created_at'], name: 'idx_review_replies_created_at' }
  ]
})

// 定义模型之间的关联
ReviewReply.associate = (models) => {
  // 回复与用户的多对一关联
  ReviewReply.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  })
  
  // 回复与评论的多对一关联
  ReviewReply.belongsTo(models.Review, {
    foreignKey: 'review_id',
    as: 'review',
    onDelete: 'CASCADE'
  })
}

export default ReviewReply