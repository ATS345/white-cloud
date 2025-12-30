# 云游戏平台 - 实现细节与使用方法

## 1. 项目概述

云游戏平台是一个基于React + TypeScript + Vite构建的现代化游戏分发平台，用户可以浏览、搜索、下载和管理游戏。本文档详细说明项目的实现细节和使用方法。

## 2. 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| React | ^19.2.0 | 前端框架 |
| TypeScript | ~5.9.3 | 类型系统 |
| Vite | ^7.2.5 | 构建工具 |
| Redux Toolkit | ^2.11.2 | 状态管理 |
| React Query | ^5.90.15 | 数据获取和缓存 |
| Ant Design | ^6.1.3 | UI组件库 |
| Axios | ^1.13.2 | HTTP客户端 |
| React Router | ^7.11.0 | 路由管理 |
| Vitest | ^4.0.16 | 单元测试框架 |
| Sentry | ^7.137.1 | 错误和性能监控 |

## 3. 实现细节

### 3.1 Vite配置优化

#### 3.1.1 功能说明

优化Vite配置，进一步拆分Ant Design组件，减小chunk大小，提高页面加载性能。

#### 3.1.2 实现方案

在`vite.config.ts`中配置`manualChunks`，将不同类型的Ant Design组件拆分为独立的chunk：

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // React相关依赖
        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
          return 'react-vendor'
        }
        
        // Redux和React Query
        if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
          return 'redux-vendor'
        }
        if (id.includes('@tanstack/react-query')) {
          return 'react-query'
        }
        
        // 进一步精细化拆分Ant Design组件
        if (id.includes('antd') && id.includes('icon')) {
          return 'antd-icons'
        }
        if (id.includes('antd') && (id.includes('modal') || id.includes('drawer') || id.includes('popover') || id.includes('tooltip'))) {
          return 'antd-overlays'
        }
        if (id.includes('antd') && (id.includes('form') || id.includes('input') || id.includes('select'))) {
          return 'antd-form'
        }
        if (id.includes('antd') && (id.includes('table') || id.includes('pagination') || id.includes('list'))) {
          return 'antd-data'
        }
        if (id.includes('antd') && (id.includes('menu') || id.includes('tabs'))) {
          return 'antd-navigation'
        }
        if (id.includes('antd')) {
          return 'antd-core'
        }
      }
    }
  }
}
```

#### 3.1.3 优化效果

- 主入口文件：118.43 kB
- React相关依赖：203.37 kB
- Ant Design组件：拆分为多个chunk，如antd-form(936.91 kB)、antd-overlays(24.88 kB)等
- 提高了页面加载性能，特别是首次加载时间

### 3.2 Vitest单元测试框架

#### 3.2.1 功能说明

配置Vitest单元测试框架，编写核心组件测试用例，确保代码质量和功能正确性。

#### 3.2.2 配置与使用

1. **安装依赖**

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

2. **配置文件**

- `vitest.config.ts`：Vitest配置
- `src/setupTests.ts`：测试环境设置

3. **运行测试**

```bash
# 运行所有测试
npm run test

# 运行所有测试（无监控）
npm run test:run

# 生成测试覆盖率报告
npm run test:coverage

# 启动测试UI
npm run test:ui
```

4. **编写测试用例**

在组件目录下创建`.test.tsx`文件，编写测试用例，例如：

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameCard, { type Game } from './index';

describe('GameCard Component', () => {
  const mockGame: Game = {
    id: 1,
    name: 'Test Game',
    type: 'Action',
    rating: 4.5,
    price: 99,
    images: ['https://example.com/game1.jpg'],
    tags: ['Action', 'Adventure', 'Open World', 'RPG'],
    releaseDate: '2025-12-30'
  };

  it('should render game information correctly', () => {
    render(
      <MemoryRouter>
        <GameCard game={mockGame} type='hot' />
      </MemoryRouter>
    );
    
    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
    expect(screen.getByText(`${mockGame.rating}`)).toBeInTheDocument();
    expect(screen.getByText(`¥${mockGame.price}`)).toBeInTheDocument();
  });
});
```

### 3.3 Sentry监控系统

#### 3.3.1 功能说明

集成Sentry监控系统，实现错误监控和性能监控，及时发现和解决生产环境中的问题。

#### 3.3.2 配置与使用

1. **安装依赖**

```bash
npm install -D @sentry/react @sentry/tracing
```

2. **配置**

在`src/main.tsx`中初始化Sentry：

```typescript
import * as Sentry from '@sentry/react'

// 初始化Sentry监控系统
if (import.meta.env.VITE_ENV === 'production') {
  Sentry.init({
    // 请替换为您的真实Sentry DSN
    dsn: import.meta.env.VITE_SENTRY_DSN || 'https://example@sentry.io/123456',
    environment: import.meta.env.VITE_ENV || 'production',
    tracesSampleRate: 1.0,
  })
}
```

3. **环境变量**

在`.env`文件中配置Sentry DSN：

```
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3.4 GitHub Actions CI/CD

#### 3.4.1 功能说明

配置GitHub Actions CI/CD流程，实现自动化构建、测试和部署，提高开发效率和代码质量。

#### 3.4.2 配置与使用

1. **配置文件**

`.github/workflows/ci-cd.yml`：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'
        cache: 'npm'
    - name: Install dependencies
      run: npm install
    - name: Run lint
      run: npm run lint
    - name: Run TypeScript check
      run: npx tsc -b
    - name: Run tests
      run: npm run test:run
    - name: Build production
      run: npm run build
    - name: Upload production build
      uses: actions/upload-artifact@v4
      with:
        name: build
        path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
    steps:
    - name: Download production build
      uses: actions/download-artifact@v4
      with:
        name: build
        path: dist
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        force_orphan: true
        publish_branch: gh-pages
```

2. **使用说明**

- 当代码推送到`main`或`master`分支时，自动触发CI/CD流程
- 流程包括：安装依赖、运行lint、TypeScript检查、测试、构建和部署
- 部署完成后，项目将自动部署到GitHub Pages

### 3.5 Nginx配置

#### 3.5.1 功能说明

编写完整的Nginx配置文件，包括HTTP/HTTPS配置、静态资源处理、API代理、安全头配置、缓存和限流等功能，供正式服务器部署使用。

#### 3.5.2 配置与使用

1. **配置文件**

`nginx.conf`：

```nginx
# 云游戏平台Nginx配置文件

user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# 工作进程配置
events {
    worker_connections  1024;
    use epoll;
    accept_mutex on;
}

# HTTP核心配置
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

    # 安全头配置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.cloud-game-platform.com;" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

    # 云游戏平台服务器配置
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL证书配置
        ssl_certificate /etc/nginx/ssl/your-domain.com.pem;
        ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
        ssl_prefer_server_ciphers on;

        # 静态资源配置
        location / {
            limit_req zone=mylimit burst=20 nodelay;
            root /var/www/cloud-game-platform/dist;
            index index.html;
            try_files $uri $uri/ /index.html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API代理配置
        location /api {
            proxy_pass https://api.cloud-game-platform.com;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
        }
    }
}
```

2. **使用说明**

- 将`nginx.conf`复制到服务器的`/etc/nginx`目录
- 修改配置文件中的域名、SSL证书路径和API代理地址
- 重启Nginx服务：`sudo systemctl restart nginx`

## 4. 环境变量配置

### 4.1 环境变量模板

`.env.example`：

```
# API配置
VITE_API_BASE_URL=/api

# 环境配置
VITE_ENV=development

# 安全配置
VITE_CSRF_TOKEN_ENABLED=false

# 监控配置
VITE_MONITORING_ENABLED=false
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# 特性开关
VITE_FEATURE_NEW_GAME=true
VITE_FEATURE_DISCOUNT_GAME=true
VITE_FEATURE_ACCESSIBILITY=true
```

### 4.2 生产环境配置

`.env`：

```
# API配置
VITE_API_BASE_URL=https://api.cloud-game-platform.com

# 环境配置
VITE_ENV=production

# 安全配置
VITE_CSRF_TOKEN_ENABLED=true

# 监控配置
VITE_MONITORING_ENABLED=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# 特性开关
VITE_FEATURE_NEW_GAME=true
VITE_FEATURE_DISCOUNT_GAME=true
VITE_FEATURE_ACCESSIBILITY=true
```

## 5. 部署指南

### 5.1 构建生产版本

```bash
npm run build
```

### 5.2 部署到服务器

1. **复制构建文件**

```bash
# 将dist目录复制到服务器
scp -r dist/* user@your-server:/var/www/cloud-game-platform/dist
```

2. **配置Nginx**

- 复制`nginx.conf`到服务器的`/etc/nginx`目录
- 修改配置文件中的域名、SSL证书路径和API代理地址
- 重启Nginx服务：`sudo systemctl restart nginx`

### 5.3 自动化部署

使用GitHub Actions CI/CD流程，自动构建和部署到GitHub Pages。

## 6. 开发指南

### 6.1 安装依赖

```bash
npm install
```

### 6.2 启动开发服务器

```bash
npm run dev
```

### 6.3 代码质量检查

```bash
# 运行ESLint
npm run lint

# 运行TypeScript检查
npx tsc -b
```

### 6.4 运行测试

```bash
# 运行所有测试
npm run test

# 生成测试覆盖率报告
npm run test:coverage
```

## 7. 最佳实践

### 7.1 代码规范

- 使用TypeScript进行开发，添加完整的类型定义
- 遵循ESLint规则，保持代码风格一致
- 使用函数组件和React Hooks
- 使用Redux Toolkit进行状态管理
- 使用React Query进行数据获取和缓存

### 7.2 测试规范

- 为核心组件编写单元测试
- 为关键功能编写集成测试
- 为主要用户流程编写端到端测试
- 保持测试覆盖率≥80%

### 7.3 性能优化

- 对大型组件使用动态导入
- 合理拆分第三方库，优化chunk大小
- 使用Lazy Loading加载图片和资源
- 优化API请求，使用缓存机制

### 7.4 安全最佳实践

- 配置安全响应头
- 使用HTTPS
- 对敏感数据进行加密
- 定期更新依赖，修复安全漏洞

## 8. 常见问题

### 8.1 构建失败

**问题**：构建失败，提示`terser not found`

**解决方案**：使用Vite默认的esbuild压缩工具，在`vite.config.ts`中设置：

```typescript
build: {
  minify: 'esbuild'
}
```

### 8.2 测试失败

**问题**：测试失败，提示`expect is not defined`

**解决方案**：在`vitest.config.ts`中启用Jest兼容模式：

```typescript
test: {
  globals: true,
  jest: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts',
}
```

### 8.3 Sentry配置错误

**问题**：Sentry配置错误，提示`reactOptions does not exist in type 'BrowserOptions'`

**解决方案**：@sentry/react v7+不再使用reactOptions配置，移除该配置项：

```typescript
Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
})
```

## 9. 未来规划

- 增加游戏直播功能
- 支持游戏云存档
- 优化移动端体验
- 增加社交功能，支持好友系统
- 完善数据分析和报表功能
- 增加更多的自动化测试
- 优化性能，提高页面加载速度

## 10. 联系方式

如有问题或建议，请联系项目团队：

- 邮箱：your-email@example.com
- GitHub：https://github.com/your-username/cloud-game-platform

## 11. 版本历史

| 版本 | 日期 | 描述 |
| --- | --- | --- |
| v1.0.0 | 2025-12-30 | 首次发布 |
| v1.1.0 | 2026-01-15 | 增加游戏直播功能 |
| v1.2.0 | 2026-02-20 | 支持游戏云存档 |
