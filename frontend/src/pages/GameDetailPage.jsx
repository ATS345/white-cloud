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
  ListItemAvatar,
  Avatar,
  LinearProgress
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
import ErrorIcon from '@mui/icons-material/Error'
import StorageIcon from '@mui/icons-material/Storage'
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi'
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
  
  const { currentGame, gameDetailLoading, gameDetailError } = useSelector((state) => state.game)
  
  const [activeTab, setActiveTab] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  
  // 游戏启动相关状态
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchProgress, setLaunchProgress] = useState(0)
  
  // 系统需求检测状态
  const [systemCheck, setSystemCheck] = useState({
    isChecking: false,
    results: {
      cpu: { passed: true, value: 'Intel i5-8400', required: 'Intel i5-4590' },
      memory: { passed: true, value: '16 GB', required: '8 GB' },
      graphics: { passed: true, value: 'NVIDIA GTX 1660', required: 'NVIDIA GTX 970' },
      storage: { passed: true, value: '512 GB SSD', required: '100 GB HDD' },
      os: { passed: true, value: 'Windows 10 64-bit', required: 'Windows 7 64-bit' }
    }
  })
  
  // 数据同步状态
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    progress: 0,
    lastSynced: new Date().toLocaleString('zh-CN')
  })

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

  // 处理游戏启动
  const handleLaunchGame = () => {
    if (!currentGame) return
    
    setSnackbarMessage('正在启动游戏...')
    setSnackbarOpen(true)
    setIsLaunching(true)
    setLaunchProgress(0)
    
    // 模拟游戏启动进度
    const interval = setInterval(() => {
      setLaunchProgress(prev => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsLaunching(false)
          setSnackbarMessage('游戏启动成功！')
          setSnackbarOpen(true)
        }
        return newProgress
      })
    }, 500)
  }

  // 处理系统需求检测
  const handleCheckSystemRequirements = () => {
    setSystemCheck(prev => ({
      ...prev,
      isChecking: true
    }))
    
    // 模拟系统需求检测
    setTimeout(() => {
      // 这里可以添加真实的系统需求检测逻辑
      setSystemCheck(prev => ({
        ...prev,
        isChecking: false
      }))
      setSnackbarMessage('系统需求检测完成！')
      setSnackbarOpen(true)
    }, 1500)
  }

  // 处理数据同步
  const handleSyncData = () => {
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      progress: 0
    }))
    
    // 模拟数据同步进度
    const interval = setInterval(() => {
      setSyncStatus(prev => {
        const newProgress = prev.progress + 20
        if (newProgress >= 100) {
          clearInterval(interval)
          return {
            ...prev,
            isSyncing: false,
            progress: 100,
            lastSynced: new Date().toLocaleString('zh-CN')
          }
        }
        return {
          ...prev,
          progress: newProgress
        }
      })
    }, 300)
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
      <Box>
        {/* 系统需求检测按钮 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={systemCheck.isChecking ? <CircularProgress size={20} color="inherit" /> : <SettingsInputComponentIcon />}
            onClick={handleCheckSystemRequirements}
            disabled={systemCheck.isChecking}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {systemCheck.isChecking ? '正在检测...' : '检测系统需求'}
          </Button>
        </Box>

        {/* 系统检测结果 */}
        {!systemCheck.isChecking && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              系统检测结果
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemCheck.results.cpu.passed ? '#10b981' : '#ef4444' }}>
                      {systemCheck.results.cpu.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="CPU"
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span style={{ fontWeight: 'bold' }}>当前:</span>
                          <span>{systemCheck.results.cpu.value}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>需求:</span>
                          <span>{systemCheck.results.cpu.required}</span>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemCheck.results.memory.passed ? '#10b981' : '#ef4444' }}>
                      {systemCheck.results.memory.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="内存"
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span style={{ fontWeight: 'bold' }}>当前:</span>
                          <span>{systemCheck.results.memory.value}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>需求:</span>
                          <span>{systemCheck.results.memory.required}</span>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemCheck.results.graphics.passed ? '#10b981' : '#ef4444' }}>
                      {systemCheck.results.graphics.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="显卡"
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span style={{ fontWeight: 'bold' }}>当前:</span>
                          <span>{systemCheck.results.graphics.value}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>需求:</span>
                          <span>{systemCheck.results.graphics.required}</span>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemCheck.results.storage.passed ? '#10b981' : '#ef4444' }}>
                      {systemCheck.results.storage.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="存储空间"
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span style={{ fontWeight: 'bold' }}>当前:</span>
                          <span>{systemCheck.results.storage.value}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>需求:</span>
                          <span>{systemCheck.results.storage.required}</span>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemCheck.results.os.passed ? '#10b981' : '#ef4444' }}>
                      {systemCheck.results.os.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="操作系统"
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span style={{ fontWeight: 'bold' }}>当前:</span>
                          <span>{systemCheck.results.os.value}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>需求:</span>
                          <span>{systemCheck.results.os.required}</span>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        <Grid container spacing={4} sx={{ py: 2 }}>
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

  // 评价相关状态
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState(null)
  const [currentRating, setCurrentRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [selectedReviewId, setSelectedReviewId] = useState(null)

  // 获取游戏评价
  const fetchGameReviews = async () => {
    if (!id) return
    
    setReviewsLoading(true)
    setReviewsError(null)
    
    try {
      // 这里可以添加获取游戏评价的API调用
      const mockReviews = [
        {
          id: 1,
          user: {
            id: 1,
            username: '玩家A',
            avatar_url: 'https://via.placeholder.com/40?text=A'
          },
          rating: 5,
          content: '这款游戏非常好玩，画面精美，剧情丰富，推荐给大家！',
          created_at: '2025-12-01T10:00:00Z',
          replies: [
            {
              id: 1,
              user: {
                id: 2,
                username: '开发者B',
                avatar_url: 'https://via.placeholder.com/40?text=B'
              },
              content: '感谢您的支持！我们会继续努力更新更多内容。',
              created_at: '2025-12-01T11:00:00Z'
            }
          ]
        },
        {
          id: 2,
          user: {
            id: 3,
            username: '玩家C',
            avatar_url: 'https://via.placeholder.com/40?text=C'
          },
          rating: 4,
          content: '游戏玩法很有创意，但是有些bug需要修复。',
          created_at: '2025-12-02T14:30:00Z',
          replies: []
        }
      ]
      
      setReviews(mockReviews)
    } catch (error) {
      setReviewsError('获取评价失败，请稍后重试')
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  // 提交评价
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (currentRating === 0 || !reviewContent.trim()) {
      setSnackbarMessage('请选择评分并填写评价内容')
      setSnackbarOpen(true)
      return
    }
    
    setReviewSubmitting(true)
    
    try {
      // 这里可以添加提交评价的API调用
      const newReview = {
        id: Date.now(),
        user: {
          id: 1,
          username: '当前用户',
          avatar_url: 'https://via.placeholder.com/40?text=U'
        },
        rating: currentRating,
        content: reviewContent,
        created_at: new Date().toISOString(),
        replies: []
      }
      
      setReviews(prev => [newReview, ...prev])
      setCurrentRating(0)
      setReviewContent('')
      setSnackbarMessage('评价提交成功')
      setSnackbarOpen(true)
    } catch (error) {
      setSnackbarMessage('评价提交失败，请稍后重试')
      setSnackbarOpen(true)
      console.error('Error submitting review:', error)
    } finally {
      setReviewSubmitting(false)
    }
  }

  // 提交回复
  const handleSubmitReply = async (reviewId) => {
    if (!replyContent.trim()) {
      setSnackbarMessage('请填写回复内容')
      setSnackbarOpen(true)
      return
    }
    
    try {
      // 这里可以添加提交回复的API调用
      const newReply = {
        id: Date.now(),
        user: {
          id: 1,
          username: '当前用户',
          avatar_url: 'https://via.placeholder.com/40?text=U'
        },
        content: replyContent,
        created_at: new Date().toISOString()
      }
      
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            replies: [...review.replies, newReply]
          }
        }
        return review
      }))
      
      setReplyContent('')
      setSelectedReviewId(null)
      setSnackbarMessage('回复提交成功')
      setSnackbarOpen(true)
    } catch (error) {
      setSnackbarMessage('回复提交失败，请稍后重试')
      setSnackbarOpen(true)
      console.error('Error submitting reply:', error)
    }
  }

  // 渲染评价列表
  const renderReviews = () => {
    return (
      <Box sx={{ py: 2 }}>
        {/* 评价统计 */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            评价统计
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  {currentGame?.rating || 0}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  平均评分
                </Typography>
                <Rating
                  value={currentGame?.rating || 0}
                  precision={0.5}
                  readOnly
                  size="large"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {reviews.length}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  评价数量
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                  {Math.round(reviews.filter(r => r.rating >= 4).length / reviews.length * 100) || 0}%
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  好评率
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899' }}>
                  {new Date().toLocaleDateString('zh-CN')}
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
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          用户评价
        </Typography>
        
        {reviewsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : reviewsError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {reviewsError}
          </Alert>
        ) : reviews.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              暂无评价，快来成为第一个评价的玩家吧！
            </Typography>
          </Box>
        ) : (
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
                
                {/* 回复输入框 */}
                {selectedReviewId === review.id ? (
                  <Box sx={{ ml: 7, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="写下您的回复..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSubmitReply(review.id)}
                        sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                      >
                        回复
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedReviewId(null)
                          setReplyContent('')
                        }}
                      >
                        取消
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedReviewId(review.id)}
                    sx={{ ml: 7 }}
                  >
                    回复
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        )}
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
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>同步中</span>
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

                    {/* 游戏启动进度条 */}
                    {isLaunching && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>游戏启动中...</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={launchProgress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {launchProgress}%
                          </Typography>
                        </Box>
                      </Box>
                    )}

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
                        variant="contained"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{ flexGrow: 1, borderRadius: 1, backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
                      >
                        立即下载
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleLaunchGame}
                        sx={{ flexGrow: 1, borderRadius: 1 }}
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
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="系统需求" />
                <Tab label="开发者信息" />
                <Tab label="版本历史" />
                <Tab label="用户评价" />
                <Tab label="数据同步" />
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
              {activeTab === 4 && renderDataSync()}
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