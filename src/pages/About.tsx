import { Row, Col, Card, Typography, Timeline, Statistic } from 'antd'
import { TeamOutlined, RocketOutlined, TrophyOutlined, GlobalOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const About = () => {
  const stats = [
    {
      title: '注册用户',
      value: 1000000,
      suffix: '+',
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#667eea' }} />
    },
    {
      title: '游戏数量',
      value: 5000,
      suffix: '+',
      icon: <RocketOutlined style={{ fontSize: '32px', color: '#764ba2' }} />
    },
    {
      title: '合作伙伴',
      value: 200,
      suffix: '+',
      icon: <TrophyOutlined style={{ fontSize: '32px', color: '#667eea' }} />
    },
    {
      title: '覆盖国家',
      value: 50,
      suffix: '+',
      icon: <GlobalOutlined style={{ fontSize: '32px', color: '#764ba2' }} />
    }
  ]

  const milestones = [
    {
      year: '2020',
      title: '平台成立',
      description: '云幕游戏商店正式成立，开启游戏平台之旅'
    },
    {
      year: '2021',
      title: '用户突破百万',
      description: '注册用户数量突破100万，成为知名游戏平台'
    },
    {
      year: '2022',
      title: '全球扩张',
      description: '业务扩展至全球50多个国家和地区'
    },
    {
      year: '2023',
      title: '生态完善',
      description: '构建完整的游戏生态系统，服务数百万玩家'
    },
    {
      year: '2024',
      title: '持续创新',
      description: '不断推出新功能，提升用户体验'
    }
  ]

  const values = [
    {
      icon: <SafetyOutlined style={{ fontSize: '40px', color: '#667eea' }} />,
      title: '用户至上',
      description: '始终将用户体验放在首位，提供优质服务'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '40px', color: '#764ba2' }} />,
      title: '持续创新',
      description: '不断探索新技术，为用户带来更好的体验'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '40px', color: '#667eea' }} />,
      title: '合作共赢',
      description: '与游戏开发商和发行商建立长期合作关系'
    }
  ]

  return (
    <div style={{ padding: '40px 20px', background: '#f8f9fa', minHeight: 'calc(100vh - 64px - 70px)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={1} style={{ marginBottom: '20px' }}>
            关于云幕
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            云幕游戏商店致力于为全球玩家提供最优质的游戏体验，连接玩家与精彩游戏世界
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} style={{ marginBottom: '60px' }}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                className="card-hover"
                style={{ 
                  textAlign: 'center',
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  {stat.icon}
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{ color: '#667eea', fontSize: '36px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Card style={{ marginBottom: '60px', borderRadius: '12px' }}>
          <Title level={2} style={{ marginBottom: '40px', textAlign: 'center' }}>
            发展历程
          </Title>
          <Timeline
            mode="left"
            items={milestones.map((milestone) => ({
              label: milestone.year,
              children: (
                <div>
                  <Title level={4}>{milestone.title}</Title>
                  <Paragraph>{milestone.description}</Paragraph>
                </div>
              )
            }))}
          />
        </Card>

        <div style={{ marginBottom: '60px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            核心价值
          </Title>
          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} md={8} key={index}>
                <Card 
                  className="card-hover"
                  style={{ 
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ marginBottom: '20px' }}>
                    {value.icon}
                  </div>
                  <Title level={3}>{value.title}</Title>
                  <Paragraph style={{ color: '#666' }}>
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Card style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: '20px' }}>
            加入我们的团队
          </Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '30px' }}>
            我们正在寻找充满激情的人才，一起打造更好的游戏平台
          </Paragraph>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)' }}>
            邮箱: careers@yunmu.com
          </Paragraph>
        </Card>
      </div>
    </div>
  )
}

export default About