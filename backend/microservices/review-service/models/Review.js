// 评论模型 - 定义评价的数据库表结构
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * 评论模型类
 */
class Review extends Model {
  /**
   * 初始化模型
   */
  static init(sequelize) {
    super.init(
      {
        // 主键ID
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
          unique: true
        },
        // 用户ID
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          comment: '评论用户ID'
        },
        // 游戏ID
        gameId: {
          type: DataTypes.UUID,
          allowNull: false,
          comment: '游戏ID'
        },
        // 游戏标题（冗余字段，方便查询）
        gameTitle: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '游戏标题'
        },
        // 评分（1-5星）
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 5
          },
          comment: '评分（1-5星）'
        },
        // 评论内容
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            len: [1, 1000]
          },
          comment: '评论内容'
        },
        // 评论状态
        status: {
          type: DataTypes.ENUM('APPROVED', 'PENDING', 'REJECTED'),
          defaultValue: 'APPROVED',
          allowNull: false,
          comment: '评论状态'
        },
        // 点赞数量
        likes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: '点赞数量'
        },
        // 踩数量
        dislikes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: '踩数量'
        },
        // 回复数量
        replyCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: '回复数量'
        },
        // 审核备注
        reviewNote: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '审核备注'
        },
        // 父评论ID（用于回复）
        parentId: {
          type: DataTypes.UUID,
          allowNull: true,
          defaultValue: null,
          comment: '父评论ID（用于回复）'
        },
        // 创建时间
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
          comment: '创建时间'
        },
        // 更新时间
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
          comment: '更新时间'
        },
        // 删除时间
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          comment: '删除时间'
        }
      },
      {
        sequelize,
        tableName: 'reviews',
        modelName: 'Review',
        timestamps: true,
        paranoid: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    );

    // 建立自关联（回复关系）
    Review.hasMany(Review, {
      foreignKey: 'parentId',
      as: 'replies',
      onDelete: 'CASCADE'
    });

    Review.belongsTo(Review, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE'
    });

    return this;
  }
}

// 初始化模型
Review.init(sequelize);

// 导出模型
export default Review;
