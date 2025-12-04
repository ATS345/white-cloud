import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Grid, Typography, Box, Paper, CircularProgress, Alert, Snackbar } from '@mui/material'
import GameCard from '../components/GameCard'
import GameFilter from '../components/GameFilter'
import { fetchGames } from '../store/gameSlice'

const GameListPage = () => {
  const dispatch = useDispatch()
  const { games, loading, error, totalPages, currentPage } = useSelector((state) => state.game)
  
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    tags: [],
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'release_date',
    sortOrder: 'desc'
  })
  
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [featuredGames, setFeaturedGames] = useState([])
  const [recommendedGames, setRecommendedGames] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [trendingGames, setTrendingGames] = useState([])

  // 初始化加载游戏列表
  useEffect(() => {
    dispatch(fetchGames({ page: 1, ...filters }))
  }, [dispatch, filters])

  // 处理筛选条件变化
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
  }

  // 处理分页变化
  const handlePageChange = (page) => {
    dispatch(fetchGames({ page, ...filters }))
  }

  // 处理游戏点击
  const handleGameClick = (gameId) => {
    // 跳转到游戏详情页
    window.location.href = `/game/${gameId}`
  }

  // 处理加入购物车
  const handleAddToCart = (game) => {
    setSnackbarMessage(`${game.title} 已加入购物车`)
    setSnackbarOpen(true)
    // 这里可以添加加入购物车的逻辑
  }

  // 关闭通知
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }
  
  // 计算精选游戏和推荐游戏
  useEffect(() => {
    if (games.length > 0) {
      // 筛选评分高的游戏作为精选游戏
      const highRatedGames = [...games]
        .filter(game => game.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
      setFeaturedGames(highRatedGames)
      
      // 筛选最新发布的游戏作为推荐游戏
      const latestGames = [...games]
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 8)
      setRecommendedGames(latestGames)
      
      // 筛选新发布游戏（最近30天）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentGames = [...games]
        .filter(game => new Date(game.release_date) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 8)
      setNewReleases(recentGames)
      
      // 筛选热门游戏（根据评分和评价数）
      const popularGames = [...games]
        .sort((a, b) => {
          // 结合评分和评价数计算热门度
          const aScore = a.rating * Math.log(a.review_count + 1)
          const bScore = b.rating * Math.log(b.review_count + 1)
          return bScore - aScore
        })
        .slice(0, 8)
      setTrendingGames(popularGames)
    }
  }, [games])

  return (
    <Container maxWidth="xl">
      {/* 页面标题 */}
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          木鱼游戏
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          发现最新、最热门的游戏
        </Typography>
      </Box>

      {/* 精选游戏横幅 */}
      {featuredGames.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            精选游戏
          </Typography>
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  {featuredGames[0].title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {featuredGames[0].description.length > 200 ? `${featuredGames[0].description.substring(0, 200)}...` : featuredGames[0].description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleGameClick(featuredGames[0].id)}
                    sx={{ bgcolor: 'white', color: '#6366f1', '&:hover': { bgcolor: '#f3f4f6' } }}
                  >
                    查看详情
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleAddToCart(featuredGames[0])}
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                  >
                    加入购物车
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                  <img
                    src={featuredGames[0].main_image_url || 'https://via.placeholder.com/400x200?text=Game+Image'}
                    alt={featuredGames[0].title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* 推荐游戏 */}
      {recommendedGames.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            推荐游戏
          </Typography>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Grid container spacing={3} sx={{ minWidth: 'min-content' }}>
              {recommendedGames.map(game => (
                <Grid item xs={12} sm={6} md={3} key={game.id} sx={{ minWidth: '250px' }}>
                  <GameCard
                    game={game}
                    onGameClick={handleGameClick}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* 新发布游戏 */}
      {newReleases.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            新发布游戏
          </Typography>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Grid container spacing={3} sx={{ minWidth: 'min-content' }}>
              {newReleases.map(game => (
                <Grid item xs={12} sm={6} md={3} key={game.id} sx={{ minWidth: '250px' }}>
                  <GameCard
                    game={game}
                    onGameClick={handleGameClick}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* 热门游戏 */}
      {trendingGames.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            热门游戏
          </Typography>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Grid container spacing={3} sx={{ minWidth: 'min-content' }}>
              {trendingGames.map(game => (
                <Grid item xs={12} sm={6} md={3} key={game.id} sx={{ minWidth: '250px' }}>
                  <GameCard
                    game={game}
                    onGameClick={handleGameClick}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* 游戏筛选和列表 */}
      <Grid container spacing={4}>
        {/* 筛选栏 */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <GameFilter
              filters={filters}
              onChange={handleFilterChange}
            />
          </Paper>
        </Grid>

        {/* 游戏列表 */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              所有游戏
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {games.length} 款游戏
            </Typography>
          </Box>
          
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
                未找到符合条件的游戏
              </Alert>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {games.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id}>
                  <GameCard
                    game={game}
                    onGameClick={handleGameClick}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              {/* 这里可以添加分页组件 */}
            </Box>
          )}
        </Grid>
      </Grid>

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

export default GameListPage