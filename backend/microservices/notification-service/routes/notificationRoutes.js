// 通知路由 - 处理通知相关的HTTP请求
import express from 'express';
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
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * 通知路由定义
 */

// 创建通知 - 需要认证
router.post('/', authenticate, createNotification);

// 获取用户的通知列表 - 需要认证
router.get('/user/:userId', authenticate, getUserNotifications);

// 获取单个通知详情 - 需要认证
router.get('/:id', authenticate, getNotificationById);

// 标记通知为已读 - 需要认证
router.put('/:id/read', authenticate, markAsRead);

// 批量标记通知为已读 - 需要认证
router.put('/read-multiple', authenticate, markMultipleAsRead);

// 删除通知 - 需要认证
router.delete('/:id', authenticate, deleteNotification);

// 批量删除通知 - 需要认证
router.delete('/delete-multiple', authenticate, deleteMultipleNotifications);

// 获取未读通知数量 - 需要认证
router.get('/user/:userId/unread-count', authenticate, getUnreadCount);

// 清除所有已读通知 - 需要认证
router.delete('/user/:userId/clear-read', authenticate, clearReadNotifications);
