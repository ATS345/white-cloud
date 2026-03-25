import { useState } from 'react'
import { Card, Row, Col, Button, Typography, Steps, Progress, Alert, Space, Divider, message, Modal } from 'antd'
import { DownloadOutlined, WindowsOutlined, AppleOutlined, AndroidOutlined, CheckCircleOutlined, SafetyOutlined, ThunderboltOutlined, FolderOpenOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

interface DownloadItem {
  platform: string
  version: string
  size: string
  icon: React.ReactNode
  status: 'idle' | 'downloading' | 'completed'
  progress: number
  downloadUrl: string
  fileName: string
  available: boolean
}

const Download = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      platform: 'Windows',
      version: 'v1.0.0',
      size: '125 MB',
      icon: <WindowsOutlined style={{ fontSize: '48px', color: '#0078D7' }} />,
      status: 'idle',
      progress: 0,
      downloadUrl: '/downloads/yunmu-game-store-setup.exe',
      fileName: 'yunmu-game-store-setup.exe',
      available: false
    },
    {
      platform: 'macOS',
      version: 'v1.0.0',
      size: '132 MB',
      icon: <AppleOutlined style={{ fontSize: '48px', color: '#999' }} />,
      status: 'idle',
      progress: 0,
      downloadUrl: '/downloads/yunmu-game-store.dmg',
      fileName: 'yunmu-game-store.dmg',
      available: false
    },
    {
      platform: 'Android',
      version: 'v1.0.0',
      size: '85 MB',
      icon: <AndroidOutlined style={{ fontSize: '48px', color: '#3DDC84' }} />,
      status: 'idle',
      progress: 0,
      downloadUrl: '/downloads/yunmu-game-store.apk',
      fileName: 'yunmu-game-store.apk',
      available: false
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)

  const handleDownload = (index: number) => {
    const item = downloads[index]
    
    if (!item.available) {
      Modal.info({
        title: '演示环境提示',
        content: (
          <div>
            <Paragraph>当前为演示环境，安装包文件尚未部署。</Paragraph>
            <Paragraph>如需获取实际安装包，请：</Paragraph>
            <ul>
              <li>联系开发团队获取</li>
              <li>等待正式发布</li>
              <li>自行构建项目（参考项目文档）</li>
            </ul>
          </div>
        ),
        onOk() {},
      })
      return
    }
    
    const link = document.createElement('a')
    link.href = item.downloadUrl
    link.download = item.fileName
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
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
          message.success(`${item.platform} 版本下载完成！`)
        }
        return updated
      })
    }, 500)
  }

  const handleInstall = (index: number) => {
    const item = downloads[index]
    
    if (!item.available) {
      message.warning('当前为演示环境，请先获取有效的安装包文件')
      return
    }
    
    message.info('请在下载文件夹中找到安装包并双击运行安装程序')
    
    if (window.showDirectoryPicker) {
      message.info('安装程序已下载到您的下载文件夹，请手动运行安装')
    } else {
      const link = document.createElement('a')
      link.href = item.downloadUrl
      link.download = item.fileName
      link.click()
      message.success('正在重新下载安装包...')
    }
  }

  const handleOpenDownloadFolder = () => {
    message.info('请在浏览器下载管理器中查看下载文件位置')
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
          message="演示环境提示"
          description="当前为开发演示环境，安装包文件尚未部署。如需实际安装包，请联系开发团队或参考项目文档自行构建。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: '40px', borderRadius: '8px' }}
        />

        <Alert
          message="安全下载保障"
          description="所有下载文件均经过严格安全检测，确保您的设备安全无忧"
          type="success"
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  opacity: item.available ? 1 : 0.8
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  {item.icon}
                </div>
                <Title level={3}>{item.platform}</Title>
                <Space direction="vertical" size="small" style={{ marginBottom: '20px', width: '100%' }}>
                  <Text type="secondary">版本: {item.version}</Text>
                  <Text type="secondary">大小: {item.size}</Text>
                  {!item.available && <Text type="warning">演示模式</Text>}
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
                    {item.available ? '立即下载' : '演示下载'}
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
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<FolderOpenOutlined />}
                        onClick={() => handleInstall(index)}
                        style={{ width: '100%' }}
                      >
                        安装应用
                      </Button>
                      <Button 
                        size="small"
                        onClick={handleOpenDownloadFolder}
                      >
                        打开下载文件夹
                      </Button>
                    </Space>
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
