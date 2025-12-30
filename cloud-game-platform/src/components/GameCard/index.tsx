import React, { useState } from 'react';
import { Card, Button, Tag } from 'antd';
import { DownloadOutlined, StarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './index.css';

// 游戏类型定义
export interface Game {
  id: number;
  name: string;
  type: string;
  rating: number;
  price: number;
  images?: string[];
  tags?: string[];
  releaseDate?: string;
}

interface GameCardProps {
  game: Game;
  type: 'hot' | 'new' | 'discount';
}

const GameCard: React.FC<GameCardProps> = ({ game, type }) => {
  // 直接在state初始化时计算折扣，使用函数式初始化确保只执行一次
  const [discount] = useState(() => {
    if (type === 'discount' && game.price > 0) {
      return Math.floor(Math.random() * 50) + 10;
    }
    return 0;
  });
  
  // 根据折扣计算最终价格
  const discountedPrice = discount > 0 ? Math.round(game.price * (1 - discount / 100)) : game.price;

  return (
    <Link to={`/game/${game.id}`} className="game-link">
      <Card
        hoverable
        cover={
          <div className="game-card-cover">
            <img 
              alt={game.name} 
              src={game.images?.[0] || `https://picsum.photos/seed/game${game.id}/400/250`} 
              className="game-card-image" 
              loading="lazy"
            />
            {/* 标签 */}
            {type === 'new' && <div className="game-badge new">新品</div>}
            {type === 'hot' && <div className="game-badge hot">热门</div>}
            {discount > 0 && (
              <div className="game-badge discount">
                {discount}% 折扣
              </div>
            )}
            {/* 悬停按钮 */}
            <div className="game-card-overlay">
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                className="game-card-button"
              >
                {game.price === 0 ? '下载' : '购买'}
              </Button>
            </div>
          </div>
        }
        className="game-card"
      >
        <Card.Meta
          title={
            <div className="game-card-title">
              {game.name}
            </div>
          }
          description={
            <>
              {/* 游戏类型和评分 */}
              <div className="game-card-meta">
                <Tag color="primary" className="game-type-tag">
                  {game.type}
                </Tag>
                <div className="game-rating">
                  <StarOutlined className="rating-icon" />
                  <span className="rating-value">{game.rating || 4.5}</span>
                </div>
              </div>
              
              {/* 价格信息 */}
              <div className="game-price-container">
                {game.price === 0 ? (
                  <span className="price-free">免费</span>
                ) : discount > 0 ? (
                  <>
                    <span className="price-original">¥{game.price}</span>
                    <span className="price-discounted">¥{discountedPrice}</span>
                  </>
                ) : (
                  <span className="price-normal">¥{game.price}</span>
                )}
              </div>
              
              {/* 游戏标签 */}
              {game.tags && game.tags.length > 0 && (
                <div className="game-tags-container">
                  {game.tags.slice(0, 3).map((tag, index) => (
                    <Tag key={index} className="game-tag">
                      {tag}
                    </Tag>
                  ))}
                  {game.tags.length > 3 && (
                    <Tag className="game-tag more">+{game.tags.length - 3}</Tag>
                  )}
                </div>
              )}
            </>
          }
        />
      </Card>
    </Link>
  );
};

export default GameCard;