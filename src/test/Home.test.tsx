import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../pages/Home';
import authReducer from '../store/slices/authSlice';

vi.mock('react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: true,
    error: null,
  })),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('Home Page', () => {
  it('should render home page', () => {
    renderWithProviders(<Home />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render hero banner section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('为什么选择云幕游戏')).toBeInTheDocument();
  });

  it('should render hot games section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('热门游戏')).toBeInTheDocument();
  });
});
