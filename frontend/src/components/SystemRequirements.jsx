import React from 'react'
import { Paper, Grid, Typography, Box } from '@mui/material'
import { Info, Memory } from '@mui/icons-material'

const SystemRequirements = ({ platform, requirements, gradientColors, color }) => {
  const platformLabels = {
    windows: 'Win',
    mac: 'Mac',
    linux: 'Linux'
  }

  const platformNames = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux'
  }

  return (
    <Grid item xs={12} md={4}>
      <Paper 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: { xs: 3, md: 4 }, 
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 15px 40px rgba(${gradientColors[0]}, ${gradientColors[1]})`,
            transform: 'translateY(-5px)'
          }
        }}
      >
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
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
              width: 40, 
              height: 40, 
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              {platformLabels[platform]}
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {platformNames[platform]}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            background: `rgba(${gradientColors[0]}, 0.05)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `rgba(${gradientColors[0]}, 0.1)`,
              transform: 'translateX(5px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, 
              height: 32,
              borderRadius: '50%',
              background: `rgba(${gradientColors[0]}, 0.2)`,
              mt: 0.5
            }}>
              <Info sx={{ color: color, fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                操作系统
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {requirements.os}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            background: `rgba(${gradientColors[0]}, 0.05)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `rgba(${gradientColors[0]}, 0.1)`,
              transform: 'translateX(5px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, 
              height: 32,
              borderRadius: '50%',
              background: `rgba(${gradientColors[0]}, 0.2)`,
              mt: 0.5
            }}>
              <Memory sx={{ color: color, fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                处理器
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {requirements.cpu}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            background: `rgba(${gradientColors[0]}, 0.05)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `rgba(${gradientColors[0]}, 0.1)`,
              transform: 'translateX(5px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, 
              height: 32,
              borderRadius: '50%',
              background: `rgba(${gradientColors[0]}, 0.2)`,
              mt: 0.5
            }}>
              <Info sx={{ color: color, fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                内存
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {requirements.ram}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            background: `rgba(${gradientColors[0]}, 0.05)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `rgba(${gradientColors[0]}, 0.1)`,
              transform: 'translateX(5px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, 
              height: 32,
              borderRadius: '50%',
              background: `rgba(${gradientColors[0]}, 0.2)`,
              mt: 0.5
            }}>
              <Info sx={{ color: color, fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                存储空间
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {requirements.storage}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            background: `rgba(${gradientColors[0]}, 0.05)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `rgba(${gradientColors[0]}, 0.1)`,
              transform: 'translateX(5px)'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 32, 
              height: 32,
              borderRadius: '50%',
              background: `rgba(${gradientColors[0]}, 0.2)`,
              mt: 0.5
            }}>
              <Info sx={{ color: color, fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                显卡
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {requirements.gpu}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Grid>
  )
}

export default SystemRequirements