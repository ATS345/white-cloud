import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../utils/axios'

// 异步Thunk - 登录
const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('/auth/login', credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || '登录失败')
  }
})

// 异步Thunk - 注册
const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/auth/register', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || '注册失败')
  }
})

// 异步Thunk - 获取当前用户信息
const getCurrentUser = createAsyncThunk('user/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/auth/me')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || '获取用户信息失败')
  }
})

// 异步Thunk - 更新用户信息
const updateUser = createAsyncThunk('user/updateUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.put('/auth/profile', userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data || '更新用户信息失败')
  }
})

// 初始状态
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

// 创建userSlice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 登出
    logout: (state) => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // 获取当前用户信息
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      // 更新用户信息
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

// 导出action creators
export const { logout, clearError } = userSlice.actions

export { login, register, getCurrentUser, updateUser }

// 导出reducer
export default userSlice.reducer