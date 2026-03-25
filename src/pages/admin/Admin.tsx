import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, AppstoreOutlined, LogoutOutlined,
  DashboardOutlined, ShopOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const { Header, Content, Sider } = Layout;

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // 开发时允许访问（生产环境需要 admin 角色校验）
  // if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'admin')) {
  //   navigate('/');
  //   return null;
  // }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/games',
      icon: <AppstoreOutlined />,
      label: '游戏管理',
      onClick: () => navigate('/admin/games'),
    },
  ];

  const userMenuItems = [
    { key: 'home', label: '返回前台', icon: <ShopOutlined />, onClick: () => navigate('/') },
    { type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
  ];

  const selectedKeys = [location.pathname === '/admin' ? '/admin' : 
    menuItems.find(item => location.pathname.startsWith(item.key) && item.key !== '/admin')?.key || '/admin'];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0d0d1a' }}>
      {/* 顶部导航 */}
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(10,10,15,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 800,
          marginRight: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <DashboardOutlined style={{ color: '#667eea', fontSize: '20px' }} />
          <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            云幕管理后台
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }} size={32} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                {user?.displayName || '管理员'}
              </span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* 侧边栏 */}
        <Sider
          width={220}
          style={{
            background: 'rgba(10,10,15,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '12px 8px',
            }}
            items={menuItems}
            theme="dark"
          />
        </Sider>

        {/* 主内容区 */}
        <Layout style={{ background: '#0d0d1a' }}>
          <Content style={{
            margin: '24px',
            padding: '24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            minHeight: 'calc(100vh - 64px - 48px)',
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Admin;
