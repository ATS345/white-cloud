import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { itemCount } = useSelector((state: RootState) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/games',
      label: '游戏',
      onClick: () => navigate('/games'),
    },
    {
      key: '/about',
      label: '关于',
      onClick: () => navigate('/about'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'library',
      label: '游戏库',
      onClick: () => navigate('/library'),
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '40px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          云幕游戏
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, border: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Badge count={itemCount} size="small">
          <ShoppingCartOutlined
            style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
            onClick={() => navigate('/cart')}
          />
        </Badge>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ marginRight: '8px' }}
              />
              <span style={{ color: 'white' }}>{user?.displayName}</span>
            </div>
          </Dropdown>
        ) : (
          <>
            <span
              style={{ color: 'white', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              登录
            </span>
            <span
              style={{ color: 'white', cursor: 'pointer' }}
              onClick={() => navigate('/register')}
            >
              注册
            </span>
          </>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;