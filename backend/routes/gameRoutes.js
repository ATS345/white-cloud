import express from 'express';
import {
  getGames,
  getGameById,
  getCategories,
  getTags,
  getGamesByCategory,
  getGamesByTag,
  launchGame,
  installGame,
  updateGame,
  getGameInstallationStatus,
  checkSystemRequirements,
  syncGameData,
  getGameData,
  deleteGameData,
  createGame,
  updateGameDetails,
  submitGameForReview,
  createGameVersion,
  createGameSystemRequirement,
} from '../controllers/gameController.js';
import { authenticate, isDeveloper } from '../middleware/auth.js';
import {
  validateCreateGame,
  validateUpdateGame,
  validateCreateGameVersion,
  validateCreateSystemRequirement,
  validateSyncGameData,
  validateCheckSystemRequirements,
  validateGetGames,
  validateGameId,
  validateInstallationStatus,
} from '../validators/gameValidator.js';
import { handleValidationErrors } from '../middleware/validationHandler.js';

// 创建路由器
const router = express.Router();

// 游戏列表路由 - 支持筛选、排序和分页
router.get('/', validateGetGames, handleValidationErrors, getGames);

// 游戏详情路由
router.get('/:id', validateGameId, handleValidationErrors, getGameById);

// 所有游戏分类路由
router.get('/categories/all', getCategories);

// 所有游戏标签路由
router.get('/tags/all', getTags);

// 按分类获取游戏路由
router.get('/categories/:categoryName', getGamesByCategory);

// 按标签获取游戏路由
router.get('/tags/:tagName', getGamesByTag);

// 游戏启动路由
router.post('/:gameId/launch', authenticate, launchGame);

// 游戏安装路由
router.post('/:gameId/install', authenticate, installGame);

// 游戏更新路由
router.post('/:gameId/update', authenticate, updateGame);

// 查询安装状态路由
router.get('/installation/:installationId', validateInstallationStatus, handleValidationErrors, getGameInstallationStatus);

// 系统需求检测路由
router.post('/:gameId/check-system', validateCheckSystemRequirements, handleValidationErrors, checkSystemRequirements);

// 游戏数据同步路由
router.post('/:gameId/sync', authenticate, validateSyncGameData, handleValidationErrors, syncGameData);

// 获取游戏数据路由
router.get('/:gameId/data', authenticate, getGameData);

// 删除游戏数据路由
router.delete('/:gameId/data/:dataId', authenticate, deleteGameData);

// 游戏发布管理路由
router.post('/create', authenticate, isDeveloper, validateCreateGame, handleValidationErrors, createGame); // 创建游戏
router.put('/:id', authenticate, isDeveloper, validateUpdateGame, handleValidationErrors, updateGameDetails); // 更新游戏
router.post('/:id/submit-review', authenticate, isDeveloper, submitGameForReview); // 提交游戏审核
router.post('/:id/versions', authenticate, isDeveloper, validateCreateGameVersion, handleValidationErrors, createGameVersion); // 创建游戏版本
router.post('/:id/system-requirements', authenticate, isDeveloper, validateCreateSystemRequirement, handleValidationErrors, createGameSystemRequirement); // 创建游戏系统需求

export default router;
