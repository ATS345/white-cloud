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
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { PersonAddOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import { register } from '../store/userSlice'

const RegisterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  // 处理复选框变化
  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked)
    setError('')
  }

  // 验证邮箱格式
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 验证密码强度
  const getPasswordStrength = (password) => {
    if (password.length < 6) {
      return 'weak';
    }
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password)) {
      return 'strong';
    }
    return 'medium';
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 表单验证
    if (!formData.username) {
      setError('请输入用户名')
      return
    }
    
    if (formData.username.length < 3) {
      setError('用户名长度不能少于3个字符')
      return
    }
    
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
    
    if (getPasswordStrength(formData.password) === 'weak') {
      setError('密码强度太弱，建议包含大小写字母、数字和特殊字符')
      return
    }
    
    if (!formData.confirmPassword) {
      setError('请确认密码')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (!termsAccepted) {
      setError('请阅读并同意用户协议和隐私政策')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // 调用Redux action注册
      await dispatch(register(formData)).unwrap()
      // 注册成功后跳转至首页
      navigate('/')
    } catch (err) {
      setError(err.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 切换密码显示状态
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  // 切换确认密码显示状态
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev)
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: '#6366f1' }}>
            <PersonAddOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            注册
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            创建您的木鱼游戏平台账号
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
            id="username"
            label="用户名"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
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
            id="email"
            label="邮箱地址"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="确认密码"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

          <FormControlLabel
            control={<Checkbox color="primary" checked={termsAccepted} onChange={handleTermsChange} />}
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                我已阅读并同意
                <Link component="button" variant="body2" sx={{ mx: 0.5, cursor: 'pointer', color: '#6366f1' }}>
                  用户协议
                </Link>
                和
                <Link component="button" variant="body2" sx={{ mx: 0.5, cursor: 'pointer', color: '#6366f1' }}>
                  隐私政策
                </Link>
              </Typography>
            }
            sx={{ mt: 1, mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              borderRadius: 1
            }}
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              已经有账号了？
              <Link component={RouterLink} to="/login" variant="body2" sx={{ ml: 0.5, color: '#6366f1', textDecoration: 'none' }}>
                立即登录
              </Link>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              注册即表示您同意我们的服务条款和隐私政策
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage