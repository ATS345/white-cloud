import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Badge, TextField, Paper } from '@mui/material'
import { ShoppingCart, Person, Search, Menu as MenuIcon, Logout } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/userSlice'

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const { totalItems } = useSelector((state) => state.cart)
  
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [userAnchorEl, setUserAnchorEl] = React.useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 导航到游戏列表页并传递搜索参数
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuOpen = (event) => {
    setUserAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleUserMenuClose = () => {
    setUserAnchorEl(null)
  }

  const handleNavigate = (path) => {
    navigate(path)
    handleMenuClose()
    handleUserMenuClose()
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/')
      handleUserMenuClose()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <>
      {/* 顶部导航栏 */}
      <AppBar position="static" sx={{ bgcolor: '#1e293b', boxShadow: 3 }}>
        <Toolbar>
          {/* Logo and Brand */}
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#6366f1', cursor: 'pointer', mr: 4 }} onClick={() => navigate('/')}>
            木鱼游戏
          </Typography>

          {/* 搜索栏 - 仅在桌面显示 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, maxWidth: 600, mr: 4 }}>
            <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', borderRadius: 2, bgcolor: '#334155' }}>
              <TextField
                placeholder="搜索游戏、开发者或标签"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="standard"
                sx={{
                  ml: 1,
                  flex: 1,
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: '#94a3b8',
                      opacity: 1
                    }
                  },
                  '& .MuiInputBase-root': {
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover fieldset': {
                      border: 'none'
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none'
                    }
                  }
                }}
                InputProps={{
                  disableUnderline: true
                }}
              />
              <IconButton type="submit" sx={{ p: 1, color: '#6366f1' }} aria-label="search">
                <Search />
              </IconButton>
            </Paper>
          </Box>

          {/* 桌面导航菜单 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/games')}>
              游戏商城
            </Button>
            <Button color="inherit" onClick={() => navigate('/library')}>
              游戏库
            </Button>
            <Button color="inherit" onClick={() => navigate('/developer')}>
              开发者中心
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/download')}
              sx={{ 
                bgcolor: '#6366f1', 
                '&:hover': { bgcolor: '#4f46e5' },
                borderRadius: 1
              }}
            >
              下载客户端
            </Button>
          </Box>

          {/* 右侧操作图标 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/cart')}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleUserMenuOpen}>
              <Person />
            </IconButton>
          </Box>

          {/* 移动端菜单按钮 - 打开侧边栏 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={onToggleSidebar}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 移动端搜索栏 - 仅在移动端显示 */}
      <Paper sx={{ display: { xs: 'flex', md: 'none' }, p: 2, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }} component="form" onSubmit={handleSearchSubmit}>
        <TextField
          placeholder="搜索游戏、开发者或标签"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#475569',
              },
              '&:hover fieldset': {
                borderColor: '#6366f1',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#94a3b8',
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: '#94a3b8',
                opacity: 1
              }
            }
          }}
        />
        <IconButton type="submit" sx={{ ml: 1, color: '#6366f1' }} aria-label="search">
          <Search />
        </IconButton>
      </Paper>

      {/* 用户菜单 */}
      <Menu
        id="user-menu"
        anchorEl={userAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(userAnchorEl)}
        onClose={handleUserMenuClose}
      >
        {user ? (
          // 已登录状态
          <>
            <MenuItem key="profile" onClick={() => handleNavigate('/profile')}>
              个人中心
            </MenuItem>
            <MenuItem key="orders" onClick={() => handleNavigate('/orders')}>
              订单历史
            </MenuItem>
            <MenuItem key="library" onClick={() => handleNavigate('/library')}>
              游戏库
            </MenuItem>
            {user.role === 'developer' && (
              <MenuItem key="developer" onClick={() => handleNavigate('/developer')}>
                开发者中心
              </MenuItem>
            )}
            <MenuItem key="logout" onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              登出
            </MenuItem>
          </>
        ) : (
          // 未登录状态
          <>
            <MenuItem key="login" onClick={() => handleNavigate('/login')}>
              登录
            </MenuItem>
            <MenuItem key="register" onClick={() => handleNavigate('/register')}>
              注册
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  )
}

export default Header