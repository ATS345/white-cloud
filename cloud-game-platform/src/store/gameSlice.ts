import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Game } from '../services/games';
import { getGames, getGameDetail, getGameLibrary } from '../services/games';

// 定义游戏状态接口
interface GameState {
  games: Game[];
  loading: boolean;
  error: string | null;
  currentGame: Game | null;
  libraryGames: Game[];
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
  page: number;
  pageSize: number;
  totalGames: number;
}

// 初始状态
const initialState: GameState = {
  games: [],
  loading: false,
  error: null,
  currentGame: null,
  libraryGames: [],
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'name',
  page: 1,
  pageSize: 12,
  totalGames: 0,
};

// 异步获取游戏列表
  export const fetchGames = createAsyncThunk(
    'game/fetchGames',
    async (params: {
      page?: number;
      pageSize?: number;
      search?: string;
      type?: string;
      sortBy?: string;
    } | undefined, thunkAPI) => {
      const state = thunkAPI.getState() as { game: GameState };
      const {
        page = state.game.page,
        pageSize = state.game.pageSize,
        search = state.game.searchTerm,
        type = state.game.selectedCategory,
        sortBy = state.game.sortBy,
      } = params || {};
      
      const response = await getGames({ page, pageSize, search, type, sortBy });
      return response;
    }
  );

  // 异步获取游戏详情
  export const fetchGameDetail = createAsyncThunk(
    'game/fetchGameDetail',
    async (id: number) => {
      const response = await getGameDetail(id);
      return response;
    }
  );

  // 异步获取游戏库
  export const fetchGameLibrary = createAsyncThunk(
    'game/fetchGameLibrary',
    async () => {
      const response = await getGameLibrary();
      return response;
    }
  );

// 创建游戏slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // 设置搜索词
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.page = 1; // 重置页码
    },
    // 设置选中的分类
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.page = 1; // 重置页码
    },
    // 设置排序方式
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    // 设置页码
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    // 设置每页数量
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // 重置页码
    },
    // 重置游戏详情
    resetCurrentGame: (state) => {
      state.currentGame = null;
    },
  },
  extraReducers: (builder) => {
    // 处理fetchGames的不同状态
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
        state.totalGames = action.payload.length;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏列表失败';
      })
      // 处理fetchGameDetail的不同状态
      .addCase(fetchGameDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
      })
      .addCase(fetchGameDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏详情失败';
      })
      // 处理fetchGameLibrary的不同状态
      .addCase(fetchGameLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.libraryGames = action.payload;
      })
      .addCase(fetchGameLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏库失败';
      });
  },
});

// 导出actions
export const { 
  setSearchTerm, 
  setSelectedCategory, 
  setSortBy, 
  setPage, 
  setPageSize, 
  resetCurrentGame 
} = gameSlice.actions;

// 导出reducer
export default gameSlice.reducer;
