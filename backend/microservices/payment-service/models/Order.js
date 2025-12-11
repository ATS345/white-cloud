// 支付服务 - 订单模型
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 订单模型定义
const Order = sequelize.define('Order', {
  // 基本信息
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID',
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'order_number',
    comment: '订单编号',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    comment: '订单总金额',
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '订单状态',
  },
  paymentMethod: {
    type: DataTypes.ENUM('alipay', 'wechat', 'credit_card', 'paypal'),
    allowNull: true,
    field: 'payment_method',
    comment: '支付方式',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status',
    comment: '支付状态',
  },
  // 游戏信息
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'game_id',
    comment: '游戏ID',
  },
  gameTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'game_title',
    comment: '游戏标题',
  },
  gamePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'game_price',
    comment: '游戏价格',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '购买数量',
  },
  // 支付信息
  paymentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'payment_id',
    comment: '支付ID',
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'transaction_id',
    comment: '交易ID',
  },
  paymentTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'payment_time',
    comment: '支付时间',
  },
  // 退款信息
  refundId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'refund_id',
    comment: '退款ID',
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'refund_amount',
    comment: '退款金额',
  },
  refundStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    allowNull: true,
    field: 'refund_status',
    comment: '退款状态',
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refund_reason',
    comment: '退款原因',
  },
  refundTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refund_time',
    comment: '退款时间',
  },
  // 用户信息
  userName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'user_name',
    comment: '用户名',
  },
  userEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'user_email',
    comment: '用户邮箱',
  },
  // 地址信息
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'shipping_address',
    comment: '收货地址',
  },
  // 备注
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '订单备注',
  },
  // 时间戳
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at',
    comment: '删除时间',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['order_number'] },
    { fields: ['user_id'] },
    { fields: ['game_id'] },
    { fields: ['status'] },
    { fields: ['payment_status'] },
    { fields: ['created_at'] },
  ],
});

export default Order;
