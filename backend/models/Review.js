import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义Review模型
const Review = sequelize.define('Review', {
  // 评分（1-5）
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: '评分必须至少为1星',
      },
      max: {
        args: [5],
        msg: '评分不能超过5星',
      },
    },
  },
  // 评价内容
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '评价内容不能为空',
      },
      len: {
        args: [10, 5000],
        msg: '评价内容长度必须在10到5000个字符之间',
      },
    },
  },
  // 用户ID，与User模型关联
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 游戏ID，与Game模型关联
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 游戏ID索引
    { fields: ['game_id'], name: 'idx_reviews_game_id' },
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_reviews_user_id' },
    // 评分索引
    { fields: ['rating'], name: 'idx_reviews_rating' },
    // 创建时间索引
    { fields: ['created_at'], name: 'idx_reviews_created_at' },
  ],
});

// 定义模型之间的关联
Review.associate = (models) => {
  // 评价与用户的多对一关联
  Review.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  // 评价与游戏的多对一关联
  Review.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE',
  });

  // 评价与评论回复的一对多关联
  Review.hasMany(models.ReviewReply, {
    foreignKey: 'review_id',
    as: 'replies',
    onDelete: 'CASCADE',
  });

  // 评价与媒体附件的一对多关联
  Review.hasMany(models.ReviewMedia, {
    foreignKey: 'review_id',
    as: 'media',
    onDelete: 'CASCADE',
  });
};

export default Review;
