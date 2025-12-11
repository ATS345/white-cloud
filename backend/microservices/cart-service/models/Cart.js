// 购物车服务 - 购物车模型
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

// 定义购物车模型
class Cart extends Model {
  // 关联关系
  static associate(models) {
    // 一个购物车属于一个用户
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 一个购物车包含多个购物车商品项
    this.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

// 初始化购物车模型
Cart.init(
  {
    // 主键
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // 用户ID
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // 购物车总金额
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    // 商品数量
    totalItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_carts_user_id',
        fields: ['userId'],
      },
    ],
  }
);

export default Cart;
