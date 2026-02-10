import api from './api';
import * as mockData from './mockData';

// 游戏类型定义
export interface Game {
  id: number;
  name: string;
  type: string;
  rating: number;
  price: number;
  developer: string;
  publisher: string;
  releaseDate: string;
  description: string;
  images: string[];
  videos: string[];
  tags: string[];
  requirements: {
    minimum: {
      os: string;
      cpu: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      cpu: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
  comments?: {
    id: number;
    user: string;
    avatar: string;
    content: string;
    rating: number;
    time: string;
  }[];
}

// 下载进度类型
export interface DownloadProgress {
  id: number;
  gameId: number;
  gameName: string;
  progress: number;
  speed: number;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';
  totalSize: number;
  downloadedSize: number;
  estimatedTime: number;
}

// 游戏进度类型
export interface GameProgress {
  gameId: number;
  progress: number;
  lastPlayed: string;
  playTime: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取游戏列表
export const getGames = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  sortBy?: string;
  skipCache?: boolean;
}): Promise<Game[]> => {
  const { page = 1, pageSize = 12, search = '', type = 'all', sortBy = 'rating', skipCache = false } = params || {};
  
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟
    const result = mockData.getGames({ page, pageSize, search, type, sortBy });
    return result.data;
  }
  
  return api.get<Game[]>('/games', {
    params: { page, pageSize, search, type, sortBy },
    skipCache,
    cacheTime: 60000, // 60秒缓存
  });
};

// 获取游戏详情
export const getGameDetail = async (id: number, skipCache = false): Promise<Game> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
    const game = mockData.getGameDetail(id);
    if (!game) {
      throw new Error('游戏不存在');
    }
    return game;
  }
  
  return api.get<Game>(`/games/${id}`, {
    skipCache,
    cacheTime: 300000, // 5分钟缓存
  });
};

// 下载游戏
export const downloadGame = async (gameId: number): Promise<{ downloadId: number }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return { downloadId: Math.floor(Math.random() * 1000) };
  }
  
  return api.post<{ downloadId: number }>(`/games/${gameId}/download`);
};

// 获取游戏下载进度
export const getDownloadProgress = async (downloadId: number): Promise<DownloadProgress> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 50)); // 模拟网络延迟
    return {
      id: downloadId,
      gameId: 1,
      gameName: '测试游戏',
      progress: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 100) + 50, // 50-150 MB/s
      status: 'downloading' as const,
      totalSize: 10000, // 10GB
      downloadedSize: Math.floor(Math.random() * 10000),
      estimatedTime: Math.floor(Math.random() * 600) + 300, // 5-15分钟
    };
  }
  
  return api.get<DownloadProgress>(`/downloads/${downloadId}/progress`, {
    skipCache: true, // 实时进度，不缓存
  });
};

// 暂停下载
export const pauseDownload = async (downloadId: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return { success: true };
  }
  
  return api.put<{ success: boolean }>(`/downloads/${downloadId}/pause`);
};

// 继续下载
export const resumeDownload = async (downloadId: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return { success: true };
  }
  
  return api.put<{ success: boolean }>(`/downloads/${downloadId}/resume`);
};

// 删除下载
export const deleteDownload = async (downloadId: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return { success: true };
  }
  
  return api.delete<{ success: boolean }>(`/downloads/${downloadId}`);
};

// 获取游戏库
export const getGameLibrary = async (params?: {
  skipCache?: boolean;
}): Promise<Game[]> => {
  const { skipCache = false } = params || {};
  
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
    return mockData.getGameLibrary();
  }
  
  return api.get<Game[]>('/library', {
    skipCache,
    cacheTime: 30000, // 30秒缓存
  });
};

// 添加游戏到库
export const addGameToLibrary = async (gameId: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 150)); // 模拟网络延迟
    // 清除游戏库缓存
    api.clearCache({ url: '/library' });
    return { success: true };
  }
  
  const result = await api.post<{ success: boolean }>(`/library/games/${gameId}`);
  // 清除游戏库缓存
  api.clearCache({ url: '/library' });
  return result;
};

// 从库中移除游戏
export const removeGameFromLibrary = async (gameId: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 150)); // 模拟网络延迟
    // 清除游戏库缓存
    api.clearCache({ url: '/library' });
    return { success: true };
  }
  
  const result = await api.delete<{ success: boolean }>(`/library/games/${gameId}`);
  // 清除游戏库缓存
  api.clearCache({ url: '/library' });
  return result;
};

// 获取游戏进度
export const getGameProgress = async (gameId: number, skipCache = false): Promise<GameProgress> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return {
      gameId,
      progress: Math.floor(Math.random() * 100),
      lastPlayed: new Date().toISOString(),
      playTime: Math.floor(Math.random() * 1000), // 分钟
    };
  }
  
  return api.get<GameProgress>(`/library/games/${gameId}/progress`, {
    skipCache,
    cacheTime: 10000, // 10秒缓存
  });
};

// 更新游戏进度
export const updateGameProgress = async (gameId: number, progress: number): Promise<{ success: boolean }> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 150)); // 模拟网络延迟
    // 清除游戏进度缓存
    api.clearCache({ url: `/library/games/${gameId}/progress` });
    return { success: true };
  }
  
  const result = await api.put<{ success: boolean }>(`/library/games/${gameId}/progress`, { progress });
  // 清除游戏进度缓存
  api.clearCache({ url: `/library/games/${gameId}/progress` });
  return result;
};

// 获取热门游戏
export const getHotGames = async (limit = 8): Promise<Game[]> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
    return mockData.getHotGames().slice(0, limit);
  }
  
  return api.get<Game[]>(`/games/hot`, {
    params: { limit },
    cacheTime: 300000, // 5分钟缓存
  });
};

// 获取新游戏
export const getNewGames = async (limit = 8): Promise<Game[]> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
    return mockData.getNewGames().slice(0, limit);
  }
  
  return api.get<Game[]>(`/games/new`, {
    params: { limit },
    cacheTime: 300000, // 5分钟缓存
  });
};

// 获取折扣游戏
export const getDiscountGames = async (limit = 8): Promise<Game[]> => {
  // 开发环境使用模拟数据
  if (import.meta.env.VITE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
    return mockData.getDiscountGames().slice(0, limit);
  }
  
  return api.get<Game[]>(`/games/discount`, {
    params: { limit },
    cacheTime: 300000, // 5分钟缓存
  });
};
