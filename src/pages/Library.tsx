import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Empty, Spin, Input, Tag, Tooltip } from 'antd';
import { 
  DownloadOutlined, PlayCircleOutlined, SearchOutlined, 
  AppstoreOutlined, StarFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import api from '@/utils/api';
import { mockLibrary } from '@/utils/mockData';

interface LibraryGame {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  developer?: string;
  genres?: { id: number; name: string }[];
}

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibrary();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-games');
      setGames(response.games || []);
    } catch {
      // 使用 Mock 数据
      setGames(mockLibrary);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameTitle: string) => {
    // 实际项目中会调用本地客户端协议启动
    console.log('启动游戏:', gameTitle);
  };

  const filteredGames = games.filter(g =>
    g.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div style={{ 
        background: '#0a0a0f', minHeight: 'calc(100vh - 128px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <AppstoreOutlined style={{ fontSize: '60px', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }} />
        <h2 style={{ color: 'white', marginBottom: '12px' }}>请先登录</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>登录后查看你的游戏库</p>
        <Button
          type="primary"
          size="large"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px' }}
          onClick={() => navigate('/login')}
        >
          去登录
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: 'calc(100vh - 128px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: 'calc(100vh - 128px)', padding: '32px 5%' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '30px', fontWeight: 800, margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: '12px', color: '#667eea' }} />
              我的游戏库
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
              共 {games.length} 款游戏
            </p>
          </div>
          <Input
            placeholder="搜索游戏..."
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              width: 250,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: 'white',
            }}
          />
        </div>

        {filteredGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            {games.length === 0 ? (
              <>
                <AppstoreOutlined style={{ fontSize: '60px', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                <h3 style={{ color: 'rgba(255,255,255,0.5)' }}>游戏库是空的</h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>去商店购买游戏吧！</p>
                <Button
                  type="primary"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                  onClick={() => navigate('/games')}
                >
                  浏览游戏商店
                </Button>
              </>
            ) : (
              <Empty description={<span style={{ color: 'rgba(255,255,255,0.5)' }}>没有找到匹配的游戏</span>} />
            )}
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredGames.map((game) => (
              <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
                <LibraryGameCard
                  game={game}
                  onPlay={() => handlePlayGame(game.title)}
                  onDownload={() => navigate('/download')}
                  onDetails={() => navigate(`/games/${game.slug}`)}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

interface LibraryGameCardProps {
  game: LibraryGame;
  onPlay: () => void;
  onDownload: () => void;
  onDetails: () => void;
}

const LibraryGameCard: React.FC<LibraryGameCardProps> = ({ game, onPlay, onDownload, onDetails }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* 封面图 */}
      <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
        <img
          src={game.coverImage}
          alt={game.title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${game.id}/400/225`; }}
        />
        {/* 悬浮操作层 */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            <Tooltip title="启动游戏">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<PlayCircleOutlined style={{ fontSize: '20px' }} />}
                onClick={onPlay}
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', width: '52px', height: '52px' }}
              />
            </Tooltip>
            <Tooltip title="下载/更新">
              <Button
                shape="circle"
                size="large"
                icon={<DownloadOutlined style={{ fontSize: '18px' }} />}
                onClick={onDownload}
                ghost
                style={{ width: '44px', height: '44px' }}
              />
            </Tooltip>
          </div>
        )}
        {/* 已购标签 */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(0,0,0,0.7)', borderRadius: '4px',
          padding: '2px 8px', fontSize: '11px', color: '#52c41a',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <StarFilled style={{ fontSize: '10px' }} />
          已购
        </div>
      </div>

      {/* 信息区 */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '6px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {game.title}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px' }}>
          {game.developer}
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {game.genres?.slice(0, 2).map((g: { id: number; name: string }) => (
            <Tag
              key={g.id}
              style={{
                background: 'rgba(102,126,234,0.15)',
                border: '1px solid rgba(102,126,234,0.3)',
                color: '#667eea',
                fontSize: '11px',
                borderRadius: '4px',
              }}
            >
              {g.name}
            </Tag>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            block
            onClick={onPlay}
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '6px', fontSize: '12px' }}
          >
            启动游戏
          </Button>
          <Button
            size="small"
            ghost
            onClick={onDetails}
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', fontSize: '12px' }}
          >
            详情
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Library;
