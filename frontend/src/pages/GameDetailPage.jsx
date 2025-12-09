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
  Tabs
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DownloadIcon from '@mui/icons-material/Download'
import ShareIcon from '@mui/icons-material/Share'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CreditCardIcon from '@mui/icons-material/CreditCard'

import {
  fetchGameDetail,
  clearGameDetail
} from '../store/gameSlice'

// 导入子组件
import SystemRequirements from '../components/SystemRequirements'
import GameReviews from '../components/GameReviews'
import GameScreenshots from '../components/GameScreenshots'
import GameDataSync from '../components/GameDataSync'
import GameVideo from '../components/GameVideo'
import DeveloperInfo from '../components/DeveloperInfo'

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
                    <DeveloperInfo developer={currentGame.developer} />
                  </Paper>
                  <GameVideo />
                </Box>
              )}
              {activeTab === 1 && <SystemRequirements minimumReq={minimumReq} recommendedReq={recommendedReq} />}
              {activeTab === 2 && <GameScreenshots screenshots={null} />}
              {activeTab === 3 && <GameReviews reviews={reviews} game={currentGame} />}
              {activeTab === 4 && <GameDataSync syncStatus={syncStatus} />}
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