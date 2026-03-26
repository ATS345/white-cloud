# 云幕游戏商店平台 - 合并发布流程

**文档版本**: v1.0  
**创建日期**: 2026-03-26  
**维护团队**: 云幕开发团队

---

## 目录

1. [概述](#1-概述)
2. [分支策略](#2-分支策略)
3. [发布前准备](#3-发布前准备)
4. [合并到测试分支](#4-合并到测试分支)
5. [功能测试与回归测试](#5-功能测试与回归测试)
6. [缺陷修复](#6-缺陷修复)
7. [合并到预发布分支](#7-合并到预发布分支)
8. [环境验证](#8-环境验证)
9. [合并到主分支](#9-合并到主分支)
10. [正式发布](#10-正式发布)
11. [发布日志记录](#11-发布日志记录)
12. [回滚预案](#12-回滚预案)

---

## 1. 概述

本文档定义了云幕游戏商店平台的完整合并发布流程，确保从开发到生产的代码变更能够安全、可控地进行发布。

### 1.1 流程目标

- 确保代码质量和稳定性
- 提供可追溯的发布历史
- 建立快速回滚机制
- 规范团队协作流程

### 1.2 适用范围

- 功能开发完成后的发布
- Bug修复的发布
- 紧急热修复的发布

---

## 2. 分支策略

### 2.1 标准分支结构

| 分支名称 | 用途 | 保护级别 |
|---------|------|---------|
| `main` | 生产环境代码，始终保持稳定可发布状态 | 高 - 需要PR审核 |
| `develop` | 开发环境代码，集成最新开发功能 | 中 - 需要PR审核 |
| `staging` | 预发布环境代码，用于最终测试 | 中 - 需要PR审核 |
| `feature/*` | 功能开发分支 | 低 - 自由开发 |
| `fix/*` | Bug修复分支 | 低 - 自由开发 |
| `hotfix/*` | 紧急热修复分支 | 中 - 需要快速审核 |
| `release/*` | 发布准备分支 | 中 - 发布专用 |

### 2.2 分支创建规范

```bash
# 从main创建develop分支（如不存在）
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop

# 从develop创建staging分支（如不存在）
git checkout develop
git pull origin develop
git checkout -b staging
git push -u origin staging

# 创建功能分支
git checkout develop
git checkout -b feature/功能名称

# 创建修复分支
git checkout develop
git checkout -b fix/问题描述

# 创建热修复分支
git checkout main
git checkout -b hotfix/紧急问题
```

---

## 3. 发布前准备

### 3.1 检查清单

在开始发布流程前，确认以下事项：

- [ ] 所有待发布的功能分支已合并到develop
- [ ] 代码审查已完成
- [ ] 单元测试通过率100%
- [ ] 文档已更新
- [ ] 数据库迁移脚本已准备
- [ ] 配置文件已更新

### 3.2 创建发布分支

```bash
# 1. 切换到develop分支
git checkout develop
git pull origin develop

# 2. 创建发布分支
git checkout -b release/v1.1.0

# 3. 更新版本号
# 编辑 package.json 和 backend/package.json

# 4. 更新CHANGELOG
# 记录本次发布的所有变更

# 5. 提交版本更新
git add .
git commit -m "chore(release): 准备v1.1.0发布"

# 6. 推送发布分支
git push -u origin release/v1.1.0
```

---

## 4. 合并到测试分支

### 4.1 合并步骤

```bash
# 1. 切换到staging分支（测试分支）
git checkout staging
git pull origin staging

# 2. 合并发布分支
git merge --no-ff release/v1.1.0

# 3. 解决合并冲突（如有）
# 编辑冲突文件
git add <冲突文件>
git commit

# 4. 推送到远程
git push origin staging
```

### 4.2 合并验证

- [ ] 合并无冲突
- [ ] 代码可以正常编译
- [ ] 应用可以正常启动

---

## 5. 功能测试与回归测试

### 5.1 测试环境准备

```bash
# 1. 部署到测试环境
# 使用Docker Compose或其他部署方式
docker-compose -f docker-compose.test.yml up -d

# 2. 运行数据库迁移
cd backend
npx prisma migrate deploy

# 3. 初始化测试数据（如需要）
npx prisma db seed
```

### 5.2 测试执行

#### 5.2.1 自动化测试

```bash
# 前端测试
npm run test:run

# 后端测试
cd backend
npm test

# E2E测试（如配置）
npm run test:e2e
```

#### 5.2.2 手动功能测试清单

**核心功能测试：**
- [ ] 用户注册/登录
- [ ] 游戏浏览和搜索
- [ ] 购物车功能
- [ ] 订单创建和支付
- [ ] 下载功能
- [ ] 用户个人资料

**性能测试：**
- [ ] 页面加载时间 < 2秒
- [ ] API响应时间 < 500ms
- [ ] 并发用户测试

**兼容性测试：**
- [ ] Chrome浏览器
- [ ] Firefox浏览器
- [ ] Safari浏览器
- [ ] 移动端响应式布局

#### 5.2.3 回归测试

- [ ] 验证之前版本的所有功能正常
- [ ] 检查已知Bug是否重现
- [ ] 验证性能指标不低于之前版本

### 5.3 测试报告

测试完成后，生成测试报告，包括：
- 测试通过率
- 发现的Bug列表
- 性能指标数据
- 兼容性测试结果

---

## 6. 缺陷修复

### 6.1 Bug处理流程

1. **记录Bug**
   - 在项目管理工具中创建Bug Issue
   - 描述Bug复现步骤
   - 附上截图和日志

2. **评估严重程度**
   - 严重：阻断核心功能，立即修复
   - 高：影响主要功能，尽快修复
   - 中：影响次要功能，计划修复
   - 低：UI/体验问题，后续优化

3. **修复Bug**
   ```bash
   # 从staging创建修复分支
   git checkout staging
   git checkout -b fix/发布测试-问题描述
   
   # 修复Bug...
   
   # 提交修复
   git add .
   git commit -m "fix: 修复xxx问题"
   
   # 推送并创建PR
   git push origin fix/发布测试-问题描述
   ```

4. **验证修复**
   - 重新执行测试
   - 确认Bug已修复
   - 确保没有引入新问题

5. **合并回staging**
   ```bash
   git checkout staging
   git merge --no-ff fix/发布测试-问题描述
   git push origin staging
   ```

### 6.2 修复完成标准

- [ ] Bug已复现并确认
- [ ] 修复代码已提交
- [ ] 相关测试已通过
- [ ] 代码审查已完成
- [ ] 回归测试无新问题

---

## 7. 合并到预发布分支

### 7.1 预发布环境准备

测试通过后，将代码部署到预发布环境（staging）进行最终验证。

```bash
# 1. 确保staging分支是最新的
git checkout staging
git pull origin staging

# 2. 部署到预发布环境
# 使用与生产环境相同的配置
docker-compose -f docker-compose.staging.yml up -d

# 3. 运行完整测试套件
npm run test:run
cd backend && npm test
```

### 7.2 预发布验证清单

- [ ] 环境配置与生产一致
- [ ] 数据库结构与生产同步
- [ ] 第三方服务配置正确
- [ ] 监控系统正常运行
- [ ] 日志收集正常
- [ ] 性能指标满足要求
- [ ] 安全扫描无高危漏洞

---

## 8. 环境验证

### 8.1 功能验证

执行完整的端到端测试，模拟真实用户场景：

1. **用户流程测试**
   - 新用户注册 → 浏览游戏 → 添加购物车 → 下单 → 支付 → 下载
   - 老用户登录 → 查看订单 → 管理个人资料

2. **管理员流程测试**
   - 登录后台 → 管理游戏 → 查看订单 → 管理用户

### 8.2 性能验证

```bash
# 使用性能测试工具
cd scripts
node performance-test.cjs

# 检查监控指标
# 访问Grafana仪表盘
```

性能指标要求：
- API响应时间 P95 < 500ms
- 页面加载时间 < 2秒
- 数据库查询时间 < 100ms
- 内存使用率 < 80%
- CPU使用率 < 70%

### 8.3 安全验证

- [ ] 运行安全扫描
- [ ] 检查XSS漏洞
- [ ] 检查SQL注入漏洞
- [ ] 验证认证机制
- [ ] 检查权限控制
- [ ] 验证敏感数据加密

---

## 9. 合并到主分支

### 9.1 合并前最终检查

- [ ] 所有测试通过
- [ ] 预发布验证完成
- [ ] 文档已更新
- [ ] 发布日志已准备
- [ ] 回滚预案已确认
- [ ] 团队已确认发布

### 9.2 合并步骤

```bash
# 1. 切换到main分支
git checkout main
git pull origin main

# 2. 合并staging分支
git merge --no-ff staging

# 3. 解决冲突（如有）
git status
# 编辑冲突文件
git add <冲突文件>
git commit

# 4. 推送到远程
git push origin main
```

### 9.3 合并后验证

```bash
# 1. 确认main分支状态
git status
git log --oneline -5

# 2. 运行快速测试
npm run test:run
cd backend && npm test

# 3. 检查构建
npm run build
cd backend && npm run build
```

---

## 10. 正式发布

### 10.1 创建发布标签

```bash
# 1. 创建带注释的标签
git tag -a v1.1.0 -m "Release v1.1.0

主要变更：
- 新增xxx功能
- 修复xxx问题
- 优化xxx性能"

# 2. 推送标签到远程
git push origin v1.1.0

# 3. 推送所有标签
git push origin --tags
```

### 10.2 部署到生产环境

```bash
# 1. 拉取最新代码
git checkout main
git pull origin main

# 2. 备份当前版本（重要！）
# 备份数据库
# 备份配置文件

# 3. 停止旧版本服务
docker-compose down

# 4. 启动新版本服务
docker-compose up -d

# 5. 验证服务状态
docker-compose ps
docker-compose logs
```

### 10.3 生产验证

- [ ] 服务正常启动
- [ ] 健康检查通过
- [ ] 监控指标正常
- [ ] 日志无错误
- [ ] 核心功能可用
- [ ] 用户可以正常访问

### 10.4 发布通知

发布成功后，通知相关方：
- 开发团队
- 运维团队
- 产品团队
- 用户（如需要）

---

## 11. 发布日志记录

### 11.1 发布日志内容

每次发布必须记录以下信息：

| 项目 | 内容 |
|------|------|
| 版本号 | v1.1.0 |
| 发布日期 | 2026-03-26 |
| 发布类型 | 功能发布 / Bug修复 / 热修复 |
| 发布人 | 张三 |
| 审核人 | 李四 |
| 主要变更 | 详细变更列表 |
| 测试结果 | 测试通过率、发现的Bug |
| 已知问题 | 遗留问题（如有） |
| 回滚点 | 上一个稳定版本 |

### 11.2 CHANGELOG格式

```markdown
## [v1.1.0] - 2026-03-26

### 新增功能
- feat(auth): 添加第三方登录功能
- feat(game): 添加游戏收藏功能
- feat(cart): 添加购物车批量操作

### Bug修复
- fix(payment): 修复支付回调处理错误
- fix(ui): 修复移动端布局问题

### 性能优化
- perf(db): 优化游戏列表查询性能
- perf(frontend): 优化首页加载速度

### 文档更新
- docs(api): 更新API文档
- docs(deploy): 更新部署指南

### 依赖更新
- chore(deps): 更新React至v18.3
- chore(deps): 更新NestJS至v10.4
```

---

## 12. 回滚预案

### 12.1 回滚触发条件

出现以下情况时考虑回滚：

| 条件 | 严重级别 | 回滚决策 |
|------|----------|----------|
| 服务无法启动 | 严重 | 立即回滚 |
| 核心功能不可用 | 严重 | 立即回滚 |
| 数据丢失风险 | 严重 | 立即回滚 |
| 性能下降 > 50% | 高 | 评估后回滚 |
| 安全漏洞 | 高 | 评估后回滚 |
| 非关键功能异常 | 中 | 评估后修复 |

### 12.2 回滚步骤

#### 12.2.1 代码回滚

```bash
# 1. 停止服务
docker-compose down

# 2. 切换到上一个稳定版本
git checkout v1.0.0

# 或者使用reset
git reset --hard <previous-commit-hash>

# 3. 重新构建和部署
docker-compose build
docker-compose up -d

# 4. 验证回滚成功
# 执行测试验证
```

#### 12.2.2 数据库回滚

```bash
# 1. 停止服务
docker-compose down

# 2. 恢复数据库备份
# 从备份文件恢复

# 3. 验证数据库
cd backend
npx prisma db pull --print

# 4. 重启服务
docker-compose up -d
```

### 12.3 回滚验证

回滚后必须验证：

- [ ] 服务正常启动
- [ ] 核心功能可用
- [ ] 数据完整无丢失
- [ ] 性能恢复正常
- [ ] 监控指标正常

### 12.4 回滚后处理

1. **记录回滚**
   - 记录回滚时间、原因、影响范围
   - 更新发布日志

2. **问题分析**
   - 分析发布失败原因
   - 制定改进措施

3. **通知团队**
   - 通知相关人员回滚情况
   - 讨论后续计划

---

## 13. 紧急热修复流程

对于生产环境的紧急问题，使用热修复流程：

```bash
# 1. 从main创建热修复分支
git checkout main
git checkout -b hotfix/安全漏洞-20260326

# 2. 修复问题
# 快速修复紧急问题

# 3. 提交修复
git add .
git commit -m "hotfix: 修复紧急安全漏洞"

# 4. 测试验证
# 快速测试验证修复

# 5. 合并到main
git checkout main
git merge --no-ff hotfix/安全漏洞-20260326

# 6. 创建热修复标签
git tag -a v1.1.1 -m "Hotfix v1.1.1 - 紧急安全修复"

# 7. 推送到远程
git push origin main --tags

# 8. 同时合并到develop
git checkout develop
git cherry-pick <hotfix-commit-hash>
git push origin develop

# 9. 部署到生产
# 快速部署修复版本
```

---

## 附录

### A. 常用命令速查

```bash
# 分支操作
git branch -a                    # 查看所有分支
git checkout <branch>            # 切换分支
git checkout -b <new-branch>     # 创建并切换分支
git merge <branch>               # 合并分支
git branch -d <branch>           # 删除本地分支
git push origin --delete <branch> # 删除远程分支

# 标签操作
git tag                          # 查看标签
git tag -a <tag> -m <message>    # 创建带注释的标签
git push origin <tag>            # 推送标签
git push origin --tags           # 推送所有标签
git checkout <tag>               # 切换到标签

# 日志查看
git log --oneline -20            # 查看最近20条提交
git log --graph --oneline        # 图形化查看提交历史
git diff <commit1> <commit2>     # 比较两个提交
git status                       # 查看当前状态

# 回滚操作
git reset --hard <commit>        # 硬重置到指定提交
git revert <commit>              # 撤销指定提交
git stash                        # 暂存当前修改
git stash pop                    # 恢复暂存的修改
```

### B. 检查清单模板

每次发布前使用此检查清单：

```markdown
## 发布检查清单 v1.1.0

### 发布前
- [ ] 代码已合并到develop
- [ ] 代码审查已完成
- [ ] 单元测试100%通过
- [ ] 文档已更新
- [ ] 版本号已更新
- [ ] CHANGELOG已更新

### 测试阶段
- [ ] 已合并到staging
- [ ] 自动化测试通过
- [ ] 功能测试完成
- [ ] 回归测试完成
- [ ] 性能测试通过
- [ ] 安全扫描通过

### 预发布阶段
- [ ] 已部署到预发布环境
- [ ] 环境验证完成
- [ ] E2E测试通过
- [ ] 团队确认发布

### 发布阶段
- [ ] 已合并到main
- [ ] 已创建发布标签
- [ ] 已部署到生产
- [ ] 生产验证完成
- [ ] 发布通知已发送

### 回滚准备
- [ ] 数据库备份已完成
- [ ] 回滚点已确认
- [ ] 回滚步骤已准备
```

---

**文档维护团队**: 云幕开发团队  
**最后更新**: 2026-03-26
