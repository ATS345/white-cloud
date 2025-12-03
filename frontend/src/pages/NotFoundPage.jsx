import React from 'react'
import { Container, Typography, Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <ErrorOutlineIcon sx={{ fontSize: 120, color: '#6366f1' }} />
      </Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        404 - 页面不存在
      </Typography>
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
        抱歉，您访问的页面不存在或已被移除。
      </Typography>
      <Button
        variant="contained"
        size="large"
        sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4, py: 1.5 }}
        onClick={handleGoHome}
      >
        返回首页
      </Button>
    </Container>
  )
}

export default NotFoundPage
