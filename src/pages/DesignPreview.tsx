/* ============================================
   云幕游戏商店 - 设计系统预览页面
   ============================================ */

import React from 'react';
import './styles.css';

const DesignPreview: React.FC = () => {
  const genres = ['动作', '冒险', 'RPG', '策略', '模拟'];

  return (
    <div className="preview-page">
      {/* Header */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-logo">云幕游戏商店</a>
          <nav>
            <ul className="navbar-menu">
              <li><a href="#" className="navbar-link active">首页</a></li>
              <li><a href="#" className="navbar-link">游戏库</a></li>
              <li><a href="#" className="navbar-link">下载客户端</a></li>
              <li><a href="#" className="navbar-link">关于我们</a></li>
            </ul>
          </nav>
          <div className="navbar-actions">
            <button className="btn-outline btn-sm">
              <span>登录</span>
            </button>
            <button className="btn-neon btn-sm">
              <span>注册</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">全新游戏体验</span>
            <h1 className="hero-title">
              PLAY THE
              <span className="hero-title-accent">FUTURE</span>
            </h1>
            <p className="hero-description">
              发现无限游戏可能，尽在云幕游戏商店。
              海量正版游戏，极速下载体验，安全支付保障。
            </p>
            <div className="hero-actions">
              <button className="btn-neon btn-lg">
                <span>探索游戏</span>
              </button>
              <button className="btn-outline btn-lg">
                <span>下载客户端</span>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop"
                alt="Game Preview"
              />
            </div>
          </div>
        </div>
        <div className="hero-diagonal" />
      </section>

      {/* Stats Section */}
      <section className="section-dark">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-value neon">128,456+</div>
              <div className="stat-card-label">注册用户</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value neon">3,842+</div>
              <div className="stat-card-label">精品游戏</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value neon">89,234+</div>
              <div className="stat-card-label">完成订单</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value neon">98%</div>
              <div className="stat-card-label">好评率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            <span className="neon-text">为什么选择</span> 云幕游戏
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="feature-card-title">海量正版游戏</h3>
              <p className="feature-card-desc">收录数千款国内外优质游戏，持续更新中</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon" style={{ color: '#10B981' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <h3 className="feature-card-title">安全支付保障</h3>
              <p className="feature-card-desc">支持支付宝、微信、银联等多种支付方式</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon" style={{ color: '#FF9F1C' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <h3 className="feature-card-title">CDN极速下载</h3>
              <p className="feature-card-desc">全国加速节点覆盖，享受极速下载体验</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon" style={{ color: '#FF2E63' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.92 6-4.72 7.28L13 17v5l5-5h2c0 5.5-4.5 10-10 10S0 22.5 0 17c0-4.76 3.35-8.73 7.82-9.65L10 9.5v-2c-5.32.72-9.5 5.11-9.5 10.5C.5 22.27 4.73 26 10 26c5.5 0 10-4.5 10-10V0H13v2.05z"/>
                </svg>
              </div>
              <h3 className="feature-card-title">一键管理游戏</h3>
              <p className="feature-card-desc">云端存档、自动更新，专注享受游戏乐趣</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="section-dark">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">热门游戏</h2>
            <button className="btn-outline btn-sm">查看全部</button>
          </div>
          <div className="games-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="game-card" key={i}>
                <div className="game-card-cover">
                  <img
                    src={`https://picsum.photos/seed/game${i}/400/225`}
                    alt={`Game ${i}`}
                  />
                  <div className="game-card-price">
                    <span>¥298</span>
                  </div>
                </div>
                <div className="game-card-body">
                  <div className="game-card-genre">动作 · RPG · 冒险</div>
                  <h3 className="game-card-title">黑神话：悟空</h3>
                  <div className="game-card-rating">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    <span className="game-card-rating-value">4.8</span>
                    <span className="game-card-rating-count">(12,456)</span>
                  </div>
                  <div className="game-card-footer">
                    <span className="game-card-price-text">¥298</span>
                    <button className="game-card-add-btn">加入购物车</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Tags Demo */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">筛选标签</h2>
          <div className="filter-tags">
            {genres.map((genre, i) => (
              <span
                key={genre}
                className={`tag-neon ${i === 0 ? 'active' : ''}`}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form Demo */}
      <section className="section-dark">
        <div className="container">
          <h2 className="section-title">表单组件</h2>
          <div className="form-demo">
            <div className="input-group">
              <label className="input-label">邮箱地址</label>
              <input
                type="email"
                className="input-neon"
                placeholder="请输入您的邮箱"
              />
            </div>
            <div className="input-group">
              <label className="input-label">密码</label>
              <input
                type="password"
                className="input-neon"
                placeholder="请输入密码"
              />
            </div>
            <div className="checkbox-group">
              <label className="checkbox-neon">
                <input type="checkbox" />
                <span className="checkbox-mark" />
                <span className="checkbox-label">记住我</span>
              </label>
            </div>
            <button className="btn-neon btn-lg" style={{ width: '100%' }}>
              <span>登录</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo neon-text">云幕游戏商店</div>
              <p className="footer-tagline">
                为玩家打造最佳游戏体验，发现无限游戏可能。
              </p>
            </div>
            <div>
              <h4 className="footer-column-title">产品</h4>
              <ul className="footer-links">
                <li><a href="#">游戏库</a></li>
                <li><a href="#">下载客户端</a></li>
                <li><a href="#">促销活动</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-column-title">支持</h4>
              <ul className="footer-links">
                <li><a href="#">帮助中心</a></li>
                <li><a href="#">联系我们</a></li>
                <li><a href="#">常见问题</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-column-title">法律</h4>
              <ul className="footer-links">
                <li><a href="#">服务条款</a></li>
                <li><a href="#">隐私政策</a></li>
                <li><a href="#">版权声明</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2026 云幕游戏商店. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#">隐私政策</a>
              <a href="#">服务条款</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* 预览页特殊样式 */
        .preview-page {
          background: #0D0D0D;
          color: #fff;
        }

        .section {
          padding: 80px 0;
        }

        .section-dark {
          padding: 80px 0;
          background: #16161A;
        }

        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 48px;
          text-align: center;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .form-demo {
          max-width: 400px;
          margin: 0 auto;
        }

        .checkbox-group {
          margin: 16px 0 24px;
        }

        @media (max-width: 1024px) {
          .stats-grid,
          .features-grid,
          .games-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid,
          .features-grid,
          .games-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DesignPreview;
