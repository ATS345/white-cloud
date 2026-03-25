import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Register from '../pages/Register';
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

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render register form', () => {
    renderWithProviders(<Register />);

    expect(screen.getByText('创建账号')).toBeInTheDocument();
  });

  it('should have username input', () => {
    renderWithProviders(<Register />);

    const usernameInput = screen.getByPlaceholderText('用户名');
    expect(usernameInput).toBeInTheDocument();
  });

  it('should have email input', () => {
    renderWithProviders(<Register />);

    const emailInput = screen.getByPlaceholderText('邮箱地址');
    expect(emailInput).toBeInTheDocument();
  });

  it('should have password inputs', () => {
    renderWithProviders(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText(/密码/);
    expect(passwordInputs.length).toBeGreaterThan(0);
  });

  it('should have register button', () => {
    renderWithProviders(<Register />);

    const registerButton = screen.getByRole('button', { name: /注.*册/ });
    expect(registerButton).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    renderWithProviders(<Register />);

    const loginLink = screen.getByText('立即登录');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have privacy policy link', () => {
    renderWithProviders(<Register />);

    const privacyLink = screen.getByText('隐私政策');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
