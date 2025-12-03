import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Grid
} from '@mui/material'
import { Visibility, VisibilityOff, Edit, Save, Cancel } from '@mui/icons-material'
import { updateUserProfile, changePassword } from '../store/userSlice'

const ProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.user)
  
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState(0)
  
  // 基本信息编辑状态
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  })
  
  // 密码修改状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  
  // 密码可见性
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  
  // 提示信息
  const [message, setMessage] = useState('')
  const [messageSeverity, setMessageSeverity] = useState('success')

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    resetForms()
  }

  // 重置表单
  const resetForms = () => {
    setIsEditing(false)
    setProfileForm({
      username: user?.username || '',
      email: user?.email || ''
    })
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    })
    setMessage('')
  }

  // 处理基本信息输入变化
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理密码输入变化
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 切换密码可见性
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(prev => !prev)
        break
      case 'new':
        setShowNewPassword(prev => !prev)
        break
      case 'confirm':
        setShowConfirmNewPassword(prev => !prev)
        break
      default:
        break
    }
  }

  // 开始编辑基本信息
  const handleStartEdit = () => {
    setIsEditing(true)
    setMessage('')
  }

  // 取消编辑
  const handleCancelEdit = () => {
    resetForms()
  }

  // 更新基本信息
  const handleUpdateProfile = async () => {
    if (!profileForm.username || !profileForm.email) {
      setMessage('请填写所有必填字段')
      setMessageSeverity('error')
      return
    }

    try {
      await dispatch(updateUserProfile(profileForm)).unwrap()
      setMessage('个人信息更新成功')
      setMessageSeverity('success')
      setIsEditing(false)
    } catch (err) {
      setMessage(err.message || '更新失败')
      setMessageSeverity('error')
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setMessage('请填写所有必填字段')
      setMessageSeverity('error')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setMessage('两次输入的新密码不一致')
      setMessageSeverity('error')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('新密码长度不能少于6个字符')
      setMessageSeverity('error')
      return
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })).unwrap()
      setMessage('密码修改成功')
      setMessageSeverity('success')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
    } catch (err) {
      setMessage(err.message || '密码修改失败')
      setMessageSeverity('error')
    }
  }

  // 如果用户未登录，重定向到登录页面
  if (!user && !loading) {
    navigate('/login')
    return null
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        个人中心
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* 用户信息概览 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 100, height: 100, bgcolor: '#6366f1', fontSize: '2rem' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {user?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              注册时间: {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* 标签页 */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="基本信息" />
          <Tab label="修改密码" />
          <Tab label="安全设置" />
        </Tabs>

        {/* 消息提示 */}
        {message && (
          <Alert severity={messageSeverity} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* 基本信息标签页 */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="username"
                  label="用户名"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  InputProps={{
                    endAdornment: !isEditing && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleStartEdit} title="编辑">
                          <Edit />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  label="邮箱地址"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  startIcon={<Cancel />}
                  sx={{ borderRadius: 1 }}
                >
                  取消
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  startIcon={<Save />}
                  sx={{
                    borderRadius: 1,
                    bgcolor: '#6366f1',
                    '&:hover': { bgcolor: '#4f46e5' }
                  }}
                >
                  保存
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* 修改密码标签页 */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="currentPassword"
                  label="当前密码"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('current')}>
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="newPassword"
                  label="新密码"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('new')}>
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmNewPassword"
                  label="确认新密码"
                  name="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                          {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                sx={{
                  borderRadius: 1,
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  py: 1.2
                }}
              >
                修改密码
              </Button>
            </Box>
          </Box>
        )}

        {/* 安全设置标签页 */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              安全设置功能正在开发中...
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                    双重验证
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    开启双重验证以提高账号安全性
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled
                    sx={{ borderRadius: 1 }}
                  >
                    功能开发中
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                    登录设备管理
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    查看和管理您的登录设备
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled
                    sx={{ borderRadius: 1 }}
                  >
                    功能开发中
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default ProfilePage