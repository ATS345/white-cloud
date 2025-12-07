// 测试脚本，用于调试模型关联问题
import sequelize from './config/database.js'

// 导入模型
import User from './models/User.js'
import Game from './models/Game.js'
import GameLibrary from './models/GameLibrary.js'

// 测试模型是否正确初始化
console.log('Testing model initialization...')
console.log('User model:', User)
console.log('Game model:', Game)
console.log('GameLibrary model:', GameLibrary)

// 测试模型关联
console.log('\nTesting model associations...')
try {
  // 手动建立关联
  User.hasMany(GameLibrary, {
    foreignKey: 'user_id',
    as: 'library',
    onDelete: 'CASCADE'
  })
  
  Game.hasMany(GameLibrary, {
    foreignKey: 'game_id',
    as: 'library_entries',
    onDelete: 'CASCADE'
  })
  
  GameLibrary.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  })
  
  GameLibrary.belongsTo(Game, {
    foreignKey: 'game_id',
    as: 'game',
    onDelete: 'CASCADE'
  })
  
  console.log('Model associations established successfully!')
} catch (error) {
  console.error('Error establishing model associations:', error)
  console.error('Error stack:', error.stack)
}
