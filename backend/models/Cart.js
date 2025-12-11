import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义Cart模型
const Cart = sequelize.define('Cart', {
  // 购物车项数量
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: '购物车项数量至少为1',
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
  tableName: 'carts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 用户ID索引
    { fields: ['user_id'], name: 'idx_carts_user_id' },
    // 游戏ID索引
    { fields: ['game_id'], name: 'idx_carts_game_id' },
    // 联合唯一索引，确保一个用户只能将一个游戏添加到购物车一次
    { fields: ['user_id', 'game_id'], name: 'idx_carts_user_game', unique: true },
  ],
});

// 定义模型之间的关联
Cart.associate = (models) => {
  // 购物车与用户的多对一关联
  Cart.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  // 购物车与游戏的多对一关联
  Cart.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE',
  });
};

export default Cart;
