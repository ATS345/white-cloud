import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Rate, Tag, List, Avatar, Input, Spin, Carousel, Tabs, Descriptions, message, Breadcrumb } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, DownloadOutlined, HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import api from '@/utils/api';
import { mockGames } from '@/utils/mockData';

const { TabPane } = Tabs;

interface GameScreenshot { id: number; url: string }
interface GameTag { id: number; name: string }
interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user?: { displayName?: string; avatar?: string };
}
interface ReviewItem {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user?: { displayName?: string; avatar?: string };
}
interface GameData {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  headerImage?: string;
  description: string;
  price: number;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  averageRating?: number;
  reviewCount?: number;
  screenshots?: GameScreenshot[];
  genres?: GameTag[];
  platforms?: GameTag[];
  languages?: GameTag[];
  features?: GameTag[];
}

const GameDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchGameDetails = React.useCallback(async () => {
    setLoading(true)
    try {
      const gameResponse = await api.get(`/games/slug/${slug}`) as GameData
      setGame(gameResponse)
      
      if (gameResponse?.id) {
        const [reviewsResponse, commentsResponse] = await Promise.all([
          api.get(`/reviews`, { params: { gameId: gameResponse.id } }).catch(() => ({ list: [] })),
          api.get(`/comments`, { params: { gameId: gameResponse.id } }).catch(() => ({ list: [] }))
        ]) as [{ list: ReviewItem[] }, { list: CommentItem[] }]
        setReviews(reviewsResponse.list || [])
        setComments(commentsResponse.list || [])
      }
    } catch {
      // 使用 Mock 数据
      const mockGame = mockGames.find(g => g.slug === slug);
      if (mockGame) {
        setGame(mockGame as unknown as GameData);
        setReviews([]);
        setComments([]);
      }
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      fetchGameDetails()
    }
  }, [slug, fetchGameDetails])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ gameId: game.id, quantity: 1 }));
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ gameId: game.id, quantity: 1 }));
    navigate('/cart');
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/download');
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.post('/comments', {
        gameId: game.id,
        content: newComment.trim(),
      }) as CommentItem;
      setComments(prev => [response, ...prev]);
      setNewComment('');
      message.success('评论发表成功');
    } catch (error) {
      message.error('评论发表失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>游戏不存在</h2>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: 'calc(100vh - 128px)', padding: '24px 5%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 面包屑 */}
        <Breadcrumb
          style={{ marginBottom: '20px' }}
          items={[
            { title: <Link to="/"><HomeOutlined /> 首页</Link> },
            { title: <Link to="/games"><AppstoreOutlined /> 游戏商店</Link> },
            { title: game.title },
          ]}
        />
        <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Carousel autoplay style={{ marginBottom: '24px' }}>
            <div>
              <img
                src={game.headerImage || game.coverImage}
                alt={game.title}
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </div>
            {game.screenshots?.map((screenshot: GameScreenshot) => (
              <div key={screenshot.id}>
                <img
                  src={screenshot.url}
                  alt={`${game.title} 截图`}
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </Carousel>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="游戏详情" key="details">
              <div style={{ lineHeight: '1.6' }}>
                <h3>关于这款游戏</h3>
                <div dangerouslySetInnerHTML={{ __html: game.description }} />
              </div>
            </TabPane>
            <TabPane tab="评论" key="comments">
              <List
                header={<div>全部评论 ({comments.length})</div>}
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(item) => (
                  <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Avatar src={item.user?.avatar} />
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500 }}>{item.user?.displayName}</span>
                        <span style={{ marginLeft: '12px', color: '#999', fontSize: '12px' }}>
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p style={{ margin: 0 }}>{item.content}</p>
                    </div>
                  </div>
                )}
              />
              <div style={{ marginTop: '24px' }}>
                <Input.TextArea 
                  rows={4} 
                  placeholder="写下你的评论..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isAuthenticated}
                />
                <Button 
                  type="primary" 
                  style={{ marginTop: '12px' }}
                  onClick={handleSubmitComment}
                  loading={submitting}
                  disabled={!isAuthenticated || !newComment.trim()}
                >
                  发表评论
                </Button>
              </div>
            </TabPane>
            <TabPane tab="评价" key="reviews">
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff6b6b' }}>
                    {game.averageRating || 0}
                  </div>
                  <div>
                    <Rate disabled defaultValue={game.averageRating || 0} count={5} />
                    <div style={{ marginTop: '8px', color: '#999' }}>
                      {game.reviewCount} 条评价
                    </div>
                  </div>
                </div>
              </div>
              <List
                dataSource={reviews}
                renderItem={(item) => (
                  <Card style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar src={item.user?.avatar} />
                        <div>
                          <div>{item.user?.displayName}</div>
                          <Rate disabled defaultValue={item.rating} count={5} style={{ fontSize: '12px' }} />
                        </div>
                      </div>
                      <div style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(item.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div>{item.content}</div>
                  </Card>
                )}
              />
            </TabPane>
          </Tabs>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ position: 'sticky', top: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img
                src={game.coverImage}
                alt={game.title}
                style={{ width: '100%', maxWidth: '200px', marginBottom: '16px' }}
              />
              <h2 style={{ marginBottom: '8px' }}>{game.title}</h2>
              <div style={{ marginBottom: '16px' }}>
                <Rate disabled defaultValue={game.averageRating || 0} count={5} />
                <span style={{ marginLeft: '8px', color: '#999' }}>
                  ({game.reviewCount} 评价)
                </span>
              </div>
              <div style={{ fontSize: '18px', color: '#999', marginBottom: '16px' }}>
                {game.developer} • {game.publisher}
              </div>
              <div style={{ marginBottom: '16px' }}>
                {game.genres?.map((genre: GameTag) => (
                  <Tag key={genre.id} style={{ margin: '4px' }}>
                    {genre.name}
                  </Tag>
                ))}
              </div>
              <div style={{ color: '#999', marginBottom: '16px' }}>
                发行日期: {new Date(game.releaseDate).toLocaleDateString('zh-CN')}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b', textAlign: 'center' }}>
                ¥{game.price}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
              >
                加入购物车
              </Button>
              <Button
                danger
                size="large"
                block
                onClick={handleBuyNow}
              >
                立即购买
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载游戏
              </Button>
              <Button
                size="large"
                icon={<HeartOutlined />}
              >
                收藏
              </Button>
            </div>

            <Descriptions column={1} style={{ marginTop: '24px' }}>
              <Descriptions.Item label="平台">
                {game.platforms?.map((platform: GameTag) => (
                  <Tag key={platform.id} style={{ margin: '4px' }}>
                    {platform.name}
                  </Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="支持语言">
                {game.languages?.map((lang: GameTag) => (
                  <Tag key={lang.id} style={{ margin: '4px' }}>
                    {lang.name}
                  </Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="游戏特色">
                {game.features?.map((feature: GameTag) => (
                  <Tag key={feature.id} style={{ margin: '4px' }}>
                    {feature.name}
                  </Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
};

export default GameDetail;