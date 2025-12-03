import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

// 异步Thunk - 获取游戏列表
export const fetchGames = createAsyncThunk(
  'game/fetchGames',
  async ({ page = 1, ...filters }, { rejectWithValue }) => {
    try {
      // 构建查询参数
      const params = {
        page,
        limit: 20,
        ...filters
      }

      // 发送请求
      const response = await api.get('/games', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏列表失败')
    }
  }
)

// 异步Thunk - 获取游戏分类
export const fetchCategories = createAsyncThunk(
  'game/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/games/categories/all')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏分类失败')
    }
  }
)

// 异步Thunk - 获取游戏标签
export const fetchTags = createAsyncThunk(
  'game/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/games/tags/all')
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏标签失败')
    }
  }
)

// 异步Thunk - 获取游戏详情
export const fetchGameDetail = createAsyncThunk(
  'game/fetchGameDetail',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/games/${gameId}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏详情失败')
    }
  }
)

// 初始状态
const initialState = {
  // 游戏列表
  games: [],
  currentGame: null,
  // 分类和标签
  categories: [],
  tags: [],
  // 分页信息
  totalPages: 1,
  currentPage: 1,
  // 加载状态
  loading: false,
  gameDetailLoading: false,
  // 错误信息
  error: null,
  gameDetailError: null,
  // 筛选条件
  filters: {
    search: '',
    category: '',
    tag: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'release_date',
    sortOrder: 'desc'
  }
}

// 创建gameSlice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // 更新筛选条件
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    // 清除游戏详情
    clearGameDetail: (state) => {
      state.currentGame = null
      state.gameDetailError = null
    },
    // 清除错误
    clearError: (state) => {
      state.error = null
      state.gameDetailError = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取游戏列表
      .addCase(fetchGames.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false
        state.games = action.payload.games
        state.totalPages = action.payload.pagination.totalPages
        state.currentPage = action.payload.pagination.currentPage
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // 获取游戏分类
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      
      // 获取游戏标签
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload
      })
      
      // 获取游戏详情
      .addCase(fetchGameDetail.pending, (state) => {
        state.gameDetailLoading = true
        state.gameDetailError = null
      })
      .addCase(fetchGameDetail.fulfilled, (state, action) => {
        state.gameDetailLoading = false
        state.currentGame = action.payload
      })
      .addCase(fetchGameDetail.rejected, (state, action) => {
        state.gameDetailLoading = false
        state.gameDetailError = action.payload
      })
  }
})

// 导出action creators
export const { updateFilters, clearGameDetail, clearError } = gameSlice.actions

// 导出reducer
export default gameSlice.reducer