import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Badge } from '@mui/material'
import { ShoppingCart, User, Search, Menu as MenuIcon, Logout } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/userSlice'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const { totalItems } = useSelector((state) => state.cart)
  
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [userAnchorEl, setUserAnchorEl] = React.useState(null)

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
    <AppBar position="static" sx={{ bgcolor: '#1e293b', boxShadow: 3 }}>
      <Toolbar>
        {/* Logo and Brand */}
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#6366f1', cursor: 'pointer' }} onClick={() => navigate('/')}>
          木鱼游戏
        </Typography>

        {/* Desktop Menu */}
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
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuItem onClick={() => handleNavigate('/')}>首页</MenuItem>
            <MenuItem onClick={() => handleNavigate('/games')}>游戏商城</MenuItem>
            <MenuItem onClick={() => handleNavigate('/library')}>游戏库</MenuItem>
            <MenuItem onClick={() => handleNavigate('/developer')}>开发者中心</MenuItem>
            <MenuItem onClick={() => handleNavigate('/login')}>登录</MenuItem>
            <MenuItem onClick={() => handleNavigate('/register')}>注册</MenuItem>
          </Menu>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" onClick={() => navigate('/cart')}>
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <User />
          </IconButton>
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
              [
                <MenuItem key="profile" onClick={() => handleNavigate('/profile')}>
                  个人中心
                </MenuItem>,
                <MenuItem key="orders" onClick={() => handleNavigate('/orders')}>
                  订单历史
                </MenuItem>,
                <MenuItem key="library" onClick={() => handleNavigate('/library')}>
                  游戏库
                </MenuItem>,
                {user.role === 'developer' && (
                  <MenuItem key="developer" onClick={() => handleNavigate('/developer')}>
                    开发者中心
                  </MenuItem>
                )},
                <MenuItem key="logout" onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  登出
                </MenuItem>
              ]
            ) : (
              // 未登录状态
              [
                <MenuItem key="login" onClick={() => handleNavigate('/login')}>
                  登录
                </MenuItem>,
                <MenuItem key="register" onClick={() => handleNavigate('/register')}>
                  注册
                </MenuItem>
              ]
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header