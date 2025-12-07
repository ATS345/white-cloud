import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  CircularProgress,
  Snackbar
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import WalletIcon from '@mui/icons-material/Wallet'
import { createPaymentIntent } from '../store/paymentSlice'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { items, totalItems, totalAmount } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  
  // 表单数据
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  })

  // 处理返回按钮
  const handleBack = () => {
    navigate('/cart')
  }

  // 处理支付方式变化
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value)
  }

  // 处理表单输入变化
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // 处理表单提交
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    // 表单验证
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.phone) {
      setError('请填写所有必填字段')
      return
    }
    
    if (totalItems === 0) {
      setError('购物车为空，无法结算')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // 调用创建支付意图的API
      await dispatch(createPaymentIntent({ gameIds: items.map(item => item.id) })).unwrap()
      
      // 模拟支付成功，跳转到订单成功页面
      setSnackbarMessage('支付成功！')
      setSnackbarOpen(true)
      
      setTimeout(() => {
        navigate('/orders')
      }, 1500)
    } catch (err) {
      setError(err.message || '支付失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理关闭通知
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    navigate('/login')
    return null
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
            返回购物车
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            结算
          </Typography>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* 左侧：订单信息和配送地址 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              配送信息
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* 姓名和邮箱 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="姓名"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="邮箱"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                
                {/* 地址信息 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="详细地址"
                    name="address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                
                {/* 城市和邮编 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="城市"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="邮编"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                
                {/* 电话 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="电话"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
          
          {/* 支付方式 */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              支付方式
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="payment method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel
                  value="credit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon /> 信用卡/借记卡
                    </Box>
                  }
                />
                <FormControlLabel
                  value="bank_transfer"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon /> 银行转账
                    </Box>
                  }
                />
                <FormControlLabel
                  value="wallet"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WalletIcon /> 电子钱包
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            {/* 支付方式详情 */}
            <Box sx={{ mt: 3 }}>
              {paymentMethod === 'credit_card' && (
                <Typography variant="body2" color="text.secondary">
                  支持 Visa, MasterCard, American Express 等主流信用卡和借记卡
                </Typography>
              )}
              {paymentMethod === 'bank_transfer' && (
                <Typography variant="body2" color="text.secondary">
                  银行转账需要 1-3 个工作日处理
                </Typography>
              )}
              {paymentMethod === 'wallet' && (
                <Typography variant="body2" color="text.secondary">
                  支持支付宝、微信支付、PayPal 等电子钱包
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* 右侧：订单摘要 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              订单摘要
            </Typography>
            
            {/* 商品列表 */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 3 }}>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} × ¥{item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* 订单总计 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">商品总价</Typography>
              <Typography variant="body1">¥{totalAmount.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">运费</Typography>
              <Typography variant="body1" color="success.main">免费</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">税费</Typography>
              <Typography variant="body1">¥{(totalAmount * 0.06).toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                订单总计
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                ¥{(totalAmount * 1.06).toFixed(2)}
              </Typography>
            </Box>
            
            {/* 提交订单按钮 */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                py: 1.5,
                borderRadius: 1
              }}
              disabled={loading || totalItems === 0}
              onClick={handleSubmit}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '提交订单'}
            </Button>
          </Paper>
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

export default CheckoutPage
