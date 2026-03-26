import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppFooter from '../components/AppFooter';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('AppFooter', () => {
  it('should render footer links', () => {
    renderWithRouter(<AppFooter />);
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('服务条款')).toBeInTheDocument();
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
    expect(screen.getByText('游戏商店')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    renderWithRouter(<AppFooter />);
    expect(screen.getByText(/云幕游戏平台/)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
