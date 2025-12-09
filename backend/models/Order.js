import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义Order模型
const Order = sequelize.define('Order', {
  // 订单总金额
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '订单总金额不能为负数',
      },
    },
  },
  // 订单状态
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  // 支付方式
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null,
  },
  // 交易ID
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null,
  },
  // 用户ID，与User模型关联
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_orders_user_id' },
    // 状态索引
    { fields: ['status'], name: 'idx_orders_status' },
    // 创建时间索引
    { fields: ['created_at'], name: 'idx_orders_created_at' },
  ],
});

// 定义模型之间的关联
Order.associate = (models) => {
  // 订单与用户的多对一关联
  Order.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  // 订单与订单商品的一对多关联
  Order.hasMany(models.OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE',
  });
};

export default Order;
