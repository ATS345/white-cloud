import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameCard, { type Game } from './index';

describe('GameCard Component', () => {
  const mockGame: Game = {
    id: 1,
    name: 'Test Game',
    type: 'Action',
    rating: 4.5,
    price: 99,
    images: ['https://example.com/game1.jpg'],
    tags: ['Action', 'Adventure', 'Open World', 'RPG'],
    releaseDate: '2025-12-30'
  };

  const renderGameCard = (game: Game, type: 'hot' | 'new' | 'discount') => {
    return render(
      <MemoryRouter>
        <GameCard game={game} type={type} />
      </MemoryRouter>
    );
  };

  it('should render game information correctly', () => {
    renderGameCard(mockGame, 'hot');
    
    // 检查游戏名称
    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
    
    // 检查游戏评分
    expect(screen.getByText(`${mockGame.rating}`)).toBeInTheDocument();
    
    // 检查游戏价格
    expect(screen.getByText(`¥${mockGame.price}`)).toBeInTheDocument();
    
    // 检查游戏图片
    const gameImage = screen.getByAltText(mockGame.name);
    expect(gameImage).toBeInTheDocument();
    expect(gameImage).toHaveAttribute('src', mockGame.images?.[0]);
    
    // 检查游戏标签（使用更精确的选择器）
    const tags = screen.getAllByText('Action');
    expect(tags.length).toBe(2);
    expect(screen.getByText('Adventure')).toBeInTheDocument();
    expect(screen.getByText('Open World')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should render hot game badge correctly', () => {
    renderGameCard(mockGame, 'hot');
    
    // 检查热门标签
    expect(screen.getByText('热门')).toBeInTheDocument();
  });

  it('should render new game badge correctly', () => {
    renderGameCard(mockGame, 'new');
    
    // 检查新品标签
    expect(screen.getByText('新品')).toBeInTheDocument();
  });

  it('should render discount game badge and calculate discounted price correctly', () => {
    // 使用vi.spyOn来模拟Math.random，确保每次返回相同的折扣值
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    
    renderGameCard(mockGame, 'discount');
    
    // 检查折扣标签，使用更灵活的匹配方式
    expect(screen.getByText(/\d+% 折扣/)).toBeInTheDocument();
    
    // 检查原价和折扣价
    expect(screen.getByText(`¥${mockGame.price}`)).toBeInTheDocument();
    // 计算预期折扣价：Math.random()返回0.25，折扣应为Math.floor(0.25 * 50) + 10 = 12 + 10 = 22%
    // 99 * (1 - 0.22) = 77.22，四舍五入为77
    expect(screen.getByText('¥77')).toBeInTheDocument();
    
    // 恢复Math.random的原始实现
    vi.restoreAllMocks();
  });

  it('should render free game correctly', () => {
    const freeGame: Game = {
      ...mockGame,
      price: 0
    };
    
    renderGameCard(freeGame, 'hot');
    
    // 检查免费标签
    expect(screen.getByText('免费')).toBeInTheDocument();
    
    // 检查下载按钮文本
    expect(screen.getByText('下载')).toBeInTheDocument();
  });

  it('should render purchase button correctly for paid games', () => {
    renderGameCard(mockGame, 'hot');
    
    // 检查购买按钮文本
    expect(screen.getByText('购买')).toBeInTheDocument();
  });

  it('should link to game detail page', () => {
    renderGameCard(mockGame, 'hot');
    
    // 检查链接地址
    const gameLink = screen.getByRole('link');
    expect(gameLink).toHaveAttribute('href', `/game/${mockGame.id}`);
  });

  it('should use placeholder image when no images provided', () => {
    const gameWithoutImages: Game = {
      ...mockGame,
      images: undefined
    };
    
    renderGameCard(gameWithoutImages, 'hot');
    
    // 检查占位图片
    const gameImage = screen.getByAltText(mockGame.name);
    expect(gameImage).toHaveAttribute('src', `https://picsum.photos/seed/game${mockGame.id}/400/250`);
  });
});
