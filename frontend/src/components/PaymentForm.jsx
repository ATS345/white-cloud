import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useDispatch, useSelector } from 'react-redux'
import { createPaymentIntent } from '../store/paymentSlice'

const PaymentForm = ({ games, onPaymentSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  
  const { loading, error, paymentIntent } = useSelector((state) => state.payment)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
  const [orderId, setOrderId] = useState(null)
  
  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(price)
  }
  
  // 计算总金额
  const totalAmount = games.reduce((sum, game) => {
    return sum + parseFloat(game.discount_price || game.price)
  }, 0)
  
  // 初始化创建支付意图
  useEffect(() => {
    const initPayment = async () => {
      try {
        const gameIds = games.map(game => game.id)
        const result = await dispatch(createPaymentIntent({ gameIds })).unwrap()
        setClientSecret(result.clientSecret)
        setOrderId(result.order_id)
      } catch (err) {
        console.error('初始化支付失败:', err)
      }
    }
    initPayment()
  }, [dispatch, games])
  
  // 处理支付提交
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      // 确认支付
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      
      if (result.error) {
        // 支付失败
        console.error('支付失败:', result.error.message)
      } else {
        // 支付成功
        if (result.paymentIntent.status === 'succeeded') {
          // 调用成功回调
          onPaymentSuccess({
            orderId,
            paymentIntentId: result.paymentIntent.id
          })
        }
      }
    } catch (err) {
      console.error('支付处理失败:', err)
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        确认支付
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* 购物车摘要 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          购物车摘要
        </Typography>
        
        {games.map((game) => (
          <Card key={game.id} sx={{ mb: 2, borderRadius: 1 }}>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid item xs={2}>
                <CardMedia
                  component="img"
                  height="80"
                  image={game.main_image_url || 'https://via.placeholder.com/80x80?text=Game+Image'}
                  alt={game.title}
                  sx={{ borderRadius: 1, objectFit: 'cover' }}
                />
              </Grid>
              <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {game.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#6366f1' }}>
                    {formatPrice(parseFloat(game.discount_price || game.price))}
                  </Typography>
                </Box>
                {game.discount_price && game.discount_price < game.price && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                      {formatPrice(parseFloat(game.price))}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
                      {Math.round((1 - game.discount_price / game.price) * 100)}% OFF
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Card>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
            总金额:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>
            {formatPrice(totalAmount)}
          </Typography>
        </Box>
      </Box>
      
      {/* 支付表单 */}
      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 1, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            支付信息
          </Typography>
          <Box sx={{ mb: 2 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424750',
                    '::placeholder': {
                      color: '#94a3b8',
                    },
                    invalid: {
                      color: '#ef4444',
                    },
                  },
                  hidePostalCode: true,
                },
              }}
            />
          </Box>
          {isProcessing || loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={!stripe || !elements || !clientSecret}
              sx={{
                borderRadius: 1,
                backgroundColor: '#6366f1',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                },
                py: 2,
              }}
            >
              确认支付
            </Button>
          )}
        </Paper>
      </form>
    </Paper>
  )
}

export default PaymentForm