// 通知控制器单元测试
import {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markMultipleAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  getUnreadCount,
  clearReadNotifications,
} from '../../controllers/notificationController.js';
import Notification from '../../models/Notification.js';
import { ValidationError, NotFoundError } from '../../utils/errors.js';
import { setCache, getCache, deleteCache } from '../../config/redis.js';

// 模拟依赖
jest.mock('../../models/Notification.js');
jest.mock('../../config/redis.js');

// 测试用例配置
const mockRequest = (user = {}, body = {}, params = {}, query = {}) => ({
  user,
  body,
  params,
  query,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Notification Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = mockRequest({ id: 1, role: 'user' });
    mockRes = mockResponse();
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should get notifications for a user from cache', async () => {
      // 准备测试数据
      const mockNotifications = {
        notifications: [
          {
            id: 1,
            userId: 1,
            type: 'ORDER_STATUS',
            title: '订单状态更新',
            content: '您的订单已发货',
            status: 'UNREAD',
            createdAt: new Date(),
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // 模拟Redis缓存命中
      getCache.mockResolvedValue(mockNotifications);

      // 设置请求参数
      mockReq.params = { userId: 1 };
      mockReq.query = { page: '1', limit: '10' };

      // 执行测试
      await getUserNotifications(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '从缓存获取通知列表成功',
        data: mockNotifications,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get notifications from database when cache miss', async () => {
      // 准备测试数据
      const mockNotifications = {
        count: 1,
        rows: [
          {
            id: 1,
            userId: 1,
            type: 'ORDER_STATUS',
            title: '订单状态更新',
            content: '您的订单已发货',
            status: 'UNREAD',
            createdAt: new Date(),
          },
        ],
      };

      // 模拟Redis缓存未命中
      getCache.mockResolvedValue(null);
      // 模拟数据库查询
      Notification.findAndCountAll.mockResolvedValue(mockNotifications);
      // 模拟缓存设置
      setCache.mockResolvedValue('OK');

      // 设置请求参数
      mockReq.params = { userId: 1 };
      mockReq.query = { page: '1', limit: '10' };

      // 执行测试
      await getUserNotifications(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Notification.findAndCountAll).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取通知列表成功',
        data: {
          notifications: mockNotifications.rows,
          pagination: {
            total: mockNotifications.count,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationById', () => {
    it('should get a notification by id from cache', async () => {
      // 准备测试数据
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'ORDER_STATUS',
        title: '订单状态更新',
        content: '您的订单已发货',
        status: 'UNREAD',
        createdAt: new Date(),
      };

      // 模拟Redis缓存命中
      getCache.mockResolvedValue(mockNotification);

      // 设置请求参数
      mockReq.params = { id: 1 };

      // 执行测试
      await getNotificationById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '从缓存获取通知详情成功',
        data: mockNotification,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get a notification by id from database when cache miss', async () => {
      // 准备测试数据
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'ORDER_STATUS',
        title: '订单状态更新',
        content: '您的订单已发货',
        status: 'UNREAD',
        createdAt: new Date(),
      };

      // 模拟Redis缓存未命中
      getCache.mockResolvedValue(null);
      // 模拟数据库查询
      Notification.findByPk.mockResolvedValue(mockNotification);
      // 模拟缓存设置
      setCache.mockResolvedValue('OK');

      // 设置请求参数
      mockReq.params = { id: 1 };

      // 执行测试
      await getNotificationById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Notification.findByPk).toHaveBeenCalledWith(1);
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取通知详情成功',
        data: mockNotification,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when notification not found', async () => {
      // 设置请求参数
      mockReq.params = { id: 999 };

      // 模拟Redis缓存未命中
      getCache.mockResolvedValue(null);
      // 模拟数据库查询返回null
      Notification.findByPk.mockResolvedValue(null);

      // 执行测试
      await getNotificationById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Notification.findByPk).toHaveBeenCalledWith(999);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '通知不存在: 999',
        code: 'NOTIFICATION_NOT_FOUND',
      }));
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      // 准备测试数据
      const mockNotification = {
        id: 1,
        userId: 1,
        status: 'UNREAD',
        update: jest.fn().mockResolvedValue({ status: 'READ' }),
      };

      // 设置请求参数
      mockReq.params = { id: 1 };

      // 模拟数据库查询
      Notification.findByPk.mockResolvedValue(mockNotification);
      // 模拟Redis缓存删除
      deleteCache.mockResolvedValue(1);

      // 执行测试
      await markAsRead(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.findByPk).toHaveBeenCalledWith(1);
      expect(mockNotification.update).toHaveBeenCalledWith({ status: 'READ' });
      expect(deleteCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '通知已标记为已读',
        data: mockNotification,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when notification not found', async () => {
      // 设置请求参数
      mockReq.params = { id: 999 };

      // 模拟数据库查询返回null
      Notification.findByPk.mockResolvedValue(null);

      // 执行测试
      await markAsRead(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.findByPk).toHaveBeenCalledWith(999);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '通知不存在: 999',
        code: 'NOTIFICATION_NOT_FOUND',
      }));
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      // 设置请求参数
      mockReq.body = {
        userId: 1,
        notificationIds: [1, 2, 3],
      };

      // 模拟数据库更新
      Notification.update.mockResolvedValue([3]); // 影响3行
      // 模拟Redis缓存删除
      deleteCache.mockResolvedValue(1);

      // 执行测试
      await markMultipleAsRead(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.update).toHaveBeenCalledWith(
        { status: 'READ' },
        { where: { userId: 1, id: [1, 2, 3] } },
      );
      expect(deleteCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '已成功标记 3 条通知为已读',
        data: {
          updatedCount: 3,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when missing required parameters', async () => {
      // 设置请求参数 - 缺少必要字段
      mockReq.body = {
        userId: 1,
        // 缺少notificationIds
      };

      // 执行测试
      await markMultipleAsRead(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.update).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '缺少必要的参数或参数格式错误',
        code: 'INVALID_PARAMETERS',
      }));
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      // 准备测试数据
      const mockNotification = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(1),
      };

      // 设置请求参数
      mockReq.params = { id: 1 };

      // 模拟数据库查询
      Notification.findByPk.mockResolvedValue(mockNotification);
      // 模拟Redis缓存删除
      deleteCache.mockResolvedValue(1);

      // 执行测试
      await deleteNotification(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.findByPk).toHaveBeenCalledWith(1);
      expect(mockNotification.destroy).toHaveBeenCalled();
      expect(deleteCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '通知删除成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when notification not found', async () => {
      // 设置请求参数
      mockReq.params = { id: 999 };

      // 模拟数据库查询返回null
      Notification.findByPk.mockResolvedValue(null);

      // 执行测试
      await deleteNotification(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.findByPk).toHaveBeenCalledWith(999);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '通知不存在: 999',
        code: 'NOTIFICATION_NOT_FOUND',
      }));
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notification count from cache', async () => {
      // 模拟Redis缓存命中
      getCache.mockResolvedValue(5);

      // 设置请求参数
      mockReq.params = { userId: 1 };

      // 执行测试
      await getUnreadCount(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '从缓存获取未读通知数量成功',
        data: { unreadCount: 5 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get unread notification count from database when cache miss', async () => {
      // 模拟Redis缓存未命中
      getCache.mockResolvedValue(null);
      // 模拟数据库查询
      Notification.count.mockResolvedValue(3);
      // 模拟缓存设置
      setCache.mockResolvedValue('OK');

      // 设置请求参数
      mockReq.params = { userId: 1 };

      // 执行测试
      await getUnreadCount(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Notification.count).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取未读通知数量成功',
        data: { unreadCount: 3 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('clearReadNotifications', () => {
    it('should clear all read notifications', async () => {
      // 模拟数据库删除
      Notification.destroy.mockResolvedValue(5); // 删除5行
      // 模拟Redis缓存删除
      deleteCache.mockResolvedValue(1);

      // 设置请求参数
      mockReq.params = { userId: 1 };

      // 执行测试
      await clearReadNotifications(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Notification.destroy).toHaveBeenCalledWith({
        where: { userId: 1, status: 'READ' },
      });
      expect(deleteCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '已成功清除 5 条已读通知',
        data: {
          deletedCount: 5,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
