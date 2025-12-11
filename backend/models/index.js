import sequelize from '../config/database.js';

// 导入所有模型
import User from './User.js';
import Game from './Game.js';
import GameCategory from './GameCategory.js';
import GameTag from './GameTag.js';
import GameVersion from './GameVersion.js';
import GameSystemRequirement from './GameSystemRequirement.js';
import Review from './Review.js';
import ReviewReply from './ReviewReply.js';
import ReviewMedia from './ReviewMedia.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Developer from './Developer.js';
import DeveloperFinance from './DeveloperFinance.js';
import WithdrawalRequest from './WithdrawalRequest.js';
import GameLibrary from './GameLibrary.js';
import Cart from './Cart.js';

// 模型集合
const models = {
  User,
  Game,
  GameCategory,
  GameTag,
  GameVersion,
  GameSystemRequirement,
  Review,
  ReviewReply,
  ReviewMedia,
  Order,
  OrderItem,
  Developer,
  DeveloperFinance,
  WithdrawalRequest,
  GameLibrary,
  Cart,
};

// 初始化所有模型的关联关系
// 手动按顺序调用associate方法，确保依赖关系正确
if (models.User.associate) {
  models.User.associate(models);
}
if (models.Game.associate) {
  models.Game.associate(models);
}
if (models.GameCategory.associate) {
  models.GameCategory.associate(models);
}
if (models.GameTag.associate) {
  models.GameTag.associate(models);
}
if (models.GameVersion.associate) {
  models.GameVersion.associate(models);
}
if (models.GameSystemRequirement.associate) {
  models.GameSystemRequirement.associate(models);
}
if (models.Review.associate) {
  models.Review.associate(models);
}
if (models.ReviewReply.associate) {
  models.ReviewReply.associate(models);
}
if (models.Order.associate) {
  models.Order.associate(models);
}
if (models.OrderItem.associate) {
  models.OrderItem.associate(models);
}
if (models.Developer.associate) {
  models.Developer.associate(models);
}
if (models.DeveloperFinance.associate) {
  models.DeveloperFinance.associate(models);
}
if (models.WithdrawalRequest.associate) {
  models.WithdrawalRequest.associate(models);
}
if (models.GameLibrary.associate) {
  models.GameLibrary.associate(models);
}
if (models.Cart.associate) {
  models.Cart.associate(models);
}
if (models.ReviewMedia.associate) {
  models.ReviewMedia.associate(models);
}

// 同步模型到数据库
const syncModels = async () => {
  try {
    // 仅在开发环境下使用force: true，生产环境不要使用
    await sequelize.sync({ force: false });
  } catch (error) {
    // 不要抛出错误，让服务器继续运行
  }
};

// 导出模型和同步函数
export {
  syncModels,
};

export default models;
