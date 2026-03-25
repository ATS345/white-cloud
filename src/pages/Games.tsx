import React, { useEffect } from 'react';
import { Row, Col, Card, Input, Select, Button, Spin, Pagination, Rate } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchGames } from '@/store/slices/gamesSlice';
import { addToCart } from '@/store/slices/cartSlice';

const { Search } = Input;
const { Option } = Select;

const Games: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { games, loading, pagination } = useSelector((state: RootState) => state.games);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [searchText, setSearchText] = React.useState('');
  const [selectedGenre, setSelectedGenre] = React.useState<number | undefined>();
  const [selectedPlatform, setSelectedPlatform] = React.useState<number | undefined>();
  const [currentPage, setCurrentPage] = React.useState(1);

  useEffect(() => {
    dispatch(
      fetchGames({
        page: currentPage,
        limit: 12,
        search: searchText || undefined,
        genre: selectedGenre,
        platform: selectedPlatform,
      })
    );
  }, [dispatch, currentPage, selectedGenre, selectedPlatform]);

  const handleSearch = () => {
    setCurrentPage(1);
    dispatch(
      fetchGames({
        page: 1,
        limit: 12,
        search: searchText || undefined,
        genre: selectedGenre,
        platform: selectedPlatform,
      })
    );
  };

  const handleAddToCart = (gameId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ gameId, quantity: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <Search
          placeholder="搜索游戏"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
        />
        <Select
          placeholder="选择类型"
          allowClear
          style={{ width: 150 }}
          value={selectedGenre}
          onChange={setSelectedGenre}
        >
          <Option value={1}>动作</Option>
          <Option value={2}>冒险</Option>
          <Option value={3}>角色扮演</Option>
          <Option value={4}>策略</Option>
          <Option value={5}>模拟</Option>
          <Option value={6}>体育</Option>
          <Option value={7}>竞速</Option>
          <Option value={8}>射击</Option>
        </Select>
        <Select
          placeholder="选择平台"
          allowClear
          style={{ width: 150 }}
          value={selectedPlatform}
          onChange={setSelectedPlatform}
        >
          <Option value={1}>Windows</Option>
          <Option value={2}>Mac</Option>
          <Option value={3}>Linux</Option>
          <Option value={4}>PlayStation</Option>
          <Option value={5}>Xbox</Option>
          <Option value={6}>Nintendo</Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {games.map((game) => (
              <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={game.title}
                      src={game.coverImage}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                  onClick={() => navigate(`/games/${game.slug}`)}
                  style={{ height: '100%' }}
                >
                  <Card.Meta
                    title={game.title}
                    description={
                      <div>
                        <div style={{ marginBottom: '8px' }}>
                          {game.genres.map((g) => g.name).join(', ')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>
                              ¥{game.price}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {game.averageRating && (
                              <Rate disabled defaultValue={game.averageRating} count={5} />
                            )}
                            <span style={{ fontSize: '12px', color: '#999' }}>
                              ({game.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <div style={{ marginTop: '12px' }}>
                    <Button
                      type="primary"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(game.id);
                      }}
                    >
                      加入购物车
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              current={currentPage}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Games;