// 购物车服务 - 模型索引文件
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import { sequelize } from '../config/database.js';

// 导出模型
const models = {
  Cart,
  CartItem,
};

// 设置模型关联关系
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// 导出sequelize实例
models.sequelize = sequelize;

// 同步数据库模型
export const syncDatabase = async () => {
  try {
    await sequelize.sync({
      alter: true, // 自动修改表结构，保持数据
      logging: (msg) => {
        console.log(`[CART-SERVICE] 数据库同步: ${msg}`);
      },
    });
    console.log('[CART-SERVICE] 数据库模型同步完成');
  } catch (error) {
    console.error('[CART-SERVICE] 数据库模型同步失败:', error.message);
    process.exit(1);
  }
};

export default models;
