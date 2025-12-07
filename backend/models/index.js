import sequelize from '../config/database.js'

// 导入所有模型
import User from './User.js'
import Game from './Game.js'
import GameCategory from './GameCategory.js'
import GameTag from './GameTag.js'
import GameVersion from './GameVersion.js'
import GameSystemRequirement from './GameSystemRequirement.js'
import Review from './Review.js'
import ReviewReply from './ReviewReply.js'
import Order from './Order.js'
import OrderItem from './OrderItem.js'
import Developer from './Developer.js'
import DeveloperFinance from './DeveloperFinance.js'
import WithdrawalRequest from './WithdrawalRequest.js'
import GameLibrary from './GameLibrary.js'

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
  Order,
  OrderItem,
  Developer,
  DeveloperFinance,
  WithdrawalRequest,
  GameLibrary
}

// 初始化所有模型的关联关系
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

// 同步模型到数据库
const syncModels = async () => {
  try {
    // 仅在开发环境下使用force: true，生产环境不要使用
    await sequelize.sync({ force: false })
    console.log('数据库模型同步成功')
  } catch (error) {
    console.error('数据库模型同步失败:', error)
  }
}

// 导出模型和同步函数
export {
  syncModels
}

export default models