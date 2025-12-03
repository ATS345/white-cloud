import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

// 异步thunk：注册用户
export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      // 保存token到本地存储
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '注册失败，请重试'
      )
    }
  }
)

// 异步thunk：用户登录
export const login = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      
      // 保存token到本地存储
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '登录失败，请检查您的邮箱和密码'
      )
    }
  }
)

// 异步thunk：获取当前用户信息
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '获取用户信息失败'
      )
    }
  }
)

// 异步thunk：更新用户信息
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', userData)
      
      // 更新本地存储的用户信息
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '更新用户信息失败'
      )
    }
  }
)

// 异步thunk：修改密码
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/password', passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '修改密码失败'
      )
    }
  }
)

// 异步thunk：用户登出
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { success: true, message: '登出成功' }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '登出失败'
      )
    }
  }
)

// 从本地存储获取初始状态
const getInitialUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

const getInitialToken = () => {
  return localStorage.getItem('token') || null
}

// 创建user slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: getInitialUser(),
    token: getInitialToken(),
    loading: false,
    error: null,
    success: false,
    message: ''
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessage: (state) => {
      state.message = ''
    }
  },
  extraReducers: (builder) => {
    // 注册用户
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.message = action.payload.message
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
    
    // 用户登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.message = action.payload.message
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
    
    // 获取当前用户信息
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 更新用户信息
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = action.payload.user
        state.message = action.payload.message
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
    
    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
    
    // 用户登出
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = null
        state.token = null
        state.message = action.payload.message
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

// 导出actions
export const { clearError, clearMessage } = userSlice.actions

// 导出reducer
export default userSlice.reducer