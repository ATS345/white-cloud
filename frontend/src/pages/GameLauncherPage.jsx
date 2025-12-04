import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchGames, 
  launchGame, 
  installGame, 
  updateGame,
  checkSystemRequirements,
  syncGameData
} from '../store/gameSlice'
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
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem
} from '@mui/material'
import GamepadIcon from '@mui/icons-material/Gamepad'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DownloadIcon from '@mui/icons-material/Download'
import SettingsIcon from '@mui/icons-material/Settings'
import RefreshIcon from '@mui/icons-material/Refresh'
import InfoIcon from '@mui/icons-material/Info'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import StorageIcon from '@mui/icons-material/Storage'
import CpuIcon from '@mui/icons-material/Cpu'
import MemoryIcon from '@mui/icons-material/Memory'
import DisplayIcon from '@mui/icons-material/Display'

const GameLauncherPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // 从Redux store获取游戏数据
  const { games, loading, error } = useSelector(state => state.game)
  
  const [activeTab, setActiveTab] = useState(0)
  const [selectedGame, setSelectedGame] = useState(null)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [systemCheckDialogOpen, setSystemCheckDialogOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    progress: 0,
    lastSynced: '2025-12-03 15:00'
  })
  
  // 本地游戏状态管理
  const [localGames, setLocalGames] = useState([])
  
  // 游戏设置状态
  const [gameSettings, setGameSettings] = useState({
    graphics: {
      resolution: '1920x1080',
      quality: 'high',
      vsync: true,
      fpsLimit: 60
    },
    audio: {
      masterVolume: 75,
      musicVolume: 50,
      sfxVolume: 80,
      voiceVolume: 65
    },
    controls: {
      invertY: false,
      sensitivity: 50,
      deadzone: 10
    },
    gameplay: {
      difficulty: 'normal',
      autoSave: true,
      hudOpacity: 100,
      subtitles: true
    }
  })
  
  // 获取游戏列表
  useEffect(() => {
    dispatch(fetchGames())
  }, [dispatch])
  
  // 将从store获取的游戏数据转换为本地游戏库数据
  useEffect(() => {
    if (games.length > 0) {
      const mappedGames = games.map(game => ({
        id: game.id,
        title: game.title,
        image: game.cover_image || 'https://via.placeholder.com/400x200?text=Game+Cover',
        status: 'not_installed', // 默认未安装，实际应从本地存储或后端获取
        progress: 0,
        lastPlayed: '',
        playtime: '0小时 0分钟',
        version: game.latest_version || '1.0',
        requiresUpdate: false,
        updateSize: '',
        systemCheck: {
          passed: true,
          issues: []
        }
      }))
      setLocalGames(mappedGames)
    }
  }, [games])

  // 处理游戏启动
  const handleLaunchGame = (game) => {
    // 使用Redux Thunk启动游戏
    dispatch(launchGame(game.id))
    
    // 更新本地游戏状态
    setLocalGames(prevGames => prevGames.map(g => 
      g.id === game.id ? { ...g, status: 'launching' } : g
    ))
    
    // 模拟启动进度
    const interval = setInterval(() => {
      setLocalGames(prevGames => {
        const updatedGames = prevGames.map(g => {
          if (g.id === game.id) {
            const newProgress = g.progress + 10
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...g, progress: 100, status: 'launched' }
            }
            return { ...g, progress: newProgress }
          }
          return g
        })
        return updatedGames
      })
    }, 500)
  }

  // 处理游戏更新
  const handleUpdateGame = (game) => {
    // 使用Redux Thunk更新游戏
    dispatch(updateGame(game.id))
    
    // 更新本地游戏状态
    setLocalGames(prevGames => prevGames.map(g => 
      g.id === game.id ? { ...g, status: 'updating', progress: 0 } : g
    ))
    
    // 模拟更新进度
    const interval = setInterval(() => {
      setLocalGames(prevGames => {
        const updatedGames = prevGames.map(g => {
          if (g.id === game.id) {
            const newProgress = g.progress + 5
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...g, progress: 0, status: 'installed', requiresUpdate: false }
            }
            return { ...g, progress: newProgress }
          }
          return g
        })
        return updatedGames
      })
    }, 500)
  }

  // 处理游戏安装
  const handleInstallGame = (game) => {
    // 使用Redux Thunk安装游戏
    dispatch(installGame(game.id))
    
    // 更新本地游戏状态
    setLocalGames(prevGames => prevGames.map(g => 
      g.id === game.id ? { ...g, status: 'installing', progress: 0 } : g
    ))
    
    // 模拟安装进度
    const interval = setInterval(() => {
      setLocalGames(prevGames => {
        const updatedGames = prevGames.map(g => {
          if (g.id === game.id) {
            const newProgress = g.progress + 3
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...g, progress: 0, status: 'installed' }
            }
            return { ...g, progress: newProgress }
          }
          return g
        })
        return updatedGames
      })
    }, 500)
  }

  // 处理数据同步
  const handleSyncData = () => {
    // 模拟系统信息（实际应用中应该从客户端获取）
    const systemInfo = {
      os: 'Windows 10 Pro 64位',
      processor: 'Intel Core i7-11700K @ 3.60GHz',
      memory: '16 GB DDR4 3200MHz',
      graphics: 'NVIDIA GeForce RTX 3070 (8 GB)',
      storage: '512 GB SSD'
    }
    
    // 使用Redux Thunk同步游戏数据
    dispatch(syncGameData({ 
      gameId: selectedGame?.id || 0, 
      syncData: { 
        // 实际应用中应该包含真实的游戏数据
        saveData: 'latest',
        settings: gameSettings
      } 
    }))
    
    // 更新同步状态
    setSyncStatus(prev => ({ ...prev, isSyncing: true, progress: 0 }))
    
    // 模拟同步进度
    const interval = setInterval(() => {
      setSyncStatus(prev => {
        const newProgress = prev.progress + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          return {
            ...prev,
            isSyncing: false,
            progress: 100,
            lastSynced: new Date().toLocaleString('zh-CN')
          }
        }
        return { ...prev, progress: newProgress }
      })
    }, 300)
  }

  // 收集系统信息（简化版，实际应用中应该使用更复杂的方法获取真实系统信息）
  const collectSystemInfo = () => {
    // 注意：在真实环境中，由于浏览器安全限制，无法直接获取详细系统信息
    // 这里使用模拟数据，实际应用中可能需要使用浏览器API、插件或其他方式获取
    return {
      os: navigator.platform || 'Windows 10 Pro 64位',
      processor: 'Intel Core i7-11700K @ 3.60GHz', // 模拟数据
      memory: '16 GB DDR4 3200MHz', // 模拟数据
      graphics: 'NVIDIA GeForce RTX 3070 (8 GB)', // 模拟数据
      storage: '512 GB SSD' // 模拟数据
    }
  }

  // 处理系统检查
  const handleSystemCheck = () => {
    // 收集系统信息
    const systemInfo = collectSystemInfo()
    
    // 使用Redux Thunk进行系统需求检测
    dispatch(checkSystemRequirements({ 
      gameId: selectedGame?.id || 0, 
      systemInfo 
    }))
    
    // 打开系统检查对话框
    setSystemCheckDialogOpen(true)
  }

  // 渲染单个游戏卡片
  const renderGameCard = (game) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
        <Paper
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
            }
          }}
        >
          {/* 游戏封面 */}
          <Box sx={{ position: 'relative', height: 120, overflow: 'hidden' }}>
            <img
              src={game.image}
              alt={game.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {/* 游戏状态标签 */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: game.status === 'installed' ? '#10b981' : 
                                 game.status === 'needs_update' ? '#f59e0b' :
                                 game.status === 'updating' || game.status === 'installing' ? '#6366f1' :
                                 '#475569',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 1,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              {game.status === 'installed' ? '已安装' : 
               game.status === 'needs_update' ? '需要更新' :
               game.status === 'updating' ? '更新中' :
               game.status === 'installing' ? '安装中' :
               '未安装'}
            </Box>
            
            {/* 系统检查结果 */}
            {game.status !== 'not_installed' && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: game.systemCheck.passed ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: game.systemCheck.passed ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                  }
                }}
                title={game.systemCheck.passed ? '系统需求满足' : '系统需求不满足'}
              >
                {game.systemCheck.passed ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>
          
          {/* 游戏信息 */}
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {game.title}
            </Typography>
            
            {/* 游戏状态信息 */}
            {game.status === 'installed' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  最后游玩: {game.lastPlayed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  游玩时间: {game.playtime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  版本: {game.version}
                </Typography>
              </Box>
            )}
            
            {game.status === 'needs_update' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningIcon fontSize="small" />
                  需要更新到最新版本
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  更新大小: {game.updateSize}
                </Typography>
              </Box>
            )}
            
            {/* 进度条 */}
            {(game.status === 'updating' || game.status === 'installing' || game.status === 'launching') && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={game.progress}
                  sx={{ height: 6, borderRadius: 3, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="text.secondary">
                    {game.progress}%
                  </Typography>
                </Box>
              </Box>
            )}
            
            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {game.status === 'installed' && !game.requiresUpdate && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleLaunchGame(game)}
                  fullWidth
                  sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                >
                  启动
                </Button>
              )}
              
              {(game.status === 'needs_update' || game.status === 'updating') && (
                <Button
                  variant={game.status === 'needs_update' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={game.status === 'updating' ? <CircularProgress size={16} /> : <DownloadIcon />}
                  onClick={() => handleUpdateGame(game)}
                  disabled={game.status === 'updating'}
                  fullWidth
                  sx={game.status === 'needs_update' ? { bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } } : {}}
                >
                  {game.status === 'needs_update' ? '更新' : '更新中'}
                </Button>
              )}
              
              {game.status === 'not_installed' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleInstallGame(game)}
                  fullWidth
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                >
                  安装
                </Button>
              )}
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => {
                  setSelectedGame(game)
                  setSettingsDialogOpen(true)
                }}
                sx={{ minWidth: 40 }}
              >
                设置
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    )
  }

  // 渲染游戏列表
  const renderGameList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress sx={{ fontSize: 40 }} />
          <Typography variant="h6" sx={{ ml: 2 }}>加载游戏列表中...</Typography>
        </Box>
      )
    }
    
    if (error) {
      return (
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => dispatch(fetchGames())}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              重新加载
            </Button>
          </Box>
        </Box>
      )
    }
    
    return (
      <Box sx={{ py: 4 }}>
        {localGames.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              暂无游戏数据
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {localGames.map(game => renderGameCard(game))}
          </Grid>
        )}
      </Box>
    )
  }

  // 渲染系统状态
  const renderSystemStatus = () => {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          系统状态
        </Typography>
        
        {/* 系统检查卡片 */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            系统需求检测
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="body1">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                  <span>系统基本满足游戏运行需求</span>
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                上次检查: 2025-12-03 10:00
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<NetworkCheckIcon />}
              onClick={handleSystemCheck}
            >
              重新检测
            </Button>
          </Box>
          
          {/* 系统信息 */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#1e293b', borderRadius: 1 }}>
                <CpuIcon sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">CPU</Typography>
                  <Typography variant="body1">Intel Core i7-11700K</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#1e293b', borderRadius: 1 }}>
                <MemoryIcon sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">内存</Typography>
                  <Typography variant="body1">16 GB DDR4</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#1e293b', borderRadius: 1 }}>
                <DisplayIcon sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">显卡</Typography>
                  <Typography variant="body1">NVIDIA GeForce RTX 3070</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#1e293b', borderRadius: 1 }}>
                <StorageIcon sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">存储空间</Typography>
                  <Typography variant="body1">512 GB SSD</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* 数据同步卡片 */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon />
            数据同步
          </Typography>
          
          <Box sx={{ mb: 3 }}>
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
              自动同步
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch defaultChecked />
                  }
                  label="启动时同步"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch defaultChecked />
                  }
                  label="退出时同步"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch />
                  }
                  label="定时同步"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch defaultChecked />
                  }
                  label="仅在WiFi下同步"
                />
              </Grid>
            </Grid>
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
      </Box>
    )
  }

  // 渲染设置页面
  const renderSettings = () => {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          启动器设置
        </Typography>
        
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            下载设置
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>下载位置</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e293b' }}>
                  <Typography variant="body2">C:\Games\Muyu\Downloads</Typography>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>同时下载数</Typography>
                <FormControlLabel
                  control={
                    <Select
                      defaultValue="3"
                      sx={{ width: '100%' }}
                    >
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="4">4</MenuItem>
                      <MenuItem value="5">5</MenuItem>
                    </Select>
                  }
                  label="3个同时下载"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="限制下载速度"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="仅在空闲时下载"
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            更新设置
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="自动检查更新"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="自动安装更新"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch />
                }
                label="仅在WiFi下更新"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="更新完成后通知"
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            性能设置
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>启动器优先级</Typography>
                <Select
                  defaultValue="normal"
                  sx={{ width: '100%' }}
                >
                  <MenuItem value="low">低</MenuItem>
                  <MenuItem value="normal">正常</MenuItem>
                  <MenuItem value="high">高</MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>资源限制</Typography>
                <Select
                  defaultValue="auto"
                  sx={{ width: '100%' }}
                >
                  <MenuItem value="auto">自动</MenuItem>
                  <MenuItem value="light">轻量</MenuItem>
                  <MenuItem value="balanced">平衡</MenuItem>
                  <MenuItem value="performance">高性能</MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="硬件加速"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch defaultChecked />
                }
                label="自动关闭后台服务"
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* 页面标题 */}
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <GamepadIcon sx={{ color: '#6366f1' }} />
          木鱼游戏启动器
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            刷新
          </Button>
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
          >
            关于
          </Button>
        </Box>
      </Box>
      
      {/* 选项卡 */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
            }
          }}
        >
          <Tab label="我的游戏" />
          <Tab label="系统状态" />
          <Tab label="设置" />
        </Tabs>
      </Paper>
      
      {/* 选项卡内容 */}
      {activeTab === 0 && renderGameList()}
      {activeTab === 1 && renderSystemStatus()}
      {activeTab === 2 && renderSettings()}
      
      {/* 游戏设置对话框 */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {selectedGame?.title} - 游戏设置
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* 图形设置 */}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="graphics-content"
                id="graphics-header"
              >
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  图形设置
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>分辨率</Typography>
                      <Select
                        defaultValue="1920x1080"
                        sx={{ width: '100%' }}
                      >
                        <MenuItem value="1280x720">1280x720</MenuItem>
                        <MenuItem value="1600x900">1600x900</MenuItem>
                        <MenuItem value="1920x1080">1920x1080</MenuItem>
                        <MenuItem value="2560x1440">2560x1440</MenuItem>
                        <MenuItem value="3840x2160">3840x2160</MenuItem>
                      </Select>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>画质预设</Typography>
                      <Select
                        defaultValue="high"
                        sx={{ width: '100%' }}
                      >
                        <MenuItem value="low">低</MenuItem>
                        <MenuItem value="medium">中</MenuItem>
                        <MenuItem value="high">高</MenuItem>
                        <MenuItem value="ultra">极高</MenuItem>
                        <MenuItem value="custom">自定义</MenuItem>
                      </Select>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch defaultChecked />
                      }
                      label="垂直同步"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>帧率限制</Typography>
                      <Select
                        defaultValue="60"
                        sx={{ width: '100%' }}
                      >
                        <MenuItem value="30">30</MenuItem>
                        <MenuItem value="60">60</MenuItem>
                        <MenuItem value="120">120</MenuItem>
                        <MenuItem value="144">144</MenuItem>
                        <MenuItem value="unlimited">无限制</MenuItem>
                      </Select>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            {/* 音频设置 */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="audio-content"
                id="audio-header"
              >
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  音频设置
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>主音量</Typography>
                      <Slider
                        value={gameSettings.audio.masterVolume}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, masterVolume: newValue }
                        }))}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>音乐音量</Typography>
                      <Slider
                        value={gameSettings.audio.musicVolume}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, musicVolume: newValue }
                        }))}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>音效音量</Typography>
                      <Slider
                        value={gameSettings.audio.sfxVolume}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, sfxVolume: newValue }
                        }))}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>语音音量</Typography>
                      <Slider
                        value={gameSettings.audio.voiceVolume}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          audio: { ...prev.audio, voiceVolume: newValue }
                        }))}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            {/* 控制设置 */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="controls-content"
                id="controls-header"
              >
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  控制设置
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch defaultChecked={gameSettings.controls.invertY} />
                      }
                      label="反转Y轴"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>鼠标灵敏度</Typography>
                      <Slider
                        value={gameSettings.controls.sensitivity}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          controls: { ...prev.controls, sensitivity: newValue }
                        }))}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>死区大小</Typography>
                      <Slider
                        value={gameSettings.controls.deadzone}
                        onChange={(e, newValue) => setGameSettings(prev => ({
                          ...prev,
                          controls: { ...prev.controls, deadzone: newValue }
                        }))}
                        min={0}
                        max={50}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // 保存设置逻辑
              setSettingsDialogOpen(false)
            }}
          >
            保存设置
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 系统检查对话框 */}
      <Dialog
        open={systemCheckDialogOpen}
        onClose={() => setSystemCheckDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          系统需求检测结果
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                系统信息
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="操作系统"
                    secondary="Windows 10 Pro 64位"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="处理器"
                    secondary="Intel Core i7-11700K @ 3.60GHz"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="内存"
                    secondary="16 GB DDR4 3200MHz"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="显卡"
                    secondary="NVIDIA GeForce RTX 3070 (8 GB)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="存储空间"
                    secondary="512 GB SSD + 2 TB HDD"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="网络"
                    secondary="100 Mbps 有线连接"
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                检测结果
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="操作系统"
                    secondary="符合要求"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="处理器"
                    secondary="符合要求"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#f59e0b' }}>
                      <WarningIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="内存"
                    secondary="建议升级到32 GB以获得最佳体验"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="显卡"
                    secondary="符合要求"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="存储空间"
                    secondary="符合要求"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSystemCheckDialogOpen(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default GameLauncherPage