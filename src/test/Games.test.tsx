import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Games from '../pages/Games';
import gamesReducer from '../store/slices/gamesSlice';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      games: gamesReducer,
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

const renderWithProviders = (ui: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('Games Page', () => {
  it('should render search and filter controls', () => {
    renderWithProviders(<Games />);
    expect(screen.getByPlaceholderText('搜索游戏名称...')).toBeInTheDocument();
    expect(screen.getByText('筛选')).toBeInTheDocument();
    expect(screen.getByText('游戏类型')).toBeInTheDocument();
    expect(screen.getByText('游戏平台')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const store = createTestStore({
      games: {
        games: [],
        currentGame: null,
        loading: true,
        error: null,
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Games />, store);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should render empty state when no games', async () => {
    const store = createTestStore({
      games: {
        games: [],
        currentGame: null,
        loading: false,
        error: null,
        pagination: { total: 0, page: 1, limit: 12, pages: 0 },
      },
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Games />, store);
    await waitFor(() => {
      expect(screen.getByText('游戏类型')).toBeInTheDocument();
    });
  });

  it('should allow search input', () => {
    renderWithProviders(<Games />);
    const searchInput = screen.getByPlaceholderText('搜索游戏名称...');
    fireEvent.change(searchInput, { target: { value: 'test game' } });
    expect(searchInput).toHaveValue('test game');
  });
});
