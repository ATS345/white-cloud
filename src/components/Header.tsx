import { Layout, Menu, Button, Space } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { DownloadOutlined, UserOutlined, ShoppingOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: 'games',
      icon: <ShoppingOutlined />,
      label: <Link to="/games">游戏库</Link>
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: <Link to="/download">下载客户端</Link>
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于我们</Link>
    }
  ]

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 50px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginRight: '40px',
          textDecoration: 'none'
        }}>
          云幕游戏商店
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[]}
          items={menuItems}
          style={{ 
            background: 'transparent',
            border: 'none',
            minWidth: '400px'
          }}
        />
      </div>
      <Space>
        <Button 
          type="primary" 
          ghost
          icon={<UserOutlined />}
          onClick={() => navigate('/login')}
        >
          登录
        </Button>
        <Button 
          type="primary"
          onClick={() => navigate('/register')}
        >
          注册
        </Button>
      </Space>
    </AntHeader>
  )
}

export default Header