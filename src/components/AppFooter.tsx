import React from 'react';
import { Row, Col, Divider } from 'antd';
import { 
  AppstoreOutlined, GithubOutlined, TwitterOutlined, WechatOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AppFooter: React.FC = () => {
  const navigate = useNavigate();

  const linkGroups = [
    {
      title: '平台',
      links: [
        { label: '游戏商店', path: '/games' },
        { label: '下载客户端', path: '/download' },
        { label: '关于我们', path: '/about' },
      ],
    },
    {
      title: '账户',
      links: [
        { label: '登录', path: '/login' },
        { label: '注册', path: '/register' },
        { label: '我的订单', path: '/orders' },
        { label: '游戏库', path: '/library' },
      ],
    },
    {
      title: '法律',
      links: [
        { label: '服务条款', path: '/terms' },
        { label: '隐私政策', path: '/privacy' },
      ],
    },
  ];

  return (
    <footer style={{
      background: 'rgba(0,0,0,0.6)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '60px 5% 30px',
      color: 'rgba(255,255,255,0.6)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[40, 40]}>
          {/* Brand */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <AppstoreOutlined style={{ fontSize: '28px', color: '#667eea' }} />
              <span style={{
                fontSize: '22px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                云幕游戏
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
              专业的游戏数字发行平台，为玩家提供正版游戏购买、管理和下载服务。
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[GithubOutlined, TwitterOutlined, WechatOutlined, CustomerServiceOutlined].map((Icon, i) => (
                <Icon
                  key={i}
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = '#667eea'}
                  onMouseLeave={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
                />
              ))}
            </div>
          </Col>

          {/* Links */}
          {linkGroups.map((group) => (
            <Col xs={8} md={4} key={group.title}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.links.map((link) => (
                  <span
                    key={link.label}
                    onClick={() => navigate(link.path)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'white'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            </Col>
          ))}
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '40px 0 24px' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
        }}>
          <span>© 2024 云幕游戏平台. All rights reserved.</span>
          <span>
            Version 1.0.0 · Made with ❤️ by 云幕团队
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
