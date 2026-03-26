# Docker部署环境变量配置说明

## 问题描述
Docker容器无法拉取镜像，环境变量配置需要完善。

## 解决方案

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL=file:./data/prod.db

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务配置
NODE_ENV=production
PORT=3000

# 前端配置
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=云幕游戏商店
```

### 2. 创建 .dockerignore 文件

在项目根目录创建：

```
# Git
.git
.gitignore

# 开发文件
*.md
!README.md
.vscode
.idea
*.log

# 测试
coverage
*.test.ts
*.spec.ts

# 环境文件
.env
.env.local
.env.*.local

# Node
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 构建产物
dist
build
```

### 3. 创建前端nginx配置

在项目根目录创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 4. 更新前端Dockerfile

更新 `Dockerfile` 添加nginx配置复制：

```dockerfile
# 前端构建阶段
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine AS frontend-production
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5. 创建启动脚本

创建 `start.sh`：

```bash
#!/bin/bash
set -e

echo "Starting 云幕游戏商店平台..."

# 启动Redis
echo "Starting Redis..."
docker run -d \
  --name yunmu-redis \
  --network yunmu-network \
  -p 6379:6379 \
  redis:7-alpine

# 启动后端
echo "Starting Backend..."
docker run -d \
  --name yunmu-backend \
  --network yunmu-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:./data/prod.db \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret-key \
  yunmu-backend:latest

# 启动前端
echo "Starting Frontend..."
docker run -d \
  --name yunmu-frontend \
  --network yunmu-network \
  -p 80:80 \
  yunmu-frontend:latest

echo "All services started!"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:3000"
echo "API Docs: http://localhost:3000/api/docs"
```

---

## 网络配置说明

### 容器网络架构

```
┌─────────────────────────────────────┐
│         yunmu-network               │
│  (bridge network)                   │
│                                     │
│  ┌──────────┐   ┌──────────┐      │
│  │  Redis   │   │ Backend  │      │
│  │  :6379   │   │  :3000   │      │
│  └────┬─────┘   └────┬─────┘      │
│       │              │             │
│       └──────────────┴──────────────┤
│                    │               │
│              ┌────┴────┐           │
│              │Frontend│           │
│              │  :80   │           │
│              └─────────┘           │
│                    │               │
└────────────────────┼───────────────┘
                     │
            ┌────────┴────────┐
            │   Host Machine  │
            │  localhost:80    │
            │ localhost:3000  │
            │ localhost:6379  │
            └─────────────────┘
```

### 网络问题排查

1. **检查容器网络**:
```bash
docker network ls
docker network inspect yunmu-network
```

2. **检查容器间通信**:
```bash
docker exec yunmu-backend ping redis
docker exec yunmu-backend curl http://redis:6379
```

3. **检查端口映射**:
```bash
docker port yunmu-backend
docker port yunmu-frontend
```

---

## 快速部署命令

### 使用docker-compose

```bash
# 1. 构建镜像
docker-compose -f docker-compose.simple.yml build

# 2. 启动服务
docker-compose -f docker-compose.simple.yml up -d

# 3. 查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 4. 停止服务
docker-compose -f docker-compose.simple.yml down
```

### 手动部署

```bash
# 1. 构建后端镜像
docker build -t yunmu-backend ./backend

# 2. 构建前端镜像
docker build -t yunmu-frontend .

# 3. 创建网络
docker network create yunmu-network

# 4. 启动Redis
docker run -d --name yunmu-redis --network yunmu-network redis:7-alpine

# 5. 启动后端
docker run -d --name yunmu-backend \
  --network yunmu-network \
  -p 3000:3000 \
  -e REDIS_HOST=redis \
  yunmu-backend

# 6. 启动前端
docker run -d --name yunmu-frontend \
  --network yunmu-network \
  -p 80:80 \
  yunmu-frontend
```

---

## 验证部署

### 检查服务状态

```bash
# 查看运行中的容器
docker ps

# 检查后端健康
curl http://localhost:3000/api/v1/health

# 检查前端
curl http://localhost/

# 检查Redis
docker exec yunmu-redis redis-cli ping
```

### 预期输出

- 后端健康检查: `{"status":"ok","database":"connected"}`
- Redis: `PONG`
- 前端: 返回HTML页面
