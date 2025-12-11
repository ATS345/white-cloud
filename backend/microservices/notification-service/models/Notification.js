// 通知模型 - 定义通知的数据库表结构
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * 通知模型类
 */
class Notification extends Model {
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
          unique: true,
        },
        // 用户ID
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          comment: '接收通知的用户ID',
        },
        // 通知类型
        type: {
          type: DataTypes.ENUM('PAYMENT_CONFIRMATION', 'ORDER_STATUS', 'GAME_UPDATE', 'SYSTEM_NOTICE', 'REVIEW_REPLY'),
          allowNull: false,
          comment: '通知类型',
        },
        // 通知标题
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '通知标题',
        },
        // 通知内容
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '通知内容',
        },
        // 通知状态
        status: {
          type: DataTypes.ENUM('UNREAD', 'READ', 'DELETED'),
          defaultValue: 'UNREAD',
          allowNull: false,
          comment: '通知状态',
        },
        // 关联ID（如订单ID、评论ID等）
        referenceId: {
          type: DataTypes.UUID,
          allowNull: true,
          comment: '关联ID（如订单ID、评论ID等）',
        },
        // 关联数据
        referenceData: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '关联数据，存储额外的结构化信息',
        },
        // 跳转链接
        url: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '通知点击后跳转的链接',
        },
        // 创建时间
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
          comment: '创建时间',
        },
        // 更新时间
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
          comment: '更新时间',
        },
        // 删除时间
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          comment: '删除时间',
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        modelName: 'Notification',
        timestamps: true,
        paranoid: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    return this;
  }
}

// 初始化模型
Notification.init(sequelize);

// 导出模型
export default Notification;
