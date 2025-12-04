import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import BarChartIcon from '@mui/icons-material/BarChart'
import GamepadIcon from '@mui/icons-material/Gamepad'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import StarIcon from '@mui/icons-material/Star'
import PersonIcon from '@mui/icons-material/Person'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const DeveloperDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.user)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 模拟数据
  const mockStats = {
    totalGames: 5,
    totalSales: 1250,
    totalRevenue: 38500.50,
    totalDownloads: 2500,
    avgRating: 4.5
  }
  
  const mockRecentSales = [
    { id: 1, gameTitle: '赛博朋克2077', amount: 298.00, date: '2025-12-01T10:30:00Z' },
    { id: 2, gameTitle: '艾尔登法环', amount: 199.00, date: '2025-11-30T15:45:00Z' },
    { id: 3, gameTitle: '星穹铁道', amount: 0.00, date: '2025-11-29T09:15:00Z' },
    { id: 4, gameTitle: '黑神话：悟空', amount: 268.00, date: '2025-11-28T14:20:00Z' },
    { id: 5, gameTitle: '星球大战：亡命徒', amount: 249.00, date: '2025-11-27T11:10:00Z' }
  ]

  useEffect(() => {
    // 检查用户是否登录
    if (!user) {
      navigate('/login')
      return
    }
    
    // 检查用户是否为开发者
    if (user.role !== 'developer') {
      setError('您没有开发者权限，无法访问此页面')
      return
    }
    
    setLoading(true)
    
    // 模拟加载数据
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [user, navigate])

  // 处理导航到游戏管理页面
  const handleNavigateToGames = () => {
    navigate('/developer/games')
  }

  // 处理导航到销售分析页面
  const handleNavigateToSales = () => {
    navigate('/developer/sales')
  }

  // 处理导航到财务报表页面
  const handleNavigateToFinances = () => {
    navigate('/developer/finances')
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 如果用户未登录，返回null
  if (!user) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          开发者中心
        </Typography>
        <Chip
          label="开发者"
          color="primary"
          icon={<PersonIcon />}
        />
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* 开发者信息卡片 */}
      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3}>
            <Avatar sx={{ width: 120, height: 120, bgcolor: '#6366f1', fontSize: '3rem' }}>
              {user.username?.charAt(0).toUpperCase() || 'D'}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`游戏数量: ${mockStats.totalGames}`}
                variant="outlined"
                icon={<GamepadIcon />}
              />
              <Chip
                label={`总销量: ${mockStats.totalSales}`}
                variant="outlined"
                icon={<ShoppingCartIcon />}
              />
              <Chip
                label={`总收入: ¥${mockStats.totalRevenue.toFixed(2)}`}
                variant="outlined"
                icon={<AccountBalanceWalletIcon />}
              />
              <Chip
                label={`平均评分: ${mockStats.avgRating} ★`}
                variant="outlined"
                icon={<StarIcon />}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 总游戏数 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              borderLeft: '4px solid #6366f1',
              bgcolor: '#1e293b',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                总游戏数
              </Typography>
              <GamepadIcon sx={{ color: '#6366f1' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {mockStats.totalGames}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                2 款新游戏
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 总销量 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              borderLeft: '4px solid #10b981',
              bgcolor: '#1e293b',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                总销量
              </Typography>
              <ShoppingCartIcon sx={{ color: '#10b981' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {mockStats.totalSales}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                12% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 总收入 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              borderLeft: '4px solid #f59e0b',
              bgcolor: '#1e293b',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                总收入
              </Typography>
              <AccountBalanceWalletIcon sx={{ color: '#f59e0b' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockStats.totalRevenue.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                8% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 总下载量 */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              borderLeft: '4px solid #ec4899',
              bgcolor: '#1e293b',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                总下载量
              </Typography>
              <TrendingUpIcon sx={{ color: '#ec4899' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {mockStats.totalDownloads}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowDownwardIcon sx={{ fontSize: '0.8rem', color: 'error.main' }} />
              <Typography variant="body2" color="error.main">
                3% 下降
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 最近销售记录 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                最近销售记录
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleNavigateToSales}
              >
                查看全部
              </Button>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table aria-label="最近销售记录表" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>游戏名称</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>价格</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>购买日期</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRecentSales.map((sale) => (
                    <TableRow key={sale.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{sale.gameTitle}</TableCell>
                      <TableCell>
                        {sale.amount === 0 ? (
                          <Chip label="免费" size="small" color="success" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ¥{sale.amount.toFixed(2)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* 快速操作 */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              快速操作
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<GamepadIcon />}
                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5, py: 1.5 }}
                onClick={handleNavigateToGames}
              >
                游戏管理
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BarChartIcon />}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: 1.5, py: 1.5 }}
                onClick={handleNavigateToSales}
              >
                销售分析
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, borderRadius: 1.5, py: 1.5 }}
                onClick={handleNavigateToFinances}
              >
                财务报表
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<CalendarTodayIcon />}
                sx={{ borderRadius: 1.5, py: 1.5 }}
              >
                发布新游戏
              </Button>
            </Box>
          </Paper>
          
          {/* 统计概览 */}
          <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              本月概览
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">新游戏发布</Typography>
                <Chip label="1" size="small" color="primary" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">本月销量</Typography>
                <Chip label="234" size="small" color="success" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">本月收入</Typography>
                <Chip label="¥12,580.00" size="small" color="warning" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">新增评价</Typography>
                <Chip label="45" size="small" color="info" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DeveloperDashboard
