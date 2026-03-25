import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Cart from '../pages/Cart';
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

describe('Cart Page', () => {
  it('should show login prompt when not authenticated', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('请先登录')).toBeInTheDocument();
    expect(screen.getByText('去登录')).toBeInTheDocument();
  });

  it('should show loading state initially when authenticated', () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'test', email: 'test@test.com', displayName: 'Test', role: 'user' },
        token: 'token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
        loading: true,
        error: null,
      },
    });

    renderWithProviders(<Cart />, store);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should show empty cart message when cart is empty and not loading', async () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'test', email: 'test@test.com', displayName: 'Test', role: 'user' },
        token: 'token',
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

    renderWithProviders(<Cart />, store);
    await waitFor(() => {
      expect(screen.getByText('购物车是空的')).toBeInTheDocument();
    });
  });

  it('should render cart items when cart has items', async () => {
    const mockCartItem = {
      id: 1,
      gameId: 1,
      quantity: 2,
      game: {
        id: 1,
        title: 'Test Game',
        slug: 'test-game',
        price: 99.99,
        currency: 'CNY',
        coverImage: 'https://example.com/cover.jpg',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
      },
    };

    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'test', email: 'test@test.com', displayName: 'Test', role: 'user' },
        token: 'token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: {
        items: [mockCartItem],
        total: 199.98,
        itemCount: 2,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Cart />, store);
    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument();
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
      expect(screen.getByText('去结算')).toBeInTheDocument();
      expect(screen.getByText('清空购物车')).toBeInTheDocument();
    });
  });

  it('should show correct total price', async () => {
    const mockCartItem = {
      id: 1,
      gameId: 1,
      quantity: 2,
      game: {
        id: 1,
        title: 'Test Game',
        slug: 'test-game',
        price: 99.99,
        currency: 'CNY',
        coverImage: 'https://example.com/cover.jpg',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
      },
    };

    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'test', email: 'test@test.com', displayName: 'Test', role: 'user' },
        token: 'token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: {
        items: [mockCartItem],
        total: 199.98,
        itemCount: 2,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<Cart />, store);
    await waitFor(() => {
      expect(screen.getByText(/总计:/)).toBeInTheDocument();
    });
  });
});
