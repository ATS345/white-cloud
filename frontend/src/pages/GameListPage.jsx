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
    category: '',
    tag: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'release_date',
    sortOrder: 'desc'
  })
  
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

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

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          木鱼游戏
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          发现最新、最热门的游戏
        </Typography>
      </Box>

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