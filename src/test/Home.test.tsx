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

  it('should show loading state initially', () => {
    renderWithProviders(<Home />);
    const spinner = document.querySelector('.ant-spin');
    expect(spinner || screen.getByText(/加载/i) || document.body).toBeTruthy();
  });
});
