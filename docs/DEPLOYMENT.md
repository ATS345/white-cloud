# 部署指南

## 一、环境要求

### 服务器要求
- 操作系统: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- CPU: 2核心以上
- 内存: 4GB以上
- 存储: 50GB以上

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Git

## 二、部署步骤

### 1. 克隆项目
```bash
git clone https://github.com/your-org/yunmu-game-store.git
cd yunmu-game-store
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置
vim .env
```

**必须修改的配置项:**
- `JWT_SECRET` - JWT密钥（至少32位随机字符串）
- `JWT_REFRESH_SECRET` - 刷新令牌密钥
- `DB_PASSWORD` - 数据库密码
- `REDIS_PASSWORD` - Redis密码

### 3. 启动服务

#### 开发环境
```bash
# 启动数据库服务
docker-compose -f docker-compose.dev.yml up -d

# 安装依赖
cd backend && npm install && cd ..
npm install

# 运行数据库迁移
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
cd ..

# 启动后端
cd backend && npm run start:dev &

# 启动前端
npm run dev
```

#### 生产环境
```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库
```bash
# 进入后端容器
docker-compose exec backend sh

# 运行迁移
npx prisma migrate deploy

# 导入种子数据
npm run seed
```

### 5. 验证部署
```bash
# 检查服务健康状态
curl http://localhost/api/health

# 检查前端
curl http://localhost/
```

## 三、服务管理

### 启动服务
```bash
docker-compose start
```

### 停止服务
```bash
docker-compose stop
```

### 重启服务
```bash
docker-compose restart
```

### 查看日志
```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 更新部署
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 四、数据备份

### 数据库备份
```bash
# 创建备份
docker-compose exec postgres pg_dump -U yunmu yunmu_game_store > backup_$(date +%Y%m%d).sql

# 恢复备份
cat backup_20240101.sql | docker-compose exec -T postgres psql -U yunmu yunmu_game_store
```

### Redis备份
```bash
# 触发RDB快照
docker-compose exec redis redis-cli BGSAVE

# 复制备份文件
docker cp yunmu-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

## 五、监控与告警

### 健康检查端点
- 前端: `http://localhost/`
- 后端API: `http://localhost/api/health`
- API文档: `http://localhost/api/docs`

### 推荐监控工具
- Prometheus + Grafana
- ELK Stack (日志)
- Uptime Kuma (可用性监控)

## 六、故障排查

### 常见问题

#### 1. 容器无法启动
```bash
# 查看容器日志
docker-compose logs backend

# 检查容器状态
docker-compose ps

# 重建容器
docker-compose up -d --force-recreate backend
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready

# 检查连接配置
docker-compose exec backend env | grep DATABASE
```

#### 3. 内存不足
```bash
# 查看资源使用
docker stats

# 清理未使用的资源
docker system prune -a
```

## 七、安全加固

### 1. 防火墙配置
```bash
# 只开放必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 2. HTTPS配置 (推荐使用 Let's Encrypt)
```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 3. 定期更新
```bash
# 更新系统包
apt update && apt upgrade -y

# 更新Docker镜像
docker-compose pull
docker-compose up -d
```

## 八、性能优化

### 1. 数据库优化
- 配置连接池
- 添加索引
- 定期 VACUUM

### 2. Redis优化
- 配置内存限制
- 启用持久化

### 3. 前端优化
- 启用 Gzip 压缩
- 配置浏览器缓存
- 使用 CDN

## 九、联系支持

如遇问题，请联系:
- 技术支持: support@yunmu.com
- 文档: https://docs.yunmu.com
