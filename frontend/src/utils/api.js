import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // 添加10秒超时设置
})

// 请求拦截器：在请求头中添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：处理token过期等情况
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token过期或无效，清除本地存储的token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 可以在这里添加跳转到登录页的逻辑
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api