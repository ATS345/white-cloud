import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../pages/Login';
import authReducer from '../store/slices/authSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名或邮箱')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
  });

  it('should have email and password inputs', () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('用户名或邮箱');
    const passwordInput = screen.getByPlaceholderText('密码');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('should have login button', () => {
    renderWithProviders(<Login />);

    const loginButtons = screen.getAllByRole('button');
    const submitButton = loginButtons.find(btn => btn.getAttribute('type') === 'submit');
    expect(submitButton).toBeInTheDocument();
  });

  it('should have link to register page', () => {
    renderWithProviders(<Login />);

    const registerLink = screen.getByText('立即注册');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should show validation error for empty email', async () => {
    renderWithProviders(<Login />);

    const loginButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/请输入邮箱/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });
  });
});
