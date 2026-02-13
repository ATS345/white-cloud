import { onLCP, onCLS, onFCP, onTTFB } from 'web-vitals';

// 性能指标类型
interface PerformanceMetrics {
  name: string;
  delta: number;
  id: string;
}

// 性能监控回调
const sendToAnalytics = ({ name, delta, id }: PerformanceMetrics) => {
  console.log(`Performance Metric: ${name} | Value: ${delta} | ID: ${id}`);
  // 这里可以将数据发送到分析服务
  // 例如：window.gtag('event', name, { value: delta, metric_id: id });
};

/**
 * 初始化性能监控
 * 监控核心Web指标：LCP、CLS等
 */
export const initPerformanceMonitoring = () => {
  onLCP(sendToAnalytics);
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};

/**
 * 自定义性能监控
 * @param name 指标名称
 * @param fn 要执行的函数
 * @returns 函数执行结果
 */
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  return result;
};

/**
 * 监控API请求性能
 * @param url API URL
 * @param fn API请求函数
 * @returns API请求结果
 */
export const measureApiPerformance = async <T>(url: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`API Request to ${url} took ${end - start}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`API Request to ${url} failed after ${end - start}ms`, error);
    throw error;
  }
};

/**
 * 监控组件渲染性能
 * @param componentName 组件名称
 * @param fn 渲染函数
 * @returns 渲染结果
 */
export const measureComponentRender = <T>(componentName: string, fn: () => T): T => {
  return measurePerformance(`${componentName} render`, fn);
};