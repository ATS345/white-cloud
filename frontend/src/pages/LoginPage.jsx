import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Link,
  Avatar,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material'
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import { login } from '../store/userSlice'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  // 验证邮箱格式
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 表单验证
    if (!formData.email) {
      setError('请输入邮箱地址')
      return
    }
    
    if (!isValidEmail(formData.email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    
    if (!formData.password) {
      setError('请输入密码')
      return
    }
    
    if (formData.password.length < 6) {
      setError('密码长度不能少于6个字符')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // 调用Redux action登录
      await dispatch(login(formData)).unwrap()
      // 登录成功后跳转至首页
      navigate('/')
    } catch (err) {
      setError(err.message || '登录失败，请检查您的邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  // 切换密码显示状态
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: '#6366f1' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            登录
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            欢迎回到木鱼游戏平台
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="邮箱地址"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              borderRadius: 1
            }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Link component="button" variant="body2" sx={{ cursor: 'pointer' }}>
              忘记密码？
            </Link>
            <Link component={RouterLink} to="/register" variant="body2">
              还没有账号？立即注册
            </Link>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              登录即表示您同意我们的
              <Link component="button" variant="body2" sx={{ ml: 0.5, cursor: 'pointer' }}>
                用户协议
              </Link>
              和
              <Link component="button" variant="body2" sx={{ ml: 0.5, cursor: 'pointer' }}>
                隐私政策
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage