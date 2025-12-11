// 通知控制器 - 处理通知相关的业务逻辑
import Notification from '../models/Notification.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { setCache, getCache, deleteCache } from '../config/redis.js';

/**
 * 创建新通知
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const createNotification = async (req, res, next) => {
  try {
    const {
      userId,
      type,
      title,
      content,
      referenceId,
      referenceData,
      url,
    } = req.body;

    // 验证必要字段
    if (!userId || !type || !title || !content) {
      throw new ValidationError('缺少必要的通知信息', 'MISSING_NOTIFICATION_INFO');
    }

    // 创建通知
    const notification = await Notification.create({
      userId,
      type,
      title,
      content,
      status: 'UNREAD',
      referenceId,
      referenceData,
      url,
    });

    // 清除相关缓存
    await deleteCache(`notifications:user:${userId}`);
    await deleteCache(`notifications:user:${userId}:unread`);

    res.status(201).json({
      success: true,
      message: '通知创建成功',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户的通知列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, type,
    } = req.query;

    // 生成缓存键
    const cacheKey = `notifications:user:${userId}:${page}:${limit}:${sortBy}:${sortOrder}:${status || 'all'}:${type || 'all'}`;

    // 尝试从缓存获取数据
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取通知列表成功',
        data: cachedData,
      });
    }

    // 构建查询条件
    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    // 计算分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder]];

    // 查询通知列表
    const { count, rows } = await Notification.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order,
    });

    const result = {
      notifications: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };

    // 缓存结果
    await setCache(cacheKey, result, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取通知列表成功',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个通知详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 生成缓存键
    const cacheKey = `notification:${id}`;

    // 尝试从缓存获取数据
    const cachedNotification = await getCache(cacheKey);
    if (cachedNotification) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取通知详情成功',
        data: cachedNotification,
      });
    }

    // 查询通知详情
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new NotFoundError(`通知不存在: ${id}`, 'NOTIFICATION_NOT_FOUND');
    }

    // 缓存结果
    await setCache(cacheKey, notification, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取通知详情成功',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新通知状态（标记为已读）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询通知
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new NotFoundError(`通知不存在: ${id}`, 'NOTIFICATION_NOT_FOUND');
    }

    // 更新通知状态为已读
    await notification.update({ status: 'READ' });

    // 清除相关缓存
    await deleteCache(`notification:${id}`);
    await deleteCache(`notifications:user:${notification.userId}:*`);
    await deleteCache(`notifications:user:${notification.userId}:unread`);

    res.status(200).json({
      success: true,
      message: '通知已标记为已读',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 批量标记通知为已读
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const markMultipleAsRead = async (req, res, next) => {
  try {
    const { userId, notificationIds } = req.body;

    // 验证必要字段
    if (!userId || !notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new ValidationError('缺少必要的参数或参数格式错误', 'INVALID_PARAMETERS');
    }

    // 批量更新通知状态为已读
    const result = await Notification.update(
      { status: 'READ' },
      { where: { userId, id: notificationIds } },
    );

    // 清除相关缓存
    await deleteCache(`notifications:user:${userId}:*`);
    await deleteCache(`notifications:user:${userId}:unread`);

    res.status(200).json({
      success: true,
      message: `已成功标记 ${result[0]} 条通知为已读`,
      data: {
        updatedCount: result[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除通知
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 查询通知
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new NotFoundError(`通知不存在: ${id}`, 'NOTIFICATION_NOT_FOUND');
    }

    // 删除通知（软删除）
    await notification.destroy();

    // 清除相关缓存
    await deleteCache(`notification:${id}`);
    await deleteCache(`notifications:user:${notification.userId}:*`);
    await deleteCache(`notifications:user:${notification.userId}:unread`);

    res.status(200).json({
      success: true,
      message: '通知删除成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 批量删除通知
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const deleteMultipleNotifications = async (req, res, next) => {
  try {
    const { userId, notificationIds } = req.body;

    // 验证必要字段
    if (!userId || !notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new ValidationError('缺少必要的参数或参数格式错误', 'INVALID_PARAMETERS');
    }

    // 批量删除通知
    const result = await Notification.destroy({
      where: { userId, id: notificationIds },
    });

    // 清除相关缓存
    await deleteCache(`notifications:user:${userId}:*`);
    await deleteCache(`notifications:user:${userId}:unread`);

    res.status(200).json({
      success: true,
      message: `已成功删除 ${result} 条通知`,
      data: {
        deletedCount: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取未读通知数量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // 生成缓存键
    const cacheKey = `notifications:user:${userId}:unread`;

    // 尝试从缓存获取数据
    const cachedCount = await getCache(cacheKey);
    if (cachedCount !== null) {
      return res.status(200).json({
        success: true,
        message: '从缓存获取未读通知数量成功',
        data: { unreadCount: cachedCount },
      });
    }

    // 查询未读通知数量
    const count = await Notification.count({
      where: { userId, status: 'UNREAD' },
    });

    // 缓存结果
    await setCache(cacheKey, count, 3600); // 缓存1小时

    res.status(200).json({
      success: true,
      message: '获取未读通知数量成功',
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 清除所有已读通知
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 中间件函数
 */
export const clearReadNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // 删除所有已读通知
    const result = await Notification.destroy({
      where: { userId, status: 'READ' },
    });

    // 清除相关缓存
    await deleteCache(`notifications:user:${userId}:*`);
    await deleteCache(`notifications:user:${userId}:unread`);

    res.status(200).json({
      success: true,
      message: `已成功清除 ${result} 条已读通知`,
      data: {
        deletedCount: result,
      },
    });
  } catch (error) {
    next(error);
  }
};
