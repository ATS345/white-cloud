import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';
import { mockGames } from '@/utils/mockData';

interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  coverImage: string;
  averageRating?: number;
  reviewCount: number;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ id: number; name: string }>;
}

interface GamesState {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: GamesState = {
  games: [],
  currentGame: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (params: { page?: number; limit?: number; genre?: number; platform?: number; search?: string }) => {
    try {
      const response = await api.get('/games', { params });
      return response;
    } catch {
      // 后端不可用时使用 Mock 数据
      let filtered = [...mockGames];
      if (params.search) {
        filtered = filtered.filter(g => g.title.toLowerCase().includes(params.search!.toLowerCase()));
      }
      if (params.genre) {
        filtered = filtered.filter(g => g.genres.some(genre => genre.id === params.genre));
      }
      if (params.platform) {
        filtered = filtered.filter(g => g.platforms.some(p => p.id === params.platform));
      }
      const page = params.page || 1;
      const limit = params.limit || 12;
      const start = (page - 1) * limit;
      return {
        list: filtered.slice(start, start + limit),
        pagination: { total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) },
      };
    }
  }
);

export const fetchGameBySlug = createAsyncThunk(
  'games/fetchGameBySlug',
  async (slug: string) => {
    try {
      const response = await api.get(`/games/slug/${slug}`);
      return response;
    } catch {
      const game = mockGames.find(g => g.slug === slug);
      if (!game) throw new Error('游戏不存在');
      return game;
    }
  }
);

export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (id: number) => {
    try {
      const response = await api.get(`/games/${id}`);
      return response;
    } catch {
      const game = mockGames.find(g => g.id === id);
      if (!game) throw new Error('游戏不存在');
      return game;
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGame: (state) => {
      state.currentGame = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload?.list || [];
        state.pagination = action.payload?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏列表失败';
      })
      .addCase(fetchGameBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
      })
      .addCase(fetchGameBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏详情失败';
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.currentGame = action.payload;
      });
  },
});

export const { clearError, clearCurrentGame } = gamesSlice.actions;
export default gamesSlice.reducer;