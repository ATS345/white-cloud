import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ShareIcon from '@mui/icons-material/Share'
import { fetchGames } from '../store/gameSlice'

const DeveloperGamesPage = () => {
  const dispatch = useDispatch()
  const { games, loading, error } = useSelector(state => state.game)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('create') // 'create' or 'edit'

  // 初始化加载游戏列表
  useEffect(() => {
    dispatch(fetchGames({ status: 'all' }))
  }, [dispatch])

  // 处理创建游戏
  const handleCreateGame = () => {
    setDialogType('create')
    setSelectedGame(null)
    setDialogOpen(true)
  }

  // 处理编辑游戏
  const handleEditGame = (game) => {
    setDialogType('edit')
    setSelectedGame(game)
    setDialogOpen(true)
  }

  // 处理删除游戏
  const handleDeleteGame = (game) => {
    // 这里可以添加删除游戏的逻辑
    console.log('Delete game:', game.id)
  }

  // 处理游戏预览
  const handleGamePreview = (game) => {
    // 跳转到游戏详情页
    window.location.href = `/game/${game.id}`
  }

  // 处理游戏推广
  const handlePromoteGame = (game) => {
    // 这里可以添加游戏推广的逻辑
    console.log('Promote game:', game.id)
  }

  // 处理游戏状态变更
  const handleUpdateGameStatus = (game, status) => {
    // 这里可以添加游戏状态变更的逻辑
    console.log('Update game status:', game.id, 'to', status)
  }



  return (
    <Container maxWidth="xl">
      {/* 页面标题和操作按钮 */}
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            我的游戏
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            管理和推广您的游戏作品
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateGame}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          创建新游戏
        </Button>
      </Box>

      {/* 游戏统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f0f9ff', borderLeft: '4px solid #0ea5e9' }}>
            <Typography variant="h6" sx={{ color: '#0c4a6e', fontWeight: 600 }}>
              总游戏数
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: '#0ea5e9', fontWeight: 700 }}>
              {games.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
            <Typography variant="h6" sx={{ color: '#92400e', fontWeight: 600 }}>
              待审核
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: '#f59e0b', fontWeight: 700 }}>
              {games.filter(g => g.status === 'pending').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#d1fae5', borderLeft: '4px solid #10b981' }}>
            <Typography variant="h6" sx={{ color: '#065f46', fontWeight: 600 }}>
              已通过
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: '#10b981', fontWeight: 700 }}>
              {games.filter(g => g.status === 'approved').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
            <Typography variant="h6" sx={{ color: '#991b1b', fontWeight: 600 }}>
              已拒绝
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: '#ef4444', fontWeight: 700 }}>
              {games.filter(g => g.status === 'rejected').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 游戏列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : games.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            您还没有创建任何游戏
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGame}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            创建第一个游戏
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {games.map(game => (
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
                {/* 游戏卡片内容 */}
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={game.main_image_url || 'https://via.placeholder.com/400x200?text=Game+Cover'}
                    alt={game.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  {/* 游戏状态标签 */}
                  <Chip
                    label={game.status === 'approved' ? '已通过' : game.status === 'pending' ? '待审核' : '已拒绝'}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: game.status === 'approved' ? '#10b981' : game.status === 'pending' ? '#f59e0b' : '#ef4444',
                      color: 'white',
                      fontWeight: 700
                    }}
                  />
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {game.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {game.categories?.slice(0, 2).map(category => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        size="small"
                        sx={{
                          bgcolor: '#e2e8f0',
                          color: '#334155',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {game.description.length > 100 ? `${game.description.substring(0, 100)}...` : game.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 700 }}>
                  ¥{game.price.toFixed(2)}
                </Typography>
            </Box>
            
            {/* 游戏状态管理 */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  游戏状态
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {game.status === 'pending' && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled
                      sx={{ minWidth: 'auto', color: '#f59e0b', borderColor: '#f59e0b' }}
                    >
                      待审核
                    </Button>
                  )}
                  {game.status === 'approved' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUpdateGameStatus(game, 'draft')}
                      sx={{ minWidth: 'auto', color: '#10b981', borderColor: '#10b981' }}
                    >
                      已发布
                    </Button>
                  )}
                  {game.status === 'rejected' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUpdateGameStatus(game, 'pending')}
                      sx={{ minWidth: 'auto', color: '#ef4444', borderColor: '#ef4444' }}
                    >
                      已拒绝
                    </Button>
                  )}
                </Box>
            </Box>
            
            {/* 操作按钮 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => handleGamePreview(game)}
              >
                预览
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEditGame(game)}
              >
                编辑
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<ShareIcon />}
                onClick={() => handlePromoteGame(game)}
                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
              >
                推广
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteGame(game)}
                sx={{ color: '#ef4444', borderColor: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}
              >
                删除
              </Button>
            </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 游戏创建/编辑对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {dialogType === 'create' ? '创建新游戏' : '编辑游戏'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* 这里可以添加游戏创建/编辑表单 */}
            <Typography variant="body1">
              {dialogType === 'create' ? '创建游戏表单' : '编辑游戏表单'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              此功能将在后续开发中实现
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {dialogType === 'create' ? '创建' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default DeveloperGamesPage
