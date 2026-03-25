# 云幕游戏商店平台

## 项目概述

云幕游戏商店平台是一个现代化的游戏分发平台，提供游戏购买、下载、管理等功能。平台采用前后端分离架构，前端使用React 18 + TypeScript，后端使用Node.js + NestJS，数据库使用PostgreSQL。

### 核心功能

- **用户系统**：注册、登录、个人资料管理
- **游戏管理**：游戏列表、游戏详情、搜索筛选
- **购物系统**：购物车、订单管理、支付集成
- **游戏库**：已购游戏管理、游戏下载
- **管理后台**：用户管理、游戏管理、数据统计
- **客户端下载**：多平台客户端下载

## 技术栈

### 前端技术

- React 18
- TypeScript
- Vite
- Ant Design 5
- React Router 6
- Redux Toolkit
- Axios

### 后端技术

- Node.js 20 LTS
- NestJS 10.0+
- Express 4.18+
- Prisma 5.0+
- PostgreSQL 16+
- Redis 7.0+
- Elasticsearch 8.11+

### 基础设施

- Docker 24+
- Kubernetes 1.28+
- Nginx 1.25+
- AWS
- Cloudflare

## 系统架构

### 架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     前端应用     │────>│     API网关     │────>│    后端服务     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                            │                         │
                            ▼                         ▼
                    ┌─────────────────┐     ┌─────────────────┐
                    │     缓存层      │<────│    数据库层     │
                    └─────────────────┘     └─────────────────┘
```

### 模块划分

- **用户模块**：用户注册、登录、个人资料管理
- **游戏模块**：游戏列表、游戏详情、搜索筛选
- **购物模块**：购物车、订单管理、支付处理
- **下载模块**：客户端下载、游戏下载
- **管理模块**：用户管理、游戏管理、数据统计
- **社区模块**：评论、评价、论坛

## 项目结构

### 前端项目结构

```
src/
├── components/        # 通用组件
├── pages/            # 页面组件
│   ├── admin/        # 管理后台页面
├── store/            # Redux状态管理
├── utils/            # 工具函数
├── services/         # API服务
├── hooks/            # 自定义钩子
├── types/            # TypeScript类型定义
├── styles/           # 全局样式
├── App.tsx           # 应用主组件
└── main.tsx          # 应用入口
```

### 后端项目结构

```
backend/
├── src/
│   ├── modules/      # 功能模块
│   │   ├── auth/     # 认证模块
│   │   ├── users/    # 用户模块
│   │   ├── games/    # 游戏模块
│   │   ├── cart/     # 购物车模块
│   │   ├── orders/   # 订单模块
│   │   ├── payments/ # 支付模块
│   │   └── admin/    # 管理模块
│   ├── config/       # 配置文件
│   ├── middleware/   # 中间件
│   ├── utils/        # 工具函数
│   └── main.ts       # 应用入口
├── prisma/           # Prisma ORM
└── .env              # 环境变量
```

## 部署指南

### 环境要求

- Node.js 20 LTS+
- PostgreSQL 16+
- Redis 7.0+
- Elasticsearch 8.11+
- Docker (可选)

### 前端部署

1. 安装依赖

```bash
npm install
```

2. 构建生产版本

```bash
npm run build
```

3. 部署到静态文件服务器

```bash
# 使用Nginx部署
# 配置Nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        root /path/to/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 后端部署

1. 安装依赖

```bash
cd backend
npm install
```

2. 配置环境变量

```bash
# 复制.env.example为.env
cp .env.example .env
# 编辑.env文件，设置数据库连接等配置
```

3. 数据库迁移

```bash
npx prisma migrate deploy
```

4. 启动服务

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

### Docker部署

1. 构建Docker镜像

```bash
# 前端镜像
docker build -t cloudcurtain-frontend .

# 后端镜像
cd backend
docker build -t cloudcurtain-backend .
```

2. 使用Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    image: cloudcurtain-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: cloudcurtain-backend
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
      - elasticsearch

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: cloudcurtain
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

  elasticsearch:
    image: elasticsearch:8.11
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m

volumes:
  postgres_data:
```

## 测试指南

### 前端测试

```bash
# 运行单元测试
npm run test

# 运行E2E测试
npm run test:e2e
```

### 后端测试

```bash
cd backend
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration
```

## API文档

### 认证接口

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户信息
- `PUT /api/v1/auth/me` - 更新用户信息
- `PUT /api/v1/auth/me/password` - 修改密码

### 游戏接口

- `GET /api/v1/games` - 获取游戏列表
- `GET /api/v1/games/:id` - 获取游戏详情
- `GET /api/v1/games/slug/:slug` - 通过slug获取游戏

### 购物车接口

- `GET /api/v1/cart` - 获取购物车
- `POST /api/v1/cart` - 添加商品到购物车
- `PUT /api/v1/cart/:id` - 更新购物车商品
- `DELETE /api/v1/cart/:id` - 删除购物车商品

### 订单接口

- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取订单详情
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders/my-games` - 获取已购游戏

### 管理接口

- `GET /api/v1/admin/statistics` - 获取统计数据
- `GET /api/v1/admin/users` - 获取用户列表
- `GET /api/v1/admin/games` - 获取游戏列表
- `POST /api/v1/admin/users` - 创建用户
- `PUT /api/v1/admin/users/:id` - 更新用户
- `DELETE /api/v1/admin/users/:id` - 删除用户
- `POST /api/v1/admin/games` - 创建游戏
- `PUT /api/v1/admin/games/:id` - 更新游戏
- `DELETE /api/v1/admin/games/:id` - 删除游戏

## 维护指南

### 日志管理

- 前端日志：使用浏览器控制台和第三方日志服务
- 后端日志：使用Winston日志库，日志文件存储在`logs`目录

### 监控

- 使用Prometheus + Grafana监控系统性能
- 使用ELK Stack收集和分析日志

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否运行
   - 检查.env文件中的数据库连接配置

2. **API接口返回401**
   - 检查JWT令牌是否有效
   - 检查用户权限

3. **前端页面白屏**
   - 检查控制台错误信息
   - 检查API接口是否正常

4. **部署后访问缓慢**
   - 检查服务器资源使用情况
   - 考虑使用CDN加速静态资源

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 联系方式

- 项目维护者：云幕游戏团队
- 邮箱：contact@cloudcurtain.com
- 网站：https://cloudcurtain.com
