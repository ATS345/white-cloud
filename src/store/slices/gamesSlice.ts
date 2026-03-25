import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';

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
    const response = await api.get('/games', { params });
    return response;
  }
);

export const fetchGameBySlug = createAsyncThunk(
  'games/fetchGameBySlug',
  async (slug: string) => {
    const response = await api.get(`/games/slug/${slug}`);
    return response;
  }
);

export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (id: number) => {
    const response = await api.get(`/games/${id}`);
    return response;
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
        state.games = action.payload.list;
        state.pagination = action.payload.pagination;
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