import { Layout } from 'antd'
import { GithubOutlined, TwitterOutlined, MailOutlined } from '@ant-design/icons'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#1a1a2e',
      color: 'white',
      padding: '40px 0'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <GithubOutlined style={{ fontSize: '24px', margin: '0 15px', cursor: 'pointer' }} />
        <TwitterOutlined style={{ fontSize: '24px', margin: '0 15px', cursor: 'pointer' }} />
        <MailOutlined style={{ fontSize: '24px', margin: '0 15px', cursor: 'pointer' }} />
      </div>
      <div>
        <p>© 2024 云幕游戏商店. All rights reserved.</p>
        <p style={{ color: '#888', fontSize: '12px' }}>
          发现精彩游戏，开启无限可能
        </p>
      </div>
    </AntFooter>
  )
}

export default Footer