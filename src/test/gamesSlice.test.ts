import gamesReducer, { fetchGames, fetchGameBySlug, fetchGameById, clearError, clearCurrentGame } from '../store/slices/gamesSlice';

describe('gamesSlice', () => {
  let initialState: ReturnType<typeof gamesReducer>;

  beforeEach(() => {
    initialState = {
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
  });

  const mockGame = {
    id: 1,
    title: 'Test Game',
    slug: 'test-game',
    description: 'A test game description',
    shortDescription: 'Test game',
    price: 99.99,
    currency: 'CNY',
    developer: 'Test Developer',
    publisher: 'Test Publisher',
    releaseDate: '2024-01-01',
    coverImage: 'https://example.com/cover.jpg',
    averageRating: 4.5,
    reviewCount: 100,
    genres: [{ id: 1, name: 'Action' }],
    platforms: [{ id: 1, name: 'PC' }],
  };

  const mockGamesResponse = {
    list: [mockGame],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    },
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(gamesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const newState = gamesReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });

    it('should handle clearCurrentGame', () => {
      const stateWithGame = { ...initialState, currentGame: mockGame };
      const newState = gamesReducer(stateWithGame, clearCurrentGame());
      expect(newState.currentGame).toBeNull();
    });
  });

  describe('async actions', () => {
    it('should handle fetchGames.pending', () => {
      const action = { type: fetchGames.pending.type };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchGames.fulfilled', () => {
      const action = {
        type: fetchGames.fulfilled.type,
        payload: mockGamesResponse,
      };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.games).toEqual(mockGamesResponse.list);
      expect(newState.pagination).toEqual(mockGamesResponse.pagination);
    });

    it('should handle fetchGames.rejected', () => {
      const action = {
        type: fetchGames.rejected.type,
        error: { message: '获取游戏列表失败' },
      };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('获取游戏列表失败');
    });

    it('should handle fetchGameBySlug.pending', () => {
      const action = { type: fetchGameBySlug.pending.type };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchGameBySlug.fulfilled', () => {
      const action = {
        type: fetchGameBySlug.fulfilled.type,
        payload: mockGame,
      };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.currentGame).toEqual(mockGame);
    });

    it('should handle fetchGameBySlug.rejected', () => {
      const action = {
        type: fetchGameBySlug.rejected.type,
        error: { message: '获取游戏详情失败' },
      };
      const newState = gamesReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('获取游戏详情失败');
    });

    it('should handle fetchGameById.fulfilled', () => {
      const action = {
        type: fetchGameById.fulfilled.type,
        payload: mockGame,
      };
      const newState = gamesReducer(initialState, action);
      expect(newState.currentGame).toEqual(mockGame);
    });
  });
});
