import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'

const LibraryPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.user)
  
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [games, setGames] = useState([])

  // 模拟数据
  const mockGames = [
    {
      id: 1,
      title: '赛博朋克2077',
      image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Cyberpunk+2077',
      status: 'installed',
      lastPlayed: '2025-12-01',
      playTime: '25h 30m'
    },
    {
      id: 2,
      title: '艾尔登法环',
      image: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Elden+Ring',
      status: 'installed',
      lastPlayed: '2025-11-28',
      playTime: '45h 15m'
    },
    {
      id: 3,
      title: '星穹铁道',
      image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Star+Rail',
      status: 'downloaded',
      lastPlayed: '2025-11-25',
      playTime: '15h 45m'
    }
  ]

  useEffect(() => {
    // 检查用户是否登录
    if (!user) {
      navigate('/login')
      return
    }

    // 模拟加载游戏库数据
    setLoading(true)
    setTimeout(() => {
      setGames(mockGames)
      setLoading(false)
    }, 1000)
  }, [user, navigate])

  if (!user) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        我的游戏库
      </Typography>

      {/* 标签页 */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="已购游戏" />
          <Tab label="已安装" />
          <Tab label="最近游玩" />
        </Tabs>
      </Paper>

      {/* 游戏列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      ) : games.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, textAlign: 'center' }}>
          <Box>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              您的游戏库是空的
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              浏览游戏商城，购买并下载您喜欢的游戏。
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4 }}
              onClick={() => navigate('/games')}
            >
              浏览游戏
            </