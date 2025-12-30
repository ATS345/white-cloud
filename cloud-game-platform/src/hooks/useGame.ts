import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { 
  fetchGames, 
  fetchGameDetail, 
  fetchGameLibrary, 
  setSearchTerm, 
  setSelectedCategory, 
  setSortBy, 
  setPage, 
  setPageSize, 
  resetCurrentGame 
} from '../store/gameSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGameDetail as apiGetGameDetail,
  getGameLibrary as apiGetGameLibrary,
  getGames as apiGetGames,
  downloadGame,
  pauseDownload,
  resumeDownload,
  deleteDownload,
  addGameToLibrary,
  removeGameFromLibrary,
  getDownloadProgress
} from '../services/games';

// 游戏相关自定义钩子
export const useGame = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { 
    games, 
    loading, 
    error, 
    currentGame, 
    libraryGames, 
    searchTerm, 
    selectedCategory, 
    sortBy, 
    page, 
    pageSize, 
    totalGames 
  } = useAppSelector((state: ReturnType<typeof import('../store').store.getState>) => state.game);

  // 获取游戏列表
  const { 
    data: queryGames, 
    isLoading: isGamesLoading, 
    error: gamesError 
  } = useQuery({
    queryKey: ['games', { page, pageSize, search: searchTerm, selectedCategory, sortBy }],
    queryFn: () => apiGetGames({ page, pageSize, search: searchTerm, type: selectedCategory, sortBy }),
  });

  // 获取游戏详情
  const { 
    data: queryGameDetail, 
    isLoading: isGameDetailLoading, 
    error: gameDetailError 
  } = useQuery({
    queryKey: ['gameDetail', currentGame?.id],
    queryFn: () => currentGame?.id ? apiGetGameDetail(currentGame.id) : Promise.resolve(null),
    enabled: !!currentGame?.id,
  });

  // 获取游戏库
  const { 
    data: queryLibraryGames, 
    isLoading: isLibraryLoading, 
    error: libraryError 
  } = useQuery({
    queryKey: ['libraryGames'],
    queryFn: () => apiGetGameLibrary(),
  });

  // 下载游戏
  const downloadGameMutation = useMutation({
    mutationFn: downloadGame,
    onSuccess: () => {
      // 下载成功后刷新游戏库
      queryClient.invalidateQueries({ queryKey: ['libraryGames'] });
    },
  });

  // 添加游戏到库
  const addGameToLibraryMutation = useMutation({
    mutationFn: addGameToLibrary,
    onSuccess: () => {
      // 添加成功后刷新游戏库
      queryClient.invalidateQueries({ queryKey: ['libraryGames'] });
    },
  });

  // 从库中移除游戏
  const removeGameFromLibraryMutation = useMutation({
    mutationFn: removeGameFromLibrary,
    onSuccess: () => {
      // 移除成功后刷新游戏库
      queryClient.invalidateQueries({ queryKey: ['libraryGames'] });
    },
  });

  // 暂停下载
  const pauseDownloadMutation = useMutation({
    mutationFn: pauseDownload,
    onSuccess: () => {
      // 暂停成功后刷新下载进度
      queryClient.invalidateQueries({ queryKey: ['downloadProgress'] });
    },
  });

  // 继续下载
  const resumeDownloadMutation = useMutation({
    mutationFn: resumeDownload,
    onSuccess: () => {
      // 继续成功后刷新下载进度
      queryClient.invalidateQueries({ queryKey: ['downloadProgress'] });
    },
  });

  // 删除下载
  const deleteDownloadMutation = useMutation({
    mutationFn: deleteDownload,
    onSuccess: () => {
      // 删除成功后刷新下载进度
      queryClient.invalidateQueries({ queryKey: ['downloadProgress'] });
    },
  });

  // 获取下载进度的函数
  const getDownloadProgressQuery = (downloadId: number) => useQuery({
    queryKey: ['downloadProgress', downloadId],
    queryFn: () => getDownloadProgress(downloadId),
    enabled: !!downloadId,
  });

  // 加载游戏列表
  const loadGames = useCallback((params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    sortBy?: string;
  }) => {
    dispatch(fetchGames(params));
  }, [dispatch]);

  // 加载游戏详情
  const loadGameDetail = useCallback((id: number) => {
    dispatch(fetchGameDetail(id));
  }, [dispatch]);

  // 加载游戏库
  const loadGameLibrary = useCallback(() => {
    dispatch(fetchGameLibrary());
  }, [dispatch]);

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  // 处理分类选择
  const handleCategorySelect = useCallback((category: string) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  // 处理排序
  const handleSort = useCallback((sort: string) => {
    dispatch(setSortBy(sort));
  }, [dispatch]);

  // 处理分页
  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  // 处理每页数量变化
  const handlePageSizeChange = useCallback((pageSize: number) => {
    dispatch(setPageSize(pageSize));
  }, [dispatch]);

  // 重置当前游戏
  const handleResetGame = useCallback(() => {
    dispatch(resetCurrentGame());
  }, [dispatch]);

  // 执行下载游戏
  const handleDownloadGame = useCallback((gameId: number) => {
    downloadGameMutation.mutate(gameId);
  }, [downloadGameMutation]);

  // 执行添加游戏到库
  const handleAddGameToLibrary = useCallback((gameId: number) => {
    addGameToLibraryMutation.mutate(gameId);
  }, [addGameToLibraryMutation]);

  // 执行从库中移除游戏
  const handleRemoveGameFromLibrary = useCallback((gameId: number) => {
    removeGameFromLibraryMutation.mutate(gameId);
  }, [removeGameFromLibraryMutation]);

  // 执行暂停下载
  const handlePauseDownload = useCallback((downloadId: number) => {
    pauseDownloadMutation.mutate(downloadId);
  }, [pauseDownloadMutation]);

  // 执行继续下载
  const handleResumeDownload = useCallback((downloadId: number) => {
    resumeDownloadMutation.mutate(downloadId);
  }, [resumeDownloadMutation]);

  // 执行删除下载
  const handleDeleteDownload = useCallback((downloadId: number) => {
    deleteDownloadMutation.mutate(downloadId);
  }, [deleteDownloadMutation]);

  return {
    // 状态
    games: queryGames || games,
    loading: isGamesLoading || loading,
    error: gamesError || error,
    currentGame: queryGameDetail || currentGame,
    libraryGames: queryLibraryGames || libraryGames,
    searchTerm,
    selectedCategory,
    sortBy,
    page,
    pageSize,
    totalGames,
    isGameDetailLoading,
    gameDetailError,
    isLibraryLoading,
    libraryError,
    
    // 方法
    loadGames,
    loadGameDetail,
    loadGameLibrary,
    handleSearch,
    handleCategorySelect,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleResetGame,
    handleDownloadGame,
    handleAddGameToLibrary,
    handleRemoveGameFromLibrary,
    handlePauseDownload,
    handleResumeDownload,
    handleDeleteDownload,
    getDownloadProgressQuery,
    
    // 下载相关状态
    isDownloading: downloadGameMutation.isPending,
    downloadError: downloadGameMutation.error,
  };
};
