import { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Avatar } from 'antd';
import { 
  HomeOutlined, 
  AimOutlined, 
  BookOutlined, 
  UserOutlined, 
  BellOutlined, 
  MenuOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Accessibility from '../Accessibility';
import DownloadManager from '../DownloadManager';
import './index.css';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.target as HTMLFormElement;
    const searchInput = input.querySelector('input') as HTMLInputElement;
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      // 跳转到搜索结果页
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/game',
      icon: <AimOutlined />,
      label: <Link to="/game/1">游戏详情</Link>,
    },
    {
      key: '/library',
      icon: <BookOutlined />,
      label: <Link to="/library">游戏库</Link>,
    },
    {
      key: '/user',
      icon: <UserOutlined />,
      label: <Link to="/user">个人中心</Link>,
    },
  ];

  return (
    <AntLayout className="app-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        className="app-sider"
        breakpoint="lg"
        theme="dark"
      >
        <div className="logo">
          <h1 className={collapsed ? 'collapsed' : ''}>云朵</h1>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname.split('/')[1] || '/']}
          items={menuItems}
          className="app-menu"
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <div className={`app-main ${collapsed ? 'collapsed' : ''}`}>
        <Header className="app-header">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="menu-toggle"
          />
          <form onSubmit={handleSearch} className="search-box">
            <SearchOutlined />
            <input placeholder="搜索游戏、开发者..." />
          </form>
          <div className="header-right">
            <Badge count={3} className="notification">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => setDownloadModalVisible(true)}
                className="notification-button"
              />
            </Badge>
            <Badge count={5} className="notification">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="notification-button"
              />
            </Badge>
            <Avatar 
              icon={<UserOutlined />} 
              className="avatar"
              onClick={() => navigate('/user')}
            />
          </div>
        </Header>
        <Content className="app-content">
          {children}
        </Content>
        <Accessibility />
        <DownloadManager 
          visible={downloadModalVisible} 
          onClose={() => setDownloadModalVisible(false)} 
        />
      </div>
    </AntLayout>
  );
};

export default Layout;
