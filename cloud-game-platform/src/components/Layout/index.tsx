import { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Avatar } from 'antd';
import { 
  HomeOutlined, 
  GameOutlined, 
  LibraryOutlined, 
  UserOutlined, 
  BellOutlined, 
  MenuOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import Accessibility from '../Accessibility';
import DownloadManager from '../DownloadManager';
import './index.css';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/game',
      icon: <GameOutlined />,
      label: <Link to="/game/1">游戏详情</Link>,
    },
    {
      key: '/library',
      icon: <LibraryOutlined />,
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
        />
      </Sider>
      <AntLayout>
        <Header className="app-header">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="menu-toggle"
          />
          <div className="search-box">
            <SearchOutlined />
            <input placeholder="搜索游戏..." />
          </div>
          <div className="header-right">
            <Badge count={3} className="notification">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => setDownloadModalVisible(true)}
              />
            </Badge>
            <Badge count={5} className="notification">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Avatar icon={<UserOutlined />} className="avatar" />
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
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
