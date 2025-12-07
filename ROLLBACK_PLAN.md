# 木鱼游戏平台回滚方案

## 1. 回滚方案概述

本回滚方案旨在确保在部署失败时，能够快速、安全地将木鱼游戏平台恢复到之前的稳定版本。回滚方案涵盖数据库、应用程序代码和配置文件等方面。

## 2. 回滚触发条件

当部署过程中出现以下情况时，应执行回滚操作：

- 数据库迁移失败
- 应用程序启动失败
- 核心功能测试失败
- 系统性能下降超过预期
- 安全漏洞被发现
- 用户无法正常访问系统

## 3. 回滚前准备

### 3.1 备份数据

在部署前，确保已完成以下备份：

- 数据库完整备份
- 配置文件备份
- 应用程序代码备份

### 3.2 版本标记

在部署前，为当前稳定版本创建标记：

```bash
# 数据库版本标记
export DB_BACKUP_TAG="$(date +%Y%m%d%H%M%S)"

# 应用程序版本标记
git tag -a stable-$DB_BACKUP_TAG -m "稳定版本备份 $DB_BACKUP_TAG"
git push origin stable-$DB_BACKUP_TAG
```

## 4. 回滚步骤

### 4.1 应用程序回滚

#### 4.1.1 后端应用回滚

```bash
# 1. 停止当前后端服务
pm stop

# 2. 回滚到之前的稳定版本
git checkout stable-$DB_BACKUP_TAG

# 3. 恢复配置文件
cp .env.backup .env

# 4. 安装对应版本的依赖
npm install

# 5. 回滚数据库（如果需要）
sequelize-cli db:migrate:undo:all
sequelize-cli db:migrate

# 6. 启动后端服务
pm start
```

#### 4.1.2 前端应用回滚

```bash
# 1. 停止当前前端服务
npm stop

# 2. 回滚到之前的稳定版本
git checkout stable-$DB_BACKUP_TAG

# 3. 恢复配置文件
cp .env.backup .env

# 4. 安装对应版本的依赖
npm install

# 5. 构建前端项目
npm run build

# 6. 启动前端服务
npm run preview
```

### 4.2 数据库回滚

#### 4.2.1 使用备份恢复

```bash
# 1. 停止后端服务
pm stop

# 2. 恢复数据库
sudo -u postgres pg_restore -d muyu_game /path/to/backup/muyu_game_backup_$DB_BACKUP_TAG.sql

# 3. 启动后端服务
npm start
```

#### 4.2.2 使用迁移回滚

```bash
# 1. 停止后端服务
npm stop

# 2. 回滚所有迁移
sequelize-cli db:migrate:undo:all

# 3. 重新运行到之前版本的迁移
sequelize-cli db:migrate --to <migration-file-name>

# 4. 启动后端服务
npm start
```

### 4.3 配置文件回滚

```bash
# 恢复配置文件
cp .env.backup .env
cp nginx/muyu-game.conf.backup /etc/nginx/sites-available/muyu-game.conf

# 重新加载Nginx配置
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 回滚验证

### 5.1 健康检查

- 后端健康检查: `http://localhost:5000/api/v1/health`
- 前端访问: `http://localhost:3000`

### 5.2 功能验证

1. 注册和登录功能
2. 游戏列表和详情页访问
3. 购物车和支付功能
4. 开发者仪表板功能
5. 游戏启动和安装功能

### 5.3 性能验证

- 监控CPU和内存使用率
- 监控API响应时间
- 监控数据库查询性能

## 6. 回滚后的处理

1. 记录回滚原因和过程
2. 分析部署失败原因
3. 修复问题后重新部署
4. 更新回滚方案

## 7. 回滚注意事项

1. 回滚操作应在低峰期进行，减少对用户的影响
2. 回滚前应通知相关团队和用户
3. 回滚过程中应密切监控系统状态
4. 回滚完成后应进行全面的测试和验证
5. 定期测试回滚方案，确保其有效性

## 8. 回滚工具和命令

| 工具/命令 | 用途 | 示例 |
|-----------|------|------|
| git | 版本控制和代码回滚 | `git checkout stable-20251204120000` |
| sequelize-cli | 数据库迁移和回滚 | `sequelize-cli db:migrate:undo:all` |
| pg_restore | 数据库备份恢复 | `pg_restore -d muyu_game backup.sql` |
| pm2 | 进程管理和监控 | `pm2 restart all` |
| nginx | 反向代理和负载均衡 | `nginx -t && systemctl reload nginx` |

## 9. 责任分工

| 角色 | 职责 |
|------|------|
| 系统管理员 | 负责数据库和服务器配置回滚 |
| 开发人员 | 负责应用程序代码回滚 |
| 测试人员 | 负责回滚后的功能验证 |
| 运维人员 | 负责监控系统状态和性能 |

## 10. 回滚时间预估

| 回滚步骤 | 时间预估 |
|----------|----------|
| 应用程序代码回滚 | 5-10分钟 |
| 数据库回滚 | 10-15分钟 |
| 配置文件回滚 | 5分钟 |
| 回滚验证 | 15-20分钟 |
| **总时间** | **35-50分钟** |

## 11. 联系方式

在回滚过程中，如有任何问题，请联系以下人员：

- 系统管理员：admin@muyu-game.com
- 开发团队：dev@muyu-game.com
- 运维团队：ops@muyu-game.com

## 12. 版本控制

| 版本 | 日期 | 作者 | 描述 |
|------|------|------|------|
| v1.0 | 2025-12-04 | 木鱼游戏团队 | 初始版本 |
