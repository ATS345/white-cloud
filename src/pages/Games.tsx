import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Button, Spin, Pagination, Rate, Empty, Tag, Slider, Checkbox } from 'antd';
import { SearchOutlined, FilterOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchGames } from '@/store/slices/gamesSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { message } from 'antd';

const { Search } = Input;

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { games, loading, pagination } = useSelector((state: RootState) => state.games);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = React.useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = React.useState<number | undefined>();
  const [selectedPlatform, setSelectedPlatform] = React.useState<number | undefined>();
  const [sortBy, setSortBy] = React.useState<string>('popular');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchGames({
      page: currentPage,
      limit: 12,
      search: searchText || undefined,
      genre: selectedGenre,
      platform: selectedPlatform,
    }));
  }, [dispatch, currentPage, selectedGenre, selectedPlatform, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    dispatch(fetchGames({ page: 1, limit: 12, search: value || undefined, genre: selectedGenre, platform: selectedPlatform }));
  };

  const handleAddToCart = (e: React.MouseEvent, gameId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(addToCart({ gameId, quantity: 1 }));
    message.success('已加入购物车');
  };

  const genres = [
    { id: 1, name: '动作' }, { id: 2, name: '冒险' }, { id: 3, name: '角色扮演' },
    { id: 4, name: '策略' }, { id: 5, name: '模拟' }, { id: 6, name: '体育' },
    { id: 7, name: '竞速' }, { id: 8, name: '射击' },
  ];
  const platforms = [
    { id: 1, name: 'Windows' }, { id: 2, name: 'Mac' }, { id: 3, name: 'Linux' },
  ];

  const displayGames = freeOnly ? games.filter(g => g.price === 0) : games;

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', padding: '32px 5%' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>游戏商店</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            探索 {pagination.total || 12}+ 款优质游戏
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* 左侧筛选面板 */}
          <Col xs={24} lg={5}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              position: 'sticky',
              top: '80px',
            }}>
              <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FilterOutlined style={{ color: '#667eea' }} />
                筛选
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '10px' }}>游戏类型</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {genres.map(g => (
                    <Tag
                      key={g.id}
                      onClick={() => setSelectedGenre(selectedGenre === g.id ? undefined : g.id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedGenre === g.id ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${selectedGenre === g.id ? '#667eea' : 'rgba(255,255,255,0.12)'}`,
                        color: selectedGenre === g.id ? '#667eea' : 'rgba(255,255,255,0.7)',
                        borderRadius: '6px',
                        padding: '3px 10px',
                        fontSize: '12px',
                        userSelect: 'none',
                      }}
                    >
                      {g.name}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '10px' }}>游戏平台</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {platforms.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlatform(selectedPlatform === p.id ? undefined : p.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: selectedPlatform === p.id ? 'rgba(102,126,234,0.2)' : 'transparent',
                        border: `1px solid ${selectedPlatform === p.id ? '#667eea' : 'rgba(255,255,255,0.08)'}`,
                        color: selectedPlatform === p.id ? '#667eea' : 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        transition: 'all 0.2s',
                        userSelect: 'none',
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '10px' }}>
                  价格范围：¥{priceRange[0]} - ¥{priceRange[1]}
                </div>
                <Slider
                  range
                  min={0}
                  max={500}
                  value={priceRange}
                  onChange={(v: number[]) => setPriceRange(v as [number, number])}
                  trackStyle={[{ background: '#667eea' }]}
                  handleStyle={[{ borderColor: '#667eea' }, { borderColor: '#667eea' }]}
                />
              </div>

              <div>
                <Checkbox
                  checked={freeOnly}
                  onChange={e => setFreeOnly(e.target.checked)}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}
                >
                  只看免费游戏
                </Checkbox>
              </div>

              <Button
                block
                ghost
                style={{ marginTop: '20px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                onClick={() => {
                  setSelectedGenre(undefined);
                  setSelectedPlatform(undefined);
                  setPriceRange([0, 500]);
                  setFreeOnly(false);
                  setSearchText('');
                }}
              >
                重置筛选
              </Button>
            </div>
          </Col>

          {/* 右侧游戏列表 */}
          <Col xs={24} lg={19}>
            {/* 工具栏 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <Search
                placeholder="搜索游戏名称..."
                allowClear
                size="large"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}
                enterButton={
                  <Button style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}>
                    <SearchOutlined />
                  </Button>
                }
              />
              <Select
                placeholder="排序方式"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                options={[
                  { value: 'popular', label: '最受欢迎' },
                  { value: 'newest', label: '最新上架' },
                  { value: 'price_asc', label: '价格从低到高' },
                  { value: 'price_desc', label: '价格从高到低' },
                  { value: 'rating', label: '评分最高' },
                ]}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  ghost={viewMode === 'grid'}
                  style={viewMode === 'grid' ? { borderColor: '#667eea', color: '#667eea' } : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  icon={<UnorderedListOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  ghost={viewMode === 'list'}
                  style={viewMode === 'list' ? { borderColor: '#667eea', color: '#667eea' } : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                  onClick={() => setViewMode('list')}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
              </div>
            ) : displayGames.length === 0 ? (
              <Empty description={<span style={{ color: 'rgba(255,255,255,0.5)' }}>暂无符合条件的游戏</span>} />
            ) : viewMode === 'grid' ? (
              <Row gutter={[16, 16]}>
                {displayGames.map((game) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                    <GameGridCard game={game} onAddToCart={handleAddToCart} navigate={navigate} isAuthenticated={isAuthenticated} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayGames.map((game) => (
                  <GameListCard key={game.id} game={game} onAddToCart={handleAddToCart} navigate={navigate} />
                ))}
              </div>
            )}

            {pagination.total > 12 && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Pagination
                  current={currentPage}
                  total={pagination.total}
                  pageSize={12}
                  onChange={page => { setCurrentPage(page); window.scrollTo(0, 0); }}
                  showSizeChanger={false}
                  style={{ color: 'white' }}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

// 游戏数据类型
interface GameItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  developer?: string;
  averageRating?: number;
  reviewCount?: number;
  genres?: { id: number; name: string }[];
}

interface GameCardBaseProps {
  game: GameItem;
  onAddToCart: (e: React.MouseEvent, gameId: number) => void;
  navigate: (path: string) => void;
}

// 网格视图卡片
const GameGridCard: React.FC<GameCardBaseProps> = ({ game, onAddToCart, navigate }) => (
  <div
    onClick={() => navigate(`/games/${game.slug}`)}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(102,126,234,0.4)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
    }}
  >
    <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
      <img
        src={game.coverImage}
        alt={game.title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/400/225`; }}
      />
      {game.price === 0 && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: '#52c41a', color: 'white', padding: '2px 8px',
          borderRadius: '4px', fontSize: '11px', fontWeight: 600,
        }}>
          免费
        </div>
      )}
    </div>
    <div style={{ padding: '14px' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>
        {game.genres?.slice(0,2).map((g: { id: number; name: string }) => g.name).join(' · ')}
      </div>
      <div style={{
        color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '8px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {game.title}
      </div>
      {game.averageRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
          <Rate disabled defaultValue={game.averageRating} count={5} style={{ fontSize: '10px' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>({game.reviewCount?.toLocaleString()})</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#667eea', fontWeight: 700, fontSize: '17px' }}>
          {game.price === 0 ? '免费' : `¥${game.price}`}
        </span>
        <Button
          type="primary"
          size="small"
          onClick={(e) => onAddToCart(e, game.id)}
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '6px', fontSize: '12px' }}
        >
          {game.price === 0 ? '免费获取' : '加入购物车'}
        </Button>
      </div>
    </div>
  </div>
);

// 列表视图卡片
const GameListCard: React.FC<GameCardBaseProps> = ({ game, onAddToCart, navigate }) => (
  <div
    onClick={() => navigate(`/games/${game.slug}`)}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex',
      gap: '0',
      transition: 'all 0.3s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(102,126,234,0.4)';
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(102,126,234,0.06)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
    }}
  >
    <img
      src={game.coverImage}
      alt={game.title}
      style={{ width: '200px', height: '112px', objectFit: 'cover', flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/200/112`; }}
    />
    <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>
          {game.genres?.slice(0,3).map((g: { id: number; name: string }) => g.name).join(' · ')}
        </div>
        <div style={{ color: 'white', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>{game.title}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{game.developer}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        {game.averageRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Rate disabled defaultValue={game.averageRating} count={5} style={{ fontSize: '12px' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{game.averageRating}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#667eea', fontWeight: 700, fontSize: '20px' }}>
            {game.price === 0 ? '免费' : `¥${game.price}`}
          </span>
          <Button
            type="primary"
            onClick={(e) => onAddToCart(e, game.id)}
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px' }}
          >
            {game.price === 0 ? '免费获取' : '加入购物车'}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default Games;
