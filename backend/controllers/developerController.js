import Developer from '../models/Developer.js'
import Game from '../models/Game.js'
import GameVersion from '../models/GameVersion.js'
import GameSystemRequirement from '../models/GameSystemRequirement.js'
import GameCategory from '../models/GameCategory.js'
import GameTag from '../models/GameTag.js'
import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import DeveloperFinance from '../models/DeveloperFinance.js'
import WithdrawalRequest from '../models/WithdrawalRequest.js'
import sequelize from 'sequelize'

// 开发者注册
export const registerDeveloper = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      company_name,
      contact_email,
      website,
      bio
    } = req.body

    // 验证必填字段
    if (!company_name || !contact_email) {
      return res.status(400).json({
        success: false,
        message: '公司名称和联系邮箱是必填项'
      })
    }

    // 检查开发者账户是否已存在
    const existingDeveloper = await Developer.findOne({
      where: { user_id: userId }
    })

    if (existingDeveloper) {
      return res.status(400).json({
        success: false,
        message: '您已经注册了开发者账户'
      })
    }

    // 创建开发者账户
    const developer = await Developer.create({
      user_id: userId,
      company_name,
      contact_email,
      website,
      bio
    })

    return res.status(201).json({
      success: true,
      message: '开发者账户注册成功',
      data: developer
    })
  } catch (error) {
    console.error('注册开发者错误:', error)
    return res.status(500).json({
      success: false,
      message: '注册开发者过程中发生错误',
      error: error.message
    })
  }
}

// 获取开发者信息
export const getDeveloperInfo = async (req, res) => {
  try {
    const userId = req.user.id

    // 获取开发者信息
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    return res.status(200).json({
      success: true,
      message: '获取开发者信息成功',
      data: developer
    })
  } catch (error) {
    console.error('获取开发者信息错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取开发者信息过程中发生错误',
      error: error.message
    })
  }
}

// 更新开发者信息
export const updateDeveloperInfo = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      company_name,
      contact_email,
      website,
      bio
    } = req.body

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 更新开发者信息
    await developer.update({
      company_name: company_name || developer.company_name,
      contact_email: contact_email || developer.contact_email,
      website: website || developer.website,
      bio: bio || developer.bio
    })

    return res.status(200).json({
      success: true,
      message: '开发者信息更新成功',
      data: developer
    })
  } catch (error) {
    console.error('更新开发者信息错误:', error)
    return res.status(500).json({
      success: false,
      message: '更新开发者信息过程中发生错误',
      error: error.message
    })
  }
}

// 获取开发者游戏列表
export const getDeveloperGames = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 构建查询条件
    const whereClause = { developer_id: developer.id }
    if (status) {
      whereClause.status = status
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取开发者游戏列表
    const games = await Game.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GameCategory,
          as: 'categories',
          attributes: ['id', 'name']
        },
        {
          model: GameTag,
          as: 'tags',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'desc']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    })

    return res.status(200).json({
      success: true,
      message: '获取开发者游戏列表成功',
      data: {
        games: games.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: games.count,
          totalPages: Math.ceil(games.count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取开发者游戏列表错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取开发者游戏列表过程中发生错误',
      error: error.message
    })
  }
}

// 获取游戏销售数据统计
export const getGameSalesStats = async (req, res) => {
  try {
    const userId = req.user.id
    const { gameId, startDate, endDate } = req.query

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 构建查询条件
    const whereClause = {
      '$OrderItem.game.developer_id$': developer.id
    }

    if (gameId) {
      whereClause.game_id = gameId
    }

    if (startDate && endDate) {
      whereClause.created_at = {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }

    // 获取销售数据统计
    const salesStats = await OrderItem.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'created_at', 'status']
        }
      ],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_revenue'],
        [sequelize.fn('DATE', sequelize.col('Order.created_at')), 'date']
      ],
      group: ['date', 'game.id', 'game.title', 'order.id', 'order.created_at', 'order.status'],
      order: [[sequelize.fn('DATE', sequelize.col('Order.created_at')), 'asc']]
    })

    // 获取总销售额和总销量
    const totalStats = await OrderItem.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_revenue']
      ]
    })

    return res.status(200).json({
      success: true,
      message: '获取游戏销售数据统计成功',
      data: {
        daily_stats: salesStats,
        total_stats: {
          total_sales: parseInt(totalStats?.dataValues.total_sales) || 0,
          total_revenue: parseFloat(totalStats?.dataValues.total_revenue) || 0
        }
      }
    })
  } catch (error) {
    console.error('获取游戏销售数据统计错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取游戏销售数据统计过程中发生错误',
      error: error.message
    })
  }
}

// 获取开发者收益分析
export const getDeveloperEarnings = async (req, res) => {
  try {
    const userId = req.user.id
    const { period = 'monthly' } = req.query

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 获取开发者收益分析
    const earnings = await DeveloperFinance.findAll({
      where: { developer_id: developer.id },
      order: [['period_start', 'desc']]
    })

    // 获取当前可用余额
    const currentBalance = await DeveloperFinance.findOne({
      where: {
        developer_id: developer.id,
        status: 'processed'
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('developer_earnings')), 'total_earnings']
      ]
    })

    return res.status(200).json({
      success: true,
      message: '获取开发者收益分析成功',
      data: {
        earnings,
        current_balance: parseFloat(currentBalance?.dataValues.total_earnings) || 0
      }
    })
  } catch (error) {
    console.error('获取开发者收益分析错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取开发者收益分析过程中发生错误',
      error: error.message
    })
  }
}

// 创建提现请求
export const createWithdrawalRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { amount, payment_method, payment_account } = req.body

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 验证提现金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '提现金额必须大于0'
      })
    }

    // 检查可用余额
    const currentBalance = await DeveloperFinance.findOne({
      where: {
        developer_id: developer.id,
        status: 'processed'
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('developer_earnings')), 'total_earnings']
      ]
    })

    const availableBalance = parseFloat(currentBalance?.dataValues.total_earnings) || 0
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: '提现金额超过可用余额'
      })
    }

    // 创建提现请求
    const withdrawalRequest = await WithdrawalRequest.create({
      developer_id: developer.id,
      amount,
      payment_method,
      payment_account
    })

    return res.status(201).json({
      success: true,
      message: '提现请求创建成功',
      data: withdrawalRequest
    })
  } catch (error) {
    console.error('创建提现请求错误:', error)
    return res.status(500).json({
      success: false,
      message: '创建提现请求过程中发生错误',
      error: error.message
    })
  }
}

// 获取提现请求列表
export const getWithdrawalRequests = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    // 查找开发者
    const developer = await Developer.findOne({
      where: { user_id: userId }
    })

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: '开发者账户不存在'
      })
    }

    // 构建查询条件
    const whereClause = { developer_id: developer.id }
    if (status) {
      whereClause.status = status
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取提现请求列表
    const withdrawalRequests = await WithdrawalRequest.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'desc']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    return res.status(200).json({
      success: true,
      message: '获取提现请求列表成功',
      data: {
        requests: withdrawalRequests.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: withdrawalRequests.count,
          totalPages: Math.ceil(withdrawalRequests.count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取提现请求列表错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取提现请求列表过程中发生错误',
      error: error.message
    })
  }
}