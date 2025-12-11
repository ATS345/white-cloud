// 评论路由 - 处理评论相关的HTTP请求
import express from 'express';
import {
  createReview,
  getGameReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  likeReview,
  dislikeReview,
  getGameReviewStats
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * 评论路由定义
 */

// 创建评论 - 需要认证
router.post('/', authenticate, createReview);

// 获取游戏的评论列表 - 无需认证
router.get('/game/:gameId', getGameReviews);

// 获取用户的评论列表 - 无需认证
router.get('/user/:userId', getUserReviews);

// 获取单个评论详情 - 无需认证
router.get('/:id', getReviewById);

// 更新评论 - 需要认证
router.put('/:id', authenticate, updateReview);

// 删除评论 - 需要认证
router.delete('/:id', authenticate, deleteReview);

// 点赞评论 - 无需认证
router.post('/:id/like', likeReview);

// 踩评论 - 无需认证
router.post('/:id/dislike', dislikeReview);

// 获取游戏的评论统计信息 - 无需认证
router.get('/game/:gameId/stats', getGameReviewStats);

export default router;
