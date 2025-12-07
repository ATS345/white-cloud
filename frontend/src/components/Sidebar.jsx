import React, { useState } from 'react'
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, IconButton, Box, Typography, Collapse, Tooltip 
} from '@mui/material'
import { 
  Home, Gamepad, LibraryBooks, ShoppingCart, Person, Settings, 
  DeveloperMode, BarChart, AttachMoney, TrendingUp, ExpandLess, ExpandMore,
  Menu, ChevronLeft, Star, NewReleases, Tag, Search
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.user)
  
  const [openDeveloperMenu, setOpenDeveloperMenu] = useState(false)
  const [openLibraryMenu, setOpenLibraryMenu] = useState(false)
  const [openDiscoverMenu, setOpenDiscoverMenu] = useState(false)
  
  // 导航项配置
  const navItems = [
    {
      title: '首页',
      path: '/',
      icon: <Home />,
      visible: true
    },
    {
      title: '发现游戏',
      path: null,
      icon: <Search />,
      visible: true,
      children: [
        { title: '所有游戏', path: '/games', icon: <Gamepad /> },
        { title: '热门游戏', path: '/games?sortBy=rating&sortOrder=desc', icon: <TrendingUp /> },
        { title: '新发布', path: '/games?sortBy=release_date&sortOrder=desc', icon: <NewReleases /> },
        { title: '最高评分', path: '/games?sortBy=rating&sortOrder=desc', icon: <Star /> }
      ]
    },
    {
      title: '游戏库',
      path: null,
      icon: <LibraryBooks />,
      visible: user,
      children: [
        { title: '我的游戏', path: '/library', icon: <LibraryBooks /> },
        { title: '收藏游戏', path: '/library?type=wishlist', icon: <Star /> }
      ]
    },
    {
      title: '购物车',
      path: '/cart',
      icon: <ShoppingCart />,
      visible: true
    },
    {
      title: '个人中心',
      path: '/profile',
      icon: <Person />,
      visible: user
    }
  ]
  
  // 开发者菜单
  const developerItems = [
    {
      title: '开发者中心',
      path: '/developer',
      icon: <DeveloperMode />
    },
    {
      title: '我的游戏',
      path: '/developer/games',
      icon: <Gamepad />
    },
    {
      title: '销售统计',
      path: '/developer/sales',
      icon: <BarChart />
    },
    {
      title: '财务管理',
      path: '/developer/finances',
      icon: <AttachMoney />
    }
  ]
  
  // 辅助导航项
  const additionalItems = [
    {
      title: '下载客户端',
      path: '/download',
      icon: <Gamepad />,
      visible: true
    },
    {
      title: '登录',
      path: '/login',
      icon: <Person />,
      visible: !user
    },
    {
      title: '注册',
      path: '/register',
      icon: <Person />,
      visible: !user
    }
  ]
  
  // 检查当前路径是否匹配
  const isActivePath = (path) => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  
  // 处理导航
  const handleNavigate = (path) => {
    navigate(path)
    onClose() // 在移动设备上导航后关闭侧边栏
  }
  
  // 切换开发者菜单
  const handleDeveloperMenuToggle = () => {
    setOpenDeveloperMenu(!openDeveloperMenu)
  }
  
  // 切换游戏库菜单
  const handleLibraryMenuToggle = () => {
    setOpenLibraryMenu(!openLibraryMenu)
  }
  
  // 切换发现菜单
  const handleDiscoverMenuToggle = () => {
    setOpenDiscoverMenu(!openDiscoverMenu)
  }
  
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#1e293b',
          color: 'white',
          boxSizing: 'border-box',
          borderRight: '1px solid #334155'
        }
      }}
    >
      {/* 侧边栏头部 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid #334155'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gamepad sx={{ color: '#6366f1', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
            木鱼游戏
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ display: { xs: 'block', md: 'none' }, color: 'white' }}
        >
          <ChevronLeft />
        </IconButton>
      </Box>
      
      {/* 主要导航列表 */}
      <List sx={{ pt: 0 }}>
        {/* 显示主要导航项 */}
        {navItems
          .filter(item => item.visible)
          .map((item, index) => (
            <React.Fragment key={index}>
              {item.children ? (
                <>
                  <ListItem
                    button
                    onClick={
                      item.title === '发现游戏' ? handleDiscoverMenuToggle :
                      item.title === '游戏库' ? handleLibraryMenuToggle :
                      handleDeveloperMenuToggle
                    }
                    sx={{
                      backgroundColor: isActivePath(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#cbd5e1' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      sx={{ color: 'white' }}
                    />
                    {item.title === '发现游戏' ? openDiscoverMenu ? <ExpandLess /> : <ExpandMore /> :
                     item.title === '游戏库' ? openLibraryMenu ? <ExpandLess /> : <ExpandMore /> :
                     openDeveloperMenu ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  
                  {/* 子菜单 */}
                  <Collapse 
                    in={
                      item.title === '发现游戏' ? openDiscoverMenu :
                      item.title === '游戏库' ? openLibraryMenu :
                      openDeveloperMenu
                    } 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child, childIndex) => (
                        <ListItem 
                          button 
                          key={childIndex}
                          onClick={() => handleNavigate(child.path)}
                          sx={{
                            pl: 4,
                            backgroundColor: isActivePath(child.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: '#94a3b8' }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.title}
                            sx={{
                              color: isActivePath(child.path) ? '#6366f1' : '#cbd5e1'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem
                  button
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    backgroundColor: isActivePath(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isActivePath(item.path) ? '#6366f1' : '#cbd5e1' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    sx={{
                      color: isActivePath(item.path) ? '#6366f1' : 'white'
                    }}
                  />
                </ListItem>
              )}
            </React.Fragment>
          ))}
        
        {/* 开发者菜单（仅开发者可见） */}
        {user && user.role === 'developer' && (
          <>
            <Divider sx={{ backgroundColor: '#334155', my: 1 }} />
            <ListItem
              button
              onClick={handleDeveloperMenuToggle}
            >
              <ListItemIcon sx={{ color: '#cbd5e1' }}>
                <DeveloperMode />
              </ListItemIcon>
              <ListItemText 
                primary="开发者中心"
                sx={{ color: 'white' }}
              />
              {openDeveloperMenu ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={openDeveloperMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {developerItems.map((item, index) => (
                  <ListItem 
                    button 
                    key={index}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      pl: 4,
                      backgroundColor: isActivePath(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: '#94a3b8' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      sx={{
                        color: isActivePath(item.path) ? '#6366f1' : '#cbd5e1'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
        
        {/* 辅助导航项 */}
        <Divider sx={{ backgroundColor: '#334155', my: 1 }} />
        {additionalItems
          .filter(item => item.visible)
          .map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleNavigate(item.path)}
              sx={{
                backgroundColor: isActivePath(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: isActivePath(item.path) ? '#6366f1' : '#cbd5e1' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                sx={{
                  color: isActivePath(item.path) ? '#6366f1' : 'white'
                }}
              />
            </ListItem>
          ))}
      </List>
      
      {/* 侧边栏底部 */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #334155' }}>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <Person sx={{ color: '#6366f1', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                {user.role === 'developer' ? '开发者' : '普通用户'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default Sidebar