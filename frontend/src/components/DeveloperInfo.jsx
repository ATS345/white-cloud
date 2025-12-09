import React from 'react'
import {
  Typography,
  Box,
  Paper,
  Avatar
} from '@mui/material'

const DeveloperInfo = ({ developer }) => {
  if (!developer) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          暂无开发者信息
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          开发者信息
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: '#6366f1' }}
          >
            {developer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
              {developer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {developer.description}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default DeveloperInfo