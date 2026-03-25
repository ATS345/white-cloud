import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Empty, Spin, message } from 'antd';
import { DownloadOutlined, PlayCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import api from '@/utils/api';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibrary();
    }
  }, [isAuthenticated]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-games');
      setGames(response.games || []);
    } catch (error) {
      console.error('获取游戏库失败:', error);
      message.error('获取游戏库失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: number) => {
    // 这里应该跳转到游戏启动页面或启动游戏客户端
    message.success('启动游戏');
  };

  const handleDownloadGame = (gameId: number) => {
    navigate('/download');
  };

  const handleViewGame = (slug: string) => {
    navigate(`/games/${slug}`);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Empty description="请先登录" />
        <Button type="primary" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>我的游戏库</h2>
      
      {games.length === 0 ? (
        <Empty description="游戏库为空" />
      ) : (
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
                style={{ height: '100%' }}
              >
                <Card.Meta
                  title={game.title}
                  description={
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        {game.developer}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: '#666' }}>购买于: </span>
                          <span style={{ fontSize: '12px' }}>
                            {new Date(game.purchaseDate).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Button
                    type="primary"
                    block
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlayGame(game.id)}
                  >
                    启动游戏
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadGame(game.id)}
                  >
                    下载
                  </Button>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <Button
                    type="link"
                    block
                    onClick={() => handleViewGame(game.slug)}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Library;