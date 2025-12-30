import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Avatar } from 'antd';
import { 
  HomeOutlined, 
  BookOutlined, 
  UserOutlined, 
  BellOutlined, 
  MenuOutlined,
  SearchOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  FireOutlined,
  PlusOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Accessibility from '../Accessibility';
import DownloadManager from '../DownloadManager';
import Logo from '../Logo';
import './index.css';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    // 模拟实时搜索建议
    if (value) {
      // 实际项目中这里应该调用API获取搜索建议
      const mockSuggestions = [
        `${value} 游戏`,
        `${value} 攻略`,
        `${value} 下载`,
        `${value} 破解版`,
        `${value} 最新版本`
      ];
      setSearchSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 跳转到搜索结果页
      navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  // 处理搜索建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    navigate(`/search?keyword=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  // 点击外部关闭搜索建议
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-box')) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: '游戏分类',
      children: [
        {
          key: '/categories/action',
          label: <Link to="/categories/action">动作游戏</Link>,
        },
        {
          key: '/categories/rpg',
          label: <Link to="/categories/rpg">角色扮演</Link>,
        },
        {
          key: '/categories/strategy',
          label: <Link to="/categories/strategy">策略游戏</Link>,
        },
        {
          key: '/categories/simulation',
          label: <Link to="/categories/simulation">模拟经营</Link>,
        },
        {
          key: '/categories/sports',
          label: <Link to="/categories/sports">体育竞技</Link>,
        },
        {
          key: '/categories/casual',
          label: <Link to="/categories/casual">休闲益智</Link>,
        },
      ],
    },
    {
      key: '/hot',
      icon: <FireOutlined />,
      label: <Link to="/hot">热门游戏</Link>,
    },
    {
      key: '/new',
      icon: <PlusOutlined />,
      label: <Link to="/new">新游推荐</Link>,
    },
    {
      key: '/library',
      icon: <BookOutlined />,
      label: <Link to="/library">游戏库</Link>,
    },
    {
      key: '/community',
      icon: <MessageOutlined />,
      label: <Link to="/community">游戏社区</Link>,
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
          <Logo 
            size={collapsed ? 'small' : 'medium'} 
            showText={!collapsed} 
            className="app-logo"
          />
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
            className="menu-toggle hover-lift"
          />
          <div className="search-box">
            <form onSubmit={handleSearchSubmit}>
              <SearchOutlined />
              <input 
                type="text" 
                placeholder="搜索游戏、开发者..." 
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => searchTerm && setShowSuggestions(true)}
              />
            </form>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions animate-slide-in-right">
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item hover-lift"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <SearchOutlined />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="header-right">
            <Badge count={3} className="notification">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => setDownloadModalVisible(true)}
                className="notification-button hover-lift"
              />
            </Badge>
            <Badge count={5} className="notification">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="notification-button hover-lift"
              />
            </Badge>
            <Avatar 
              icon={<UserOutlined />} 
              className="avatar hover-lift"
              onClick={() => navigate('/user')}
            />
          </div>
        </Header>
        <Content className="app-content">
          <div className="page-transition">
            {children}
          </div>
        </Content>
        <Accessibility />
        <DownloadManager 
          visible={downloadModalVisible} 
          onClose={() => setDownloadModalVisible(false)} 
        />

        {/* 移动端底部导航栏 */}
        <div className="mobile-bottom-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeOutlined />
            <span>首页</span>
          </Link>
          <Link to="/categories" className={`nav-item ${location.pathname.startsWith('/categories') ? 'active' : ''}`}>
            <AppstoreOutlined />
            <span>分类</span>
          </Link>
          <Link to="/library" className={`nav-item ${location.pathname === '/library' ? 'active' : ''}`}>
            <BookOutlined />
            <span>游戏库</span>
          </Link>
          <Link to="/community" className={`nav-item ${location.pathname === '/community' ? 'active' : ''}`}>
            <MessageOutlined />
            <span>社区</span>
          </Link>
          <Link to="/user" className={`nav-item ${location.pathname === '/user' ? 'active' : ''}`}>
            <UserOutlined />
            <span>我的</span>
          </Link>
        </div>
      </div>
    </AntLayout>
  );
};

export default Layout;
