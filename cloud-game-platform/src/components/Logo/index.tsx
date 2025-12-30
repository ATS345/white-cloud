import React from 'react';
import './index.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  className = '',
  showText = true,
}) => {
  return (
    <div className={`logo-container ${size} ${className}`}>
      {/* 云朵LOGO SVG */}
      <svg
        className="cloud-logo"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-color)" />
            <stop offset="100%" stopColor="var(--primary-light)" />
          </linearGradient>
          <linearGradient id="cloudShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* 主体云朵 */}
        <path
          d="M 30 60 Q 30 45 45 45 Q 50 40 55 45 Q 70 45 70 60 Q 70 75 55 75 Q 50 80 45 75 Q 30 75 30 60 Z"
          fill="url(#cloudGradient)"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
          filter="drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))"
        />
        
        {/* 云朵高光 */}
        <path
          d="M 35 55 Q 35 50 40 50 Q 45 47 50 50 Q 55 50 55 55 Q 55 60 50 60 Q 45 63 40 60 Q 35 60 35 55 Z"
          fill="url(#cloudShadow)"
          opacity="0.8"
        />
        
        {/* 装饰元素 - 星星 */}
        <g className="logo-stars">
          <path
            d="M 40 50 L 41 53 L 44 53 L 42 55 L 43 58 L 40 56 L 37 58 L 38 55 L 36 53 L 39 53 Z"
            fill="white"
            opacity="0.9"
            transform="scale(0.8)"
          />
          <path
            d="M 55 55 L 56 58 L 59 58 L 57 60 L 58 63 L 55 61 L 52 63 L 53 60 L 51 58 L 54 58 Z"
            fill="white"
            opacity="0.9"
            transform="scale(0.6)"
          />
          <path
            d="M 45 65 L 46 68 L 49 68 L 47 70 L 48 73 L 45 71 L 42 73 L 43 70 L 41 68 L 44 68 Z"
            fill="white"
            opacity="0.9"
            transform="scale(0.7)"
          />
        </g>
      </svg>
      
      {/* 品牌文字 */}
      {showText && (
        <span className="logo-text">
          云朵游戏
        </span>
      )}
    </div>
  );
};

export default Logo;