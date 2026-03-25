import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

interface ApiInstance extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

// 生产环境（静态服务器部署）使用相对路径，开发环境使用完整地址
// 相对路径依赖前端服务器代理 /api → 后端
const getBaseURL = () => {
  const envUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  // 生产构建时使用相对路径（由前端 Node.js 服务器代理 /api）
  if ((import.meta as { env?: { PROD?: boolean } }).env?.PROD) {
    return '/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as ApiInstance;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data as unknown;
  },
  (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      config?: { url?: string };
      message?: string;
    };
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || '请求失败';
    console.error('API Error:', {
      url: axiosError.config?.url,
      status: axiosError.response?.status,
      message: errorMessage,
    });
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
