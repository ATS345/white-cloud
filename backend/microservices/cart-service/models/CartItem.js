// 购物车服务 - 购物车商品项模型
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

// 定义购物车商品项模型
class CartItem extends Model {
  // 关联关系
  static associate(models) {
    // 一个购物车商品项属于一个购物车
    this.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

// 初始化购物车商品项模型
CartItem.init(
  {
    // 主键
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // 购物车ID
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Carts',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // 游戏ID
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Games',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // 游戏名称
    gameName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // 游戏价格
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // 商品数量
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: '商品数量不能小于1',
        },
      },
    },
    // 商品总价
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // 游戏图片URL
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        name: 'idx_cart_items_cart_id',
        fields: ['cartId'],
      },
      {
        name: 'idx_cart_items_game_id',
        fields: ['gameId'],
      },
      {
        name: 'idx_cart_items_cart_game',
        fields: ['cartId', 'gameId'],
        unique: true,
      },
    ],
    // 钩子函数：在创建或更新前计算subtotal
    hooks: {
      beforeCreate: (cartItem) => {
        cartItem.subtotal = parseFloat(cartItem.price) * parseInt(cartItem.quantity);
      },
      beforeUpdate: (cartItem) => {
        cartItem.subtotal = parseFloat(cartItem.price) * parseInt(cartItem.quantity);
      },
    },
  }
);

export default CartItem;
