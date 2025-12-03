import express from 'express'
import {
  getGames,
  getGameById,
  getCategories,
  getTags,
  getGamesByCategory,
  getGamesByTag
} from '../controllers/gameController.js'

// 创建路由器
const router = express.Router()

// 游戏列表路由 - 支持筛选、排序和分页
router.get('/', getGames)

// 游戏详情路由
router.get('/:id', getGameById)

// 所有游戏分类路由
router.get('/categories/all', getCategories)

// 所有游戏标签路由
router.get('/tags/all', getTags)

// 按分类获取游戏路由
router.get('/categories/:categoryName', getGamesByCategory)

// 按标签获取游戏路由
router.get('/tags/:tagName', getGamesByTag)

export default router