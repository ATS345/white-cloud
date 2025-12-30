import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { generateCsrfToken, getCsrfToken } from '../utils/security';

// 请求缓存接口
interface RequestCache {
  [key: string]: { data: unknown; timestamp: number };
}

// 请求队列接口
interface RequestQueue {
  [key: string]: AbortController[];
}

// 配置选项接口
interface ApiConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  cacheTime?: number;
  skipCache?: boolean;
}

// 创建API服务类
class ApiService {
  private api: AxiosInstance;
  private cache: RequestCache = {};
  private requestQueue: RequestQueue = {};
  private readonly DEFAULT_TIMEOUT = 8000;

  constructor() {
    // 创建axios实例
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: this.DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 初始化CSRF令牌
    if (!localStorage.getItem('csrfToken')) {
      generateCsrfToken();
    }

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => this.handleRequest(config as ApiConfig),
      (error) => this.handleRequestError(error)
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    );
  }

  // 生成请求唯一标识
  private generateRequestKey(config: ApiConfig): string {
    const { method, url, params, data } = config;
    return `${method || 'get'}:${url || ''}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  }

  // 请求处理
  private handleRequest(config: ApiConfig): ApiConfig {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // 添加CSRF令牌
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRF-Token': csrfToken,
      };
    }

    // 创建AbortController用于取消请求
    const controller = new AbortController();
    config.signal = controller.signal;

    // 将请求控制器添加到队列
    const requestKey = this.generateRequestKey(config as ApiConfig);
    if (!this.requestQueue[requestKey]) {
      this.requestQueue[requestKey] = [];
    }
    this.requestQueue[requestKey].push(controller);

    return config;
  }

  // 请求错误处理
  private handleRequestError(error: unknown): Promise<never> {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }

  // 响应处理
  private handleResponse(response: AxiosResponse): unknown {
    // 缓存响应数据
    const config = response.config as ApiConfig;
    if (!config.skipCache && response.status === 200) {
      const cacheKey = this.generateRequestKey(config);
      this.cache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };
    }

    // 从请求队列中移除已完成的请求
    const requestKey = this.generateRequestKey(config);
    if (this.requestQueue[requestKey]) {
      delete this.requestQueue[requestKey];
    }

    return response.data;
  }

  // 响应错误处理
  private handleResponseError(error: unknown): Promise<never> {
    const axiosError = error as {
      config?: ApiConfig;
      response?: {
        status: number;
        data: unknown;
      };
      message?: string;
    };
    const config = axiosError.config as ApiConfig;

    // 清除请求队列中的控制器
    if (config) {
      const requestKey = this.generateRequestKey(config);
      if (this.requestQueue[requestKey]) {
        delete this.requestQueue[requestKey];
      }
    }

    // 处理取消请求错误
    if (axios.isCancel(error)) {
      console.log('Request canceled:', axiosError.message);
      return Promise.reject(error);
    }

    // 处理网络错误或超时错误
    if (!axiosError.response) {
      // 重试逻辑
      if (config && config.retry! > 0) {
        config.retry!--;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.api(config));
          }, config.retryDelay);
        });
      }
      console.error('Network Error or Timeout:', axiosError.message);
      return Promise.reject(new Error('网络连接失败，请检查网络设置后重试'));
    }

    // 服务器返回错误状态码
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    switch (status) {
      case 401:
        // 未授权，清除token并跳转登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden:', data);
        return Promise.reject(new Error('您没有权限访问此资源'));
      case 404:
        console.error('Not Found:', data);
        return Promise.reject(new Error('请求的资源不存在'));
      case 429:
        console.error('Too Many Requests:', data);
        return Promise.reject(new Error('请求过于频繁，请稍后再试'));
      case 500:
        console.error('Server Error:', data);
        return Promise.reject(new Error('服务器错误，请稍后再试'));
      default:
        console.error(`Error ${status}:`, data);
        return Promise.reject(new Error(data.message || `请求失败，状态码：${status}`));
    }

    return Promise.reject(error);
  }

  // 取消请求
  public cancelRequests(requestConfig: Partial<ApiConfig>): void {
    const requestKey = this.generateRequestKey(requestConfig as ApiConfig);
    if (this.requestQueue[requestKey]) {
      this.requestQueue[requestKey].forEach(controller => {
        controller.abort();
      });
      delete this.requestQueue[requestKey];
    }
  }

  // 清除特定请求的缓存
  public clearCache(requestConfig: Partial<ApiConfig>): void {
    const cacheKey = this.generateRequestKey(requestConfig as ApiConfig);
    if (this.cache[cacheKey]) {
      delete this.cache[cacheKey];
    }
  }

  // 清除所有缓存
  public clearAllCache(): void {
    this.cache = {};
  }

  // GET请求
  public get<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.api.get(url, config);
  }

  // POST请求
  public post<T>(url: string, data?: unknown, config?: ApiConfig): Promise<T> {
    return this.api.post(url, data, config);
  }

  // PUT请求
  public put<T>(url: string, data?: unknown, config?: ApiConfig): Promise<T> {
    return this.api.put(url, data, config);
  }

  // PATCH请求
  public patch<T>(url: string, data?: unknown, config?: ApiConfig): Promise<T> {
    return this.api.patch(url, data, config);
  }

  // DELETE请求
  public delete<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.api.delete(url, config);
  }

  // 下载文件
  public download<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.api.get(url, {
      ...config,
      responseType: 'blob',
    });
  }
}

// 导出API服务实例
export default new ApiService();
