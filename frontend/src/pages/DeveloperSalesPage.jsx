import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
  Tabs,
  Tab,
  Box as MuiBox
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import GamepadIcon from '@mui/icons-material/Gamepad'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import BarChartIcon from '@mui/icons-material/BarChart'
import PieChartIcon from '@mui/icons-material/PieChart'
import LineChartIcon from '@mui/icons-material/ShowChart'

const DeveloperSalesPage = () => {
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.user)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'quarter', 'year'
  const [chartType, setChartType] = useState('line') // 'line', 'bar', 'pie'
  const [tabValue, setTabValue] = useState(0) // 0: 销售概览, 1: 游戏详情, 2: 地区分析
  
  // 模拟销售数据
  const mockSalesData = {
    totalSales: 1250,
    totalRevenue: 38500.50,
    avgPrice: 30.80,
    salesGrowth: 12,
    revenueGrowth: 8,
    dailySales: [
      { date: '12-01', sales: 45, revenue: 13500 },
      { date: '12-02', sales: 38, revenue: 11400 },
      { date: '12-03', sales: 52, revenue: 15600 },
      { date: '12-04', sales: 48, revenue: 14400 },
      { date: '12-05', sales: 55, revenue: 16500 },
      { date: '12-06', sales: 62, revenue: 18600 },
      { date: '12-07', sales: 58, revenue: 17400 },
      { date: '12-08', sales: 49, revenue: 14700 },
      { date: '12-09', sales: 53, revenue: 15900 },
      { date: '12-10', sales: 57, revenue: 17100 }
    ],
    gameSales: [
      { id: 1, title: '赛博朋克2077', sales: 320, revenue: 95360, price: 298 },
      { id: 2, title: '艾尔登法环', sales: 280, revenue: 55720, price: 199 },
      { id: 3, title: '黑神话：悟空', sales: 250, revenue: 67000, price: 268 },
      { id: 4, title: '星穹铁道', sales: 180, revenue: 0, price: 0 },
      { id: 5, title: '星球大战：亡命徒', sales: 120, revenue: 29880, price: 249 }
    ],
    regionalSales: [
      { region: '华东', sales: 350, revenue: 104300, percentage: 28 },
      { region: '华南', sales: 280, revenue: 83200, percentage: 22 },
      { region: '华北', sales: 240, revenue: 71520, percentage: 18 },
      { region: '西南', sales: 180, revenue: 53640, percentage: 14 },
      { region: '东北', sales: 120, revenue: 35760, percentage: 9 },
      { region: '西北', sales: 80, revenue: 23840, percentage: 7 }
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
    
    setLoading(true)
    
    // 模拟加载数据
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [user, navigate])

  // 处理时间范围变化
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value)
    // 这里可以根据时间范围重新加载数据
  }

  // 处理图表类型变化
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value)
  }

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // 处理返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/developer')
  }

  // 处理导航到游戏管理
  const handleNavigateToGames = () => {
    navigate('/developer/games')
  }

  // 处理导航到财务报表
  const handleNavigateToFinances = () => {
    navigate('/developer/finances')
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
            销售分析
          </Typography>
          <Typography variant="body1" color="text.secondary">
            查看您的游戏销售数据和趋势
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
            onClick={handleNavigateToFinances}
          >
            财务报表
          </Button>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* 销售概览卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              {mockSalesData.totalSales}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                {mockSalesData.salesGrowth}% 增长
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
              <TrendingUpIcon sx={{ color: '#f59e0b' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockSalesData.totalRevenue.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                {mockSalesData.revenueGrowth}% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 平均价格 */}
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
                平均价格
              </Typography>
              <ArrowUpwardIcon sx={{ color: '#6366f1' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¥{mockSalesData.avgPrice.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                5% 增长
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 游戏数量 */}
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
                游戏数量
              </Typography>
              <GamepadIcon sx={{ color: '#ec4899' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {mockSalesData.gameSales.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                1 款新游戏
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 数据筛选和图表类型选择 */}
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
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              图表类型：
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<LineChartIcon />}
                onClick={() => setChartType('line')}
              >
                折线图
              </Button>
              <Button
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => setChartType('bar')}
              >
                柱状图
              </Button>
              <Button
                variant={chartType === 'pie' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<PieChartIcon />}
                onClick={() => setChartType('pie')}
              >
                饼图
              </Button>
            </Box>
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
          <Tab label="销售概览" sx={{ minWidth: 120 }} />
          <Tab label="游戏详情" sx={{ minWidth: 120 }} />
          <Tab label="地区分析" sx={{ minWidth: 120 }} />
        </Tabs>
      </Box>

      {/* 销售概览 */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* 销售趋势图 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                销售趋势
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <LineChartIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    销售趋势图表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    显示最近 {timeRange === 'week' ? '7天' : timeRange === 'month' ? '30天' : timeRange === 'quarter' ? '90天' : '365天'} 的销售数据
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* 销售分布 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                销售分布
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PieChartIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    销售分布图表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    显示不同游戏的销售占比
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* 每日销售数据 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                每日销售数据
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table aria-label="每日销售数据表" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>日期</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>销量</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>收入</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>平均价格</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSalesData.dailySales.map((day) => (
                      <TableRow key={day.date} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>{day.sales}</TableCell>
                        <TableCell>¥{day.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          {day.sales > 0 ? 
                            `¥${(day.revenue / day.sales).toFixed(2)}` : 
                            '¥0.00'}
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

      {/* 游戏详情 */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* 游戏销量排名 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  游戏销量排名
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleNavigateToGames}
                >
                  管理游戏
                </Button>
              </Box>
              
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table aria-label="游戏销量排名表" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>排名</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>游戏名称</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>价格</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>销量</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>收入</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>平均单价</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSalesData.gameSales.map((game, index) => (
                      <TableRow key={game.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {index + 1}
                          {index < 3 && (
                            <Chip
                              label={index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{game.title}</TableCell>
                        <TableCell>
                          {game.price === 0 ? (
                            <Chip label="免费" size="small" color="success" />
                          ) : (
                            `¥${game.price.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>{game.sales}</TableCell>
                        <TableCell>¥{game.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          {game.sales > 0 ? 
                            `¥${(game.revenue / game.sales).toFixed(2)}` : 
                            '¥0.00'}
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

      {/* 地区分析 */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* 地区销售分布 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                地区销售分布
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e293b', borderRadius: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PieChartIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    地区销售分布图表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    显示不同地区的销售占比
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* 地区销售详情 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                地区销售详情
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table aria-label="地区销售详情表" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>地区</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>销量</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>收入</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>占比</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockSalesData.regionalSales.map((region) => (
                      <TableRow key={region.region} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{region.region}</TableCell>
                        <TableCell>{region.sales}</TableCell>
                        <TableCell>¥{region.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 8,
                                bgcolor: '#334155',
                                borderRadius: 4,
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${region.percentage}%`,
                                  height: '100%',
                                  bgcolor: '#6366f1',
                                  borderRadius: 4
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {region.percentage}%
                            </Typography>
                          </Box>
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
    </Container>
  )
}

export default DeveloperSalesPage