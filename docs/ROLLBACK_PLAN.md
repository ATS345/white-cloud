# 回滚方案

## 概述

本文档定义了云幕游戏商店平台的回滚策略和操作步骤，确保在发布出现问题时能够快速恢复服务。

---

## 回滚触发条件

| 条件 | 严重级别 | 回滚决策 |
|------|----------|----------|
| 服务无法启动 | 严重 | 立即回滚 |
| 核心功能不可用 | 严重 | 立即回滚 |
| 数据丢失风险 | 严重 | 立即回滚 |
| 性能下降 > 50% | 高 | 评估后回滚 |
| 非关键功能异常 | 中 | 评估后修复 |

---

## 回滚前准备

### 1. 确认当前版本信息

```bash
# 检查当前版本
cat package.json | grep version
cat backend/package.json | grep version

# 检查数据库状态
cd backend
npx prisma db pull --print | head -20
```

### 2. 确认备份存在

```bash
# 检查备份文件
ls -la backup/

# 验证最新备份
ls -lt backup/*.db | head -5
```

---

## 回滚步骤

### 场景一：代码回滚

```bash
# 1. 停止服务
# 前端
# (Ctrl+C 或关闭终端)

# 后端
# (Ctrl+C 或关闭终端)

# 2. 回滚代码
git log --oneline -10  # 查看最近提交
git reset --hard <previous-commit-hash>

# 3. 重新安装依赖（如有变化）
npm install
cd backend && npm install

# 4. 重新构建
npm run build
cd backend && npm run build

# 5. 重启服务
npm run start:dev  # 后端
npm run dev        # 前端
```

### 场景二：数据库回滚

```powershell
# Windows PowerShell

# 1. 停止后端服务
# (Ctrl+C)

# 2. 备份当前数据库（以防万一）
$date = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item backend\prisma\dev.db "backup\dev_before_rollback_$date.db"

# 3. 恢复备份
$latestBackup = Get-ChildItem backup\*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $latestBackup.FullName backend\prisma\dev.db -Force

# 4. 验证数据库
Set-Location backend
npx prisma generate
npx prisma db pull --print

# 5. 重启服务
npm run start:dev
```

### 场景三：完整回滚

```bash
# 1. 停止所有服务
docker-compose down  # 如果使用 Docker

# 2. 回滚代码
git reset --hard <previous-commit-hash>

# 3. 恢复数据库
cp backup/dev_YYYYMMDD.db backend/prisma/dev.db

# 4. 重新构建
npm install && npm run build
cd backend && npm install && npm run build

# 5. 重启服务
docker-compose up -d
# 或
npm run start:dev
```

---

## Docker 环境回滚

### 使用镜像标签回滚

```bash
# 1. 查看可用镜像
docker images | grep yunmu

# 2. 停止当前容器
docker-compose down

# 3. 修改 docker-compose.yml 使用旧版本镜像
# image: yunmu-game-store:v1.0.0-previous

# 4. 重启服务
docker-compose up -d
```

### 使用 Docker 卷回滚

```bash
# 1. 停止服务
docker-compose down

# 2. 恢复数据卷
docker run --rm -v yunmu_data:/data -v $(pwd)/backup:/backup alpine \
    cp /backup/dev_YYYYMMDD.db /data/

# 3. 重启服务
docker-compose up -d
```

---

## 回滚验证清单

### 功能验证

- [ ] 服务正常启动
- [ ] 用户可以登录
- [ ] 游戏列表正常显示
- [ ] 购物车功能正常
- [ ] 订单功能正常
- [ ] 支付功能正常

### 性能验证

- [ ] 响应时间 < 500ms
- [ ] 无内存泄漏
- [ ] CPU 使用率正常

### 数据验证

- [ ] 用户数据完整
- [ ] 订单数据完整
- [ ] 游戏数据完整

---

## 回滚后操作

### 1. 记录回滚原因

```markdown
## 回滚记录

- 时间: YYYY-MM-DD HH:MM:SS
- 操作人: XXX
- 回滚原因: XXX
- 回滚版本: v1.0.0 -> v0.9.0
- 影响范围: XXX
- 后续计划: XXX
```

### 2. 通知相关方

- 开发团队
- 运维团队
- 用户（如需要）

### 3. 问题分析

- 收集日志
- 分析根因
- 制定修复计划

---

## 应急联系人

| 角色 | 联系方式 |
|------|----------|
| 技术负责人 | XXX |
| 运维负责人 | XXX |
| 产品负责人 | XXX |

---

## 附录：常用命令速查

```bash
# 查看服务状态
pm2 status          # PM2
docker ps           # Docker
systemctl status    # Systemd

# 查看日志
pm2 logs            # PM2
docker logs <container>  # Docker
journalctl -u <service>  # Systemd

# 快速重启
pm2 restart all     # PM2
docker-compose restart  # Docker
systemctl restart <service>  # Systemd
```
