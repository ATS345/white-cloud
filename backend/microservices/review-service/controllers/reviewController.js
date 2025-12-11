// 评论控制器 - 处理评论相关的业务逻辑
import Review from '../models/Review.js';
import { BadRequestError, NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';
import { setCache, getCache, deleteCache } from '../config/redis.js';

/**
 * 创建新评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const createReview = async (req, res, next) => {
  try {
    const { userId, gameId, gameTitle, rating, content, parentId } = req.body;

    // 验证必要字段
    if (!userId || !gameId || !gameTitle || !rating || !content) {
      throw new ValidationError('缺少必要的评论信息', 'MISSING_REVIEW_INFO');
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      throw new ValidationError('评分必须在1-5之间', 'INVALID_RATING');
    }

    // 验证评论内容长度
    if (content.length < 1 || content.length > 1000) {
      throw new ValidationError('评论内容长度必须在1-1000字符之间', 'INVALID_CONTENT_LENGTH');
    }

    // 创建评论
    const review = await Review.create({
      userId,
      gameId,
      gameTitle,
      rating,
      content,
      parentId
    });

    // 清除相关缓存
    await deleteCache(`reviews:game:${gameId}`);
    await deleteCache(`reviews:user:${userId}`);
    await deleteCache(`reviews:stats:${gameId}`);

    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取游戏的评论列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getGameReviews = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', rating, status } = req.query;

    // 生成缓存键
    const cacheKey = `reviews:game:${gameId}:${page}:${limit}:${sortBy}:${sortOrder}:${rating || 'all'}:${status || 'all'}`;

    // 尝试从缓存获取数据
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取评论列表成功',
        data: cachedData
      });
    }

    // 构建查询条件
    const where = { gameId };
    if (rating) where.rating = rating;
    if (status) where.status = status;

    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder]];

    // 查询评论列表
    const { count, rows } = await Review.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order,
      include: [
        {
          model: Review,
          as: 'replies',
          limit: 5, // 只返回前5条回复
          order: [['createdAt', 'asc']]
        }
      ]
    });

    const result = {
      reviews: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };

    // 缓存结果
    await setCache(cacheKey, result, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取游戏评论列表成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户的评论列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status } = req.query;

    // 生成缓存键
    const cacheKey = `reviews:user:${userId}:${page}:${limit}:${sortBy}:${sortOrder}:${status || 'all'}`;

    // 尝试从缓存获取数据
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取用户评论列表成功',
        data: cachedData
      });
    }

    // 构建查询条件
    const where = { userId };
    if (status) where.status = status;

    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder]];

    // 查询用户评论列表
    const { count, rows } = await Review.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order,
      include: [
        {
          model: Review,
          as: 'replies',
          limit: 5,
          order: [['createdAt', 'asc']]
        }
      ]
    });

    const result = {
      reviews: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };

    // 缓存结果
    await setCache(cacheKey, result, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取用户评论列表成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个评论详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 生成缓存键
    const cacheKey = `review:${id}`;

    // 尝试从缓存获取数据
    const cachedReview = await getCache(cacheKey);
    if (cachedReview) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取评论详情成功',
        data: cachedReview
      });
    }

    // 查询评论详情
    const review = await Review.findByPk(id, {
      include: [
        {
          model: Review,
          as: 'replies',
          order: [['createdAt', 'asc']]
        }
      ]
    });

    if (!review) {
      throw new NotFoundError(`评论不存在: ${id}`, 'REVIEW_NOT_FOUND');
    }

    // 缓存结果
    await setCache(cacheKey, review, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取评论详情成功',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, content, status } = req.body;

    // 查询评论
    const review = await Review.findByPk(id);
    if (!review) {
      throw new NotFoundError(`评论不存在: ${id}`, 'REVIEW_NOT_FOUND');
    }

    // 验证评分范围
    if (rating && (rating < 1 || rating > 5)) {
      throw new ValidationError('评分必须在1-5之间', 'INVALID_RATING');
    }

    // 验证评论内容长度
    if (content && (content.length < 1 || content.length > 1000)) {
      throw new ValidationError('评论内容长度必须在1-1000字符之间', 'INVALID_CONTENT_LENGTH');
    }

    // 更新评论
    await review.update({
      rating: rating || review.rating,
      content: content || review.content,
      status: status || review.status
    });

    // 清除相关缓存
    await deleteCache(`review:${id}`);
    await deleteCache(`reviews:game:${review.gameId}:*`);
    await deleteCache(`reviews:user:${review.userId}:*`);
    await deleteCache(`reviews:stats:${review.gameId}`);

    res.status(200).json({
      success: true,
      message: '评论更新成功',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询评论
    const review = await Review.findByPk(id);
    if (!review) {
      throw new NotFoundError(`评论不存在: ${id}`, 'REVIEW_NOT_FOUND');
    }

    // 删除评论（软删除）
    await review.destroy();

    // 清除相关缓存
    await deleteCache(`review:${id}`);
    await deleteCache(`reviews:game:${review.gameId}:*`);
    await deleteCache(`reviews:user:${review.userId}:*`);
    await deleteCache(`reviews:stats:${review.gameId}`);

    res.status(200).json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 点赞评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询评论
    const review = await Review.findByPk(id);
    if (!review) {
      throw new NotFoundError(`评论不存在: ${id}`, 'REVIEW_NOT_FOUND');
    }

    // 更新点赞数
    await review.update({
      likes: review.likes + 1
    });

    // 清除相关缓存
    await deleteCache(`review:${id}`);
    await deleteCache(`reviews:game:${review.gameId}:*`);
    await deleteCache(`reviews:user:${review.userId}:*`);

    res.status(200).json({
      success: true,
      message: '评论点赞成功',
      data: {
        likes: review.likes + 1,
        dislikes: review.dislikes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 踩评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const dislikeReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询评论
    const review = await Review.findByPk(id);
    if (!review) {
      throw new NotFoundError(`评论不存在: ${id}`, 'REVIEW_NOT_FOUND');
    }

    // 更新踩数
    await review.update({
      dislikes: review.dislikes + 1
    });

    // 清除相关缓存
    await deleteCache(`review:${id}`);
    await deleteCache(`reviews:game:${review.gameId}:*`);
    await deleteCache(`reviews:user:${review.userId}:*`);

    res.status(200).json({
      success: true,
      message: '评论踩成功',
      data: {
        likes: review.likes,
        dislikes: review.dislikes + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取游戏的评论统计信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getGameReviewStats = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    // 生成缓存键
    const cacheKey = `reviews:stats:${gameId}`;

    // 尝试从缓存获取数据
    const cachedStats = await getCache(cacheKey);
    if (cachedStats) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取评论统计成功',
        data: cachedStats
      });
    }

    // 查询评论统计信息
    const stats = await Review.findAll({
      where: { gameId },
      attributes: [
        'rating',
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'asc']]
    });

    // 计算平均评分和总评论数
    const totalReviews = stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0);
    let totalRating = 0;
    stats.forEach(stat => {
      totalRating += stat.rating * parseInt(stat.dataValues.count);
    });
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    const result = {
      averageRating: parseFloat(averageRating),
      totalReviews,
      ratingDistribution: stats.map(stat => ({
        rating: stat.rating,
        count: parseInt(stat.dataValues.count)
      }))
    };

    // 缓存结果
    await setCache(cacheKey, result, 3600 * 6); // 缓存6小时

    res.status(200).json({
      success: true,
      message: '获取评论统计成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
