import { useState, useEffect } from 'react';
import { Card, Carousel, Tabs, Button, Input, Select, Row, Col, Tag, Spin } from 'antd';
import { SearchOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import './index.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [gameType, setGameType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [activeTab, setActiveTab] = useState('hot');

  const { 
    games, 
    loading, 
    error, 
    handleSearch, 
    handleCategorySelect,
    handleSort,
    loadGames
  } = useGame();

  const gameTypes = ['all', '开放世界', '角色扮演', '动作冒险', '回合制', '射击'];

  // 轮播图数据
  const carouselItems = [
    { id: 1, image: 'https://picsum.photos/seed/banner1/1200/400', alt: 'Banner 1' },
    { id: 2, image: 'https://picsum.photos/seed/banner2/1200/400', alt: 'Banner 2' },
    { id: 3, image: 'https://picsum.photos/seed/banner3/1200/400', alt: 'Banner 3' }
  ];

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

  // 根据标签页过滤游戏
  const gameArray = Array.isArray(games) ? games : [];
  const filteredGames = gameArray.filter((game: any) => {
    if (activeTab === 'hot') {
      return game.rating >= 4.5;
    } else if (activeTab === 'new') {
      return true; // 新品上市，这里可以根据实际数据过滤
    } else if (activeTab === 'discount') {
      return game.price > 0; // 限时折扣，这里可以根据实际数据过滤
    }
    return true;
  });

  return (
    <div className="home-page">
      {/* 轮播图 */}
      <Carousel autoplay className="banner-carousel" effect="fade">
        {carouselItems.map(item => (
          <div key={item.id} className="carousel-item">
            <img alt={item.alt} src={item.image} />
            <div className="carousel-overlay">
              <h2>云朵游戏平台</h2>
              <p>探索精彩游戏世界</p>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 搜索、筛选和排序 */}
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
            <Option value="name">名称排序</Option>
          </Select>
        </div>
      </div>

      {/* 游戏列表 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="game-tabs"
        items={[
          { key: 'hot', label: '热门游戏', children: null },
          { key: 'new', label: '新品上市', children: null },
          { key: 'discount', label: '限时折扣', children: null },
        ]}
      >
        <TabPane tab="热门游戏" key="hot">
          <Spin spinning={loading} tip="加载游戏中...">
            {error ? (
              <div className="error-message">加载失败，请重试</div>
            ) : (
              <Row gutter={[16, 24]}>
                {filteredGames.map((game: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                    <Link to={`/game/${game.id}`} className="game-link">
                      <Card
                        hoverable
                        cover={<img alt={game.name} src={game.image} className="game-card-image" />}
                        className="game-card"
                      >
                        <Card.Meta
                          title={
                            <div className="game-card-title">
                              {game.name}
                            </div>
                          }
                          description={
                            <>
                              <div className="game-info">
                                <span className="game-type">{game.type}</span>
                                <span className="game-rating">
                                  <StarOutlined /> {game.rating}
                                </span>
                              </div>
                              <div className="game-price">
                                {game.price === 0 ? <span className="free">免费</span> : `¥${game.price}`}
                              </div>
                              <div className="game-tags">
                                {game.tags?.map((tag: string, index: number) => (
                                  <Tag key={index} className="game-tag">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            </>
                          }
                        />
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          className="download-btn"
                          block
                        >
                          {game.price === 0 ? '下载' : '购买'}
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </TabPane>
        <TabPane tab="新品上市" key="new">
          <Spin spinning={loading} tip="加载游戏中...">
            {error ? (
              <div className="error-message">加载失败，请重试</div>
            ) : (
              <Row gutter={[16, 24]}>
                {filteredGames.map((game: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                    <Link to={`/game/${game.id}`} className="game-link">
                      <Card
                        hoverable
                        cover={<img alt={game.name} src={game.image} className="game-card-image" />}
                        className="game-card"
                      >
                        <div className="new-badge">新品</div>
                        <Card.Meta
                          title={
                            <div className="game-card-title">
                              {game.name}
                            </div>
                          }
                          description={
                            <>
                              <div className="game-info">
                                <span className="game-type">{game.type}</span>
                                <span className="game-rating">
                                  <StarOutlined /> {game.rating}
                                </span>
                              </div>
                              <div className="game-price">
                                {game.price === 0 ? <span className="free">免费</span> : `¥${game.price}`}
                              </div>
                              <div className="game-tags">
                                {game.tags?.map((tag: string, index: number) => (
                                  <Tag key={index} className="game-tag">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            </>
                          }
                        />
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          className="download-btn"
                          block
                        >
                          {game.price === 0 ? '下载' : '购买'}
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </TabPane>
        <TabPane tab="限时折扣" key="discount">
          <Spin spinning={loading} tip="加载游戏中...">
            {error ? (
              <div className="error-message">加载失败，请重试</div>
            ) : (
              <Row gutter={[16, 24]}>
                {filteredGames.map((game: any) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                    <Link to={`/game/${game.id}`} className="game-link">
                      <Card
                        hoverable
                        cover={<img alt={game.name} src={game.image} className="game-card-image" />}
                        className="game-card"
                      >
                        {game.price > 0 && (
                          <div className="discount-badge">
                            {Math.floor(Math.random() * 50) + 10}% 折扣
                          </div>
                        )}
                        <Card.Meta
                          title={
                            <div className="game-card-title">
                              {game.name}
                            </div>
                          }
                          description={
                            <>
                              <div className="game-info">
                                <span className="game-type">{game.type}</span>
                                <span className="game-rating">
                                  <StarOutlined /> {game.rating}
                                </span>
                              </div>
                              <div className="game-price">
                                {game.price === 0 ? <span className="free">免费</span> : (
                                  <>
                                    <span className="original-price">¥{Math.floor(game.price * 1.5)}</span>
                                    <span className="discounted-price">¥{game.price}</span>
                                  </>
                                )}
                              </div>
                              <div className="game-tags">
                                {game.tags?.map((tag: string, index: number) => (
                                  <Tag key={index} className="game-tag">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            </>
                          }
                        />
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          className="download-btn"
                          block
                        >
                          {game.price === 0 ? '下载' : '购买'}
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Home;
