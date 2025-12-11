# 游戏服务 (game-service)

游戏商店平台的游戏服务微服务，负责游戏相关的核心功能，包括游戏列表、游戏详情、游戏管理等。

## 功能特性

- ✅ 游戏列表查询（支持分页、搜索、分类过滤）
- ✅ 游戏详情查询
- ✅ 游戏分类和标签管理
- ✅ 热门游戏和新游戏推荐
- ✅ 游戏创建、更新、删除
- ✅ 游戏状态管理
- ✅ 开发者游戏列表
- ✅ 批量操作支持
- ✅ Redis 缓存支持
- ✅ 完善的日志记录
- ✅ 健康检查端点

## 技术栈

- **框架**: Express.js 4.18.2
- **数据库**: MySQL 8.0 + Sequelize 6.35.2
- **缓存**: Redis 4.6.12
- **认证**: JWT (预留)
- **日志**: Winston 3.11.0
- **API文档**: Swagger (预留)
- **测试**: Jest + Supertest
- **代码规范**: ESLint + Airbnb 规则

## 目录结构

```
game-service/
├── config/                 # 配置文件
│   ├── database.js         # 数据库配置
│   ├── logger.js           # 日志配置
│   └── redis.js            # Redis 配置
├── controllers/            # 控制器
│   ├── gameListController.js     # 游戏列表控制器
│   └── gameManagementController.js  # 游戏管理控制器
├── models/                 # 数据模型
│   ├── Game.js             # 游戏模型
│   ├── GameCategory.js     # 游戏分类模型
│   ├── GameTag.js          # 游戏标签模型
│   ├── GameVersion.js      # 游戏版本模型
│   ├── GameSystemRequirement.js  # 游戏系统需求模型
│   └── Developer.js        # 开发者模型
├── tests/                  # 测试文件
│   └── unit/               # 单元测试
├── .env.example            # 环境变量示例
├── .eslintrc.json          # ESLint 配置
├── jest.config.js          # Jest 配置
├── package.json            # 依赖配置
├── server.js               # 服务入口
└── README.md               # 项目说明
```

## 快速开始

### 环境要求

- Node.js 16.x 或更高版本
- MySQL 8.0 或更高版本
- Redis 6.0 或更高版本

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 文件并修改为 `.env`，然后根据实际情况配置环境变量：

```bash
cp .env.example .env
```

### 启动服务

#### 开发模式

```bash
npm run dev
```

#### 生产模式

```bash
npm start
```

### 运行测试

```bash
npm test
```

### 代码规范检查

```bash
npm run lint
```

## API 端点

### 公共游戏 API

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/games` | 获取游戏列表 | 公开 |
| GET | `/games/:id` | 获取游戏详情 | 公开 |
| GET | `/categories` | 获取游戏分类列表 | 公开 |
| GET | `/tags` | 获取游戏标签列表 | 公开 |
| GET | `/games/popular` | 获取热门游戏 | 公开 |
| GET | `/games/new` | 获取新游戏 | 公开 |

### 游戏管理 API

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | `/games` | 创建游戏 | 开发者/管理员 |
| PUT | `/games/:id` | 更新游戏 | 开发者/管理员 |
| DELETE | `/games/:id` | 删除游戏 | 开发者/管理员 |
| DELETE | `/games/batch` | 批量删除游戏 | 管理员 |
| PATCH | `/games/:id/status` | 更新游戏状态 | 管理员 |
| GET | `/developers/:developerId/games` | 获取开发者游戏列表 | 开发者/管理员 |

### 系统 API

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/health` | 健康检查 | 公开 |

## 数据库模型

### Game (游戏)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | INTEGER | 游戏ID（主键） |
| developer_id | INTEGER | 开发者ID |
| title | STRING(100) | 游戏标题 |
| description | TEXT | 游戏描述 |
| price | DECIMAL(10,2) | 游戏价格 |
| discount_price | DECIMAL(10,2) | 折扣价格 |
| release_date | DATE | 发布日期 |
| rating | DECIMAL(3,2) | 游戏评分 |
| review_count | INTEGER | 评论数量 |
| status | ENUM | 游戏状态（pending, approved, rejected） |
| main_image_url | STRING(255) | 主图URL |
| cover_image | STRING(255) | 封面图URL |
| executable_path | STRING(255) | 可执行文件路径 |
| launch_parameters | STRING(255) | 启动参数 |
| latest_version | STRING(20) | 最新版本号 |
| download_url | STRING(255) | 下载URL |
| created_at | DATE | 创建时间 |
| updated_at | DATE | 更新时间 |

## 缓存策略

- 游戏列表：缓存 1 小时
- 游戏详情：缓存 1 小时
- 游戏分类：缓存 24 小时
- 游戏标签：缓存 24 小时
- 热门游戏：缓存 1 小时
- 新游戏：缓存 1 小时

## 错误处理

API 返回统一的错误格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息",
    "details": "详细错误信息（仅开发环境）"
  }
}
```

## 日志记录

- **访问日志**：记录所有 API 请求
- **错误日志**：记录所有异常和错误
- **业务日志**：记录重要业务操作
- **调试日志**：记录调试信息（仅开发环境）

## 监控与健康检查

- 健康检查端点：`GET /health`
- 支持 Redis 连接检查
- 支持数据库连接检查（预留）

## 开发规范

### 代码规范

- 遵循 Airbnb JavaScript 编码规范
- 使用 ESLint 进行代码检查
- 函数和变量命名采用驼峰命名法
- 类名采用帕斯卡命名法
- 使用 ES 模块语法

### 提交规范

- 提交信息格式：`type(scope): description`
- 类型：feat, fix, docs, style, refactor, test, chore

### 测试规范

- 单元测试覆盖率 ≥ 80%
- 集成测试覆盖核心业务流程
- 使用 Jest 作为测试框架
- 使用 Supertest 进行 API 测试

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t game-service .

# 运行容器
docker run -d -p 3002:3002 --env-file .env game-service
```

### Kubernetes 部署

参考 `k8s/` 目录下的部署配置文件（预留）。

## 版本控制

- **主分支**：main（生产环境）
- **开发分支**：develop（开发环境）
- **特性分支**：feature/xxx
- **修复分支**：fix/xxx

## 开发团队

- **架构师**：XXX
- **开发工程师**：XXX
- **测试工程师**：XXX
- **运维工程师**：XXX

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-12-11)
- ✅ 初始版本发布
- ✅ 游戏列表和详情功能
- ✅ 游戏管理功能
- ✅ 缓存和日志支持
- ✅ 健康检查端点

## 后续计划

- ⏳ 游戏评论和评分系统
- ⏳ 游戏下载和更新功能
- ⏳ 游戏推荐算法
- ⏳ 多语言支持
- ⏳ 数据统计和分析
- ⏳ 游戏数据导入导出

## 联系方式

- **项目地址**：https://github.com/game-store/game-service
- **问题反馈**：https://github.com/game-store/game-service/issues
- **技术支持**：support@game-store.com
