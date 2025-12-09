import React from 'react'
import {
  Typography,
  Box,
  Paper,
  Grid,
  GpsFixedIcon,
  SettingsInputComponentIcon,
  MemoryIcon,
  StorageIcon
} from '@mui/material'

const SystemRequirements = ({ minimumReq, recommendedReq }) => {
  // 渲染单个配置项
  const renderRequirementItem = (icon, label, value) => {
    return (
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', ml: 1 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body1">{value}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        系统需求
      </Typography>
      <Grid container spacing={3}>
        {/* 最低配置 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              最低配置
            </Typography>
            {minimumReq ? (
              <Box>
                {renderRequirementItem(
                  <GpsFixedIcon sx={{ color: '#6366f1' }} />,
                  '操作系统',
                  minimumReq.os
                )}
                {renderRequirementItem(
                  <SettingsInputComponentIcon sx={{ color: '#6366f1' }} />,
                  '处理器',
                  minimumReq.processor
                )}
                {renderRequirementItem(
                  <MemoryIcon sx={{ color: '#6366f1' }} />,
                  '内存',
                  minimumReq.memory
                )}
                {renderRequirementItem(
                  <StorageIcon sx={{ color: '#6366f1' }} />,
                  '显卡',
                  minimumReq.graphics
                )}
                {renderRequirementItem(
                  <StorageIcon sx={{ color: '#6366f1' }} />,
                  '存储空间',
                  minimumReq.storage
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无最低配置信息
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* 推荐配置 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              推荐配置
            </Typography>
            {recommendedReq ? (
              <Box>
                {renderRequirementItem(
                  <GpsFixedIcon sx={{ color: '#6366f1' }} />,
                  '操作系统',
                  recommendedReq.os
                )}
                {renderRequirementItem(
                  <SettingsInputComponentIcon sx={{ color: '#6366f1' }} />,
                  '处理器',
                  recommendedReq.processor
                )}
                {renderRequirementItem(
                  <MemoryIcon sx={{ color: '#6366f1' }} />,
                  '内存',
                  recommendedReq.memory
                )}
                {renderRequirementItem(
                  <StorageIcon sx={{ color: '#6366f1' }} />,
                  '显卡',
                  recommendedReq.graphics
                )}
                {renderRequirementItem(
                  <StorageIcon sx={{ color: '#6366f1' }} />,
                  '存储空间',
                  recommendedReq.storage
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无推荐配置信息
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SystemRequirements