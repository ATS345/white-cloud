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

// 异步Thunk - 游戏启动
export const launchGame = createAsyncThunk(
  'game/launchGame',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/launch`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '游戏启动失败')
    }
  }
)

// 异步Thunk - 游戏安装
export const installGame = createAsyncThunk(
  'game/installGame',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/install`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '游戏安装失败')
    }
  }
)

// 异步Thunk - 游戏更新
export const updateGame = createAsyncThunk(
  'game/updateGame',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/update`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '游戏更新失败')
    }
  }
)

// 异步Thunk - 查询安装状态
export const getInstallationStatus = createAsyncThunk(
  'game/getInstallationStatus',
  async (installationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/games/installation/${installationId}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '查询安装状态失败')
    }
  }
)

// 异步Thunk - 系统需求检测
export const checkSystemRequirements = createAsyncThunk(
  'game/checkSystemRequirements',
  async ({ gameId, systemInfo }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/check-system`, systemInfo)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '系统需求检测失败')
    }
  }
)

// 异步Thunk - 游戏数据同步
export const syncGameData = createAsyncThunk(
  'game/syncGameData',
  async ({ gameId, syncData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/sync`, syncData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '游戏数据同步失败')
    }
  }
)

// 异步Thunk - 获取游戏数据
export const getGameData = createAsyncThunk(
  'game/getGameData',
  async ({ gameId, dataType, dataName }, { rejectWithValue }) => {
    try {
      const params = {}
      if (dataType) params.data_type = dataType
      if (dataName) params.data_name = dataName
      
      const response = await api.get(`/games/${gameId}/data`, { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏数据失败')
    }
  }
)

// 异步Thunk - 删除游戏数据
export const deleteGameData = createAsyncThunk(
  'game/deleteGameData',
  async ({ gameId, dataId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/games/${gameId}/data/${dataId}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '删除游戏数据失败')
    }
  }
)

// 异步Thunk - 获取游戏评价
export const fetchGameReviews = createAsyncThunk(
  'game/fetchGameReviews',
  async ({ gameId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/game/${gameId}`, { params: { page, limit } })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '获取游戏评价失败')
    }
  }
)

// 异步Thunk - 创建游戏评价
export const createGameReview = createAsyncThunk(
  'game/createGameReview',
  async ({ gameId, rating, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${gameId}`, { rating, content })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '创建游戏评价失败')
    }
  }
)

// 异步Thunk - 创建评价回复
export const createReviewReply = createAsyncThunk(
  'game/createReviewReply',
  async ({ reviewId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/replies`, { content })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '创建评价回复失败')
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
    operationLoading: false,
    // 错误信息
    error: null,
    gameDetailError: null,
    operationError: null,
    // 筛选条件
    filters: {
      search: '',
      categories: [],
      tags: [],
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'release_date',
      sortOrder: 'desc'
    },
    // 游戏操作相关状态
    currentOperationGame: null,
    currentInstallation: null,
    currentUpdate: null,
    installationStatus: null,
    systemCheckResult: null,
    syncResult: null,
    // 游戏数据
    gameData: null,
    // 评价相关状态
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    reviewPagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    currentReview: null
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
      state.operationError = null
    },
    // 设置当前操作的游戏ID
    setCurrentOperationGame: (state, action) => {
      state.currentOperationGame = action.payload
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
      
      // 游戏启动
      .addCase(launchGame.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(launchGame.fulfilled, (state, action) => {
        state.operationLoading = false
        // 这里可以添加游戏启动成功后的逻辑
      })
      .addCase(launchGame.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 游戏安装
      .addCase(installGame.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(installGame.fulfilled, (state, action) => {
        state.operationLoading = false
        state.currentInstallation = action.payload
      })
      .addCase(installGame.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 游戏更新
      .addCase(updateGame.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(updateGame.fulfilled, (state, action) => {
        state.operationLoading = false
        state.currentUpdate = action.payload
      })
      .addCase(updateGame.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 查询安装状态
      .addCase(getInstallationStatus.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(getInstallationStatus.fulfilled, (state, action) => {
        state.operationLoading = false
        state.installationStatus = action.payload
      })
      .addCase(getInstallationStatus.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 系统需求检测
      .addCase(checkSystemRequirements.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(checkSystemRequirements.fulfilled, (state, action) => {
        state.operationLoading = false
        state.systemCheckResult = action.payload
      })
      .addCase(checkSystemRequirements.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 游戏数据同步
      .addCase(syncGameData.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(syncGameData.fulfilled, (state, action) => {
        state.operationLoading = false
        state.syncResult = action.payload
      })
      .addCase(syncGameData.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 获取游戏数据
      .addCase(getGameData.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(getGameData.fulfilled, (state, action) => {
        state.operationLoading = false
        state.gameData = action.payload
      })
      .addCase(getGameData.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 删除游戏数据
      .addCase(deleteGameData.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(deleteGameData.fulfilled, (state, action) => {
        state.operationLoading = false
        // 从gameData中移除删除的数据
        if (state.gameData && state.gameData.data) {
          state.gameData.data = state.gameData.data.filter(
            data => data.id !== action.payload.dataId
          )
        }
      })
      .addCase(deleteGameData.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 获取游戏评价
      .addCase(fetchGameReviews.pending, (state) => {
        state.reviewsLoading = true
        state.reviewsError = null
      })
      .addCase(fetchGameReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false
        state.reviews = action.payload.reviews
        state.reviewPagination = action.payload.pagination
      })
      .addCase(fetchGameReviews.rejected, (state, action) => {
        state.reviewsLoading = false
        state.reviewsError = action.payload
      })
      
      // 创建游戏评价
      .addCase(createGameReview.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(createGameReview.fulfilled, (state, action) => {
        state.operationLoading = false
        // 将新评价添加到评价列表的开头
        state.reviews = [action.payload, ...state.reviews]
        // 更新当前游戏的评分和评价数量
        if (state.currentGame) {
          const newRating = (state.currentGame.rating * state.currentGame.review_count + action.payload.rating) / (state.currentGame.review_count + 1)
          state.currentGame = {
            ...state.currentGame,
            rating: parseFloat(newRating.toFixed(1)),
            review_count: state.currentGame.review_count + 1
          }
        }
      })
      .addCase(createGameReview.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
      
      // 创建评价回复
      .addCase(createReviewReply.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
      })
      .addCase(createReviewReply.fulfilled, (state, action) => {
        state.operationLoading = false
        // 找到对应的评价并添加回复
        const reviewIndex = state.reviews.findIndex(review => review.id === action.payload.review_id)
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = {
            ...state.reviews[reviewIndex],
            replies: [...state.reviews[reviewIndex].replies, action.payload]
          }
        }
      })
      .addCase(createReviewReply.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = action.payload
      })
  }
})

// 导出action creators
export const { updateFilters, clearGameDetail, clearError, setCurrentOperationGame } = gameSlice.actions

// 导出reducer
export default gameSlice.reducer