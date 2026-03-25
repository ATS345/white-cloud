import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppFooter from '../components/AppFooter';

describe('AppFooter', () => {
  it('should render footer links', () => {
    render(<AppFooter />);
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('服务条款')).toBeInTheDocument();
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
    expect(screen.getByText('联系我们')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<AppFooter />);
    expect(screen.getByText(/云幕游戏平台/)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
