import React from 'react';
import { Input, Badge, Avatar, Dropdown, Button, Space } from 'antd';
import { 
  UserOutlined, ShoppingCartOutlined, LogoutOutlined, 
  SearchOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchText.trim())}`);
      setSearchVisible(false);
      setSearchText('');
    }
  };

  const navItems = [
    { key: '/', label: '首页' },
    { key: '/games', label: '游戏商店' },
    { key: '/download', label: '下载客户端' },
    { key: '/about', label: '关于' },
  ];

  const userMenuItems = isAuthenticated ? [
    { key: 'profile', label: '个人资料', onClick: () => navigate('/profile') },
    { key: 'orders', label: '我的订单', onClick: () => navigate('/orders') },
    { key: 'library', label: '游戏库', onClick: () => navigate('/library') },
    { type: 'divider' as const },
    ...(user?.role === 'ADMIN' ? [{ key: 'admin', label: '管理后台', onClick: () => navigate('/admin') }] : []),
    { 
      key: 'logout', 
      label: <span style={{ color: '#ff4d4f' }}><LogoutOutlined style={{ marginRight: 8 }} />退出登录</span>, 
      onClick: handleLogout,
    },
  ] : [];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 5%',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div
        style={{
          color: 'white',
          fontSize: '22px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '150px',
        }}
        onClick={() => navigate('/')}
      >
        <AppstoreOutlined style={{ fontSize: '24px', color: '#667eea' }} />
        <span style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          云幕游戏
        </span>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', gap: '4px' }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            style={{
              background: location.pathname === item.key ? 'rgba(102,126,234,0.2)' : 'transparent',
              border: 'none',
              color: location.pathname === item.key ? '#667eea' : 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: location.pathname === item.key ? 600 : 400,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (location.pathname !== item.key) {
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              }
            }}
            onMouseLeave={e => {
              if (location.pathname !== item.key) {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 搜索框 */}
        {searchVisible ? (
          <Input
            autoFocus
            placeholder="搜索游戏..."
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            onBlur={() => { if (!searchText) setSearchVisible(false); }}
            style={{
              width: 220,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'white',
            }}
          />
        ) : (
          <SearchOutlined
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onClick={() => setSearchVisible(true)}
          />
        )}

        {/* 购物车 */}
        <Badge count={itemCount} size="small" offset={[0, 2]}>
          <ShoppingCartOutlined
            style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
            onClick={() => navigate('/cart')}
          />
        </Badge>

        {/* 用户区域 */}
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', cursor: 'pointer' }}
                size={32}
              />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || user?.username}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Button
              ghost
              size="small"
              onClick={() => navigate('/login')}
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)', borderRadius: '6px' }}
            >
              登录
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '6px',
              }}
            >
              注册
            </Button>
          </Space>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
