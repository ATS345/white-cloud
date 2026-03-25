import { Button, Row, Col, Typography, Space, Rate, Tag, Carousel, Statistic } from 'antd'
import { 
  DownloadOutlined, PlayCircleOutlined, SafetyOutlined, RocketOutlined,
  FireOutlined, StarOutlined, UserOutlined, ThunderboltOutlined
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { addToCart } from '@/store/slices/cartSlice'
import { mockHotGames, mockNewGames } from '@/utils/mockData'
import { message } from 'antd'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const bannerGames = [
    {
      id: 3,
      title: '黑神话：悟空',
      subtitle: '2024年度最期待国产游戏',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/capsule_616x353.jpg',
      price: 268,
      slug: 'black-myth-wukong',
      badge: '热销中',
      badgeColor: '#ff4d4f',
    },
    {
      id: 2,
      title: '艾尔登法环',
      subtitle: '荣获年度最佳游戏大奖',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg',
      price: 398,
      slug: 'elden-ring',
      badge: '年度最佳',
      badgeColor: '#faad14',
    },
    {
      id: 6,
      title: '博德之门3',
      subtitle: 'D&D史诗奇幻RPG巨作',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg',
      price: 368,
      slug: 'baldurs-gate-3',
      badge: '强烈推荐',
      badgeColor: '#52c41a',
    },
  ]

  const handleAddToCart = async (gameId: number) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      await dispatch(addToCart({ gameId, quantity: 1 })).unwrap()
      message.success('已添加到购物车')
    } catch {
      message.error('添加失败，请先登录')
    }
  }

  const features = [
    {
      icon: <PlayCircleOutlined style={{ fontSize: '36px', color: '#667eea' }} />,
      title: '海量正版游戏',
      description: '收录数千款国内外优质游戏，持续更新中',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '36px', color: '#52c41a' }} />,
      title: '安全支付保障',
      description: '支持支付宝、微信、银联等多种支付方式',
    },
    {
      icon: <RocketOutlined style={{ fontSize: '36px', color: '#ff7a45' }} />,
      title: 'CDN极速下载',
      description: '全国加速节点覆盖，享受极速下载体验',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '36px', color: '#faad14' }} />,
      title: '一键管理游戏',
      description: '云端存档、自动更新，专注享受游戏乐趣',
    },
  ]

  const stats = [
    { title: '注册用户', value: 128456, prefix: <UserOutlined />, suffix: '+', color: '#667eea' },
    { title: '精品游戏', value: 3842, prefix: <PlayCircleOutlined />, suffix: '+', color: '#52c41a' },
    { title: '完成订单', value: 89234, prefix: <StarOutlined />, suffix: '+', color: '#ff7a45' },
    { title: '好评率', value: 98, prefix: <FireOutlined />, suffix: '%', color: '#faad14' },
  ]

  return (
    <div style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <Carousel autoplay autoplaySpeed={4000} effect="fade" dots={{ className: 'banner-dots' }}>
          {bannerGames.map((banner) => (
            <div key={banner.id}>
              <div style={{
                position: 'relative',
                height: '600px',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.5)',
                  transform: 'scale(1.05)',
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10%',
                  transform: 'translateY(-50%)',
                  maxWidth: '500px',
                }}>
                  <Tag color={banner.badgeColor} style={{ marginBottom: '16px', fontSize: '14px', padding: '4px 12px' }}>
                    {banner.badge}
                  </Tag>
                  <Title style={{ color: 'white', fontSize: '52px', lineHeight: 1.2, margin: '0 0 16px' }}>
                    {banner.title}
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: '32px' }}>
                    {banner.subtitle}
                  </Paragraph>
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        height: '50px',
                        padding: '0 32px',
                        fontSize: '16px',
                        borderRadius: '8px',
                      }}
                      onClick={() => navigate(`/games/${banner.slug}`)}
                    >
                      立即购买 ¥{banner.price}
                    </Button>
                    <Button
                      size="large"
                      ghost
                      style={{ height: '50px', padding: '0 32px', fontSize: '16px', borderRadius: '8px' }}
                      onClick={() => navigate(`/games/${banner.slug}`)}
                    >
                      查看详情
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 统计数据 */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 5%' }}>
        <Row gutter={[32, 16]} justify="center">
          {stats.map((stat, i) => (
            <Col xs={12} sm={6} key={i} style={{ textAlign: 'center' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{stat.title}</span>}
                value={stat.value}
                prefix={<span style={{ color: 'white' }}>{stat.prefix}</span>}
                suffix={<span style={{ color: 'white', fontSize: '20px' }}>{stat.suffix}</span>}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* 特色功能 */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <Title level={2} style={{ color: 'white' }}>为什么选择云幕游戏</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
              专业的游戏平台，为玩家提供最佳体验
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(102,126,234,0.15)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(102,126,234,0.5)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                  <Title level={4} style={{ color: 'white', marginBottom: '8px' }}>{feature.title}</Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '14px' }}>
                    {feature.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 热门游戏 */}
      <section style={{ padding: '0 5% 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: '12px' }} />
              热门游戏
            </Title>
            <Link to="/games">
              <Button ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
                查看全部
              </Button>
            </Link>
          </div>
          <Row gutter={[20, 20]}>
            {mockHotGames.map((game) => (
              <Col xs={24} sm={12} md={6} key={game.id}>
                <GameCard game={game} onAddToCart={handleAddToCart} navigate={navigate} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 新游上架 */}
      <section style={{ padding: '0 5% 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <StarOutlined style={{ color: '#faad14', marginRight: '12px' }} />
              精品推荐
            </Title>
            <Link to="/games">
              <Button ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
                查看全部
              </Button>
            </Link>
          </div>
          <Row gutter={[20, 20]}>
            {mockNewGames.map((game) => (
              <Col xs={24} sm={12} md={6} key={game.id}>
                <GameCard game={game} onAddToCart={handleAddToCart} navigate={navigate} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 下载 CTA */}
      <section style={{
        margin: '0 5% 80px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 5%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
          准备好开始游戏之旅了吗？
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', marginBottom: '40px' }}>
          下载云幕游戏客户端，解锁完整功能，享受无限游戏乐趣
        </Paragraph>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={() => navigate('/download')}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              height: '52px',
              padding: '0 40px',
              fontSize: '18px',
              fontWeight: 600,
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            立即下载客户端
          </Button>
          <Button
            size="large"
            ghost
            onClick={() => navigate('/games')}
            style={{ height: '52px', padding: '0 40px', fontSize: '18px', borderRadius: '10px' }}
          >
            浏览游戏商店
          </Button>
        </Space>
      </section>
    </div>
  )
}

// 游戏卡片组件
interface GameCardProps {
  game: {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    averageRating?: number;
    reviewCount?: number;
    genres?: { id: number; name: string }[];
  };
  onAddToCart: (id: number) => void;
  navigate: (path: string) => void;
}
const GameCard = ({ game, onAddToCart, navigate }: GameCardProps) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(102,126,234,0.5)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
    }}
    onClick={() => navigate(`/games/${game.slug}`)}
  >
    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
      <img
        src={game.coverImage}
        alt={game.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/400/225`;
        }}
      />
      {game.price === 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#52c41a',
          color: 'white',
          padding: '2px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          免费
        </div>
      )}
    </div>
    <div style={{ padding: '14px 16px' }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>
        {game.genres?.map((g: { id: number; name: string }) => g.name).join(' / ')}
      </div>
      <div style={{
        color: 'white',
        fontWeight: 600,
        fontSize: '15px',
        marginBottom: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {game.title}
      </div>
      {game.averageRating && (
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Rate disabled defaultValue={game.averageRating} count={5} style={{ fontSize: '11px' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            ({(game.reviewCount || 0).toLocaleString()})
          </span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#667eea', fontWeight: 700, fontSize: '18px' }}>
          {game.price === 0 ? '免费' : `¥${game.price}`}
        </span>
        <Button
          type="primary"
          size="small"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(game.id)
          }}
        >
          {game.price === 0 ? '免费下载' : '加入购物车'}
        </Button>
      </div>
    </div>
  </div>
)

export default Home
