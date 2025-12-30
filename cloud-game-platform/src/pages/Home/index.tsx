import { useState, useEffect } from 'react';
import { Carousel, Button, Input, Select, Row, Spin, Typography, Space, Statistic } from 'antd';
import { SearchOutlined, StarOutlined, FireOutlined, PlusOutlined, AppstoreOutlined, GiftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import GameCard from '../../components/GameCard';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;

// 轮播图组件
const BannerCarousel: React.FC = () => {
  const carouselItems = [
    { id: 1, image: 'https://picsum.photos/seed/banner1/1200/400', alt: 'Banner 1', title: '云朵游戏平台', description: '探索精彩游戏世界' },
    { id: 2, image: 'https://picsum.photos/seed/banner2/1200/400', alt: 'Banner 2', title: '新品上市', description: '体验最新最热游戏' },
    { id: 3, image: 'https://picsum.photos/seed/banner3/1200/400', alt: 'Banner 3', title: '限时折扣', description: '享受超值游戏优惠' }
  ];

  return (
    <Carousel autoplay className="banner-carousel" effect="fade" dotPosition="bottom">
      {carouselItems.map(item => (
        <div key={item.id} className="carousel-item">
          <img alt={item.alt} src={item.image} />
          <div className="carousel-overlay">
            <div className="carousel-content">
              <Title level={2} className="carousel-title">{item.title}</Title>
              <Text className="carousel-description">{item.description}</Text>
              <Link to="/categories">
                <Button type="primary" size="large" className="carousel-button">
                  立即探索
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

// 搜索和筛选组件
const SearchFilter: React.FC<{
  searchText: string;
  setSearchText: (text: string) => void;
  gameType: string;
  setGameType: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleSearch: (text: string) => void;
}> = ({ 
  searchText, 
  setSearchText, 
  gameType, 
  setGameType, 
  sortBy, 
  setSortBy, 
  handleSearch 
}) => {
  const gameTypes = ['all', '开放世界', '角色扮演', '动作冒险', '回合制', '射击', '策略', '模拟', '体育', '休闲'];

  return (
    <div className="search-filter-container">
      <div className="search-filter">
        <Input
          placeholder="搜索游戏、开发者..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          onPressEnter={() => handleSearch(searchText)}
        />
        <Select
          value={gameType}
          onChange={setGameType}
          className="filter-select"
          placeholder="游戏类型"
          allowClear
        >
          {gameTypes.map((type) => (
            <Option key={type} value={type}>
              {type === 'all' ? '全部' : type}
            </Option>
          ))}
        </Select>
        <Select
          value={sortBy}
          onChange={setSortBy}
          className="sort-select"
          placeholder="排序方式"
        >
          <Option value="rating">评分从高到低</Option>
          <Option value="price-asc">价格从低到高</Option>
          <Option value="price-desc">价格从高到低</Option>
          <Option value="releaseDate">最新发布</Option>
        </Select>
      </div>
    </div>
  );
};

// 热门游戏模块
const HotGames: React.FC<{
  games: any[];
  loading: boolean;
  error: any;
}> = ({ games, loading, error }) => {
  const hotGames = games.filter((game: any) => (game.rating || 0) >= 4.5);

  return (
    <div className="home-section">
      <div className="section-header">
        <div className="section-title">
          <FireOutlined className="section-icon" />
          <Title level={3} className="section-title-text">热门游戏</Title>
        </div>
        <Link to="/hot" className="section-more">查看更多</Link>
      </div>
      
      <Spin spinning={loading} tip="加载游戏中..." className="section-content">
        {error ? (
          <div className="error-message">加载失败，请重试</div>
        ) : (
          <Row gutter={[16, 24]}>
            {hotGames.slice(0, 12).map((game: any) => (
              <GameCard game={game} type="hot" key={game.id} />
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

// 新品推荐模块
const NewGames: React.FC<{
  games: any[];
  loading: boolean;
  error: any;
}> = ({ games, loading, error }) => {
  const newGames = [...games].sort((a, b) => {
    return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
  });

  return (
    <div className="home-section">
      <div className="section-header">
        <div className="section-title">
          <PlusOutlined className="section-icon" />
          <Title level={3} className="section-title-text">新品推荐</Title>
        </div>
        <Link to="/new" className="section-more">查看更多</Link>
      </div>
      
      <Spin spinning={loading} tip="加载游戏中..." className="section-content">
        {error ? (
          <div className="error-message">加载失败，请重试</div>
        ) : (
          <Row gutter={[16, 24]}>
            {newGames.slice(0, 8).map((game: any) => (
              <GameCard game={game} type="new" key={game.id} />
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

// 游戏分类模块
const GameCategories: React.FC = () => {
  const categories = [
    { name: '开放世界', count: 128, icon: <AppstoreOutlined /> },
    { name: '角色扮演', count: 256, icon: <PlusOutlined /> },
    { name: '动作冒险', count: 192, icon: <FireOutlined /> },
    { name: '回合制', count: 96, icon: <StarOutlined /> },
    { name: '射击', count: 168, icon: <StarOutlined /> },
    { name: '策略', count: 144, icon: <AppstoreOutlined /> },
    { name: '模拟', count: 132, icon: <GiftOutlined /> },
    { name: '体育', count: 72, icon: <StarOutlined /> },
  ];

  return (
    <div className="home-section categories-section">
      <div className="section-header">
        <div className="section-title">
          <AppstoreOutlined className="section-icon" />
          <Title level={3} className="section-title-text">游戏分类</Title>
        </div>
        <Link to="/categories" className="section-more">查看全部</Link>
      </div>
      
      <div className="categories-grid">
        {categories.map((category, index) => (
          <Link to={`/categories/${category.name}`} className="category-card" key={index}>
            <div className="category-icon">{category.icon}</div>
            <Space direction="vertical" className="category-info">
              <div className="category-name">{category.name}</div>
              <Statistic 
                value={category.count} 
                suffix="款游戏" 
                className="category-count"
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Space>
          </Link>
        ))}
      </div>
    </div>
  );
};

// 限时折扣模块
const DiscountGames: React.FC<{
  games: any[];
  loading: boolean;
  error: any;
}> = ({ games, loading, error }) => {
  const discountGames = games.filter((game: any) => game.price > 0);

  return (
    <div className="home-section">
      <div className="section-header">
        <div className="section-title">
            <GiftOutlined className="section-icon" />
            <Title level={3} className="section-title-text">限时折扣</Title>
          </div>
        <Link to="/discount" className="section-more">查看更多</Link>
      </div>
      
      <Spin spinning={loading} tip="加载游戏中..." className="section-content">
        {error ? (
          <div className="error-message">加载失败，请重试</div>
        ) : (
          <Row gutter={[16, 24]}>
            {discountGames.slice(0, 8).map((game: any) => (
              <GameCard game={game} type="discount" key={game.id} />
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [gameType, setGameType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const { 
    games, 
    loading, 
    error, 
    handleSearch, 
    handleCategorySelect,
    handleSort,
    loadGames
  } = useGame();

  // 初始化加载游戏数据
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // 处理搜索
  useEffect(() => {
    if (searchText) {
      handleSearch(searchText);
    }
  }, [searchText, handleSearch]);

  // 处理分类筛选
  useEffect(() => {
    handleCategorySelect(gameType);
  }, [gameType, handleCategorySelect]);

  // 处理排序
  useEffect(() => {
    handleSort(sortBy);
  }, [sortBy, handleSort]);

  const gameArray = Array.isArray(games) ? games : [];

  return (
    <div className="home-page">
      {/* 轮播图模块 */}
      <BannerCarousel />

      {/* 搜索和筛选模块 */}
      <SearchFilter 
        searchText={searchText}
        setSearchText={setSearchText}
        gameType={gameType}
        setGameType={setGameType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        handleSearch={handleSearch}
      />

      {/* 热门游戏模块 */}
      <HotGames games={gameArray} loading={loading} error={error} />

      {/* 游戏分类模块 */}
      <GameCategories />

      {/* 新品推荐模块 */}
      <NewGames games={gameArray} loading={loading} error={error} />

      {/* 限时折扣模块 */}
      <DiscountGames games={gameArray} loading={loading} error={error} />
    </div>
  );
};

export default Home;