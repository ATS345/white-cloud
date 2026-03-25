import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppHeader from '../components/AppHeader';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState,
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

describe('AppHeader', () => {
  it('should render logo and navigation', () => {
    renderWithProviders(<AppHeader />);
    expect(screen.getByText('云幕游戏')).toBeInTheDocument();
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('游戏')).toBeInTheDocument();
    expect(screen.getByText('关于')).toBeInTheDocument();
  });

  it('should show login and register when not authenticated', () => {
    renderWithProviders(<AppHeader />);
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('should show user info when authenticated', () => {
    const store = createTestStore({
      auth: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'user',
        },
        token: 'mock-token',
        isAuthenticated: true,
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

    renderWithProviders(<AppHeader />, store);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
  });

  it('should show cart badge with item count', () => {
    const store = createTestStore({
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
        itemCount: 5,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AppHeader />, store);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
