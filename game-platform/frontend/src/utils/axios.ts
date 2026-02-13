import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

// 请求缓存
interface CacheItem {
  data: unknown;
  timestamp: number;
}

const requestCache = new Map<string, CacheItem>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 缓存过期时间：5分钟

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生成缓存键
const generateCacheKey = (config: AxiosRequestConfig): string => {
  const { method = 'GET', url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 检查缓存（仅GET请求）
    if (config.method === 'get') {
      const cacheKey = generateCacheKey(config);
      const cachedData = requestCache.get(cacheKey);
      
      if (cachedData) {
        const now = Date.now();
        if (now - cachedData.timestamp < CACHE_EXPIRY) {
          // 使用缓存数据
          return Promise.reject({ cached: true, data: cachedData.data });
        } else {
          // 缓存已过期，删除缓存
          requestCache.delete(cacheKey);
        }
      }
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
    // 缓存响应（仅GET请求）
    if (response.config.method === 'get') {
      const cacheKey = generateCacheKey(response.config);
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // 处理缓存的响应
    if (error.cached) {
      return Promise.resolve({ data: error.data });
    }

    // 处理错误
    if (error.response) {
      // 服务器返回错误
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          window.location.href = '/auth';
          break;
        case 403:
          console.error('You don\'t have permission to access this resource');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error: ${error.response.data.error || 'Unknown error'}`);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('Network error, please try again later');
    } else {
      // 请求配置有误
      console.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// 重试机制
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // 等待一段时间后重试
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  if (lastError) {
    throw lastError;
  } else {
    throw new Error('Request failed without error');
  }
};

export { api, retryRequest };
export default api;