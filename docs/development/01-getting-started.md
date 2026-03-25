# 云幕游戏商店平台 - 快速开始指南

## 文档概述

本文档提供了云幕游戏商店平台的快速开始指南，帮助开发人员快速搭建开发环境并开始开发工作。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕开发团队

---

## 目录

1. [环境要求](#1-环境要求)
2. [项目结构](#2-项目结构)
3. [环境搭建](#3-环境搭建)
4. [依赖安装](#4-依赖安装)
5. [配置说明](#5-配置说明)
6. [启动项目](#6-启动项目)
7. [常见问题](#7-常见问题)

---

## 1. 环境要求

### 1.1 操作系统

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)

### 1.2 必需软件

| 软件 | 版本要求 | 安装方式 | 验证命令 |
|------|---------|---------|---------|
| **Node.js** | 20 LTS | [官网下载](https://nodejs.org/) | `node --version` |
| **npm** | 10+ | 随Node.js安装 | `npm --version` |
| **Git** | 2.42+ | [官网下载](https://git-scm.com/) | `git --version` |
| **PostgreSQL** | 16+ | [官网下载](https://www.postgresql.org/) | `psql --version` |
| **Redis** | 7.0+ | [官网下载](https://redis.io/) | `redis-cli --version` |

### 1.3 推荐软件

| 软件 | 用途 | 安装方式 |
|------|------|---------|
| **VS Code** | 代码编辑器 | [官网下载](https://code.visualstudio.com/) |
| **Docker** | 容器化部署 | [官网下载](https://www.docker.com/) |
| **Postman** | API测试 | [官网下载](https://www.postman.com/) |

### 1.4 VS Code扩展

推荐安装以下VS Code扩展：

- **ESLint** - JavaScript/TypeScript代码检查
- **Prettier** - 代码格式化
- **TypeScript Hero** - TypeScript工具集
- **React Developer Tools** - React调试工具
- **Redux DevTools** - Redux调试工具
- **GitLens** - Git增强工具
- **Thunder Client** - API测试工具

---

## 2. 项目结构

### 2.1 整体结构

```
game-store-platform/
├── src/                          # 前端源代码
│   ├── components/               # 通用组件
│   ├── pages/                    # 页面组件
│   ├── store/                    # Redux状态管理
│   ├── utils/                    # 工具函数
│   ├── services/                 # API服务
│   ├── hooks/                    # 自定义钩子
│   ├── types/                    # TypeScript类型定义
│   ├── styles/                   # 全局样式
│   ├── App.tsx                   # 应用主组件
│   └── main.tsx                  # 应用入口
├── backend/                      # 后端源代码
│   ├── src/
│   │   ├── modules/             # 功能模块
│   │   ├── config/              # 配置文件
│   │   ├── middleware/          # 中间件
│   │   ├── utils/               # 工具函数
│   │   └── main.ts              # 应用入口
│   ├── prisma/                  # Prisma ORM
│   └── .env                     # 环境变量
├── docs/                         # 项目文档
├── public/                       # 静态资源
├── package.json                  # 前端依赖配置
├── vite.config.ts               # Vite配置
├── tsconfig.json                # TypeScript配置
└── README.md                    # 项目说明文档
```

### 2.2 前端目录结构

```
src/
├── components/                   # 通用组件
│   ├── AppHeader.tsx            # 应用头部
│   ├── AppFooter.tsx            # 应用底部
│   └── ...                      # 其他组件
├── pages/                        # 页面组件
│   ├── admin/                   # 管理后台页面
│   ├── Home.tsx                 # 首页
│   ├── Games.tsx                # 游戏列表
│   ├── GameDetail.tsx           # 游戏详情
│   ├── Login.tsx                # 登录页面
│   ├── Register.tsx             # 注册页面
│   └── ...                      # 其他页面
├── store/                        # Redux状态管理
│   ├── index.ts                 # Store配置
│   └── slices/                  # 状态切片
│       ├── authSlice.ts         # 认证状态
│       ├── gamesSlice.ts        # 游戏状态
│       └── cartSlice.ts         # 购物车状态
├── utils/                        # 工具函数
│   └── api.ts                   # API客户端
└── App.tsx                       # 应用主组件
```

### 2.3 后端目录结构

```
backend/
├── src/
│   ├── modules/                  # 功能模块
│   │   ├── auth/                # 认证模块
│   │   ├── users/               # 用户模块
│   │   ├── games/               # 游戏模块
│   │   ├── cart/                # 购物车模块
│   │   ├── orders/              # 订单模块
│   │   ├── payments/            # 支付模块
│   │   └── admin/               # 管理模块
│   ├── config/                  # 配置文件
│   │   ├── prisma/              # Prisma配置
│   │   ├── redis/               # Redis配置
│   │   └── elasticsearch/       # Elasticsearch配置
│   ├── middleware/              # 中间件
│   ├── utils/                   # 工具函数
│   └── main.ts                  # 应用入口
├── prisma/                       # Prisma ORM
│   ├── schema.prisma            # 数据库模型
│   └── seed.ts                  # 种子数据
└── .env                         # 环境变量
```

---

## 3. 环境搭建

### 3.1 克隆项目

```bash
# 克隆项目仓库
git clone https://github.com/cloudcurtain/game-store-platform.git

# 进入项目目录
cd game-store-platform
```

### 3.2 安装Node.js

#### Windows

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载LTS版本（20.x）
3. 运行安装程序
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

#### macOS

```bash
# 使用Homebrew安装
brew install node@20

# 验证安装
node --version
npm --version
```

#### Linux (Ubuntu)

```bash
# 添加Node.js源
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装Node.js
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 3.3 安装数据库

#### PostgreSQL

**Windows/macOS**:
1. 访问 [PostgreSQL官网](https://www.postgresql.org/download/)
2. 下载并安装PostgreSQL 16
3. 记住设置的密码

**Linux (Ubuntu)**:
```bash
# 安装PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到postgres用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE cloudcurtain;
CREATE USER cloudcurtain_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cloudcurtain TO cloudcurtain_user;
```

#### Redis

**Windows**:
1. 下载Redis for Windows
2. 解压并运行 `redis-server.exe`

**macOS**:
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu)**:
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

---

## 4. 依赖安装

### 4.1 前端依赖

```bash
# 在项目根目录
npm install
```

### 4.2 后端依赖

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install
```

### 4.3 全局依赖

```bash
# 安装TypeScript
npm install -g typescript

# 安装NestJS CLI
npm install -g @nestjs/cli

# 安装Prisma CLI
npm install -g prisma
```

---

## 5. 配置说明

### 5.1 环境变量配置

#### 前端环境变量

创建 `.env` 文件在项目根目录：

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=云幕游戏商店
VITE_APP_VERSION=1.0.0
```

#### 后端环境变量

创建 `.env` 文件在 `backend` 目录：

```env
# 数据库配置
DATABASE_URL="postgresql://cloudcurtain_user:your_password@localhost:5432/cloudcurtain?schema=public"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch配置
ELASTICSEARCH_NODE=http://localhost:9200

# JWT配置
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# 应用配置
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 5.2 数据库初始化

```bash
# 进入后端目录
cd backend

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 导入种子数据
npx prisma db seed
```

---

## 6. 启动项目

### 6.1 启动数据库服务

```bash
# PostgreSQL (Linux/macOS)
sudo systemctl start postgresql
# 或
pg_ctl -D /usr/local/var/postgres start

# Redis
redis-server
```

### 6.2 启动后端服务

```bash
# 进入后端目录
cd backend

# 开发模式启动
npm run start:dev

# 生产模式启动
npm run build
npm run start:prod
```

后端服务将在 `http://localhost:3000` 启动。

### 6.3 启动前端服务

```bash
# 在项目根目录
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 6.4 访问应用

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000/api/v1
- **API文档**: http://localhost:3000/api/docs (Swagger)

---

## 7. 常见问题

### 7.1 Node.js相关

**问题**: npm install 失败
**解决方案**:
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

**问题**: Node版本不匹配
**解决方案**:
```bash
# 使用nvm管理Node版本
nvm install 20
nvm use 20
```

### 7.2 数据库相关

**问题**: 数据库连接失败
**解决方案**:
1. 检查PostgreSQL服务是否运行
2. 检查 `.env` 文件中的数据库连接字符串
3. 检查数据库用户权限

**问题**: Prisma迁移失败
**解决方案**:
```bash
# 重置数据库
npx prisma migrate reset

# 重新运行迁移
npx prisma migrate dev
```

### 7.3 端口占用

**问题**: 端口3000或5173被占用
**解决方案**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

### 7.4 编译错误

**问题**: TypeScript编译错误
**解决方案**:
```bash
# 检查TypeScript版本
tsc --version

# 重新安装TypeScript
npm install --save-dev typescript@latest
```

---

## 下一步

- 阅读 [编码规范](./02-coding-standards.md)
- 了解 [Git工作流程](./03-git-workflow.md)
- 查看 [API接口规范](../api/01-api-specification.md)

---

## 联系方式

- **技术支持**: tech@cloudcurtain.com
- **开发团队**: dev@cloudcurtain.com

---

**文档维护团队**: 云幕开发团队  
**最后更新**: 2026-03-14
