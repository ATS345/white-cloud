import React from 'react';
import { Layout, Menu, Breadcrumb, Button } from 'antd';
import { UserOutlined, AppstoreOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const { Header, Content, Sider } = Layout;

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/admin'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'games',
      icon: <AppstoreOutlined />,
      label: '游戏管理',
      onClick: () => navigate('/admin/games'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '40px' }}>
          云幕游戏管理后台
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white' }}>欢迎，{user?.displayName}</span>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            退出登录
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#001529' }}>
          <Menu
            mode="inline"
            theme="dark"
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>管理后台</Breadcrumb.Item>
            <Breadcrumb.Item>
              {window.location.pathname.split('/').pop() || '仪表盘'}
            </Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Admin;
