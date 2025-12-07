import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

const LibraryPage = () => {
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.user)
  
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [games, setGames] = useState([])

  // 模拟数据
  const mockGames = [
    {
      id: 1,
      title: '赛博朋克2077',
      image: 'https://picsum.photos/300/200?random=3',
      status: 'installed',
      lastPlayed: '2025-12-01',
      playTime: '25h 30m'
    },
    {
      id: 2,
      title: '艾尔登法环',
      image: 'https://picsum.photos/300/200?random=1',
      status: 'installed',
      lastPlayed: '2025-11-28',
      playTime: '45h 15m'
    },
    {
      id: 3,
      title: '星穹铁道',
      image: 'https://picsum.photos/300/200?random=2',
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
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Paper
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                {/* 游戏封面 */}
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={game.image}
                    alt={game.title}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover'
                    }}
                  />
                  {/* 状态标签 */}
                  <Chip
                    label={game.status === 'installed' ? '已安装' : '已购买'}
                    color={game.status === 'installed' ? 'success' : 'primary'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                {/* 游戏信息 */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {game.title}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      最近游玩: {game.lastPlayed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      游玩时间: {game.playTime}
                    </Typography>
                  </Box>

                  {/* 操作按钮 */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {game.status === 'installed' ? (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5 }}
                      >
                        开始游戏
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5 }}
                      >
                        下载
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default LibraryPage
