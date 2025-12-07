import React, { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Box, Button, Divider, CircularProgress, Snackbar, Alert } from '@mui/material'
import { Download, Pause, PlayArrow, CheckCircle, Error, Info } from '@mui/icons-material'
import { detectDevice, checkSystemRequirements } from '../utils/deviceDetector'
import { DownloadManager } from '../utils/downloadManager'

const DownloadCard = ({ platform, downloadInfo, gradientColors, color }) => {
  const platformNames = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux'
  }

  const [downloadStatus, setDownloadStatus] = useState('idle') // idle, downloading, paused, completed, error
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('info')
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [isCompatible, setIsCompatible] = useState(true)
  const [compatibilityMessage, setCompatibilityMessage] = useState('')

  const downloadManager = new DownloadManager()

  useEffect(() => {
    // 检测设备信息和兼容性
    const info = detectDevice()
    setDeviceInfo(info)
    
    const compatible = checkSystemRequirements(info, platform)
    setIsCompatible(compatible)
    
    if (!compatible) {
      setCompatibilityMessage(`您的${info.os.name} ${info.os.version}可能不兼容此版本，请升级系统后重试`)
    }
  }, [platform])

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.ceil(seconds)}秒`
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`
    return `${Math.ceil(seconds / 3600)}小时`
  }

  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(2)} B/s`
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`
  }

  const handleDownload = async () => {
    if (downloadStatus === 'downloading') {
      // 暂停下载
      await downloadManager.pause()
      setDownloadStatus('paused')
      return
    }
    
    if (downloadStatus === 'paused') {
      // 恢复下载
      await downloadManager.resume()
      setDownloadStatus('downloading')
      return
    }
    
    // 开始新下载
    try {
      setDownloadStatus('downloading')
      setDownloadProgress(0)
      
      await downloadManager.startDownload({
        url: downloadInfo.downloadUrl,
        filename: downloadInfo.filename,
        onProgress: (progress, speed, timeRemaining) => {
          setDownloadProgress(progress)
          setDownloadSpeed(speed)
          setRemainingTime(timeRemaining)
        },
        onComplete: () => {
          setDownloadStatus('completed')
          setSnackbarMessage('下载完成！请按照指引安装应用')
          setSnackbarSeverity('success')
          setShowSnackbar(true)
        },
        onError: (error) => {
          setDownloadStatus('error')
          setSnackbarMessage(`下载失败：${error.message}`)
          setSnackbarSeverity('error')
          setShowSnackbar(true)
        }
      })
    } catch (error) {
      setDownloadStatus('error')
      setSnackbarMessage(`下载启动失败：${error.message}`)
      setSnackbarSeverity('error')
      setShowSnackbar(true)
    }
  }

  const handleCancel = async () => {
    await downloadManager.cancel()
    setDownloadStatus('idle')
    setDownloadProgress(0)
    setDownloadSpeed(0)
    setRemainingTime(0)
  }

  const getButtonIcon = () => {
    switch (downloadStatus) {
      case 'downloading':
        return <Pause />
      case 'paused':
        return <PlayArrow />
      case 'completed':
        return <CheckCircle />
      case 'error':
        return <Error />
      default:
        return <Download />
    }
  }

  const getButtonText = () => {
    switch (downloadStatus) {
      case 'downloading':
        return '暂停下载'
      case 'paused':
        return '继续下载'
      case 'completed':
        return '下载完成'
      case 'error':
        return '重试下载'
      default:
        return '立即下载'
    }
  }

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'downloading':
        return <CircularProgress size={20} sx={{ mr: 1 }} />
      case 'completed':
        return <CheckCircle sx={{ mr: 1, color: '#10b981' }} />
      case 'error':
        return <Error sx={{ mr: 1, color: '#ef4444' }} />
      case 'paused':
        return <Pause sx={{ mr: 1, color: '#f59e0b' }} />
      default:
        return <Info sx={{ mr: 1, color: '#3b82f6' }} />
    }
  }

  const getStatusText = () => {
    switch (downloadStatus) {
      case 'downloading':
        return '下载中...'
      case 'completed':
        return '下载完成'
      case 'error':
        return '下载失败'
      case 'paused':
        return '已暂停'
      default:
        return '准备下载'
    }
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
          
          {/* 兼容性警告 */}
          {!isCompatible && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" />
                {compatibilityMessage}
              </Typography>
            </Box>
          )}
          
          {/* 下载状态显示 */}
          {downloadStatus !== 'idle' && (
            <Box sx={{ mb: 3 }}>
              {/* 状态指示器 */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {getStatusIcon()}
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {getStatusText()}
                </Typography>
              </Box>
              
              {/* 进度条 */}
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                bgcolor: `rgba(${gradientColors[0]}, 0.1)`, 
                borderRadius: 4, 
                overflow: 'hidden',
                mb: 2
              }}>
                <Box 
                  sx={{ 
                    width: `${downloadProgress}%`, 
                    height: '100%', 
                    bgcolor: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
              
              {/* 进度详情 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {downloadProgress.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {downloadSpeed > 0 && formatSpeed(downloadSpeed)} | 剩余 {formatTime(remainingTime)}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* 下载按钮 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={getButtonIcon()}
              onClick={handleDownload}
              disabled={!isCompatible}
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
              {getButtonText()}
            </Button>
            
            {/* 取消按钮 */}
            {(downloadStatus === 'downloading' || downloadStatus === 'paused') && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderRadius: 2,
                  borderColor: `rgba(${gradientColors[0]}, 0.5)`,
                  color: `rgb(${gradientColors[0]})`,
                  '&:hover': {
                    borderColor: `rgba(${gradientColors[0]}, 0.8)`,
                    bgcolor: `rgba(${gradientColors[0]}, 0.05)`
                  },
                  py: 1.5,
                  minWidth: 100
                }}
              >
                取消
              </Button>
            )}
          </Box>
          
          {/* 安装指引 */}
          {downloadStatus === 'completed' && (
            <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 600, mb: 2 }}>
                安装指引
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                1. 找到下载的文件：{downloadInfo.filename}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                2. 双击文件开始安装
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                3. 按照安装向导完成安装
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                4. 安装完成后，点击桌面图标启动应用
              </Typography>
            </Box>
          )}
          
          {/* 通知提示 */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={6000}
            onClose={() => setShowSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setShowSnackbar(false)}
              severity={snackbarSeverity}
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default DownloadCard