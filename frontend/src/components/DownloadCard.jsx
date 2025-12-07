import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Button, Divider } from '@mui/material'
import { Download } from '@mui/icons-material'

const DownloadCard = ({ platform, downloadInfo, gradientColors, color }) => {
  const platformNames = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux'
  }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card 
        sx={{ 
          height: '100%', 
          borderRadius: { xs: 3, md: 4 }, 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          '&:hover': {
            boxShadow: `0 20px 60px rgba(${gradientColors[0]}, 0.25)`,
            transform: 'translateY(-8px) scale(1.02)',
          }
        }}
      >
        {downloadInfo.recommended && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bgcolor: '#10b981', 
            color: 'white', 
            px: 2, 
            py: 0.5, 
            borderRadius: '0 4px 0 4px',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 1
          }}>
            推荐
          </Box>
        )}
        {/* 装饰性渐变条 */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: 4, 
          background: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
          zIndex: 1
        }} />
        <CardContent sx={{ pt: 4, pb: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(${gradientColors[0]}, 0.1) 0%, rgba(${gradientColors[1]}, 0.1) 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                background: `linear-gradient(135deg, rgba(${gradientColors[0]}, 0.2) 0%, rgba(${gradientColors[1]}, 0.2) 100%)`
              }
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontWeight: 700,
                fontSize: '1.5rem'
              }}>
                {platformNames[platform]}
              </Box>
            </Box>
          </Box>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: '#1e293b' }}>
            {platformNames[platform]}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: `rgba(${gradientColors[0]}, 0.2)` }} />
          <Box sx={{ mb: 3, p: 3, bgcolor: `rgba(${gradientColors[0]}, 0.05)`, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.875rem' }}>
              版本
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: color, fontSize: '1.25rem' }}>
              {downloadInfo.version}
            </Typography>
          </Box>
          <Box sx={{ mb: 4, p: 3, bgcolor: `rgba(${gradientColors[0]}, 0.05)`, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.875rem' }}>
              大小
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {downloadInfo.size}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Download />}
            sx={{ 
              borderRadius: 2, 
              bgcolor: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`, 
              '&:hover': { 
                bgcolor: `linear-gradient(135deg, ${gradientColors[1]} 0%, ${gradientColors[0]} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 10px 25px rgba(${gradientColors[0]}, 0.4)`
              },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: `0 4px 15px rgba(${gradientColors[0]}, 0.3)`,
              transition: 'all 0.3s ease'
            }}
          >
            立即下载
          </Button>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default DownloadCard