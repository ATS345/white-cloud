import React from 'react'
import { Container, Grid, Typography, Box, Paper, Button, Alert } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import DownloadCard from '../components/DownloadCard'
import SystemRequirements from '../components/SystemRequirements'

const DownloadClientPage = () => {
  const navigate = useNavigate()

  // 模拟下载链接（实际项目中应指向真实的下载地址）
  const downloadLinks = {
    windows: {
      url: '#',
      size: '50MB',
      version: 'v1.0.0',
      recommended: true
    },
    mac: {
      url: '#',
      size: '45MB',
      version: 'v1.0.0',
      recommended: false
    },
    linux: {
      url: '#',
      size: '40MB',
      version: 'v1.0.0',
      recommended: false
    }
  }

  // 系统要求
  const systemRequirements = {
    windows: {
      os: 'Windows 10/11 (64位)',
      cpu: 'Intel i5 8th gen 或 AMD Ryzen 5',
      ram: '8GB RAM',
      storage: '至少 2GB 可用空间',
      gpu: 'NVIDIA GeForce GTX 1050 或 AMD Radeon RX 560'
    },
    mac: {
      os: 'macOS 11 Big Sur 或更高版本',
      cpu: 'Intel Core i5 或 Apple Silicon',
      ram: '8GB RAM',
      storage: '至少 2GB 可用空间',
      gpu: '集成显卡即可'
    },
    linux: {
      os: 'Ubuntu 20.04 LTS 或其他主流发行版',
      cpu: 'Intel i5 或 AMD Ryzen 5',
      ram: '8GB RAM',
      storage: '至少 2GB 可用空间',
      gpu: 'NVIDIA GeForce GTX 1050 或 AMD Radeon RX 560'
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#6366f1' }}>
          下载木鱼游戏客户端
        </Typography>
        <Typography variant="h6" component="p" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          获取最新版本的木鱼游戏客户端，享受更流畅的游戏体验
        </Typography>
      </Box>

      {/* 左上角返回按钮 */}
      <Box sx={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.9)', 
            borderColor: 'rgba(99, 102, 241, 0.3)', 
            color: '#6366f1',
            '&:hover': { 
              borderColor: 'rgba(99, 102, 241, 0.6)',
              bgcolor: 'rgba(255, 255, 255, 1)',
              transform: 'translateY(-2px)'
            },
            borderRadius: 2,
            px: 2,
            py: 1,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          ← 返回首页
        </Button>
      </Box>
      
      {/* 客户端介绍卡片 */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 6 }, 
          borderRadius: { xs: 2, md: 4 }, 
          mb: 6, 
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
          color: 'white',
          boxShadow: '0 15px 40px rgba(99, 102, 241, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 背景装饰 */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 0
          }}
        />
        
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          {/* 左侧文本内容 */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 4,
                lineHeight: 1.2
              }}
            >
              为什么选择木鱼游戏客户端？
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 5 }}>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <CheckCircle 
                    sx={{ 
                      fontSize: 28, 
                      color: '#10b981',
                      flexShrink: 0
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    更快的下载速度
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <CheckCircle 
                    sx={{ 
                      fontSize: 28, 
                      color: '#10b981',
                      flexShrink: 0
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    自动游戏更新
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <CheckCircle 
                    sx={{ 
                      fontSize: 28, 
                      color: '#10b981',
                      flexShrink: 0
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    安全可靠的游戏库
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <CheckCircle 
                    sx={{ 
                      fontSize: 28, 
                      color: '#10b981',
                      flexShrink: 0
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    实时游戏资讯
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/download')}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white', 
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                立即下载
              </Button>
            </Box>
          </Grid>
          
          {/* 右侧图片和悬浮卡片 - 图片隐藏 */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 4, md: 0 } }}>
            <Box 
              sx={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: 450,
                transform: { md: 'translateY(10px)' }
              }}
            >

              
              {/* 装饰性元素 */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent)',
                  zIndex: 1,
                  transform: 'rotate(15deg)'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 下载区域 */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', color: '#1e293b' }}>
          选择您的平台
        </Typography>
        
        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {/* Windows 版本 */}
          <DownloadCard 
            platform="windows" 
            downloadInfo={downloadLinks.windows} 
            gradientColors={['#6366f1', '#8b5cf6']} 
            color="#6366f1" 
          />
          
          {/* Mac 版本 */}
          <DownloadCard 
            platform="mac" 
            downloadInfo={downloadLinks.mac} 
            gradientColors={['#06b6d4', '#3b82f6']} 
            color="#06b6d4" 
          />
          
          {/* Linux 版本 */}
          <DownloadCard 
            platform="linux" 
            downloadInfo={downloadLinks.linux} 
            gradientColors={['#10b981', '#34d399']} 
            color="#10b981" 
          />
        </Grid>
      </Box>

      {/* 系统要求 */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', color: '#1e293b' }}>
          系统要求
        </Typography>
        
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Windows 系统要求 */}
          <SystemRequirements 
            platform="windows" 
            requirements={systemRequirements.windows} 
            gradientColors={['#6366f1', '#8b5cf6']} 
            color="#6366f1" 
          />
          
          {/* Mac 系统要求 */}
          <SystemRequirements 
            platform="mac" 
            requirements={systemRequirements.mac} 
            gradientColors={['#06b6d4', '#3b82f6']} 
            color="#06b6d4" 
          />
          
          {/* Linux 系统要求 */}
          <SystemRequirements 
            platform="linux" 
            requirements={systemRequirements.linux} 
            gradientColors={['#10b981', '#34d399']} 
            color="#10b981" 
          />
        </Grid>
      </Box>

      {/* 安装说明 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', color: '#1e293b' }}>
          安装说明
        </Typography>
        
        <Paper 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: { xs: 3, md: 4 }, 
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 装饰性元素 */}
          <Box sx={{ 
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.05)',
            zIndex: 0
          }} />
          <Box sx={{ 
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.05)',
            zIndex: 0
          }} />
          
          <Grid container spacing={{ xs: 3, md: 6 }} sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={6}>
              {/* 步骤1 */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3, 
                background: 'rgba(99, 102, 241, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    1
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    下载安装包
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', ml: 6 }}>
                  从上方选择您的平台，点击「立即下载」按钮下载安装包。
                </Typography>
              </Box>
              
              {/* 步骤2 */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3, 
                background: 'rgba(99, 102, 241, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    2
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    运行安装程序
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', ml: 6 }}>
                  找到下载的安装包，双击运行安装程序。按照提示完成安装步骤。
                </Typography>
              </Box>
              
              {/* 步骤3 */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3, 
                background: 'rgba(99, 102, 241, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    3
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    登录您的账号
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', ml: 6 }}>
                  安装完成后，打开木鱼游戏客户端，使用您的账号登录。
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* 步骤4 */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3, 
                background: 'rgba(139, 92, 246, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 0.1)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    4
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                    开始使用
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', ml: 6 }}>
                  登录成功后，您可以浏览游戏商城，购买游戏，或者直接进入您的游戏库。
                </Typography>
              </Box>
              
              {/* 步骤5 */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3, 
                background: 'rgba(139, 92, 246, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 0.1)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.15)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    5
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                    自动更新
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', ml: 6 }}>
                  客户端会自动检查更新，确保您始终使用最新版本。
                </Typography>
              </Box>
              
              {/* 提示信息 */}
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  '& .MuiAlert-icon': {
                    color: '#3b82f6'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#3b82f6', flexShrink: 0 }}>
                    提示：
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    首次安装客户端时，可能需要一些时间进行初始化配置。
                  </Typography>
                </Box>
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* 页脚提示 */}
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="body2">
          © 2025 木鱼游戏平台. 保留所有权利.
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          木鱼游戏客户端仅适用于木鱼游戏平台购买的游戏。
        </Typography>
      </Box>
    </Container>
  )
}

export default DownloadClientPage