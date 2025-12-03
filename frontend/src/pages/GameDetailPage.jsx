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
import {
  fetchGameDetail,
  clearGameDetail
} from '../store/gameSlice'

const GameDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentGame, gameDetailLoading, gameDetailError } = useSelector((state) => state.game)
  
  const [activeTab, setActiveTab] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // 初始化加载游戏详情
  useEffect(() => {
    dispatch(fetchGameDetail(id))
    
    // 组件卸载时清除游戏详情
    return () => {
      dispatch(clearGameDetail())
    }
  }, [dispatch, id])

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // 处理返回按钮点击
  const handleBackClick = () => {
    navigate(-1)
  }

  // 处理加入购物车
  const handleAddToCart = () => {
    if (!currentGame) return
    
    setSnackbarMessage(`${currentGame.title} 已加入购物车`)
    setSnackbarOpen(true)
    // 这里可以添加加入购物车的逻辑
  }

  // 处理下载游戏
  const handleDownload = () => {
    if (!currentGame) return
    
    setSnackbarMessage('开始下载游戏...')
    setSnackbarOpen(true)
    // 这里可以添加下载游戏的逻辑
  }

  // 关闭通知
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(price)
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 渲染游戏截图
  const renderScreenshots = () => {
    if (!currentGame || !currentGame.screenshots) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            暂无截图
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2, pb: 3 }}>
        {currentGame.screenshots.map((screenshot, index) => (
          <Box
            key={index}
            sx={{
              flex: '0 0 auto',
              width: 400,
              height: 225,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 2
            }}
          >
            <img
              src={screenshot.url || 'https://via.placeholder.com/400x225?text=Screenshot'}
              alt={`${currentGame.title} Screenshot ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        ))}
      </Box>
    )
  }

  // 渲染系统需求
  const renderSystemRequirements = () => {
    if (!currentGame || !currentGame.system_requirements) {
      return (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            暂无系统需求信息
          </Typography>
        </Box>
      )
    }

    // 分离最低配置和推荐配置
    const minimumReq = currentGame.system_requirements.find(req => req.type === 'minimum')
    const recommendedReq = currentGame.system_requirements.find(req => req.type === 'recommended')

    return (
      <Grid container spacing={4} sx={{ py: 2 }}>
        {/* 最低配置 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              最低配置
            </Typography>
            {minimumReq ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    操作系统
                  </Typography>
                  <Typography variant="body1">{minimumReq.os}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    处理器
                  </Typography>
                  <Typography variant="body1">{minimumReq.processor}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    内存
                  </Typography>
                  <Typography variant="body1">{minimumReq.memory}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    显卡
                  </Typography>
                  <Typography variant="body1">{minimumReq.graphics}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    存储空间
                  </Typography>
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
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    操作系统
                  </Typography>
                  <Typography variant="body1">{recommendedReq.os}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    处理器
                  </Typography>
                  <Typography variant="body1">{recommendedReq.processor}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    内存
                  </Typography>
                  <Typography variant="body1">{recommendedReq.memory}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    显卡
                  </Typography>
                  <Typography variant="body1">{recommendedReq.graphics}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    存储空间
                  </Typography>
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
            {currentGame.developer.company_name}
          </Typography>
          
          {currentGame.developer.bio && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {currentGame.developer.bio}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {currentGame.developer.contact_email && (
              <Chip
                label={`联系邮箱: ${currentGame.developer.contact_email}`}
                variant="outlined"
              />
            )}
            {currentGame.developer.website && (
              <Chip
                label={`官网: ${currentGame.developer.website}`}
                variant="outlined"
              />
            )}
          </Box>
        </Paper>
      </Box>
    )
  }

  // 渲染游戏版本信息
  const renderVersions = () => {
    if (!currentGame || !currentGame.versions) {
      return (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            暂无版本信息
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ py: 2 }}>
        {currentGame.versions.map((version) => (
          <Paper key={version.id} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
                  版本 {version.version_number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  发布日期: {new Date(version.release_date).toLocaleDateString('zh-CN')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={version.platform.toUpperCase()}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={formatFileSize(version.file_size)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            {version.changelog && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  更新日志:
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {version.changelog}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ mt: 1 }}
              onClick={handleDownload}
            >
              下载此版本
            </Button>
          </Paper>
        ))}
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
        ) : currentGame ? (
          <Box>
            {/* 游戏基本信息 */}
            <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
              <Grid container spacing={4}>
                {/* 游戏主图 */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                    <img
                      src={currentGame.main_image_url || 'https://via.placeholder.com/800x450?text=Game+Image'}
                      alt={currentGame.title}
                      style={{
                        width: '100%',
                        display: 'block'
                      }}
                    />
                    {/* 折扣标签 */}
                    {currentGame.discount_price && currentGame.discount_price < currentGame.price && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: 1,
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: 2
                        }}
                      >
                        {Math.round((1 - currentGame.discount_price / currentGame.price) * 100)}% OFF
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* 游戏信息 */}
                <Grid item xs={12} md={6}>
                  {/* 游戏分类和标签 */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {currentGame.categories?.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        sx={{
                          backgroundColor: '#475569',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#64748b'
                          }
                        }}
                      />
                    ))}
                    {currentGame.tags?.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  {/* 游戏标题 */}
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    {currentGame.title}
                  </Typography>

                  {/* 评分 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Rating
                      value={currentGame.rating || 0}
                      precision={0.5}
                      readOnly
                      size="large"
                    />
                    <Typography variant="body1" sx={{ ml: 1, color: 'text.secondary' }}>
                      ({currentGame.review_count} 条评价)
                    </Typography>
                  </Box>

                  {/* 发布日期 */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    发布日期: {new Date(currentGame.release_date).toLocaleDateString('zh-CN')}
                  </Typography>

                  {/* 游戏描述 */}
                  <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 4 }}>
                    {currentGame.description}
                  </Typography>

                  {/* 价格和操作按钮 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      {currentGame.discount_price && currentGame.discount_price < currentGame.price ? (
                        <>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>
                            {formatPrice(currentGame.discount_price)}
                          </Typography>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            原价: {formatPrice(currentGame.price)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>
                          {formatPrice(currentGame.price)}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAddToCart}
                        sx={{ flexGrow: 1, borderRadius: 1, backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
                      >
                        加入购物车
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{ flexGrow: 1, borderRadius: 1 }}
                      >
                        立即下载
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
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* 游戏截图 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                游戏截图
              </Typography>
              {renderScreenshots()}
            </Box>

            {/* 游戏视频 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                游戏视频
              </Typography>
              <Paper sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
                <Box sx={{ 
                  height: 400,
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* 视频播放按钮 */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(99, 102, 241, 0.9)',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 70, 229, 0.9)',
                      transform: 'translate(-50%, -50%) scale(1.1)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <PlayArrowIcon sx={{ fontSize: 40, color: 'white', ml: 0.5 }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    点击播放游戏视频
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* 选项卡 */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  textColor="primary"
                  indicatorColor="primary"
                >
                  <Tab label="系统需求" />
                  <Tab label="开发者信息" />
                  <Tab label="版本历史" />
                  <Tab label="用户评价" />
                </Tabs>
              </Box>

              {/* 选项卡内容 */}
              <Box sx={{ p: 3 }}>
                {activeTab === 0 && renderSystemRequirements()}
                {activeTab === 1 && renderDeveloperInfo()}
                {activeTab === 2 && renderVersions()}
                {activeTab === 3 && (
                  <Box sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      用户评价功能开发中...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Box>

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
    </Container>
  )
}

export default GameDetailPage