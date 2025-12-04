import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  IconButton,
  RemoveIcon,
  AddIcon,
  DeleteIcon,
  Divider,
  Alert,
  Snackbar
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { items, totalItems, totalAmount } = useSelector((state) => state.cart)
  
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')

  // 处理返回按钮
  const handleBack = () => {
    navigate(-1)
  }

  // 处理增加数量
  const handleIncreaseQuantity = (item) => {
    dispatch(updateQuantity({
      gameId: item.id,
      quantity: item.quantity + 1
    }))
  }

  // 处理减少数量
  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({
        gameId: item.id,
        quantity: item.quantity - 1
      }))
    }
  }

  // 处理删除商品
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart({ gameId: itemId }))
    setSnackbarMessage('商品已从购物车移除')
    setSnackbarOpen(true)
  }

  // 处理清空购物车
  const handleClearCart = () => {
    if (window.confirm('确定要清空购物车吗？')) {
      dispatch(clearCart())
      setSnackbarMessage('购物车已清空')
      setSnackbarOpen(true)
    }
  }

  // 处理去结算
  const handleCheckout = () => {
    if (totalItems === 0) {
      setSnackbarMessage('购物车为空，无法结算')
      setSnackbarOpen(true)
      return
    }
    navigate('/checkout')
  }

  // 处理关闭通知
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={handleBack}
          >
            返回
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            购物车
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
          {totalItems} 件商品
        </Typography>
      </Box>

      {/* 购物车为空 */}
      {totalItems === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <ShoppingCartIcon sx={{ fontSize: 120, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            购物车是空的
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            浏览游戏商城，将喜欢的游戏添加到购物车吧
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4 }}
            onClick={() => navigate('/games')}
          >
            浏览游戏
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* 购物车商品列表 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {/* 商品列表 */}
              {items.map((item) => (
                <Box key={item.id} sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* 商品图片 */}
                    <Grid item xs={4} md={3}>
                      <Box sx={{ width: '100%', height: 100, borderRadius: 1, overflow: 'hidden', bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    </Grid>

                    {/* 商品信息 */}
                    <Grid item xs={8} md={9}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.isFree ? '免费' : `¥${item.price.toFixed(2)}`}
                          </Typography>
                          
                          {/* 数量控制 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDecreaseQuantity(item)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleIncreaseQuantity(item)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* 操作按钮 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          {/* 小计 */}
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                            ¥{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          {/* 删除按钮 */}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}

              {/* 清空购物车按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCart}
                >
                  清空购物车
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* 购物车摘要 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                订单摘要
              </Typography>

              {/* 商品数量 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">商品数量</Typography>
                <Typography variant="body1">{totalItems} 件</Typography>
              </Box>

              {/* 商品总价 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">商品总价</Typography>
                <Typography variant="body1">¥{totalAmount.toFixed(2)}</Typography>
              </Box>

              {/* 运费 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">运费</Typography>
                <Typography variant="body1" color="success.main">
                  免费
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 总计 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  总计
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                  ¥{totalAmount.toFixed(2)}
                </Typography>
              </Box>

              {/* 去结算按钮 */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  bgcolor: '#6366f1', 
                  '&:hover': { bgcolor: '#4f46e5' },
                  py: 1.5,
                  fontSize: '1rem'
                }}
                onClick={handleCheckout}
              >
                去结算
              </Button>

              {/* 继续购物按钮 */}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/games')}
              >
                继续购物
              </Button>
            </Paper>
          </Grid>
        </Grid>
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
    </Container>
  )
}

export default CartPage
