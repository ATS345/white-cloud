import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理错误
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          // 请求资源不存在
          console.error('Not Found:', error.response.data);
          break;
        case 500:
          // 服务器错误
          console.error('Server Error:', error.response.data);
          break;
        default:
          console.error('Error:', error.response.data);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('No Response:', error.request);
    } else {
      // 请求配置错误
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
