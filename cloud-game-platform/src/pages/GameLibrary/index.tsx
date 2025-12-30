import { useState } from 'react';
import { Card, Tabs, Button, Input, Select, Row, Col, Tag, Popconfirm } from 'antd';
import { SearchOutlined, DownloadOutlined, DeleteOutlined, PlayCircleOutlined, StarOutlined } from '@ant-design/icons';
import './index.css';

const { TabPane } = Tabs;
const { Option } = Select;

const GameLibrary: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [gameType, setGameType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const games = [
    {
      id: 1,
      name: '原神',
      type: '开放世界',
      rating: 4.8,
      price: 0,
      image: 'https://picsum.photos/seed/game1/300/200',
      tags: ['开放世界', '冒险', '角色扮演'],
      progress: 65,
      playTime: '120小时',
      lastPlayed: '2024-01-15',
    },
    {
      id: 2,
      name: '赛博朋克2077',
      type: '角色扮演',
      rating: 4.6,
      price: 298,
      image: 'https://picsum.photos/seed/game2/300/200',
      tags: ['赛博朋克', '角色扮演', '开放世界'],
      progress: 45,
      playTime: '80小时',
      lastPlayed: '2024-01-10',
    },
    {
      id: 3,
      name: '艾尔登法环',
      type: '动作冒险',
      rating: 4.9,
      price: 298,
      image: 'https://picsum.photos/seed/game3/300/200',
      tags: ['魂系', '动作', '开放世界'],
      progress: 30,
      playTime: '50小时',
      lastPlayed: '2024-01-05',
    },
    {
      id: 4,
      name: '星穹铁道',
      type: '回合制',
      rating: 4.7,
      price: 0,
      image: 'https://picsum.photos/seed/game4/300/200',
      tags: ['回合制', '科幻', '角色扮演'],
      progress: 80,
      playTime: '150小时',
      lastPlayed: '2024-01-16',
    },
  ];

  const gameTypes = ['all', '开放世界', '角色扮演', '动作冒险', '回合制', '射击'];
  const sortOptions = [
    { value: 'name', label: '名称' },
    { value: 'playTime', label: '游玩时间' },
    { value: 'lastPlayed', label: '最后游玩' },
    { value: 'rating', label: '评分' },
  ];

  return (
    <div className="game-library-page">
      {/* 搜索和筛选 */}
      <div className="library-header">
        <h1>我的游戏库</h1>
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
          <Select
            value={sortBy}
            onChange={setSortBy}
            className="sort-select"
            placeholder="排序方式"
          >
            {sortOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 游戏列表 */}
      <Tabs defaultActiveKey="1" className="library-tabs">
        <TabPane tab="已安装" key="1">
          <Row gutter={[16, 16]}>
            {games.map((game) => (
              <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                <Card
                  hoverable
                  cover={<img alt={game.name} src={game.image} />}
                  className="library-game-card"
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
                        <div className="game-progress">
                          <div className="progress-label">
                            <span>进度</span>
                            <span>{game.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${game.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="game-stats">
                          <span className="play-time">游玩时间: {game.playTime}</span>
                          <span className="last-played">最后游玩: {game.lastPlayed}</span>
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
                  <div className="game-actions">
                    <Button type="primary" icon={<PlayCircleOutlined />} className="play-btn">
                      开始游戏
                    </Button>
                    <Button icon={<DownloadOutlined />} className="update-btn">
                      更新
                    </Button>
                    <Popconfirm
                      title="确定要卸载此游戏吗？"
                      onConfirm={() => console.log('卸载游戏')}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<DeleteOutlined />} className="uninstall-btn">
                        卸载
                      </Button>
                    </Popconfirm>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="已购买" key="2">
          <div className="empty-tab">已购买内容即将上线</div>
        </TabPane>
        <TabPane tab="愿望单" key="3">
          <div className="empty-tab">愿望单内容即将上线</div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default GameLibrary;
