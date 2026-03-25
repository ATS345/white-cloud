import authReducer, { login, register, logout, fetchCurrentUser, clearError } from '../store/slices/authSlice';

describe('authSlice', () => {
  let initialState: ReturnType<typeof authReducer>;

  beforeEach(() => {
    initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  });

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const newState = authReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });
  });

  describe('async actions', () => {
    it('should handle login.pending', () => {
      const action = { type: login.pending.type };
      const newState = authReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle login.fulfilled', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        token: 'mock-token',
      };
      const action = {
        type: login.fulfilled.type,
        payload: mockUser,
      };
      const newState = authReducer(initialState, action);
      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('mock-token');
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.loading).toBe(false);
    });

    it('should handle login.rejected', () => {
      const action = {
        type: login.rejected.type,
        error: { message: '登录失败' },
      };
      const newState = authReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('登录失败');
    });

    it('should handle register.pending', () => {
      const action = { type: register.pending.type };
      const newState = authReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle register.fulfilled', () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        email: 'new@example.com',
        displayName: 'New User',
        role: 'user',
        token: 'mock-token',
      };
      const action = {
        type: register.fulfilled.type,
        payload: mockUser,
      };
      const newState = authReducer(initialState, action);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should handle logout.fulfilled', () => {
      const authenticatedState = {
        ...initialState,
        user: { id: 1, username: 'test', email: 'test@test.com', displayName: 'Test', role: 'user' },
        token: 'some-token',
        isAuthenticated: true,
      };
      const action = { type: logout.fulfilled.type };
      const newState = authReducer(authenticatedState, action);
      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should handle fetchCurrentUser.fulfilled', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
      };
      const action = {
        type: fetchCurrentUser.fulfilled.type,
        payload: mockUser,
      };
      const newState = authReducer(initialState, action);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });
  });
});
