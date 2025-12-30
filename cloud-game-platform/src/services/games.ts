import api from './api';

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
}

// 获取游戏列表
export const getGames = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  sortBy?: string;
}) => {
  return api.get<Game[]>('/games', { params });
};

// 获取游戏详情
export const getGameDetail = async (id: number) => {
  return api.get<Game>(`/games/${id}`);
};

// 下载游戏
export const downloadGame = async (gameId: number) => {
  return api.post(`/games/${gameId}/download`);
};

// 获取游戏下载进度
export const getDownloadProgress = async (downloadId: number) => {
  return api.get(`/downloads/${downloadId}/progress`);
};

// 暂停下载
export const pauseDownload = async (downloadId: number) => {
  return api.put(`/downloads/${downloadId}/pause`);
};

// 继续下载
export const resumeDownload = async (downloadId: number) => {
  return api.put(`/downloads/${downloadId}/resume`);
};

// 删除下载
export const deleteDownload = async (downloadId: number) => {
  return api.delete(`/downloads/${downloadId}`);
};

// 获取游戏库
export const getGameLibrary = async () => {
  return api.get<Game[]>('/library');
};

// 添加游戏到库
export const addGameToLibrary = async (gameId: number) => {
  return api.post(`/library/games/${gameId}`);
};

// 从库中移除游戏
export const removeGameFromLibrary = async (gameId: number) => {
  return api.delete(`/library/games/${gameId}`);
};

// 获取游戏进度
export const getGameProgress = async (gameId: number) => {
  return api.get(`/library/games/${gameId}/progress`);
};

// 更新游戏进度
export const updateGameProgress = async (gameId: number, progress: number) => {
  return api.put(`/library/games/${gameId}/progress`, { progress });
};
