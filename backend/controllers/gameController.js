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

// 游戏启动API
export const launchGame = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user // 从JWT中获取用户ID
    
    // 导入GameLibrary模型
    const GameLibrary = require('../models/GameLibrary.js').default

    // 查找游戏
    const game = await Game.findByPk(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法启动'
      })
    }

    // 2. 检查游戏是否已安装
    if (!gameLibraryEntry.installed) {
      return res.status(400).json({
        success: false,
        message: '游戏尚未安装，请先安装游戏'
      })
    }

    // 3. 检查游戏是否需要更新
    if (gameLibraryEntry.needs_update) {
      return res.status(400).json({
        success: false,
        message: '游戏需要更新，请先更新游戏'
      })
    }

    // 4. 生成游戏启动命令
    const launchCommand = game.executable_path
    const launchParams = game.launch_parameters || ''

    // 5. 记录游戏启动日志（可以添加到数据库或日志文件）
    console.log(`User ${userId} launched game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏启动成功',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        launchTime: new Date().toISOString(),
        launchCommand: `${launchCommand} ${launchParams}`,
        executablePath: launchCommand,
        launchParameters: launchParams
      }
    })
  } catch (error) {
    console.error('游戏启动错误:', error)
    res.status(500).json({
      success: false,
      message: '游戏启动失败',
      error: error.message
    })
  }
}

// 游戏安装API
export const installGame = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    
    // 导入GameLibrary模型
    const GameLibrary = require('../models/GameLibrary.js').default

    // 查找游戏
    const game = await Game.findByPk(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 1. 验证用户是否拥有该游戏
    let gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法安装'
      })
    }

    // 2. 检查游戏是否已安装
    if (gameLibraryEntry.installed) {
      return res.status(400).json({
        success: false,
        message: '游戏已安装，无需重复安装'
      })
    }

    // 3. 创建安装任务ID
    const installationId = `install_${Date.now()}_${gameId}`

    // 4. 更新游戏库状态，标记为正在安装
    await gameLibraryEntry.update({
      installation_status: 'downloading',
      installation_id: installationId
    })

    // 5. 记录游戏安装日志
    console.log(`User ${userId} started installing game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏安装任务已创建',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        installationId,
        downloadUrl: game.download_url,
        fileSize: game.latest_version?.file_size || 0,
        latestVersion: game.latest_version
      }
    })
  } catch (error) {
    console.error('游戏安装错误:', error)
    res.status(500).json({
      success: false,
      message: '游戏安装失败',
      error: error.message
    })
  }
}

// 游戏更新API
export const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user

    // 查找游戏
    const game = await Game.findByPk(gameId)
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 这里可以添加游戏更新的逻辑，例如：
    // 1. 检查游戏是否有可用更新
    // 2. 开始游戏更新下载过程
    // 3. 返回更新任务ID，用于查询更新进度

    res.status(200).json({
      success: true,
      message: '游戏更新任务已创建',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        updateId: `update_${Date.now()}_${gameId}`,
        // 实际应用中，这里应该返回真实的更新任务ID和相关信息
        latestVersion: game.latest_version
      }
    })
  } catch (error) {
    console.error('游戏更新错误:', error)
    res.status(500).json({
      success: false,
      message: '游戏更新失败',
      error: error.message
    })
  }
}

// 查询游戏安装状态API
export const getGameInstallationStatus = async (req, res) => {
  try {
    const { installationId } = req.params

    // 这里可以添加查询游戏安装状态的逻辑，例如：
    // 1. 根据安装任务ID查询安装进度
    // 2. 返回安装状态、进度、下载速度等信息

    res.status(200).json({
      success: true,
      message: '查询安装状态成功',
      data: {
        installationId,
        status: 'downloading', // 可选值：pending, downloading, installing, completed, failed
        progress: 45, // 安装进度百分比
        downloadSpeed: '12.5 MB/s',
        estimatedTime: '15 minutes',
        // 实际应用中，这里应该返回真实的安装状态信息
        error: null
      }
    })
  } catch (error) {
    console.error('查询安装状态错误:', error)
    res.status(500).json({
      success: false,
      message: '查询安装状态失败',
      error: error.message
    })
  }
}

// 系统需求检测API
export const checkSystemRequirements = async (req, res) => {
  try {
    const { gameId } = req.params
    const systemInfo = req.body // 前端发送的系统信息

    // 查找游戏
    const game = await Game.findByPk(gameId, {
      include: [{
        model: GameSystemRequirement,
        as: 'system_requirements',
        attributes: ['id', 'os', 'processor', 'memory', 'graphics', 'storage', 'type']
      }]
    })
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 1. 分离最低需求和推荐需求
    const minimumRequirements = game.system_requirements.find(req => req.type === 'minimum')
    const recommendedRequirements = game.system_requirements.find(req => req.type === 'recommended')

    if (!minimumRequirements) {
      return res.status(400).json({
        success: false,
        message: '该游戏尚未设置最低系统需求'
      })
    }

    // 2. 解析系统信息
    const parsedSystemInfo = {
      os: systemInfo.os || '',
      processor: systemInfo.processor || '',
      memory: parseInt(systemInfo.memory?.match(/\d+/)[0]) || 0, // 提取内存大小（GB）
      graphics: systemInfo.graphics || '',
      storage: parseInt(systemInfo.storage?.match(/\d+/)[0]) || 0 // 提取存储大小（GB）
    }

    // 3. 解析需求信息
    const parsedMinimumRequirements = {
      os: minimumRequirements.os,
      processor: minimumRequirements.processor,
      memory: parseInt(minimumRequirements.memory?.match(/\d+/)[0]) || 0,
      graphics: minimumRequirements.graphics,
      storage: parseInt(minimumRequirements.storage?.match(/\d+/)[0]) || 0
    }

    const parsedRecommendedRequirements = recommendedRequirements ? {
      os: recommendedRequirements.os,
      processor: recommendedRequirements.processor,
      memory: parseInt(recommendedRequirements.memory?.match(/\d+/)[0]) || 0,
      graphics: recommendedRequirements.graphics,
      storage: parseInt(recommendedRequirements.storage?.match(/\d+/)[0]) || 0
    } : null

    // 4. 对比系统信息和需求
    const issues = []

    // 检查最低需求
    if (parsedSystemInfo.memory < parsedMinimumRequirements.memory) {
      issues.push({
        type: 'memory',
        message: `内存不足，建议升级到至少${parsedMinimumRequirements.memory} GB`,
        required: minimumRequirements.memory,
        available: `${parsedSystemInfo.memory} GB`,
        requirementType: 'minimum'
      })
    }

    if (parsedSystemInfo.storage < parsedMinimumRequirements.storage) {
      issues.push({
        type: 'storage',
        message: `存储空间不足，建议至少${parsedMinimumRequirements.storage} GB可用空间`,
        required: minimumRequirements.storage,
        available: `${parsedSystemInfo.storage} GB`,
        requirementType: 'minimum'
      })
    }

    // 检查推荐需求
    if (parsedRecommendedRequirements) {
      if (parsedSystemInfo.memory < parsedRecommendedRequirements.memory) {
        issues.push({
          type: 'memory',
          message: `内存低于推荐配置，建议升级到${parsedRecommendedRequirements.memory} GB以获得最佳体验`,
          required: recommendedRequirements.memory,
          available: `${parsedSystemInfo.memory} GB`,
          requirementType: 'recommended'
        })
      }

      if (parsedSystemInfo.storage < parsedRecommendedRequirements.storage) {
        issues.push({
          type: 'storage',
          message: `存储空间低于推荐配置，建议至少${parsedRecommendedRequirements.storage} GB可用空间以获得最佳体验`,
          required: recommendedRequirements.storage,
          available: `${parsedSystemInfo.storage} GB`,
          requirementType: 'recommended'
        })
      }

      // 检查操作系统（简单匹配）
      if (!parsedSystemInfo.os.toLowerCase().includes(parsedRecommendedRequirements.os.toLowerCase().split(' ')[0].toLowerCase())) {
        issues.push({
          type: 'os',
          message: `操作系统建议使用${parsedRecommendedRequirements.os}以获得最佳体验`,
          required: recommendedRequirements.os,
          available: parsedSystemInfo.os,
          requirementType: 'recommended'
        })
      }
    }

    // 5. 确定检测结果
    const meetsMinimum = issues.filter(issue => issue.requirementType === 'minimum').length === 0
    const meetsRecommended = recommendedRequirements ? 
      issues.filter(issue => issue.requirementType === 'recommended').length === 0 : 
      null

    // 6. 记录检测日志
    console.log(`System requirements check for game ${gameId} by user ${req.user?.userId || 'anonymous'}`)

    res.status(200).json({
      success: true,
      message: '系统需求检测成功',
      data: {
        gameId: game.id,
        gameTitle: game.title,
        meetsMinimum,
        meetsRecommended,
        issues,
        systemRequirements: game.system_requirements,
        detectedSystem: parsedSystemInfo
      }
    })
  } catch (error) {
    console.error('系统需求检测错误:', error)
    res.status(500).json({
      success: false,
      message: '系统需求检测失败',
      error: error.message
    })
  }
}

// 游戏数据同步API
export const syncGameData = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const syncData = req.body // 要同步的游戏数据
    
    // 导入GameData和GameLibrary模型
    const GameData = require('../models/GameData.js').default
    const GameLibrary = require('../models/GameLibrary.js').default
    const Developer = require('../models/Developer.js').default

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法同步数据'
      })
    }

    // 2. 准备数据
    const { data_type = 'save_data', data_name = 'autosave', data_content } = syncData
    
    if (!data_content) {
      return res.status(400).json({
        success: false,
        message: '同步数据不能为空'
      })
    }

    // 3. 计算数据大小
    const dataSize = Buffer.byteLength(JSON.stringify(data_content), 'utf8')

    // 4. 保存或更新游戏数据
    const [gameData, created] = await GameData.findOrCreate({
      where: {
        user_id: userId,
        game_id: gameId,
        data_type,
        data_name
      },
      defaults: {
        data_content,
        data_size: dataSize,
        last_modified_at: new Date()
      }
    })

    // 如果数据已存在，则更新
    if (!created) {
      await gameData.update({
        data_content,
        data_size: dataSize,
        last_modified_at: new Date()
      })
    }

    // 5. 记录同步日志
    console.log(`User ${userId} synced ${data_type} for game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: created ? '游戏数据同步成功' : '游戏数据更新成功',
      data: {
        gameId,
        syncTime: new Date().toISOString(),
        syncedData: {
          data_type,
          data_name,
          data_size: dataSize
        },
        isNew: created
      }
    })
  } catch (error) {
    console.error('游戏数据同步错误:', error)
    res.status(500).json({
      success: false,
      message: '游戏数据同步失败',
      error: error.message
    })
  }
}

// 获取游戏数据API
export const getGameData = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const { data_type, data_name } = req.query
    
    // 导入GameData和GameLibrary模型
    const GameData = require('../models/GameData.js').default
    const GameLibrary = require('../models/GameLibrary.js').default

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法获取数据'
      })
    }

    // 2. 构建查询条件
    const whereConditions = {
      user_id: userId,
      game_id: gameId
    }

    if (data_type) {
      whereConditions.data_type = data_type
    }

    if (data_name) {
      whereConditions.data_name = data_name
    }

    // 3. 查询游戏数据
    const gameData = await GameData.findAll({
      where: whereConditions,
      order: [['last_modified_at', 'desc']]
    })

    res.status(200).json({
      success: true,
      message: '游戏数据获取成功',
      data: {
        gameId,
        data: gameData
      }
    })
  } catch (error) {
    console.error('获取游戏数据错误:', error)
    res.status(500).json({
      success: false,
      message: '获取游戏数据失败',
      error: error.message
    })
  }
}

// 删除游戏数据API
export const deleteGameData = async (req, res) => {
  try {
    const { gameId, dataId } = req.params
    const { userId } = req.user
    
    // 导入GameData和GameLibrary模型
    const GameData = require('../models/GameData.js').default
    const GameLibrary = require('../models/GameLibrary.js').default

    // 1. 验证用户是否拥有该游戏
    const gameLibraryEntry = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })
    
    if (!gameLibraryEntry) {
      return res.status(403).json({
        success: false,
        message: '您没有购买该游戏，无法删除数据'
      })
    }

    // 2. 删除游戏数据
    const deletedCount = await GameData.destroy({
      where: {
        id: dataId,
        user_id: userId,
        game_id: gameId
      }
    })

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏数据不存在或已被删除'
      })
    }

    // 3. 记录删除日志
    console.log(`User ${userId} deleted game data ${dataId} for game ${gameId} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏数据删除成功',
      data: {
        gameId,
        dataId,
        deletedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('删除游戏数据错误:', error)
    res.status(500).json({
      success: false,
      message: '删除游戏数据失败',
      error: error.message
    })
  }
}

// 创建游戏API
export const createGame = async (req, res) => {
  try {
    const { userId } = req.user
    const { 
      title, 
      description, 
      price, 
      discount_price, 
      release_date, 
      main_image_url, 
      cover_image, 
      categories = [], 
      tags = [],
      executable_path, 
      launch_parameters,
      latest_version
    } = req.body

    // 1. 验证必填字段
    if (!title || !description || !price || !release_date || !main_image_url) {
      return res.status(400).json({
        success: false,
        message: '标题、描述、价格、发布日期和主图是必填项'
      })
    }

    // 2. 查找开发者信息
    const Developer = require('../models/Developer.js').default
    const developer = await Developer.findOne({ where: { user_id: userId } })
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户'
      })
    }

    // 3. 创建游戏
    const game = await Game.create({
      developer_id: developer.id,
      title,
      description,
      price,
      discount_price,
      release_date,
      main_image_url,
      cover_image,
      executable_path,
      launch_parameters,
      latest_version,
      status: 'pending' // 默认状态为待审核
    })

    // 4. 处理分类关联
    if (categories.length > 0) {
      const categoryRecords = await GameCategory.findAll({ 
        where: { name: { [Op.in]: categories } } 
      })
      await game.setCategories(categoryRecords)
    }

    // 5. 处理标签关联
    if (tags.length > 0) {
      const tagRecords = await GameTag.findAll({ 
        where: { name: { [Op.in]: tags } } 
      })
      await game.setTags(tagRecords)
    }

    // 6. 记录创建日志
    console.log(`Developer ${developer.id} created game ${game.id} at ${new Date().toISOString()}`)

    res.status(201).json({
      success: true,
      message: '游戏创建成功，等待审核',
      data: game
    })
  } catch (error) {
    console.error('创建游戏错误:', error)
    res.status(500).json({
      success: false,
      message: '创建游戏失败',
      error: error.message
    })
  }
}

// 更新游戏API
export const updateGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const updateData = req.body

    // 1. 查找开发者信息
    const Developer = require('../models/Developer.js').default
    const developer = await Developer.findOne({ where: { user_id: userId } })
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户'
      })
    }

    // 2. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id
      }
    })
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏'
      })
    }

    // 3. 更新游戏信息
    await game.update(updateData)

    // 4. 处理分类关联
    if (updateData.categories && updateData.categories.length > 0) {
      const categoryRecords = await GameCategory.findAll({ 
        where: { name: { [Op.in]: updateData.categories } } 
      })
      await game.setCategories(categoryRecords)
    }

    // 5. 处理标签关联
    if (updateData.tags && updateData.tags.length > 0) {
      const tagRecords = await GameTag.findAll({ 
        where: { name: { [Op.in]: updateData.tags } } 
      })
      await game.setTags(tagRecords)
    }

    // 6. 记录更新日志
    console.log(`Developer ${developer.id} updated game ${game.id} at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏更新成功',
      data: game
    })
  } catch (error) {
    console.error('更新游戏错误:', error)
    res.status(500).json({
      success: false,
      message: '更新游戏失败',
      error: error.message
    })
  }
}

// 提交游戏审核API
export const submitGameForReview = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user

    // 1. 查找开发者信息
    const Developer = require('../models/Developer.js').default
    const developer = await Developer.findOne({ where: { user_id: userId } })
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户'
      })
    }

    // 2. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id
      }
    })
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏'
      })
    }

    // 3. 提交审核
    await game.update({ status: 'pending' })

    // 4. 记录审核日志
    console.log(`Developer ${developer.id} submitted game ${game.id} for review at ${new Date().toISOString()}`)

    res.status(200).json({
      success: true,
      message: '游戏已提交审核',
      data: game
    })
  } catch (error) {
    console.error('提交游戏审核错误:', error)
    res.status(500).json({
      success: false,
      message: '提交游戏审核失败',
      error: error.message
    })
  }
}

// 创建游戏版本API
export const createGameVersion = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const { version_number, changelog, file_url, file_size, platform } = req.body

    // 1. 验证必填字段
    if (!version_number || !file_url || !file_size || !platform) {
      return res.status(400).json({
        success: false,
        message: '版本号、文件URL、文件大小和平台是必填项'
      })
    }

    // 2. 查找开发者信息
    const Developer = require('../models/Developer.js').default
    const developer = await Developer.findOne({ where: { user_id: userId } })
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户'
      })
    }

    // 3. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id
      }
    })
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏'
      })
    }

    // 4. 创建游戏版本
    const gameVersion = await GameVersion.create({
      game_id: game.id,
      version_number,
      changelog,
      file_url,
      file_size,
      platform
    })

    // 5. 更新游戏的最新版本
    await game.update({ latest_version: version_number })

    // 6. 记录版本创建日志
    console.log(`Developer ${developer.id} created version ${version_number} for game ${game.id} at ${new Date().toISOString()}`)

    res.status(201).json({
      success: true,
      message: '游戏版本创建成功',
      data: gameVersion
    })
  } catch (error) {
    console.error('创建游戏版本错误:', error)
    res.status(500).json({
      success: false,
      message: '创建游戏版本失败',
      error: error.message
    })
  }
}

// 创建游戏系统需求API
export const createGameSystemRequirement = async (req, res) => {
  try {
    const { gameId } = req.params
    const { userId } = req.user
    const { os, processor, memory, graphics, storage, type = 'minimum' } = req.body

    // 1. 验证必填字段
    if (!os || !processor || !memory || !graphics || !storage) {
      return res.status(400).json({
        success: false,
        message: '操作系统、处理器、内存、显卡和存储是必填项'
      })
    }

    // 2. 查找开发者信息
    const Developer = require('../models/Developer.js').default
    const developer = await Developer.findOne({ where: { user_id: userId } })
    if (!developer) {
      return res.status(403).json({
        success: false,
        message: '您还不是开发者，请先注册开发者账户'
      })
    }

    // 3. 查找游戏
    const game = await Game.findOne({
      where: {
        id: gameId,
        developer_id: developer.id
      }
    })
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或您没有权限修改该游戏'
      })
    }

    // 4. 创建系统需求
    const systemRequirement = await GameSystemRequirement.create({
      game_id: game.id,
      os,
      processor,
      memory,
      graphics,
      storage,
      type
    })

    // 5. 记录系统需求创建日志
    console.log(`Developer ${developer.id} created system requirement for game ${game.id} at ${new Date().toISOString()}`)

    res.status(201).json({
      success: true,
      message: '游戏系统需求创建成功',
      data: systemRequirement
    })
  } catch (error) {
    console.error('创建游戏系统需求错误:', error)
    res.status(500).json({
      success: false,
      message: '创建游戏系统需求失败',
      error: error.message
    })
  }
}