import React, { useState, useEffect } from 'react'
import { 
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, 
  MenuItem, Slider, Divider, IconButton, Paper, Chip, Autocomplete 
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { useDispatch } from 'react-redux'
import { fetchCategories, fetchTags } from '../store/gameSlice'

const GameFilter = ({ filters, onChange }) => {
  const dispatch = useDispatch()
  
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    categories: [], // 改为数组，支持多选
    tags: [], // 改为数组，支持多选
    minRating: 0,
    maxRating: 5,
    platform: '',
    releaseDate: {
      from: '',
      to: ''
    }
  })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [expanded, setExpanded] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // 初始化加载分类和标签
  useEffect(() => {
    dispatch(fetchCategories()).unwrap().then((data) => {
      setCategories(data)
    })
    
    dispatch(fetchTags()).unwrap().then((data) => {
      setTags(data)
    })
  }, [dispatch])

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setLocalFilters(prev => ({
      ...prev,
      search: e.target.value
    }))
  }

  // 处理排序方式变化
  const handleSortChange = (e) => {
    setLocalFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }))
  }

  // 处理排序顺序变化
  const handleSortOrderChange = (e) => {
    setLocalFilters(prev => ({
      ...prev,
      sortOrder: e.target.value
    }))
  }

  // 处理价格范围变化
  const handlePriceChange = (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }))
  }

  // 应用筛选
  const handleApplyFilters = () => {
    onChange(localFilters)
  }

  // 重置筛选
  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      categories: [],
      tags: [],
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      maxRating: 5,
      platform: '',
      releaseDate: {
        from: '',
        to: ''
      },
      sortBy: 'release_date',
      sortOrder: 'desc'
    }
    setLocalFilters(resetFilters)
    setSelectedCategories([])
    setSelectedTags([])
    onChange(resetFilters)
  }

  // 格式化价格
  const formatPrice = (value) => {
    return `¥${value}`
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        backgroundColor: '#1e293b',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          筛选选项
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          sx={{ color: 'white' }}
        >
          {expanded ? <ClearIcon /> : <FilterListIcon />}
        </IconButton>
      </Box>

      {expanded && (
        <>
          {/* 搜索框 - 增强版 */}
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              freeSolo
              disableClearable
              options={[]} // 这里可以添加搜索建议选项，后续可以从后端获取
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="搜索游戏"
                  variant="outlined"
                  size="small"
                  value={localFilters.search}
                  onChange={(e) => {
                    handleSearchChange(e)
                    // 实现实时搜索，延迟300ms避免频繁请求
                    clearTimeout(window.searchTimeout)
                    window.searchTimeout = setTimeout(() => {
                      handleApplyFilters()
                    }, 300)
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#475569',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94a3b8',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <IconButton onClick={handleApplyFilters} sx={{ color: '#94a3b8', ml: 1 }}>
                          <SearchIcon />
                        </IconButton>
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 2, bgcolor: '#334155' }} />

          {/* 分类筛选 - 支持多选 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              游戏分类
            </Typography>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.name}
              value={selectedCategories}
              onChange={(event, newValue) => {
                setSelectedCategories(newValue)
                setLocalFilters(prev => ({
                  ...prev,
                  categories: newValue.map(category => category.name)
                }))
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                    sx={{
                      backgroundColor: '#475569',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#64748b'
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: '#475569',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiMenuList-root': {
                      backgroundColor: '#1e293b',
                      color: 'white',
                    },
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        backgroundColor: '#334155',
                      },
                    },
                  }}
                  placeholder="选择游戏分类"
                />
              )}
            />
          </Box>

          {/* 标签筛选 - 支持多选 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              游戏标签
            </Typography>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={selectedTags}
              onChange={(event, newValue) => {
                setSelectedTags(newValue)
                setLocalFilters(prev => ({
                  ...prev,
                  tags: newValue.map(tag => tag.name)
                }))
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                    sx={{
                      backgroundColor: '#475569',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#64748b'
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: '#475569',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiMenuList-root': {
                      backgroundColor: '#1e293b',
                      color: 'white',
                    },
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        backgroundColor: '#334155',
                      },
                    },
                  }}
                  placeholder="选择游戏标签"
                />
              )}
            />
          </Box>

          {/* 价格范围 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              价格范围
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {formatPrice(localFilters.minPrice)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {formatPrice(localFilters.maxPrice)}
              </Typography>
            </Box>
            <Slider
              value={[localFilters.minPrice, localFilters.maxPrice]}
              onChange={handlePriceChange}
              min={0}
              max={1000}
              step={50}
              valueLabelDisplay="auto"
              getAriaLabel={() => '价格范围'}
              getAriaValueText={formatPrice}
              sx={{
                color: '#6366f1',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#6366f1',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#6366f1',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#475569',
                },
              }}
            />
          </Box>

          {/* 评分范围 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              评分范围
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {localFilters.minRating}
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {localFilters.maxRating}
              </Typography>
            </Box>
            <Slider
              value={[localFilters.minRating, localFilters.maxRating]}
              onChange={(event, newValue) => {
                setLocalFilters(prev => ({
                  ...prev,
                  minRating: newValue[0],
                  maxRating: newValue[1]
                }))
              }}
              min={0}
              max={5}
              step={0.5}
              valueLabelDisplay="auto"
              getAriaLabel={() => '评分范围'}
              sx={{
                color: '#f59e0b',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#f59e0b',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#f59e0b',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#475569',
                },
              }}
            />
          </Box>

          {/* 游戏平台 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              游戏平台
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={localFilters.platform}
                onChange={(e) => {
                  setLocalFilters(prev => ({
                    ...prev,
                    platform: e.target.value
                  }))
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366f1',
                    },
                  },
                  '& .MuiMenuList-root': {
                    backgroundColor: '#1e293b',
                    color: 'white',
                  },
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      backgroundColor: '#334155',
                    },
                  },
                }}
              >
                <MenuItem value="">所有平台</MenuItem>
                <MenuItem value="windows">Windows</MenuItem>
                <MenuItem value="mac">Mac</MenuItem>
                <MenuItem value="linux">Linux</MenuItem>
                <MenuItem value="ios">iOS</MenuItem>
                <MenuItem value="android">Android</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 排序选项 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8', fontWeight: 600 }}>
              排序方式
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flexGrow: 1 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>排序依据</InputLabel>
                <Select
                  label="排序依据"
                  value={localFilters.sortBy}
                  onChange={handleSortChange}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: '#475569',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiMenuList-root': {
                      backgroundColor: '#1e293b',
                      color: 'white',
                    },
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        backgroundColor: '#334155',
                      },
                    },
                  }}
                >
                  <MenuItem value="release_date">发布日期</MenuItem>
                  <MenuItem value="rating">评分</MenuItem>
                  <MenuItem value="price">价格</MenuItem>
                  <MenuItem value="review_count">评价数量</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>排序顺序</InputLabel>
                <Select
                  label="排序顺序"
                  value={localFilters.sortOrder}
                  onChange={handleSortOrderChange}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: '#475569',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiMenuList-root': {
                      backgroundColor: '#1e293b',
                      color: 'white',
                    },
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        backgroundColor: '#334155',
                      },
                    },
                  }}
                >
                  <MenuItem value="desc">降序</MenuItem>
                  <MenuItem value="asc">升序</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 2, bgcolor: '#334155' }} />

          {/* 筛选按钮 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleApplyFilters}
              sx={{ borderRadius: 1, backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
            >
              应用筛选
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleResetFilters}
              sx={{ 
                borderRadius: 1, 
                borderColor: '#6366f1', 
                color: '#6366f1',
                '&:hover': { 
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)'
                } 
              }}
            >
              重置
            </Button>
          </Box>
        </>
      )}
    </Paper>
  )
}

export default GameFilter