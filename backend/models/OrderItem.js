import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义OrderItem模型
const OrderItem = sequelize.define('OrderItem', {
  // 购买价格
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '购买价格不能为负数'
      }
    }
  },
  // 购买数量
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: '购买数量至少为1'
      }
    }
  },
  // 订单ID，与Order模型关联
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // 游戏ID，与Game模型关联
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  // 模型配置
  tableName: 'order_items',
  timestamps: false
})

// 定义模型之间的关联
OrderItem.associate = (models) => {
  // 订单商品与订单的多对一关联
  OrderItem.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE'
  })
  
  // 订单商品与游戏的多对一关联
  OrderItem.belongsTo(models.Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE'
  })
}

export default OrderItem