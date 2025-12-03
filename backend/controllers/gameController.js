import { Op } from 'sequelize'
import Game from '../models/Game.js'
import GameCategory from '../models/GameCategory.js'
import GameTag from '../models/GameTag.js'
import GameVersion from '../models/GameVersion.js'
import GameSystemRequirement from '../models/GameSystemRequirement.js'

// 获取游戏列表 - 支持筛选、排序和分页
export const getGames = async (req, res) => {
  try {
    // 获取查询参数
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      tag = '',
      minPrice = 0,
      maxPrice = 1000,
      sortBy = 'release_date',
      sortOrder = 'desc',
      status = 'approved' // 默认只显示已通过审核的游戏
    } = req.query

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

    // 构建筛选条件 - 分类
    if (category) {
      include[0].where = {
        name: category
      }
    }

    // 构建筛选条件 - 标签
    if (tag) {
      include[1].where = {
        name: tag
      }
    }

    // 构建排序条件
    const order = [
      [sortBy, sortOrder]
    ]

    // 计算偏移量
    const offset = (page - 1) * limit

    // 查询游戏列表
    const games = await Game.findAndCountAll({
      where: whereConditions,
      include,
      order,
      limit: parseInt(limit),
      offset,
      distinct: true
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
    console.error('获取游戏列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败',
      error: error.message
    })
  }
}

// 获取游戏详情
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params

    // 查询游戏详情，包含关联模型
    const game = await Game.findByPk(id, {
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
          model: GameVersion,
          as: 'versions',
          attributes: ['id', 'version_number', 'release_date', 'platform', 'file_size'],
          order: [['release_date', 'desc']]
        },
        {
          model: GameSystemRequirement,
          as: 'system_requirements',
          attributes: ['id', 'os', 'processor', 'memory', 'graphics', 'storage', 'type']
        }
      ]
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
    console.error('获取游戏详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏详情失败',
      error: error.message
    })
  }
}

// 获取所有游戏分类
export const getCategories = async (req, res) => {
  try {
    const categories = await GameCategory.findAll({
      attributes: ['id', 'name', 'description']
    })

    res.status(200).json({
      success: true,
      message: '游戏分类获取成功',
      data: categories
    })
  } catch (error) {
    console.error('获取游戏分类错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏分类失败',
      error: error.message
    })
  }
}

// 获取所有游戏标签
export const getTags = async (req, res) => {
  try {
    const tags = await GameTag.findAll({
      attributes: ['id', 'name']
    })

    res.status(200).json({
      success: true,
      message: '游戏标签获取成功',
      data: tags
    })
  } catch (error) {
    console.error('获取游戏标签错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏标签失败',
      error: error.message
    })
  }
}

// 按分类获取游戏
export const getGamesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params
    const { page = 1, limit = 20 } = req.query

    // 查找分类
    const category = await GameCategory.findOne({
      where: { name: categoryName }
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取该分类下的游戏
    const games = await category.getGames({
      where: {
        status: 'approved'
      },
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
        }
      ],
      limit: parseInt(limit),
      offset,
      distinct: true
    })

    res.status(200).json({
      success: true,
      message: `获取${categoryName}分类下的游戏成功`,
      data: games
    })
  } catch (error) {
    console.error('按分类获取游戏错误:', error)
    res.status(500).json({
      success: false,
      message: '按分类获取游戏失败',
      error: error.message
    })
  }
}

// 按标签获取游戏
export const getGamesByTag = async (req, res) => {
  try {
    const { tagName } = req.params
    const { page = 1, limit = 20 } = req.query

    // 查找标签
    const tag = await GameTag.findOne({
      where: { name: tagName }
    })

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '标签不存在'
      })
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取该标签下的游戏
    const games = await tag.getGames({
      where: {
        status: 'approved'
      },
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
        }
      ],
      limit: parseInt(limit),
      offset,
      distinct: true
    })

    res.status(200).json({
      success: true,
      message: `获取${tagName}标签下的游戏成功`,
      data: games
    })
  } catch (error) {
    console.error('按标签获取游戏错误:', error)
    res.status(500).json({
      success: false,
      message: '按标签获取游戏失败',
      error: error.message
    })
  }
}