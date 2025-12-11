import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义ReviewMedia模型
const ReviewMedia = sequelize.define('ReviewMedia', {
  // 媒体类型
  media_type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
    defaultValue: 'image',
  },
  // 媒体URL
  media_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '媒体URL不能为空',
      },
      isUrl: {
        msg: '请提供有效的媒体URL',
      },
    },
  },
  // 媒体缩略图URL
  thumbnail_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: '请提供有效的缩略图URL',
      },
    },
  },
  // 媒体文件名
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '媒体文件名不能为空',
      },
    },
  },
  // 媒体文件大小（字节）
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: '媒体文件大小必须大于0',
      },
    },
  },
  // 媒体文件类型
  file_mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '媒体文件类型不能为空',
      },
    },
  },
  // 评论ID，与Review模型关联
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // 回复ID，与ReviewReply模型关联
  reply_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // 用户ID，与User模型关联
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'review_media',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 评论ID索引
    { fields: ['review_id'], name: 'idx_review_media_review_id' },
    // 回复ID索引
    { fields: ['reply_id'], name: 'idx_review_media_reply_id' },
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_review_media_user_id' },
    // 媒体类型索引
    { fields: ['media_type'], name: 'idx_review_media_type' },
  ],
});

// 定义模型之间的关联
ReviewMedia.associate = (models) => {
  // 媒体附件与用户的多对一关联
  ReviewMedia.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  // 媒体附件与评论的多对一关联
  ReviewMedia.belongsTo(models.Review, {
    foreignKey: 'review_id',
    as: 'review',
    onDelete: 'CASCADE',
  });

  // 媒体附件与评论回复的多对一关联
  ReviewMedia.belongsTo(models.ReviewReply, {
    foreignKey: 'reply_id',
    as: 'reply',
    onDelete: 'CASCADE',
  });
};

export default ReviewMedia;
