import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存策略优化
      staleTime: 10 * 60 * 1000, // 10分钟缓存时间，减少不必要的网络请求
      gcTime: 30 * 60 * 1000, // 30分钟后从缓存中移除未使用的数据
      
      // 重试机制优化
      retry: (failureCount, error: any) => {
        // 只对网络错误和服务器错误进行重试
        if (error.response?.status >= 500 || !error.response) {
          // 最多重试2次
          return failureCount < 2;
        }
        // 4xx错误不重试
        return false;
      },
      retryDelay: (attemptIndex) => {
        // 指数退避策略，每次重试间隔增加
        return Math.min(1000 * 2 ** attemptIndex, 5000);
      },
      
      // 数据更新策略
      refetchOnWindowFocus: 'always', // 窗口重新获取焦点时重新获取数据
      refetchOnMount: 'always', // 组件挂载时重新获取数据
      refetchOnReconnect: 'always', // 网络重新连接时重新获取数据
      
      // 后台数据刷新
      refetchInterval: false, // 不自动后台刷新
      refetchIntervalInBackground: false, // 后台时不自动刷新
      
      // 乐观更新配置
      structuralSharing: true, // 启用结构共享，减少不必要的重渲染
      
      // 错误处理
      retryOnMount: false, // 挂载时不重试失败的查询
    },
    mutations: {
      // 乐观更新配置
      onSuccess: () => {
        // 成功后刷新相关查询
        queryClient.invalidateQueries();
      },
      // 错误处理
      retry: 0, // 突变操作不重试
    },
  },
});
