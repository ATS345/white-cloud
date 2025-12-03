import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../utils/axios'

// 异步Thunk - 创建支付意图
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ gameIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/payments/intent', { gameIds })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '创建支付意图失败')
    }
  }
)

// 异步Thunk - 确认支付
export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async ({ orderId, paymentIntentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/payments/confirm', { orderId, paymentIntentId })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '确认支付失败')
    }
  }
)

// 异步Thunk - 获取订单历史
export const fetchOrderHistory = createAsyncThunk(
  'payment/fetchOrderHistory',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/payments/orders', { params: { page, limit } })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取订单历史失败')
    }
  }
)

// 异步Thunk - 获取订单详情
export const fetchOrderDetail = createAsyncThunk(
  'payment/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/payments/orders/${orderId}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取订单详情失败')
    }
  }
)

// 初始状态
const initialState = {
  // 支付状态
  loading: false,
  paymentIntent: null,
  paymentSuccess: false,
  order: null,
  // 订单历史
  orders: [],
  totalPages: 1,
  currentPage: 1,
  // 错误信息
  error: null
}

// 创建paymentSlice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // 重置支付状态
    resetPayment: (state) => {
      state.paymentIntent = null
      state.paymentSuccess = false
      state.error = null
    },
    // 清除错误
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 创建支付意图
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false
        state.paymentIntent = action.payload
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // 确认支付
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false
        state.paymentSuccess = true
        state.order = action.payload.order
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // 获取订单历史
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.totalPages = action.payload.pagination.totalPages
        state.currentPage = action.payload.pagination.currentPage
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // 获取订单详情
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// 导出action creators
export const { resetPayment, clearError } = paymentSlice.actions

// 导出reducer
export default paymentSlice.reducer