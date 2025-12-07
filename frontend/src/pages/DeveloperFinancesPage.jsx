import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PaymentIcon from '@mui/icons-material/Payment'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import CancelIcon from '@mui/icons-material/Cancel'
import DollarIcon from '@mui/icons-material/AttachMoney'
import BarChartIcon from '@mui/icons-material/BarChart'

const DeveloperFinancesPage = () => {
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.user)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'quarter', 'year'
  const [tabValue, setTabValue] = useState(0) // 0: 财务概览, 1: 收支明细, 2: 提现记录
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [withdrawalAccount, setWithdrawalAccount] = useState('')
  
  // 模拟财务数据
  const mockFinancialData = {
    balance: 32500.75,
    availableBalance: 28500.75,
    pendingBalance: 4000,
    totalRevenue: 45600.50,
    totalWithdrawals: 13100,
    revenueGrowth: 8,
    withdrawalGrowth: 15,
    incomeDetails: [
      { id: 1, type: 'game_sale', amount: 298.00, date: '2025-12-01T10:30:00Z', description: '赛博朋克2077 销售', status: 'completed' },
      { id: 2, type: 'game_sale', amount: 199.00, date: '2025-12-01T15:45:00Z', description: '艾尔登法环 销售', status: 'completed' },
      { id: 3, type: 'game_sale', amount: 268.00, date: '2025-11-30T09:15:00Z', description: '黑神话：悟空 销售', status: 'completed' },
      { id: 4, type: 'game_sale', amount: 0.00, date: '2025-11-29T14:20:00Z', description: '星穹铁道 销售', status: 'completed' },
      { id: 5, type: 'game_sale', amount: 249.00, date: '2025-11-28T11:10:00Z', description: '星球大战：亡命徒 销售', status: 'completed' },
      { id: 6, type: 'refund', amount: -298.00, date: '2025-11-27T16:30:00Z', description: '赛博朋克2077 退款', status: 'completed' },
      { id: 7, type: 'game_sale', amount: 298.00, date: '2025-11-26T08:45:00Z', description: '赛博朋克2077 销售', status: 'completed' },
      { id: 8, type: 'game_sale', amount: 199.00, date: '2025-11-25T13:20:00Z', description: '艾尔登法环 销售', status: 'completed' }
    ],
    withdrawalRequests: [
      { id: 1, amount: 5000.00, date: '2025-11-15T10:00:00Z', status: 'completed', account: '支付宝 - 138****1234', processedAt: '2025-11-16T14:30:00Z' },
      { id: 2, amount: 3000.00, date: '2025-10-20T15:30:00Z', status: 'completed', account: '微信 - 138****1234', processedAt: '2025-10-21T10:15:00Z' },
      { id: 3, amount: 5100.00, date: '2025-09-10T09:45:00Z', status: 'completed', account: '银行转账 - 工商银行 ****1234', processedAt: '2025-09-11T16:20:00Z' },
      { id: 4, amount: 4000.00, date: '2025-12-05T14:20:00Z', status: 'pending', account: '支付宝 - 138****1234', processedAt: null },
      { id: 5, amount: 2000.00, date: '2025-08-25T11:10:00Z', status: 'canceled', account: '支付宝 - 138****1234', processedAt: null }
    ],
    monthlyRevenue: [
      { month: '1月', revenue: 8500.50 },
      { month: '2月', revenue: 9200.00 },
      { month: '3月', revenue: 7800.25 },
      { month: '4月', revenue: 10500.75 },
      { month: '5月', revenue: 11200.50 },
      { month: '6月', revenue: 9800.00 },
      { month: '7月', revenue: 12500.25 },
      { month: '8月', revenue: 13200.75 },
      { month: '9月', revenue: 11800.00 },
      { month: '10月', revenue: 10500.50 },
      { month: '11月', revenue: 12600.25 },
      { month: '12月', revenue: 9500.00 }
    ]
  }

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
    
    // 模拟加载数据
    setTimeout(() => {
      // 加载完成后不需要更新状态
    }, 1000)
  }, [user, navigate])

  // 处理时间范围变化
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value)
    // 这里可以根据时间范围重新加载数据
  }

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // 处理打开提现对话框
  const handleOpenWithdrawalDialog = () => {
    setWithdrawalDialogOpen(true)
  }

  // 处理关闭提现对话框
  const handleCloseWithdrawalDialog = () => {
    setWithdrawalDialogOpen(false)
    setWithdrawalAmount('')
    setWithdrawalAccount('')
  }

  // 处理提交提现申请
  const handleSubmitWithdrawal = () => {
    // 这里可以添加提现申请的逻辑
    console.log('提交提现申请:', {
      amount: withdrawalAmount,
      account: withdrawalAccount
    })
    handleCloseWithdrawalDialog()
  }

  // 处理返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/developer')
  }

  // 处理导航到销售分析页面
  const handleNavigateToSales = () => {
    navigate('/developer/sales')
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

  // 获取状态图标和颜色
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircleIcon />, color: 'success', label: '已完成' }
      case 'pending':
        return { icon: <PendingIcon />, color: 'warning', label: '待处理' }
      case 'canceled':
        return { icon: <CancelIcon />, color: 'error', label: '已取消' }
      default:
        return { icon: <PendingIcon />, color: 'info', label: '未知状态' }
    }
  }

  // 如果用户未登录，返回null
  if (!user) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题和导航 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            财务报表
          </Typography>
          <Typography variant="body1" color="text.secondary">
            查看您的财务状况和交易记录
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={handleBackToDashboard}
          >
            返回仪表盘
          </Button>
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={handleNavigateToSales}
          >
            销售分析
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleOpenWithdrawalDialog}
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            申请提现
          </Button>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* 财务概览卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 账户余额 */}
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
                账户余额
              </Typography>
              <AccountBalanceWalletIcon sx={{ color: '#6366f1' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockFinancialData.balance.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                {mockFinancialData.revenueGrowth}% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 可用余额 */}
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
                可用余额
              </Typography>
              <DollarIcon sx={{ color: '#10b981' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockFinancialData.availableBalance.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                上月增长 12%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 待处理金额 */}
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
                待处理金额
              </Typography>
              <PendingIcon sx={{ color: '#f59e0b' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockFinancialData.pendingBalance.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowDownwardIcon sx={{ fontSize: '0.8rem', color: 'warning.main' }} />
              <Typography variant="body2" color="warning.main">
                4笔交易待处理
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
                总收入
              </Typography>
              <TrendingUpIcon sx={{ color: '#ec4899' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockFinancialData.totalRevenue.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                {mockFinancialData.revenueGrowth}% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 数据筛选 */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              时间范围：
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                displayEmpty
              >
                <MenuItem value="week">最近一周</MenuItem>
                <MenuItem value="month">最近一个月</MenuItem>
                <MenuItem value="quarter">最近三个月</MenuItem>
                <MenuItem value="year">最近一年</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
            >
              筛选
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
            >
              导出报表
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 标签页切换 */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#6366f1',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#6366f1',
              fontWeight: 'bold',
            },
          }}
        >
          <Tab label="财务概览" sx={{ minWidth: 120 }} />
          <Tab label="收支明细" sx={{ minWidth: 120 }} />
          <Tab label="提现记录" sx={{ minWidth: 120 }} />
        </Tabs>
      </Box>

      {/* 财务概览 */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* 月收入趋势 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                月收入趋势
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    月收入趋势图表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    显示最近12个月的收入数据
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* 财务统计 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                财务统计
              </Typography>
              
              <List sx={{ width: '100%', maxWidth: 360 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#6366f1' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="总收入"
                    secondary={`¥${mockFinancialData.totalRevenue.toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#10b981' }}>
                      <DownloadIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="总提现"
                    secondary={`¥${mockFinancialData.totalWithdrawals.toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#f59e0b' }}>
                      <AccountBalanceWalletIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="当前余额"
                    secondary={`¥${mockFinancialData.balance.toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#ec4899' }}>
                      <PaymentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="提现次数"
                    secondary={`${mockFinancialData.withdrawalRequests.length} 次`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* 收入构成 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                收入构成
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CreditCardIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    收入构成图表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    显示不同游戏的收入占比
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 收支明细 */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* 收支明细列表 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                收支明细
              </Typography>
              
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table aria-label="收支明细表" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>日期</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>类型</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>描述</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>金额</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>状态</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockFinancialData.incomeDetails.map((item) => (
                      <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.type === 'game_sale' ? '游戏销售' : item.type === 'refund' ? '退款' : '其他'}
                            size="small"
                            color={item.type === 'game_sale' ? 'success' : item.type === 'refund' ? 'error' : 'info'}
                            icon={item.type === 'game_sale' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                          />
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: item.amount >= 0 ? 'success.main' : 'error.main' }}>
                          {item.amount >= 0 ? '+' : ''}¥{item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status === 'completed' ? '已完成' : '待处理'}
                            size="small"
                            color={item.status === 'completed' ? 'success' : 'warning'}
                            icon={item.status === 'completed' ? <CheckCircleIcon /> : <PendingIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 提现记录 */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* 提现记录列表 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                提现记录
              </Typography>
              
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table aria-label="提现记录表" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>提现日期</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>金额</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>账户</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>状态</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>处理时间</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockFinancialData.withdrawalRequests.map((request) => {
                      const statusInfo = getStatusInfo(request.status)
                      return (
                        <TableRow key={request.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{formatDate(request.date)}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                            ¥{request.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>{request.account}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusInfo.label}
                              size="small"
                              color={statusInfo.color}
                              icon={statusInfo.icon}
                            />
                          </TableCell>
                          <TableCell>
                            {request.processedAt ? formatDate(request.processedAt) : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          {/* 提现说明 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                提现说明
              </Typography>
              
              <Accordion sx={{ bgcolor: '#1e293b', mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    提现规则
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText primary="1. 最低提现金额：¥100" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="2. 提现手续费：免费" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="3. 提现处理时间：1-3个工作日" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="4. 每月提现次数：无限制" />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ bgcolor: '#1e293b', mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    支持的提现方式
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CreditCardIcon />
                      </ListItemIcon>
                      <ListItemText primary="支付宝" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CreditCardIcon />
                      </ListItemIcon>
                      <ListItemText primary="微信支付" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CreditCardIcon />
                      </ListItemIcon>
                      <ListItemText primary="银行转账" />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ bgcolor: '#1e293b' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    提现常见问题
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText primary="Q: 提现申请提交后可以取消吗？" secondary="A: 提现申请提交后，在处理前可以取消，处理中或已完成的提现无法取消。" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Q: 提现失败怎么办？" secondary="A: 提现失败后，资金会自动退回您的账户余额，请检查您的提现账户信息是否正确。" />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 提现申请对话框 */}
      <Dialog
        open={withdrawalDialogOpen}
        onClose={handleCloseWithdrawalDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RequestQuoteIcon sx={{ color: '#6366f1' }} />
            申请提现
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              当前可用余额：<span style={{ fontWeight: 'bold', color: '#10b981' }}>¥{mockFinancialData.availableBalance.toFixed(2)}</span>
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="提现金额"
            type="number"
            fullWidth
            variant="outlined"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="请输入提现金额，最低¥100"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="提现账户"
            type="text"
            fullWidth
            variant="outlined"
            value={withdrawalAccount}
            onChange={(e) => setWithdrawalAccount(e.target.value)}
            placeholder="请输入提现账户信息"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>提现说明：</strong>
            </Typography>
            <List sx={{ mt: 1 }}>
              <ListItem sx={{ padding: 0 }}>
                <ListItemText primary="• 最低提现金额：¥100" secondary="" />
              </ListItem>
              <ListItem sx={{ padding: 0 }}>
                <ListItemText primary="• 提现处理时间：1-3个工作日" secondary="" />
              </ListItem>
              <ListItem sx={{ padding: 0 }}>
                <ListItemText primary="• 提现手续费：免费" secondary="" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithdrawalDialog}>
            取消
          </Button>
          <Button
            onClick={handleSubmitWithdrawal}
            variant="contained"
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 100 || parseFloat(withdrawalAmount) > mockFinancialData.availableBalance}
          >
            提交申请
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default DeveloperFinancesPage