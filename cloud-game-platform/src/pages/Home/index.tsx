import { useState } from 'react';
import { Card, Carousel, Tabs, Button, Input, Select, Row, Col, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons';
import './index.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [gameType, setGameType] = useState('all');

  const games = [
    {
      id: 1,
      name: '原神',
      type: '开放世界',
      rating: 4.8,
      price: 0,
      image: 'https://picsum.photos/seed/game1/300/200',
      tags: ['开放世界', '冒险', '角色扮演'],
    },
    {
      id: 2,
      name: '赛博朋克2077',
      type: '角色扮演',
      rating: 4.6,
      price: 298,
      image: 'https://picsum.photos/seed/game2/300/200',
      tags: ['赛博朋克', '角色扮演', '开放世界'],
    },
    {
      id: 3,
      name: '艾尔登法环',
      type: '动作冒险',
      rating: 4.9,
      price: 298,
      image: 'https://picsum.photos/seed/game3/300/200',
      tags: ['魂系', '动作', '开放世界'],
    },
    {
      id: 4,
      name: '星穹铁道',
      type: '回合制',
      rating: 4.7,
      price: 0,
      image: 'https://picsum.photos/seed/game4/300/200',
      tags: ['回合制', '科幻', '角色扮演'],
    },
  ];

  const gameTypes = ['all', '开放世界', '角色扮演', '动作冒险', '回合制', '射击'];

  return (
    <div className="home-page">
      {/* 轮播图 */}
      <Carousel autoplay className="banner-carousel">
        <div>
          <img src="https://picsum.photos/seed/banner1/1200/400" alt="Banner 1" />
        </div>
        <div>
          <img src="https://picsum.photos/seed/banner2/1200/400" alt="Banner 2" />
        </div>
        <div>
          <img src="https://picsum.photos/seed/banner3/1200/400" alt="Banner 3" />
        </div>
      </Carousel>

      {/* 搜索和筛选 */}
      <div className="search-filter">
        <Input
          placeholder="搜索游戏..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
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
      </div>

      {/* 游戏列表 */}
      <Tabs defaultActiveKey="1" className="game-tabs">
        <TabPane tab="热门游戏" key="1">
          <Row gutter={[16, 16]}>
            {games.map((game) => (
              <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                <Card
                  hoverable
                  cover={<img alt={game.name} src={game.image} />}
                  className="game-card"
                >
                  <Card.Meta
                    title={game.name}
                    description={
                      <>
                        <div className="game-info">
                          <span className="game-type">{game.type}</span>
                          <span className="game-rating">
                            <StarOutlined /> {game.rating}
                          </span>
                        </div>
                        <div className="game-price">
                          {game.price === 0 ? '免费' : `¥${game.price}`}
                        </div>
                        <div className="game-tags">
                          {game.tags.map((tag, index) => (
                            <Tag key={index} color="blue">
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
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="新品上市" key="2">
          <div className="empty-tab">新品上市内容即将上线</div>
        </TabPane>
        <TabPane tab="限时折扣" key="3">
          <div className="empty-tab">限时折扣内容即将上线</div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Home;
