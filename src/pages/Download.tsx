import { useState } from 'react'
import { Card, Row, Col, Button, Typography, Steps, Progress, Alert, Space, Divider } from 'antd'
import { DownloadOutlined, WindowsOutlined, AppleOutlined, AndroidOutlined, CheckCircleOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

interface DownloadItem {
  platform: string
  version: string
  size: string
  icon: React.ReactNode
  status: 'idle' | 'downloading' | 'completed'
  progress: number
}

const Download = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      platform: 'Windows',
      version: 'v1.0.0',
      size: '125 MB',
      icon: <WindowsOutlined style={{ fontSize: '48px', color: '#0078D7' }} />,
      status: 'idle',
      progress: 0
    },
    {
      platform: 'macOS',
      version: 'v1.0.0',
      size: '132 MB',
      icon: <AppleOutlined style={{ fontSize: '48px', color: '#999' }} />,
      status: 'idle',
      progress: 0
    },
    {
      platform: 'Android',
      version: 'v1.0.0',
      size: '85 MB',
      icon: <AndroidOutlined style={{ fontSize: '48px', color: '#3DDC84' }} />,
      status: 'idle',
      progress: 0
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)

  const handleDownload = (index: number) => {
    const newDownloads = [...downloads]
    newDownloads[index].status = 'downloading'
    setDownloads(newDownloads)

    const interval = setInterval(() => {
      setDownloads(prev => {
        const updated = [...prev]
        if (updated[index].progress < 100) {
          updated[index].progress += Math.random() * 15
          if (updated[index].progress > 100) updated[index].progress = 100
        } else {
          updated[index].status = 'completed'
          clearInterval(interval)
        }
        return updated
      })
    }, 500)
  }

  const downloadSteps = [
    {
      title: '选择平台',
      description: '选择适合您设备的平台版本'
    },
    {
      title: '下载客户端',
      description: '点击下载按钮开始下载'
    },
    {
      title: '安装应用',
      description: '运行安装程序完成安装'
    },
    {
      title: '开始使用',
      description: '登录账号开始游戏之旅'
    }
  ]

  const systemRequirements = {
    windows: {
      title: 'Windows 系统要求',
      requirements: [
        '操作系统: Windows 10 或更高版本',
        '处理器: Intel Core i5 或同等性能',
        '内存: 4GB RAM (推荐 8GB)',
        '存储空间: 2GB 可用空间',
        '网络: 宽带互联网连接'
      ]
    },
    mac: {
      title: 'macOS 系统要求',
      requirements: [
        '操作系统: macOS 10.15 或更高版本',
        '处理器: Intel Core i5 或 Apple Silicon',
        '内存: 4GB RAM (推荐 8GB)',
        '存储空间: 2GB 可用空间',
        '网络: 宽带互联网连接'
      ]
    }
  }

  return (
    <div style={{ padding: '40px 20px', background: '#f8f9fa', minHeight: 'calc(100vh - 64px - 70px)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <Title level={1} style={{ marginBottom: '20px' }}>
            下载云幕游戏商店
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            选择适合您设备的版本，开始您的游戏之旅
          </Paragraph>
        </div>

        <Alert
          message="安全下载保障"
          description="所有下载文件均经过严格安全检测，确保您的设备安全无忧"
          type="info"
          showIcon
          style={{ marginBottom: '40px', borderRadius: '8px' }}
        />

        <Row gutter={[32, 32]} style={{ marginBottom: '60px' }}>
          {downloads.map((item, index) => (
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
                  {item.icon}
                </div>
                <Title level={3}>{item.platform}</Title>
                <Space direction="vertical" size="small" style={{ marginBottom: '20px', width: '100%' }}>
                  <Text type="secondary">版本: {item.version}</Text>
                  <Text type="secondary">大小: {item.size}</Text>
                </Space>
                
                {item.status === 'idle' && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(index)}
                    style={{ 
                      width: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    立即下载
                  </Button>
                )}
                
                {item.status === 'downloading' && (
                  <div style={{ width: '100%' }}>
                    <Progress 
                      percent={Math.round(item.progress)} 
                      status="active"
                      strokeColor={{
                        '0%': '#667eea',
                        '100%': '#764ba2',
                      }}
                    />
                    <Text type="secondary">下载中... {Math.round(item.progress)}%</Text>
                  </div>
                )}
                
                {item.status === 'completed' && (
                  <div style={{ width: '100%' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '10px' }} />
                    <div style={{ color: '#52c41a', fontWeight: 'bold', marginBottom: '10px' }}>
                      下载完成
                    </div>
                    <Button type="primary" size="large" style={{ width: '100%' }}>
                      安装应用
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        <div style={{ marginBottom: '60px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            下载步骤
          </Title>
          <Steps current={currentStep} onChange={setCurrentStep} style={{ marginBottom: '40px' }}>
            {downloadSteps.map((step, index) => (
              <Step key={index} title={step.title} description={step.description} />
            ))}
          </Steps>
        </div>

        <Row gutter={[32, 32]} style={{ marginBottom: '60px' }}>
          <Col xs={24} md={12}>
            <Card 
              title={systemRequirements.windows.title}
              style={{ borderRadius: '12px', height: '100%' }}
            >
              <ul style={{ paddingLeft: '20px' }}>
                {systemRequirements.windows.requirements.map((req, index) => (
                  <li key={index} style={{ marginBottom: '8px', color: '#666' }}>
                    {req}
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={systemRequirements.mac.title}
              style={{ borderRadius: '12px', height: '100%' }}
            >
              <ul style={{ paddingLeft: '20px' }}>
                {systemRequirements.mac.requirements.map((req, index) => (
                  <li key={index} style={{ marginBottom: '8px', color: '#666' }}>
                    {req}
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>

        <Card style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <SafetyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                安全可靠
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                所有下载文件经过多重安全检测，确保您的设备安全
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <ThunderboltOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                极速下载
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                采用CDN加速技术，享受闪电般的下载速度
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <CheckCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                简单易用
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)' }}>
                一键下载安装，无需复杂配置，即刻开始使用
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default Download