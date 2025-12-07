import express from 'express'
import { 
  createReview, 
  getGameReviews, 
  updateReview, 
  deleteReview, 
  createReviewReply, 
  deleteReviewReply, 
  getUserReviews 
} from '../controllers/reviewController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// 评价路由
router.post('/:gameId', authenticate, createReview) // 创建评价
router.get('/game/:gameId', getGameReviews) // 获取游戏评价列表
router.put('/:reviewId', authenticate, updateReview) // 更新评价
router.delete('/:reviewId', authenticate, deleteReview) // 删除评价
router.post('/:reviewId/replies', authenticate, createReviewReply) // 创建评价回复
router.delete('/replies/:replyId', authenticate, deleteReviewReply) // 删除评价回复
router.get('/user/:userId', getUserReviews) // 获取用户的评价历史

export default router