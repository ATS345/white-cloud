import React from 'react'
import {
  Typography,
  Box,
  Paper,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Chip
} from '@mui/material'
import CloudIcon from '@mui/icons-material/Cloud'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'

const GameDataSync = ({ syncStatus }) => {
  // 处理数据同步
  const handleSyncData = () => {
    // 这里可以添加同步数据的API调用逻辑
    console.log('开始同步数据')
  }

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudIcon />
          游戏数据同步
        </Typography>
        
        {/* 同步状态 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            同步状态
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1">
              {syncStatus.isSyncing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="primary" />
                  <span>正在同步数据...</span>
                </Box>
              ) : syncStatus.progress === 100 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981' }}>
                  <CheckCircleIcon />
                  <span>数据已同步</span>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b' }}>
                  <WarningIcon />
                  <span>数据未同步</span>
                </Box>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最后同步: {syncStatus.lastSynced}
            </Typography>
          </Box>
          
          {/* 同步进度条 */}
          <LinearProgress
            variant={syncStatus.isSyncing ? 'determinate' : 'indeterminate'}
            value={syncStatus.progress}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          
          {syncStatus.progress > 0 && !syncStatus.isSyncing && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                同步进度
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {syncStatus.progress}%
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* 同步选项 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            同步选项
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="存档"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="设置"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="成就"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="好友"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
        
        {/* 同步按钮 */}
        <Button
          variant="contained"
          size="large"
          startIcon={syncStatus.isSyncing ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          onClick={handleSyncData}
          disabled={syncStatus.isSyncing}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          {syncStatus.isSyncing ? '正在同步...' : '立即同步'}
        </Button>
      </Paper>
      
      {/* 同步历史 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          同步历史
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="游戏存档同步"
              secondary={
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>状态:</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>时间:</span>
                    <span>{syncStatus.lastSynced}</span>
                  </Box>
                </>
              }
            />
            <IconButton edge="end" aria-label="more">
              <CloudIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="成就数据同步"
              secondary={
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>状态:</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>时间:</span>
                    <span>{new Date(Date.now() - 86400000).toLocaleString('zh-CN')}</span>
                  </Box>
                </>
              }
            />
            <IconButton edge="end" aria-label="more">
              <CloudIcon />
            </IconButton>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="游戏设置同步"
              secondary={
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>状态:</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>已完成</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>时间:</span>
                    <span>{new Date(Date.now() - 172800000).toLocaleString('zh-CN')}</span>
                  </Box>
                </>
              }
            />
            <IconButton edge="end" aria-label="more">
              <CloudIcon />
            </IconButton>
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export default GameDataSync