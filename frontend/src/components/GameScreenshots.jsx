import React from 'react'
import {
  Typography,
  Box,
  Grid,
  Paper
} from '@mui/material'

const GameScreenshots = ({ screenshots }) => {
  // 如果没有提供截图数据，使用默认数据
  const displayScreenshots = screenshots || [1, 2, 3, 4]

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        游戏截图
      </Typography>
      <Grid container spacing={3}>
        {displayScreenshots.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 1, borderRadius: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  bgcolor: '#1e293b',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {typeof item === 'number' ? `游戏截图 ${item}` : item.title}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default GameScreenshots