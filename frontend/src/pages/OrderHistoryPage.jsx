import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Tabs,
  Tab,
  Pagination
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PaidIcon from '@mui/icons-material/Paid'

const OrderHistoryPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.user)
  const { loading, error, totalPages, currentPage } = useSelector((state) => state.payment)
  
  const [activeTab, setActiveTab] = useState(0)

  // 模拟订单数据
  const mockOrders = [
    {
      id: 1,
      orderNumber: 'MUYU-20251201-001',
      totalAmount: 298.00,
      status: 'completed',
      createdAt: '2025-12-01T10:30:00Z',
      games: [
        { id: 1, title: '赛博朋克2077', price: 298.00 }
      ]
    },
    {
      id: 2,
      orderNumber: 'MUYU-20251128-002',
      totalAmount: 199.00,
      status: 'completed',
      createdAt: '2025-11-28T15:45:00Z',
      games: [
        { id: 2, title: '艾尔登法环', price: 199.00 }
      ]
    },
    {
      id: 3,
      orderNumber: 'MUYU-20251125-003',
      totalAmount: 0.00,
      status: 'completed',
      createdAt: '2025-11-25T09:15:00Z',
      games: [
        { id: 3, title: '星穹铁道', price: 0.00 }
      ]
    }
  ]

  useEffect(() => {
    // 检查用户是否登录
    if (!user) {
      navigate('/login')
      return
    }

    // 模拟加载订单历史
    // dispatch(fetchOrderHistory({ page: 1, limit: 10 }))
  }, [user, navigate, dispatch])

  // 处理标签页变化
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // 处理分页变化
  const handlePageChange = () => {
    // dispatch(fetchOrderHistory({ page, limit: 10 }))
  }

  // 处理查看订单详情
  const handleViewOrder = (orderId) => {
    // navigate(`/orders/${orderId}`)
    alert(`查看订单详情: ${orderId}`)
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取订单状态标签
  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return { label: '已完成', color: 'success' }
      case 'pending':
        return { label: '待处理', color: 'warning' }
      case 'processing':
        return { label: '处理中', color: 'info' }
      case 'shipped':
        return { label: '已发货', color: 'primary' }
      case 'cancelled':
        return { label: '已取消', color: 'error' }
      default:
        return { label: '未知', color: 'default' }
    }
  }

  if (!user) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ReceiptLongIcon sx={{ fontSize: 32, color: '#6366f1' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          订单历史
        </Typography>
      </Box>

      {/* 标签页 */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="全部订单" />
          <Tab label="已完成" />
          <Tab label="待处理" />
          <Tab label="已取消" />
        </Tabs>
      </Paper>

      {/* 订单列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      ) : mockOrders.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, textAlign: 'center' }}>
          <Box>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              您还没有任何订单
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              浏览游戏商城，购买您喜欢的游戏吧
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4 }}
              onClick={() => navigate('/games')}
            >
              浏览游戏
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
            <Table aria-label="订单历史表">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>订单编号</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>日期</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>商品</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>总计</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'right' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockOrders.map((order) => {
                  const statusLabel = getOrderStatusLabel(order.status)
                  return (
                    <TableRow
                      key={order.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptLongIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {order.orderNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                          <Typography variant="body2">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {order.games.map((game) => (
                            <Typography key={game.id} variant="body2">
                              {game.title}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel.label}
                          color={statusLabel.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaidIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                            ¥{order.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 分页 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{ mb: 3 }}
            />
          </Box>
        </Box>
      )}
    </Container>
  )
}

export default OrderHistoryPage
