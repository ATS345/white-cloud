import React from 'react'
import {
  Typography,
  Box,
  Paper
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

const GameVideo = () => {
  // 处理播放视频
  const handlePlayVideo = () => {
    // 这里可以添加播放视频的逻辑，比如打开视频播放器
    console.log('播放游戏预告片')
  }

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 1, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            width: '100%',
            height: 400,
            bgcolor: '#1e293b',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#334155'
            }
          }}
          onClick={handlePlayVideo}
        >
          <PlayArrowIcon sx={{ fontSize: '4rem', mr: 2, color: '#6366f1' }} />
          播放游戏预告片
        </Box>
      </Paper>
    </Box>
  )
}

export default GameVideo