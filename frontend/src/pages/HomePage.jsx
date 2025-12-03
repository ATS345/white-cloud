import React, { useState } from 'react'
import { Container, Typography, Box, Grid, Paper, Button, TextField, Divider, Card, CardMedia, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchGames } from '../store/gameSlice'

const HomePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [searchQuery, setSearchQuery] = useState('')

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 调用Redux action进行搜索
      dispatch(fetchGames({
        page: 1,
        search: searchQuery.trim()
      }))
      // 跳转到游戏列表页，显示搜索结果
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Mock data for popular games
  const popularGames = [
    {
      id: 1,
      title: '赛博朋克2077',
      price: 298,
      discountPrice: 149,
      image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Cyberpunk+2077',
      rating: 4.5
    },
    {
      id: 2,
      title: '艾尔登法环',
      price: 298,
      discountPrice: 199,
      image: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Elden+Ring',
      rating: 4.8
    },
    {
      id: 3,
      title: '星穹铁道',
      price: 0,
      discountPrice: 0,
      image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Star+Rail',
      rating: 4.6
    },
    {
      id: 4,
      title: '原神',
      price: 0,
      discountPrice: 0,
      image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Genshin+Impact',
      rating: 4.7
    }
  ]

  // Mock data for latest games
  const latestGames = [
    {
      id: 5,
      title: '黑神话：悟空',
      price: 268,
      discountPrice: 268,
      image: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Black+Myth',
      rating: 4.9
    },
    {
      id: 6,
      title: '星球大战：亡命徒',
      price: 298,
      discountPrice: 249,
      image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Star+Wars',
      rating: 4.4
    },
    {
      id: 7,
      title: '漫威蜘蛛人2',
      price: 468,
      discountPrice: 399,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Spider+Man+2',
      rating: 4.7
    },
    {
      id: 8,
      title: '霍格沃茨之遗',
      price: 298,
      discountPrice: 199,
      image: 'https://via.placeholder.com/300x200/14b8a6/ffffff?text=Hogwarts+Legacy',
      rating: 4.5
    }
  ]

  return (
    <Box sx={{ bgcolor: '#0f172a', minHeight: 'calc(100vh - 64px - 240px)' }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#1e293b', py: 8, px: 2 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 2 }}>
                发现你的下一款游戏
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
                在木鱼游戏平台，探索海量优质游戏，与全球玩家一起畅玩。
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4, py: 1.5, fontSize: '1rem' }}
                  onClick={() => navigate('/games')}
                >
                  浏览游戏
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: '#ffffff' }, px: 4, py: 1.5, fontSize: '1rem' }}
                  onClick={() => navigate('/download')}
                >
                  下载客户端
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    超过100万玩家
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    全球活跃用户
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    5000+游戏
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    丰富的游戏库
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    98%好评率
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    用户满意度
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 0 } }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <img
                  src="https://via.placeholder.com/400x300/6366f1/ffffff?text=木鱼游戏"
                  alt="木鱼游戏"
                  style={{ width: '100%', borderRadius: 12, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Bar */}
      <Box sx={{ py: 4, px: 2 }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 2, bgcolor: '#1e293b', boxShadow: 3, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="搜索游戏、开发者或标签"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: '#6366f1'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'white'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2, px: 4 }}
              >
                搜索
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Popular Games Section */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 1 }}>
            热门游戏
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            查看当前最受欢迎的游戏
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {popularGames.map((game) => (
            <Grid item xs={12} sm={6} md={3} key={game.id}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={game.image}
                    alt={game.title}
                  />
                  {game.discountPrice < game.price && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#ef4444', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {Math.round(((game.price - game.discountPrice) / game.price) * 100)}% OFF
                    </Box>
                  )}
                  {game.price === 0 && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#10b981', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      免费
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 1 }}>
                    {game.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} sx={{ fontSize: '1rem' }}>
                          {index < Math.floor(game.rating) ? '★' : index < game.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {game.rating}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {game.discountPrice < game.price ? (
                      <>
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                          ¥{game.discountPrice}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'line-through' }}>
                          ¥{game.price}
                        </Typography>
                      </>
                    ) : game.price === 0 ? (
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                        免费
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ¥{game.price}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5 }}
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      查看详情
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' }, borderRadius: 2, px: 4 }}
            onClick={() => navigate('/games')}
          >
            查看更多热门游戏
          </Button>
        </Box>
      </Container>

      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 6 }} />

      {/* Latest Games Section */}
      <Container maxWidth="xl" sx={{ py: 0, pb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 1 }}>
            最新发布
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            探索最新上架的游戏
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {latestGames.map((game) => (
            <Grid item xs={12} sm={6} md={3} key={game.id}>
              <Card sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={game.image}
                    alt={game.title}
                  />
                  {game.discountPrice < game.price && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#ef4444', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {Math.round(((game.price - game.discountPrice) / game.price) * 100)}% OFF
                    </Box>
                  )}
                  {game.price === 0 && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#10b981', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      免费
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 1 }}>
                    {game.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} sx={{ fontSize: '1rem' }}>
                          {index < Math.floor(game.rating) ? '★' : index < game.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {game.rating}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {game.discountPrice < game.price ? (
                      <>
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                          ¥{game.discountPrice}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'line-through' }}>
                          ¥{game.price}
                        </Typography>
                      </>
                    ) : game.price === 0 ? (
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                        免费
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ¥{game.price}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5 }}
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      查看详情
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' }, borderRadius: 2, px: 4 }}
            onClick={() => navigate('/games')}
          >
            查看更多最新游戏
          </Button>
        </Box>
      </Container>

      {/* Client Download Section */}
      <Box sx={{ bgcolor: '#1e293b', py: 8, px: 2, mt: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 2 }}>
                下载木鱼游戏客户端
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
                体验更流畅的游戏购买、下载和管理体验。支持Windows、macOS等主流操作系统。
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2, px: 4, py: 1.5, fontSize: '1rem' }}
                  >
                    Windows 下载
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: '#ffffff' }, borderRadius: 2, px: 4, py: 1.5, fontSize: '1rem' }}
                  >
                    macOS 下载
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: '#ffffff' }, borderRadius: 2, px: 4, py: 1.5, fontSize: '1rem' }}
                >
                  Linux 下载
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    版本
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    v1.0.0
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    文件大小
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    200 MB
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    更新日期
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    2025-12-04
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', order: { xs: 1, md: 2 }, mt: { xs: 4, md: 0 } }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <img
                  src="https://via.placeholder.com/400x300/6366f1/ffffff?text=木鱼游戏客户端"
                  alt="木鱼游戏客户端"
                  style={{ width: '100%', borderRadius: 12, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage