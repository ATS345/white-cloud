import Review from '../models/Review.js'
import ReviewReply from '../models/ReviewReply.js'
import Game from '../models/Game.js'
import GameLibrary from '../models/GameLibrary.js'
import sequelize from 'sequelize'

// 创建评价
export const createReview = async (req, res) => {
  try {
    const { gameId } = req.params
    const { rating, content } = req.body
    const userId = req.user.id

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved' // 只允许对已通过审核的游戏评价
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 验证用户是否已购买该游戏
    const gameLibrary = await GameLibrary.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (!gameLibrary) {
      return res.status(403).json({
        success: false,
        message: '您还未购买此游戏，无法评价'
      })
    }

    // 验证用户是否已经评价过该游戏
    const existingReview = await Review.findOne({
      where: {
        user_id: userId,
        game_id: gameId
      }
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '您已经评价过此游戏，无法重复评价'
      })
    }

    // 创建评价
    const review = await Review.create({
      user_id: userId,
      game_id: gameId,
      rating,
      content
    })

    // 更新游戏的平均评分和评论数量
    await updateGameRating(gameId)

    // 返回创建的评价
    const newReview = await Review.findByPk(review.id, {
      include: [
        {
          model: req.app.get('models').User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ],
      attributes: ['id', 'rating', 'content', 'created_at', 'updated_at']
    })

    return res.status(201).json({
      success: true,
      message: '评价创建成功',
      data: newReview
    })
  } catch (error) {
    console.error('创建评价错误:', error)
    return res.status(500).json({
      success: false,
      message: '创建评价失败',
      error: error.message
    })
  }
}

// 获取游戏评价列表
export const getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query

    // 验证游戏是否存在
    const game = await Game.findByPk(gameId, {
      where: {
        status: 'approved'
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      })
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取评价列表
    const reviews = await Review.findAndCountAll({
      where: { game_id: gameId },
      include: [
        {
          model: req.app.get('models').User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        },
        {
          model: ReviewReply,
          as: 'replies',
          include: [
            {
              model: req.app.get('models').User,
              as: 'user',
              attributes: ['id', 'username', 'avatar_url']
            }
          ],
          attributes: ['id', 'content', 'created_at', 'user_id']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    })

    // 获取游戏的平均评分
    const avgRating = await Review.findOne({
      where: { game_id: gameId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']]
    })

    return res.status(200).json({
      success: true,
      message: '获取游戏评价列表成功',
      data: {
        reviews: reviews.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: reviews.count,
          totalPages: Math.ceil(reviews.count / limit)
        },
        averageRating: parseFloat(avgRating.dataValues.average_rating) || 0
      }
    })
  } catch (error) {
    console.error('获取游戏评价列表错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取游戏评价列表失败',
      error: error.message
    })
  }
}

// 更新评价
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, content } = req.body
    const userId = req.user.id

    // 查找评价
    const review = await Review.findByPk(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '评价不存在'
      })
    }

    // 验证用户是否是评价的作者
    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '您无权修改此评价'
      })
    }

    // 更新评价
    await review.update({
      rating,
      content
    })

    // 更新游戏的平均评分
    await updateGameRating(review.game_id)

    // 返回更新后的评价
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: req.app.get('models').User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ],
      attributes: ['id', 'rating', 'content', 'created_at', 'updated_at']
    })

    return res.status(200).json({
      success: true,
      message: '评价更新成功',
      data: updatedReview
    })
  } catch (error) {
    console.error('更新评价错误:', error)
    return res.status(500).json({
      success: false,
      message: '更新评价失败',
      error: error.message
    })
  }
}

// 删除评价
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // 查找评价
    const review = await Review.findByPk(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '评价不存在'
      })
    }

    // 验证用户是否是评价的作者或管理员
    if (review.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您无权删除此评价'
      })
    }

    // 保存游戏ID，用于更新游戏评分
    const gameId = review.game_id

    // 删除评价
    await review.destroy()

    // 更新游戏的平均评分和评论数量
    await updateGameRating(gameId)

    return res.status(200).json({
      success: true,
      message: '评价删除成功'
    })
  } catch (error) {
    console.error('删除评价错误:', error)
    return res.status(500).json({
      success: false,
      message: '删除评价失败',
      error: error.message
    })
  }
}

// 创建评价回复
export const createReviewReply = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { content } = req.body
    const userId = req.user.id

    // 查找评价
    const review = await Review.findByPk(reviewId)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '评价不存在'
      })
    }

    // 创建回复
    const reply = await ReviewReply.create({
      user_id: userId,
      review_id: reviewId,
      content
    })

    // 返回创建的回复
    const newReply = await ReviewReply.findByPk(reply.id, {
      include: [
        {
          model: req.app.get('models').User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ],
      attributes: ['id', 'content', 'created_at', 'review_id', 'user_id']
    })

    return res.status(201).json({
      success: true,
      message: '回复创建成功',
      data: newReply
    })
  } catch (error) {
    console.error('创建回复错误:', error)
    return res.status(500).json({
      success: false,
      message: '创建回复失败',
      error: error.message
    })
  }
}

// 删除评价回复
export const deleteReviewReply = async (req, res) => {
  try {
    const { replyId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // 查找回复
    const reply = await ReviewReply.findByPk(replyId)

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: '回复不存在'
      })
    }

    // 验证用户是否是回复的作者或管理员
    if (reply.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您无权删除此回复'
      })
    }

    // 删除回复
    await reply.destroy()

    return res.status(200).json({
      success: true,
      message: '回复删除成功'
    })
  } catch (error) {
    console.error('删除回复错误:', error)
    return res.status(500).json({
      success: false,
      message: '删除回复失败',
      error: error.message
    })
  }
}

// 获取用户的评价历史
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    // 计算偏移量
    const offset = (page - 1) * limit

    // 获取用户评价
    const reviews = await Review.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'main_image_url']
        }
      ],
      order: [['created_at', 'desc']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    })

    return res.status(200).json({
      success: true,
      message: '获取用户评价历史成功',
      data: {
        reviews: reviews.rows,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalItems: reviews.count,
          totalPages: Math.ceil(reviews.count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户评价历史错误:', error)
    return res.status(500).json({
      success: false,
      message: '获取用户评价历史失败',
      error: error.message
    })
  }
}

// 更新游戏的平均评分和评论数量（辅助函数）
const updateGameRating = async (gameId) => {
  try {
    // 计算平均评分和评论数量
    const ratingStats = await Review.findAll({
      where: { game_id: gameId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'review_count']
      ]
    })

    const stats = ratingStats[0].dataValues
    
    // 更新游戏信息
    await Game.update(
      {
        rating: parseFloat(stats.average_rating) || 0,
        review_count: parseInt(stats.review_count) || 0
      },
      {
        where: { id: gameId }
      }
    )
  } catch (error) {
    console.error('更新游戏评分错误:', error)
    throw error
  }
}