import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

// 异步Thunk - 获取开发者信息
export const fetchDeveloperInfo = createAsyncThunk(
  'developer/fetchDeveloperInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/developer/info')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取开发者信息失败')
    }
  }
)

// 异步Thunk - 获取开发者游戏列表
export const fetchDeveloperGames = createAsyncThunk(
  'developer/fetchDeveloperGames',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/developer/games', { params: { page, limit } })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取开发者游戏列表失败')
    }
  }
)

// 异步Thunk - 获取开发者销售数据
export const fetchDeveloperSales = createAsyncThunk(
  'developer/fetchDeveloperSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/developer/sales', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取开发者销售数据失败')
    }
  }
)

// 异步Thunk - 获取开发者财务数据
export const fetchDeveloperFinances = createAsyncThunk(
  'developer/fetchDeveloperFinances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/developer/finances')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取开发者财务数据失败')
    }
  }
)

// 初始状态
const initialState = {
  // 开发者信息
  developerInfo: null,
  // 开发者游戏列表
  games: [],
  totalGames: 0,
  totalPages: 1,
  currentPage: 1,
  // 销售数据
  salesData: null,
  // 财务数据
  financialData: null,
  // 加载状态
  loading: false,
  gamesLoading: false,
  salesLoading: false,
  financesLoading: false,
  // 错误信息
  error: null,
  gamesError: null,
  salesError: null,
  financesError: null
}

// 创建developerSlice
const developerSlice = createSlice({
  name: 'developer',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
      state.gamesError = null
      state.salesError = null
      state.financesError = null
    },
    // 重置开发者状态
    resetDeveloper: (state) => {
      state.developerInfo = null
      state.games = []
      state.salesData = null
      state.financialData = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取开发者信息
      .addCase(fetchDeveloperInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeveloperInfo.fulfilled, (state, action) => {
        state.loading = false
        state.developerInfo = action.payload
      })
      .addCase(fetchDeveloperInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // 获取开发者游戏列表
      .addCase(fetchDeveloperGames.pending, (state) => {
        state.gamesLoading = true
        state.gamesError = null
      })
      .addCase(fetchDeveloperGames.fulfilled, (state, action) => {
        state.gamesLoading = false
        state.games = action.payload.games
        state.totalGames = action.payload.totalGames
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchDeveloperGames.rejected, (state, action) => {
        state.gamesLoading = false
        state.gamesError = action.payload
      })
      
      // 获取开发者销售数据
      .addCase(fetchDeveloperSales.pending, (state) => {
        state.salesLoading = true
        state.salesError = null
      })
      .addCase(fetchDeveloperSales.fulfilled, (state, action) => {
        state.salesLoading = false
        state.salesData = action.payload
      })
      .addCase(fetchDeveloperSales.rejected, (state, action) => {
        state.salesLoading = false
        state.salesError = action.payload
      })
      
      // 获取开发者财务数据
      .addCase(fetchDeveloperFinances.pending, (state) => {
        state.financesLoading = true
        state.financesError = null
      })
      .addCase(fetchDeveloperFinances.fulfilled, (state, action) => {
        state.financesLoading = false
        state.financialData = action.payload
      })
      .addCase(fetchDeveloperFinances.rejected, (state, action) => {
        state.financesLoading = false
        state.financesError = action.payload
      })
  }
})

// 导出actions
export const { clearError, resetDeveloper } = developerSlice.actions

// 导出reducer
export default developerSlice.reducer