# 云幕游戏商店平台 v1.0.0 发布文档

## 📦 发布信息

| 项目 | 信息 |
|------|------|
| 版本号 | v1.0.0 |
| 发布日期 | 2026-03-19 |
| 发布类型 | 正式版 (GA) |
| 支持平台 | Windows / Linux / macOS |

---

## 🚀 快速开始

### 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **内存**: >= 4GB RAM
- **磁盘**: >= 2GB 可用空间

### 安装步骤

#### 方式一：源码安装

```bash
# 1. 克隆项目
git clone <repository-url>
cd 游戏商店平台项目开发

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖
cd backend
npm install

# 4. 初始化数据库
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. 启动后端服务
npm run start:dev

# 6. 启动前端服务（新终端）
cd ..
npm run dev
```

#### 方式二：Docker 部署

```bash
# 启动完整服务栈
docker-compose up -d

# 或使用简化配置
docker-compose -f docker-compose.simple.yml up -d
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://localhost:5173 |
| 后端 API | http://localhost:3000 |
| API 文档 | http://localhost:3000/api |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

---

## 👤 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 普通用户 | user@example.com | admin123 |

> ⚠️ **重要**: 生产环境请立即修改默认密码！

---

## 🔧 配置说明

### 环境变量

#### 后端配置 (backend/.env)

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 服务
PORT=3000
NODE_ENV=production
```

#### 前端配置 (.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📊 监控配置

### Prometheus 指标

- 端点: `/metrics`
- 端口: 3000

### 健康检查

- 端点: `/health`
- 返回: `{ "status": "ok" }`

### Grafana 仪表盘

1. 访问 http://localhost:3001
2. 默认账号: admin / admin
3. 导入仪表盘: `monitoring/grafana/provisioning/dashboards/json/system-overview.json`

---

## 🔄 数据备份

### 自动备份脚本

```powershell
# Windows PowerShell
Set-Location c:\项目开发\游戏商店平台项目开发\backend
$date = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item prisma\dev.db "..\backup\dev_$date.db"
```

```bash
# Linux/macOS
cd backend
cp prisma/dev.db ../backup/dev_$(date +%Y%m%d_%H%M%S).db
```

### 备份策略

| 类型 | 频率 | 保留时间 |
|------|------|----------|
| 完整备份 | 每日 | 30 天 |
| 增量备份 | 每小时 | 7 天 |

---

## 🛡️ 安全建议

### 生产环境检查清单

- [ ] 修改所有默认密码
- [ ] 更换 JWT 密钥
- [ ] 启用 HTTPS
- [ ] 配置防火墙规则
- [ ] 禁用调试模式
- [ ] 设置日志级别为 warn/error
- [ ] 配置 CORS 白名单

---

## 📞 技术支持

如遇问题，请检查：

1. 服务是否正常运行
2. 端口是否被占用
3. 数据库是否已初始化
4. 环境变量是否正确配置

---

## 📝 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)
