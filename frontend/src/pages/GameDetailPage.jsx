import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Chip,
  Rating,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Avatar,
  LinearProgress,
  TextField
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DownloadIcon from '@mui/icons-material/Download'
import ShareIcon from '@mui/icons-material/Share'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloudIcon from '@mui/icons-material/Cloud'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import StorageIcon from '@mui/icons-material/Storage'
import CreditCardIcon from '@mui/icons-material/CreditCard'

import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent'
import MemoryIcon from '@mui/icons-material/Memory'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import {
  fetchGameDetail,
  clearGameDetail
} from '../store/gameSlice'

const GameDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { game: currentGame, loading: gameDetailLoading, error: gameDetailError } = useSelector((state) => state.game)
  
  // 状态管理
  const [activeTab, setActiveTab] = useState(0)
  const [currentRating, setCurrentRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  
  // 模拟评论数据
  const reviews = [
    {
      id: 1,
      user: {
        username: '游戏玩家123',
        avatar_url: ''
      },
      rating: 4.5,
      content: '游戏非常不错，画面精美，剧情丰富，推荐大家游玩！',
      created_at: '2025-12-05T10:30:00Z',
      replies: []
    },
    {
      id: 2,
      user: {
        username: '游戏达人456',
        avatar_url: ''
      },
      rating: 5.0,
      content: '这是我今年玩过的最好玩的游戏，没有之一！',
      created_at: '2025-12-04T15:20:00Z',
      replies: []
    }
  ]
  
  // 模拟系统需求
  const minimumReq = {
    os: 'Windows 10 64位',
    processor: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
    memory: '8 GB RAM',
    graphics: 'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB',
    storage: '70 GB 可用空间'
  }
  
  const recommendedReq = {
    os: 'Windows 10 64位',
    processor: 'Intel Core i7-8700K / AMD Ryzen 7 2700X',
    memory: '16 GB RAM',
    graphics: 'NVIDIA GeForce RTX 2070 Super / AMD Radeon RX 5700 XT',
    storage: '70 GB SSD 可用空间'
  }
  
  // 模拟同步状态
  const syncStatus = {
    isSyncing: false,
    progress: 100,
    lastSynced: '2025-12-07 14:30:00'
  }
  
  // 初始化获取游戏详情
  useEffect(() => {
    dispatch(fetchGameDetail(id))
    
    // 组件卸载时清理游戏详情
    return () => {
      dispatch(clearGameDetail())
    }
  }, [dispatch, id])
  
  // 处理返回按钮
  const handleBackClick = () => {
    navigate(-1)
  }
  
  // 处理添加到购物车
  const handleAddToCart = () => {
    setSnackbarMessage('游戏已添加到购物车')
    setSnackbarOpen(true)
  }
  
  // 处理立即购买
  const handleBuyNow = () => {
    navigate('/checkout', { state: { games: [currentGame] } })
  }
  
  // 处理下载游戏
  const handleDownloadGame = () => {
    setSnackbarMessage('正在准备下载...')
    setSnackbarOpen(true)
    
    // 这里可以添加跳转到下载页面或调用下载API的逻辑
    // 例如：navigate('/download', { state: { gameId: currentGame.id } })
  }
  
  // 处理启动游戏
  const handleLaunchGame = () => {
    setSnackbarMessage('正在启动游戏...')
    setSnackbarOpen(true)
  }
  
  // 处理提交评价
  const handleSubmitReview = (e) => {
    e.preventDefault()
    setReviewSubmitting(true)
    
    // 模拟提交评价
    setTimeout(() => {
      setReviewSubmitting(false)
      setSnackbarMessage('评价提交成功')
      setSnackbarOpen(true)
      setCurrentRating(0)
      setReviewContent('')
    }, 1500)
  }
  
  // 处理关闭通知
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }
  
  // 处理数据同步
  const handleSyncData = () => {
    // 模拟同步数据
  }
  
  // 渲染系统需求
  const renderSystemRequirements = () => {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          系统需求
        </Typography>
        <Grid container spacing={3}>
          {/* 最低配置 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                最低配置
              </Typography>
              {minimumReq ? (
                <Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GpsFixedIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        操作系统
                      </Typography>
                    </Box>
                    <Typography variant="body1">{minimumReq.os}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsInputComponentIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        处理器
                      </Typography>
                    </Box>
                    <Typography variant="body1">{minimumReq.processor}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        内存
                      </Typography>
                    </Box>
                    <Typography variant="body1">{minimumReq.memory}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        显卡
                      </Typography>
                    </Box>
                    <Typography variant="body1">{minimumReq.graphics}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        存储空间
                      </Typography>
                    </Box>
                    <Typography variant="body1">{minimumReq.storage}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无最低配置信息
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* 推荐配置 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                推荐配置
              </Typography>
              {recommendedReq ? (
                <Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GpsFixedIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        操作系统
                      </Typography>
                    </Box>
                    <Typography variant="body1">{recommendedReq.os}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsInputComponentIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        处理器
                      </Typography>
                    </Box>
                    <Typography variant="body1">{recommendedReq.processor}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MemoryIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        内存
                      </Typography>
                    </Box>
                    <Typography variant="body1">{recommendedReq.memory}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        显卡
                      </Typography>
                    </Box>
                    <Typography variant="body1">{recommendedReq.graphics}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        存储空间
                      </Typography>
                    </Box>
                    <Typography variant="body1">{recommendedReq.storage}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无推荐配置信息
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // 渲染开发者信息
  const renderDeveloperInfo = () => {
    if (!currentGame || !currentGame.developer) {
      return (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            暂无开发者信息
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ py: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            开发者信息
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: '#6366f1' }}
            >
              {currentGame.developer.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
                {currentGame.developer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentGame.developer.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    )
  }

  // 渲染游戏截图
  const renderScreenshots = () => {
    return (
      <Box sx={{ py: 2 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Paper sx={{ p: 1, borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    bgcolor: '#1e293b',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  游戏截图 {item}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // 渲染游戏视频
  const renderVideo = () => {
    return (
      <Box sx={{ py: 2 }}>
        <Paper sx={{ p: 1, borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              width: '100%',
              height: 400,
              bgcolor: '#1e293b',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#334155'
              }
            }}
          >
            <PlayArrowIcon sx={{ fontSize: '4rem', mr: 2, color: '#6366f1' }} />
            播放游戏预告片
          </Box>
        </Paper>
      </Box>
    )
  }

  // 渲染游戏评论
  const renderReviews = () => {
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

  // 渲染游戏数据同步
  const renderDataSync = () => {
    return (
      <Box sx={{ py: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudIcon />
            游戏数据同步
          </Typography>
          
          {/* 同步状态 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              同步状态
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1">
                {syncStatus.isSyncing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="primary" />
                    <span>正在同步数据...</span>
                  </Box>
                ) : syncStatus.progress === 100 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981' }}>
                    <CheckCircleIcon />
                    <span>数据已同步</span>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b' }}>
                    <WarningIcon />
                    <span>数据未同步</span>
                  </Box>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                最后同步: {syncStatus.lastSynced}
              </Typography>
            </Box>
            
            {/* 同步进度条 */}
            <LinearProgress
              variant={syncStatus.isSyncing ? 'determinate' : 'indeterminate'}
              value={syncStatus.progress}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            
            {syncStatus.progress > 0 && !syncStatus.isSyncing && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  同步进度
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {syncStatus.progress}%
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* 同步选项 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              同步选项
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="存档"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="设置"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="成就"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="好友"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
          
          {/* 同步按钮 */}
          <Button
            variant="contained"
            size="large"
            startIcon={syncStatus.isSyncing ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            onClick={handleSyncData}
            disabled={syncStatus.isSyncing}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {syncStatus.isSyncing ? '正在同步...' : '立即同步'}
          </Button>
        </Paper>
        
        {/* 同步历史 */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            同步历史
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="游戏存档同步"
                secondary={
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <span>状态:</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>时间:</span>
                      <span>{syncStatus.lastSynced}</span>
                    </Box>
                  </>
                }
              />
              <IconButton edge="end" aria-label="more">
                <CloudIcon />
              </IconButton>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemText
                primary="成就数据同步"
                secondary={
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <span>状态:</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>时间:</span>
                      <span>{new Date(Date.now() - 86400000).toLocaleString('zh-CN')}</span>
                    </Box>
                  </>
                }
              />
              <IconButton edge="end" aria-label="more">
                <CloudIcon />
              </IconButton>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemText
                primary="游戏设置同步"
                secondary={
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <span>状态:</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>时间:</span>
                      <span>{new Date(Date.now() - 172800000).toLocaleString('zh-CN')}</span>
                    </Box>
                  </>
                }
              />
              <IconButton edge="end" aria-label="more">
                <CloudIcon />
              </IconButton>
            </ListItem>
          </List>
        </Paper>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* 返回按钮 */}
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 3 }}
          onClick={handleBackClick}
        >
          返回
        </Button>

        {gameDetailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
            <CircularProgress size={80} />
          </Box>
        ) : gameDetailError ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
            <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
              {gameDetailError}
            </Alert>
          </Box>
        ) : !currentGame ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
            <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
              游戏不存在
            </Alert>
          </Box>
        ) : (
          <Box>
            {/* 游戏基本信息 */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {/* 游戏封面 */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      bgcolor: '#1e293b',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    游戏封面
                  </Box>
                </Paper>
              </Grid>

              {/* 游戏信息 */}
              <Grid item xs={12} md={8}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {currentGame.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating
                    value={currentGame.rating || 0}
                    readOnly
                    precision={0.5}
                    size="large"
                  />
                  <Typography variant="body1" color="text.secondary">
                    {currentGame.rating || 0}/5 分
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({currentGame.review_count || 0} 条评价)
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  {currentGame.discount_price && currentGame.discount_price < currentGame.price ? (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mr: 2, display: 'inline-block' }}>
                        ¥{currentGame.discount_price.toFixed(2)}
                      </Typography>
                      <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary', display: 'inline-block' }}>
                        ¥{currentGame.price.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`-${Math.round(((currentGame.price - currentGame.discount_price) / currentGame.price) * 100)}%`}
                        color="error"
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                      ¥{currentGame.price.toFixed(2)}
                    </Typography>
                  )}
                </Box>

                {/* 游戏分类和标签 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {currentGame.categories && currentGame.categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentGame.tags && currentGame.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                {/* 游戏操作按钮 */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, flexGrow: 1 }}
                  >
                    添加到购物车
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CreditCardIcon />}
                    onClick={handleBuyNow}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, flexGrow: 1 }}
                  >
                    立即购买
                  </Button>
                </Box>

                {/* 游戏状态按钮 */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadGame}
                    sx={{ flexGrow: 1, borderColor: '#6366f1', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}
                  >
                    下载游戏
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleLaunchGame}
                    sx={{ flexGrow: 1, borderColor: '#10b981', color: '#10b981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                  >
                    启动游戏
                  </Button>
                  <IconButton
                    size="large"
                    color="primary"
                    sx={{ borderRadius: 1 }}
                    title="分享"
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>

                {/* 游戏基本信息 */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    发布日期
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(currentGame.release_date).toLocaleDateString('zh-CN')}
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    开发商
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {currentGame.developer?.name || '未知'}
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    简介
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {currentGame.description}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* 标签页导航 */}
            <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={activeTab}
                onChange={(event, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 'bold',
                  }
                }}
              >
                <Tab label="游戏详情" />
                <Tab label="系统需求" />
                <Tab label="游戏截图" />
                <Tab label="玩家评价" />
                <Tab label="数据同步" />
              </Tabs>
            </Paper>

            {/* 标签页内容 */}
            <Box sx={{ mb: 4 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    游戏详情
                  </Typography>
                  <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                      {currentGame.description}
                    </Typography>
                    {renderDeveloperInfo()}
                  </Paper>
                  {renderVideo()}
                </Box>
              )}
              {activeTab === 1 && renderSystemRequirements()}
              {activeTab === 2 && renderScreenshots()}
              {activeTab === 3 && renderReviews()}
              {activeTab === 4 && renderDataSync()}
            </Box>
          </Box>
        )}

        {/* 通知 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  )
}

export default GameDetailPage
