// 游戏控制器入口文件 - 整合所有游戏相关控制器

// 导入拆分后的控制器
import { getGames, getGameById } from './game/gameListController.js'
import { getCategories, getTags, getGamesByCategory, getGamesByTag } from './game/categoryTagController.js'
import { launchGame, installGame, updateGame, getGameInstallationStatus, checkSystemRequirements } from './game/gameLaunchController.js'
import { syncGameData, getGameData, deleteGameData } from './game/gameDataController.js'
import { createGame, updateGameDetails, submitGameForReview, createGameVersion, createGameSystemRequirement } from './game/gameManagementController.js'

// 导出所有控制器函数
export {
  // 游戏列表相关
  getGames,
  getGameById,
  
  // 分类标签相关
  getCategories,
  getTags,
  getGamesByCategory,
  getGamesByTag,
  
  // 游戏启动相关
  launchGame,
  installGame,
  updateGame,
  getGameInstallationStatus,
  checkSystemRequirements,
  
  // 游戏数据相关
  syncGameData,
  getGameData,
  deleteGameData,
  
  // 游戏管理相关
  createGame,
  updateGameDetails,
  submitGameForReview,
  createGameVersion,
  createGameSystemRequirement
}