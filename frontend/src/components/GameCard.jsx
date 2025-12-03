import React from 'react'
import { Card, CardActionArea, CardMedia, CardContent, CardActions, Typography, Button, Box, Chip } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

const GameCard = ({ game, onGameClick, onAddToCart }) => {
  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(price)
  }

  // 渲染评分
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} sx={{ color: '#fbbf24', fontSize: 16 }} />
        ))}
        {hasHalfStar && (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <StarBorderIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden',
                width: '50%'
              }}
            >
              <StarIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
            </Box>
          </Box>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarBorderIcon key={`empty-${i}`} sx={{ color: '#fbbf24', fontSize: 16 }} />
        ))}
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          ({game.review_count})
        </Typography>
      </Box>
    )
  }

  return (
    <Card 
      className="game-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
        }
      }}
    >
      <CardActionArea 
        onClick={() => onGameClick(game.id)}
        sx={{ flexGrow: 1 }}
      >
        {/* 游戏主图 */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={game.main_image_url || 'https://via.placeholder.com/400x200?text=Game+Image'}
            alt={game.title}
            sx={{ objectFit: 'cover', borderRadius: 2 }}
          />
          {/* 折扣标签 */}
          {game.discount_price && game.discount_price < game.price && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 1,
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: 2
              }}
            >
              {Math.round((1 - game.discount_price / game.price) * 100)}% OFF
            </Box>
          )}
        </Box>

        <CardContent>
          {/* 游戏分类标签 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {game.categories?.slice(0, 2).map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                size="small"
                sx={{
                  backgroundColor: '#475569',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#64748b'
                  }
                }}
              />
            ))}
          </Box>

          {/* 游戏标题 */}
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {game.title}
          </Typography>

          {/* 游戏描述 */}
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
            {game.description.length > 100 ? `${game.description.substring(0, 100)}...` : game.description}
          </Typography>

          {/* 评分 */}
          {renderRating(game.rating || 0)}
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        {/* 价格 */}
        <Box>
          {game.discount_price && game.discount_price < game.price ? (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                {formatPrice(game.discount_price)}
              </Typography>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {formatPrice(game.price)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
              {formatPrice(game.price)}
            </Typography>
          )}
        </Box>

        {/* 加入购物车按钮 */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          onClick={(e) => {
            e.stopPropagation() // 防止触发卡片点击
            onAddToCart(game)
          }}
          sx={{ borderRadius: 2 }}
        >
          加入购物车
        </Button>
      </CardActions>
    </Card>
  )
}

export default GameCard