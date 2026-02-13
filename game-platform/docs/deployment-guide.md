# 游戏平台部署指南

## 1. 系统要求

### 1.1 前端系统要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **构建工具**: Vite

### 1.2 后端系统要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **数据库**: PostgreSQL 14.0 或更高版本
- **缓存**: Redis (可选，用于会话管理)

### 1.3 服务器要求
- **操作系统**: Ubuntu 20.04 LTS 或更高版本，或 Windows Server 2019 或更高版本
- **CPU**: 至少 2 核
- **内存**: 至少 4GB RAM
- **存储**: 至少 20GB 可用空间
- **网络**: 稳定的网络连接，开放必要的端口

## 2. 环境配置

### 2.1 前端环境配置

#### 2.1.1 安装依赖
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

#### 2.1.2 配置环境变量
创建 `.env` 文件，添加以下内容：
```env
# 前端环境变量
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
```

### 2.2 后端环境配置

#### 2.2.1 安装依赖
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install
```

#### 2.2.2 配置环境变量
创建 `.env` 文件，添加以下内容：
```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgres://username:password@localhost:5432/game_platform

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Stripe 配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# 邮件配置（可选）
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

## 3. 数据库设置

### 3.1 创建数据库
```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE game_platform;

# 创建用户并授权
CREATE USER game_platform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE game_platform TO game_platform_user;

# 退出
\q
```

### 3.2 数据库迁移
- **推荐使用**: Prisma 或 Sequelize 等 ORM 工具进行数据库迁移
- **手动迁移**: 可以使用 `database-design.md` 中的 SQL 语句手动创建表结构

## 4. 构建与部署

### 4.1 前端构建
```bash
# 进入前端目录
cd frontend

# 构建项目
npm run build

# 构建产物将生成在 dist 目录
```

### 4.2 后端构建
```bash
# 进入后端目录
cd backend

# 构建项目
npm run build

# 构建产物将生成在 dist 目录
```

### 4.3 部署方式

#### 4.3.1 方式一：使用 PM2 部署

**安装 PM2**
```bash
npm install -g pm2
```

**部署前端**
```bash
# 进入前端目录
cd frontend

# 启动前端服务器
npm run preview

# 或者使用 serve 启动
npm install -g serve
npm run build
serve dist

# 使用 PM2 管理
npm install -g pm2
npm run build
npm run preview
```

**部署后端**
```bash
# 进入后端目录
cd backend

# 启动后端服务器
npm start

# 或者使用 PM2 启动
npm run build
npm start

# 使用 PM2 管理
npm install -g pm2
npm run build
npm run start
```

#### 4.3.2 方式二：使用 Docker 部署

**创建 Dockerfile（前端）**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**创建 Dockerfile（后端）**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**创建 docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://game_platform_user:your_password@db:5432/game_platform

  db:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=game_platform
      - POSTGRES_USER=game_platform_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**启动服务**
```bash
docker-compose up -d
```

## 5. 反向代理配置

### 5.1 使用 Nginx 作为反向代理

**安装 Nginx**
```bash
sudo apt update
sudo apt install nginx
```

**创建 Nginx 配置文件**
```bash
sudo nano /etc/nginx/sites-available/game-platform
```

**添加以下配置**
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # 前端请求
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API 请求
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**启用配置**
```bash
sudo ln -s /etc/nginx/sites-available/game-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5.2 SSL 证书配置

**推荐使用 Let's Encrypt 获取免费 SSL 证书**

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期
sudo certbot renew --dry-run
```

## 6. 监控与维护

### 6.1 日志管理
- **前端日志**: 可通过 Nginx 日志查看
- **后端日志**: 可通过 PM2 日志查看

```bash
# 查看 PM2 日志
pm logs
```

### 6.2 性能监控
- **推荐使用**: New Relic、Datadog 或 Prometheus + Grafana
- **内置监控**: 前端已集成 Web Vitals 进行性能监控

### 6.3 常见问题排查

**问题 1: 前端无法连接到后端**
- 检查 `VITE_API_URL` 配置是否正确
- 检查后端服务是否运行
- 检查防火墙设置

**问题 2: 数据库连接失败**
- 检查 `DATABASE_URL` 配置是否正确
- 检查 PostgreSQL 服务是否运行
- 检查数据库用户权限

**问题 3: 支付功能不工作**
- 检查 Stripe 密钥配置是否正确
- 检查 Stripe Webhook 配置
- 检查网络连接

## 7. CI/CD 配置

### 7.1 GitHub Actions 配置

**创建 `.github/workflows/deploy.yml` 文件**

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: |
          cd frontend && npm install
          cd ../backend && npm install
          
      - name: Build frontend
        run: cd frontend && npm run build
        
      - name: Build backend
        run: cd backend && npm run build
        
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v2.1.5
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: '-rltgoDzvO --delete'
          SOURCE: 'frontend/dist/'
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: '/var/www/game-platform/frontend'
          
      - name: Deploy backend
        uses: easingthemes/ssh-deploy@v2.1.5
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: '-rltgoDzvO --delete'
          SOURCE: 'backend/dist/'
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: '/var/www/game-platform/backend'
          
      - name: Restart services
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/game-platform/backend
            pm2 restart all
```

### 7.2 环境变量配置
在 GitHub 仓库的 Settings > Secrets 中添加以下密钥：
- `SSH_PRIVATE_KEY`: 服务器 SSH 私钥
- `REMOTE_HOST`: 服务器 IP 地址
- `REMOTE_USER`: 服务器用户名

## 8. 安全最佳实践

### 8.1 服务器安全
- **更新系统**: 定期更新服务器系统和软件包
- **防火墙**: 配置防火墙，只开放必要的端口
- **SSH 安全**: 使用密钥认证，禁用密码登录

### 8.2 应用安全
- **依赖检查**: 定期检查依赖的安全漏洞
- **输入验证**: 对所有用户输入进行验证
- **XSS 防护**: 防止跨站脚本攻击
- **CSRF 防护**: 防止跨站请求伪造攻击
- **密码安全**: 使用 bcrypt 等算法加密存储密码

### 8.3 数据安全
- **备份策略**: 定期备份数据库和重要文件
- **加密传输**: 使用 HTTPS 加密数据传输
- **敏感数据**: 避免在日志中存储敏感数据

## 9. 结论

本部署指南详细描述了游戏平台项目的部署流程和环境配置。通过遵循本指南，您可以成功部署游戏平台项目并确保其正常运行。同时，本指南也提供了监控、维护和安全最佳实践，帮助您保持项目的稳定和安全。
