import { useState, useEffect } from 'react'
import { Button, Card, Row, Col, Typography, Space, Spin, message } from 'antd'
import { DownloadOutlined, PlayCircleOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { addToCart } from '@/store/slices/cartSlice'
import api from '@/utils/api'

const { Title, Paragraph } = Typography

interface GameItem {
  id: number
  title: string
  slug: string
  coverImage: string
  price: number
  averageRating?: number
  releaseDate?: string
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [hotGames, setHotGames] = useState<GameItem[]>([])
  const [newGames, setNewGames] = useState<GameItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const [hotResponse, newResponse] = await Promise.all([
        api.get('/games/hot', { params: { limit: 4 } }),
        api.get('/games/new', { params: { limit: 4 } })
      ])
      setHotGames(hotResponse || [])
      setNewGames(newResponse || [])
    } catch (error) {
      console.error('获取首页数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (gameId: number) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      await dispatch(addToCart({ gameId, quantity: 1 })).unwrap()
      message.success('已添加到购物车')
    } catch (error) {
      message.error('添加失败')
    }
  }

  const features = [
    {
      icon: <PlayCircleOutlined style={{ fontSize: '40px', color: '#667eea' }} />,
      title: '海量游戏',
      description: '精选数千款优质游戏，涵盖各种类型和风格'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '40px', color: '#764ba2' }} />,
      title: '安全可靠',
      description: '所有游戏经过严格检测，确保下载安全无虞'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '40px', color: '#667eea' }} />,
      title: '极速下载',
      description: '采用先进下载技术，享受闪电般的下载速度'
    }
  ]

  return (
    <div>
      <section style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '100px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>
            欢迎来到云幕游戏商店
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '40px', color: 'rgba(255,255,255,0.9)' }}>
            发现精彩游戏，开启无限可能
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => window.location.href = '/download'}
              style={{ 
                background: 'white', 
                color: '#667eea',
                border: 'none',
                height: '50px',
                fontSize: '18px',
                padding: '0 40px'
              }}
            >
              下载客户端
            </Button>
            <Button 
              size="large"
              onClick={() => window.location.href = '/games'}
              style={{ 
                background: 'transparent', 
                color: 'white',
                border: '2px solid white',
                height: '50px',
                fontSize: '18px',
                padding: '0 40px'
              }}
            >
              浏览游戏
            </Button>
          </Space>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>
            平台特色
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card 
                  className="card-hover"
                  style={{ 
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ marginBottom: '20px' }}>
                    {feature.icon}
                  </div>
                  <Title level={3}>{feature.title}</Title>
                  <Paragraph style={{ color: '#666' }}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <section style={{ padding: '80px 20px', background: '#f8f9fa' }}>
            <div className="container">
              <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>
                热门游戏
              </Title>
              <Row gutter={[24, 24]}>
                {hotGames.map((game) => (
                  <Col xs={24} sm={12} md={6} key={game.id}>
                    <Card
                      className="card-hover"
                      hoverable
                      cover={
                        <div style={{ 
                          height: '300px',
                          overflow: 'hidden',
                          borderRadius: '8px 8px 0 0'
                        }}>
                          <img 
                            alt={game.title} 
                            src={game.coverImage} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      }
                      style={{ borderRadius: '8px' }}
                      onClick={() => navigate(`/games/${game.slug}`)}
                    >
                      <Card.Meta
                        title={game.title}
                        description={
                          <div>
                            <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '18px' }}>
                              ¥{game.price}
                            </div>
                            <div style={{ color: '#888', fontSize: '14px' }}>
                              评分: {game.averageRating?.toFixed(1) || '暂无'} / 5.0
                            </div>
                          </div>
                        }
                      />
                      <Button 
                        type="primary" 
                        size="small" 
                        style={{ marginTop: '12px', width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(game.id)
                        }}
                      >
                        加入购物车
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link to="/games">
                  <Button type="primary" size="large">
                    查看更多游戏
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 20px' }}>
            <div className="container">
              <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>
                新游上架
              </Title>
              <Row gutter={[24, 24]}>
                {newGames.map((game) => (
                  <Col xs={24} sm={12} md={6} key={game.id}>
                    <Card
                      className="card-hover"
                      hoverable
                      cover={
                        <div style={{ 
                          height: '300px',
                          overflow: 'hidden',
                          borderRadius: '8px 8px 0 0'
                        }}>
                          <img 
                            alt={game.title} 
                            src={game.coverImage} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      }
                      style={{ borderRadius: '8px' }}
                      onClick={() => navigate(`/games/${game.slug}`)}
                    >
                      <Card.Meta
                        title={game.title}
                        description={
                          <div>
                            <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '18px' }}>
                              ¥{game.price}
                            </div>
                            <div style={{ color: '#888', fontSize: '14px' }}>
                              {game.releaseDate && new Date(game.releaseDate).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        }
                      />
                      <Button 
                        type="primary" 
                        size="small" 
                        style={{ marginTop: '12px', width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(game.id)
                        }}
                      >
                        加入购物车
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>
        </>
      )}

      <section style={{ 
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <Title level={2} style={{ color: 'white', marginBottom: '20px' }}>
            准备好开始游戏之旅了吗？
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '40px', color: 'rgba(255,255,255,0.9)' }}>
            立即下载云幕游戏商店客户端，开启您的游戏世界
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            icon={<DownloadOutlined />}
            onClick={() => window.location.href = '/download'}
            style={{ 
              background: 'white', 
              color: '#667eea',
              border: 'none',
              height: '50px',
              fontSize: '18px',
              padding: '0 40px'
            }}
          >
            立即下载
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home