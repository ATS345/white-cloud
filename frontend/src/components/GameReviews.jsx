import React, { useState } from 'react'
import {
  Typography,
  Box,
  Paper,
  Rating,
  Chip,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material'

const GameReviews = ({ reviews, game }) => {
  // 状态管理
  const [currentRating, setCurrentRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // 处理提交评价
  const handleSubmitReview = (e) => {
    e.preventDefault()
    setReviewSubmitting(true)
    
    // 这里可以添加提交评价的API调用逻辑
    setTimeout(() => {
      setReviewSubmitting(false)
      setCurrentRating(0)
      setReviewContent('')
      // 可以添加成功提示
    }, 1500)
  }

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          用户评价
          <Chip
            label={`${reviews.length} 条评价`}
            color="primary"
            size="small"
          />
        </Typography>
        <Rating
          value={4.5}
          readOnly
          precision={0.5}
          size="large"
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          4.5/5 分（基于 {reviews.length} 条评价）
        </Typography>
        
        {/* 评价统计 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                {reviews.length}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                总评价
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                好评率
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                平均评分
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899' }}>
                {new Date(reviews[0].created_at).toLocaleDateString('zh-CN')}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                最新评价
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 撰写评价 */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          撰写评价
        </Typography>
        <form onSubmit={handleSubmitReview}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              评分
            </Typography>
            <Rating
              value={currentRating}
              onChange={(event, newValue) => {
                setCurrentRating(newValue)
              }}
              size="large"
              precision={1}
              sx={{ mb: 2 }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="评价内容"
            variant="outlined"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="请分享您对这款游戏的体验...（10-5000字）"
            sx={{ mb: 3 }}
            disabled={reviewSubmitting}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={reviewSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={reviewSubmitting}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {reviewSubmitting ? '提交中...' : '提交评价'}
          </Button>
        </form>
      </Paper>
      
      {/* 评价列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={review.user.avatar_url} alt={review.user.username}>
                  {review.user.username.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {review.user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.created_at).toLocaleDateString('zh-CN')}
                  </Typography>
                </Box>
              </Box>
              <Rating
                value={review.rating}
                readOnly
                size="medium"
                precision={1}
              />
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {review.content}
            </Typography>
            
            {/* 回复列表 */}
            {review.replies && review.replies.length > 0 && (
              <Box sx={{ ml: 7, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {review.replies.map((reply) => (
                  <Box key={reply.id} sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar src={reply.user.avatar_url} alt={reply.user.username} sx={{ width: 28, height: 28 }}>
                        {reply.user.username.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {reply.user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(reply.created_at).toLocaleDateString('zh-CN')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      {reply.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default GameReviews