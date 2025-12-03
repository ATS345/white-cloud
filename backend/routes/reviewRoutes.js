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
import { protect } from '../middleware/auth.js'

const router = express.Router()

// 评价路由
router.post('/:gameId', protect, createReview) // 创建评价
router.get('/game/:gameId', getGameReviews) // 获取游戏评价列表
router.put('/:reviewId', protect, updateReview) // 更新评价
router.delete('/:reviewId', protect, deleteReview) // 删除评价
router.post('/:reviewId/replies', protect, createReviewReply) // 创建评价回复
router.delete('/replies/:replyId', protect, deleteReviewReply) // 删除评价回复
router.get('/user/:userId', getUserReviews) // 获取用户的评价历史

export default router