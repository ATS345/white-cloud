# 游戏商店平台

## 项目概述

游戏商店平台是一个现代化的在线游戏购买和下载平台，提供游戏浏览、搜索、购买、下载和评论等功能。项目采用前后端分离架构，前端使用 React 19 + TypeScript + Tailwind CSS 4 开发，后端使用 Express + TypeScript 开发。

## 功能特性

### 核心功能
- **游戏浏览**: 浏览游戏列表，查看游戏详情
- **游戏搜索**: 按关键词搜索游戏
- **游戏分类**: 按分类浏览游戏
- **用户认证**: 注册、登录、个人信息管理
- **购物车**: 添加、删除游戏到购物车
- **支付系统**: 集成 Stripe 支付
- **游戏下载**: 购买后下载游戏
- **评论系统**: 对游戏发表评论和评分
- **统计分析**: 游戏销售和用户数据统计

### 技术特性
- **前端优化**: 路由懒加载、图片懒加载、请求缓存
- **性能监控**: 集成 Web Vitals 监控核心 Web 指标
- **响应式设计**: 适配移动端、平板和桌面设备
- **TypeScript**: 全项目使用 TypeScript，类型安全
- **Tailwind CSS**: 使用 Tailwind CSS 4 进行样式设计
- **Zustand**: 轻量级状态管理
- **Axios**: 优化的 HTTP 客户端，支持请求缓存和重试机制

## 技术栈

### 前端
- **框架**: React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **路由**: React Router 7
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **性能监控**: Web Vitals

### 后端
- **框架**: Express
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **认证**: JWT
- **支付**: Stripe
- **ORM**: Sequelize (推荐)

## 快速开始

### 环境要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本
- **PostgreSQL**: 14.0 或更高版本

### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd game-platform
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **配置后端环境变量**
创建 `.env` 文件，添加以下内容：
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DATABASE_URL=postgres://username:password@localhost:5432/game_platform

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Stripe 配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

4. **启动后端服务器**
```bash
npm run dev
```

5. **安装前端依赖**
```bash
cd ../frontend
npm install
```

6. **配置前端环境变量**
创建 `.env` 文件，添加以下内容：
```env
# 前端环境变量
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
```

7. **启动前端开发服务器**
```bash
npm run dev
```

8. **访问应用**
打开浏览器，访问 `http://localhost:5173`

## 项目结构

```
game-platform/
├── backend/                # 后端代码
│   ├── src/
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── services/       # 服务
│   │   └── index.ts        # 后端入口
│   ├── .env                # 后端环境变量
│   ├── package.json        # 后端依赖
│   └── tsconfig.json       # TypeScript 配置
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── assets/         # 资源文件
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 应用主组件
│   │   └── main.tsx         # 应用入口
│   ├── .env                # 前端环境变量
│   ├── package.json        # 前端依赖
│   └── tsconfig.json       # TypeScript 配置
├── docs/                   # 项目文档
│   ├── database-design.md  # 数据库设计
│   ├── frontend-architecture.md # 前端架构设计
│   └── deployment-guide.md # 部署指南
└── README.md               # 项目说明
```

## 开发流程

### 前端开发
1. 在 `frontend/src/components` 中创建或修改组件
2. 在 `frontend/src/pages` 中创建或修改页面
3. 在 `frontend/src/utils` 中添加或修改工具函数
4. 运行 `npm run dev` 启动开发服务器
5. 运行 `npm run build` 构建生产版本

### 后端开发
1. 在 `backend/src/routes` 中创建或修改路由
2. 在 `backend/src/services` 中添加或修改服务
3. 在 `backend/src/middleware` 中添加或修改中间件
4. 运行 `npm run dev` 启动开发服务器
5. 运行 `npm run build` 构建生产版本

## 测试

### 前端测试
```bash
cd frontend
npm run test
```

### 后端测试
```bash
cd backend
npm run test
```

## 部署

详细的部署指南请参考 `docs/deployment-guide.md` 文件。

## 性能优化

### 前端优化
- **路由懒加载**: 使用 `React.lazy` 和 `Suspense` 实现路由组件的懒加载
- **图片懒加载**: 实现了 `Image` 组件，使用 Intersection Observer 实现图片的延迟加载
- **请求缓存**: 实现了请求缓存机制，减少重复请求
- **错误处理**: 实现了请求错误处理和重试机制

### 后端优化
- **数据库索引**: 为常用查询字段添加索引
- **查询优化**: 优化 SQL 查询，减少数据库负载
- **缓存**: 使用 Redis 缓存热点数据
- **并发处理**: 优化并发请求处理

## 安全措施

### 前端安全
- **输入验证**: 对用户输入进行验证
- **XSS 防护**: 防止跨站脚本攻击
- **CSRF 防护**: 防止跨站请求伪造攻击

### 后端安全
- **密码加密**: 使用 bcrypt 加密存储密码
- **JWT 认证**: 使用 JWT 进行身份验证
- **API 限流**: 防止 API 滥用
- **CORS 配置**: 合理配置 CORS 策略

## 贡献指南

1. **Fork 仓库**
2. **创建分支**
3. **提交更改**
4. **创建 Pull Request**

## 许可证

本项目采用 MIT 许可证。详情请参阅 `LICENSE` 文件。

## 联系方式

- **项目维护者**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [Your GitHub Profile]

## 更新日志

### v1.0.0 (2026-02-13)
- 项目初始化
- 前端优化升级
- 后端 API 开发
- 数据库设计
- 部署指南完善
