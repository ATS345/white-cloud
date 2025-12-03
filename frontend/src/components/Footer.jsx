import React from 'react'
import { Container, Typography, Box, Grid, Link, Divider } from '@mui/material'
import { GitHub, Twitter, Instagram, Facebook } from '@mui/icons-material'

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#1e293b', color: 'white', py: 6, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ mb: 2, color: '#6366f1', fontWeight: 'bold' }}>
              木鱼游戏
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
              木鱼游戏平台是一个专业的游戏分发平台，提供海量优质游戏下载、购买和社区服务。
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' } }}>
                <Twitter />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' } }}>
                <Facebook />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' } }}>
                <Instagram />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' } }}>
                <GitHub />
              </Link>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ mb: 2, color: '#6366f1', fontWeight: 'bold' }}>
              快速链接
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                首页
              </Link>
              <Link href="/games" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                游戏商城
              </Link>
              <Link href="/library" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                游戏库
              </Link>
              <Link href="/developer" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                开发者中心
              </Link>
              <Link href="/download" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                客户端下载
              </Link>
            </Box>
          </Grid>

          {/* Support Section */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ mb: 2, color: '#6366f1', fontWeight: 'bold' }}>
              支持与服务
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                帮助中心
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                联系我们
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                常见问题
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                隐私政策
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { color: '#6366f1' }, fontSize: '0.9rem' }}>
                用户协议
              </Link>
            </Box>
          </Grid>

          {/* Newsletter Section */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ mb: 2, color: '#6366f1', fontWeight: 'bold' }}>
              订阅更新
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
              订阅我们的新闻通讯，获取最新游戏资讯和优惠活动。
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="email"
                placeholder="您的邮箱"
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none',
                  flexGrow: 1,
                  fontSize: '0.9rem'
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: '#4f46e5'
                  }
                }}
              >
                订阅
              </button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright */}
        <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          © {new Date().getFullYear()} 木鱼游戏平台. 保留所有权利.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer