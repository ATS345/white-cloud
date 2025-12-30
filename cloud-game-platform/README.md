# 云游戏平台

## 项目介绍

云游戏平台是一个基于React + TypeScript + Vite构建的现代化游戏分发平台，用户可以浏览、搜索、下载和管理游戏。

## 功能特性

- 🔍 **游戏搜索**：支持关键词搜索和实时搜索建议
- 📦 **游戏分类**：多种游戏分类，包括动作游戏、角色扮演、策略游戏等
- 🔥 **热门游戏**：展示热门游戏排行榜
- 🆕 **新游推荐**：展示最新上线的游戏
- 💾 **游戏库**：管理已购买的游戏
- 📥 **下载管理**：实时监控游戏下载进度
- ♿ **无障碍支持**：支持高对比度、大字体、深色模式等无障碍设置
- 🔔 **通知系统**：接收游戏更新和活动通知
- 📱 **响应式设计**：适配桌面端、平板和移动端

## 技术栈

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
| ESLint | ^9.39.1 | 代码质量检查 |

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 通用组件
├── hooks/            # 自定义Hook
├── lib/              # 工具库
├── pages/            # 页面组件
├── routes/           # 路由配置
├── services/         # API服务
├── store/            # Redux状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
├── App.tsx           # 应用入口组件
├── App.css           # 应用样式
├── index.tsx         # 应用挂载
└── index.css         # 全局样式
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码质量检查

```bash
npm run lint
```

### 类型检查

```bash
npx tsc -b
```

## 环境变量

| 变量名 | 用途 | 默认值 |
| --- | --- | --- |
| VITE_API_BASE_URL | API基础URL | /api |

## 部署指南

### 构建生产版本

```bash
npm run build
```

### 部署到静态服务器

将`dist`目录下的文件部署到静态服务器（如Nginx、Apache、GitHub Pages、Vercel等）。

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-api-server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 负载均衡配置

对于高流量场景，建议使用负载均衡器分发请求，提高系统可用性和性能。

#### Nginx负载均衡配置

```nginx
# 上游服务器配置
upstream game_platform_servers {
    server server1:80 weight=1 max_fails=3 fail_timeout=30s;
    server server2:80 weight=1 max_fails=3 fail_timeout=30s;
    server server3:80 weight=1 max_fails=3 fail_timeout=30s;
}

# 负载均衡服务器配置
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://game_platform_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 安全防护配置

#### 1. HTTPS配置

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SSL证书配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    # 强制HTTP跳转到HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理配置
    location /api {
        proxy_pass http://your-api-server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP跳转到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

#### 2. 安全头配置

```nginx
server {
    # ... 其他配置 ...

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.your-domain.com" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
}
```

#### 3. 限流配置

```nginx
http {
    # ... 其他配置 ...

    # 限流配置
    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
}

server {
    # ... 其他配置 ...

    location / {
        limit_req zone=mylimit burst=20 nodelay;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 4. 防火墙配置

建议在服务器上配置防火墙，只开放必要的端口：

```bash
# 允许SSH连接
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许HTTP和HTTPS连接
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许回环接口
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 拒绝所有其他入站连接
iptables -P INPUT DROP
```

## 开发规范

### 代码风格

- 使用TypeScript进行开发，添加完整的类型定义
- 遵循ESLint规则，保持代码风格一致
- 使用函数组件和React Hooks
- 使用Redux Toolkit进行状态管理
- 使用React Query进行数据获取和缓存

### 命名规范

- 组件名：使用PascalCase（如`GameCard`）
- 文件名：使用PascalCase（如`GameCard.tsx`）
- 变量名：使用camelCase（如`gameList`）
- 常量名：使用大写字母和下划线（如`MAX_DOWNLOAD_SPEED`）

### 注释规范

- 组件和函数添加JSDoc注释
- 复杂逻辑添加单行或多行注释
- 注释使用中文

## 测试

### 单元测试

```bash
npm run test:unit
```

### 集成测试

```bash
npm run test:integration
```

### 端到端测试

```bash
npm run test:e2e
```

## 贡献指南

1. Fork本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目团队：

- 邮箱：your-email@example.com
- GitHub：https://github.com/your-username/cloud-game-platform
- Gitee：https://gitee.com/your-username/cloud-game-platform

## 更新日志

### v1.0.0 (2025-12-30)

- 首次发布
- 实现基本的游戏浏览、搜索、下载功能
- 支持无障碍设置
- 响应式设计
- 实时下载管理

