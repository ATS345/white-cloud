import { Op } from 'sequelize'
import models from '../../models/index.js'
import logger from '../../config/logger.js'
import {
  cacheQuery,
  generateGameListCacheKey,
  generateGameDetailCacheKey,
  CACHE_EXPIRY
} from '../../utils/cacheUtils.js'

// 从models中获取所有需要的模型
const { Game, GameCategory, GameTag, GameSystemRequirement, Developer } = models

/**
 * @swagger
 * /api/v1/games: 
 *   get:
 *     summary: 获取游戏列表
 *     description: 获取游戏列表，支持筛选、排序和分页
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 分类筛选
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 标签筛选
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           default: 0
 *         description: 最低价格
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           default: 1000
 *         description: 最高价格
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: release_date
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: desc
 *         description: 排序顺序
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: approved
 *         description: 游戏状态
 *     responses:
 *       200:
 *         description: 成功获取游戏列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 游戏列表获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Game'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGames = async (req, res) => {
  try {
    // 获取查询参数
    const {
      page = 1,
      limit = 20,
      search = '',
      categories = [],
      tags = [],
      minPrice = 0,
      maxPrice = 1000,
      sortBy = 'release_date',
      sortOrder = 'desc',
      status = 'approved' // 默认只显示已通过审核的游戏
    } = req.query

    // 处理多选参数，支持字符串数组或逗号分隔字符串
    const categoryArray = typeof categories === 'string' ? categories.split(',').filter(c => c) : categories
    const tagArray = typeof tags === 'string' ? tags.split(',').filter(t => t) : tags

    // 生成缓存键
    const cacheKey = generateGameListCacheKey({
      page,
      limit,
      search,
      categories: categoryArray,
      tags: tagArray,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      status
    })

    // 使用缓存查询
    const games = await cacheQuery(cacheKey, CACHE_EXPIRY.MEDIUM, async () => {
      // 构建查询条件
      const whereConditions = {
        status: status === 'all' ? { [Op.in]: ['pending', 'approved', 'rejected'] } : status
      }

      // 搜索条件
      if (search) {
        whereConditions.title = {
          [Op.iLike]: `%${search}%`
        }
      }

      // 价格范围
      whereConditions.price = {
        [Op.between]: [minPrice, maxPrice]
      }

      // 构建包含关联模型的查询
      const include = [
        {
          model: GameCategory,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        },
        {
          model: GameTag,
          as: 'tags',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]

      // 构建筛选条件 - 分类（支持多选）
      if (categoryArray.length > 0) {
        include[0].where = {
          name: { [Op.in]: categoryArray }
        }
      }

      // 构建筛选条件 - 标签（支持多选）
      if (tagArray.length > 0) {
        include[1].where = {
          name: { [Op.in]: tagArray }
        }
      }

      // 构建排序条件
      const order = [
        [sortBy, sortOrder]
      ]

      // 计算偏移量
      const offset = (page - 1) * limit

      // 查询游戏列表
      return await Game.findAndCountAll({
        where: whereConditions,
        include,
        order,
        limit: parseInt(limit),
        offset,
        distinct: true
      })
    })

    // 计算总页数
    const totalPages = Math.ceil(games.count / limit)

    // 返回响应
    res.status(200).json({
      success: true,
      message: '游戏列表获取成功',
      data: {
        games: games.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: games.count,
          totalPages
        }
      }
    })
  } catch (error) {
    logger.error('获取游戏列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败',
      error: error.message
    })
  }
}

/**
 * @swagger
 * /api/v1/games/{id}: 
 *   get:
 *     summary: 获取游戏详情
 *     description: 根据ID获取游戏详情，包含分类、标签、系统需求等信息
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 游戏ID
 *     responses:
 *       200:
 *         description: 成功获取游戏详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 游戏详情获取成功
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params

    // 生成缓存键
    const cacheKey = generateGameDetailCacheKey(id)

    // 使用缓存查询
    const game = await cacheQuery(cacheKey, CACHE_EXPIRY.LONG, async () => {
      // 查询游戏详情，包含关联模型
      return await Game.findByPk(id, {
        include: [
          {
            model: GameCategory,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name']
          },
          {
            model: GameTag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name']
          },
          {
            model: GameSystemRequirement,
            as: 'system_requirements',
            attributes: ['id', 'os', 'processor', 'memory', 'graphics', 'storage', 'type']
          },
          {
            model: Developer,
            attributes: ['id', 'name', 'description']
          }
        ]
      })
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    res.status(200).json({
      success: true,
      message: '游戏详情获取成功',
      data: game
    })
  } catch (error) {
    logger.error('获取游戏详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏详情失败',
      error: error.message
    })
  }
}