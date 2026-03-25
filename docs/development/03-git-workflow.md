# 云幕游戏商店平台 - Git工作流程

## 文档概述

本文档定义了云幕游戏商店平台的Git工作流程，包括分支策略、提交规范、合并流程等。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕开发团队

---

## 目录

1. [分支策略](#1-分支策略)
2. [提交信息规范](#2-提交信息规范)
3. [开发流程](#3-开发流程)
4. [代码合并流程](#4-代码合并流程)
5. [版本发布流程](#5-版本发布流程)
6. [冲突解决指南](#6-冲突解决指南)

---

## 1. 分支策略

### 1.1 主要分支

| 分支名称 | 用途 | 保护级别 |
|---------|------|---------|
| `main` | 生产环境代码，始终保持稳定可发布状态 | 高 - 需要PR审核 |
| `develop` | 开发环境代码，集成最新开发功能 | 中 - 需要PR审核 |
| `staging` | 预发布环境代码，用于最终测试 | 中 - 需要PR审核 |

### 1.2 辅助分支

| 分支类型 | 命名规范 | 示例 | 生命周期 |
|---------|---------|------|---------|
| 功能分支 | `feature/功能名称` | `feature/user-authentication` | 短期 |
| 修复分支 | `fix/问题描述` | `fix/login-error` | 短期 |
| 热修复分支 | `hotfix/问题描述` | `hotfix/security-patch` | 短期 |
| 发布分支 | `release/版本号` | `release/v1.0.0` | 中期 |

### 1.3 分支命名规范

```bash
# 功能分支
feature/user-authentication
feature/game-list-page
feature/shopping-cart

# 修复分支
fix/login-validation
fix/game-detail-display

# 热修复分支
hotfix/security-vulnerability
hotfix/payment-error

# 发布分支
release/v1.0.0
release/v1.1.0
```

---

## 2. 提交信息规范

### 2.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 类型(type)

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(auth): 添加用户登录功能 |
| `fix` | 修复Bug | fix(cart): 修复购物车数量计算错误 |
| `docs` | 文档更新 | docs(api): 更新API文档 |
| `style` | 代码格式调整 | style: 格式化代码 |
| `refactor` | 代码重构 | refactor(user): 重构用户服务 |
| `test` | 测试相关 | test(auth): 添加登录测试用例 |
| `chore` | 构建/工具相关 | chore: 更新依赖版本 |
| `perf` | 性能优化 | perf(query): 优化数据库查询 |
| `ci` | CI/CD相关 | ci: 配置GitHub Actions |

### 2.3 范围(scope)

范围表示提交影响的模块：

- `auth` - 认证模块
- `user` - 用户模块
- `game` - 游戏模块
- `cart` - 购物车模块
- `order` - 订单模块
- `payment` - 支付模块
- `admin` - 管理后台
- `api` - API接口
- `ui` - 用户界面
- `db` - 数据库

### 2.4 提交信息示例

```bash
# 新功能
feat(auth): 添加JWT认证功能

- 实现JWT Token生成
- 添加Token验证中间件
- 实现Token刷新机制

Closes #123

# Bug修复
fix(cart): 修复购物车商品数量更新问题

购物车商品数量更新时未正确同步到后端

Fixes #456

# 文档更新
docs(api): 更新用户接口文档

添加用户注册和登录接口的详细说明

# 代码重构
refactor(user): 重构用户服务层

将用户业务逻辑从控制器分离到服务层，提高代码可维护性
```

---

## 3. 开发流程

### 3.1 开始新功能开发

```bash
# 1. 切换到develop分支
git checkout develop

# 2. 拉取最新代码
git pull origin develop

# 3. 创建功能分支
git checkout -b feature/user-profile

# 4. 开发功能...
# 编写代码、测试、文档

# 5. 提交代码
git add .
git commit -m "feat(user): 添加用户个人资料页面"

# 6. 推送到远程仓库
git push origin feature/user-profile

# 7. 在GitHub上创建Pull Request
```

### 3.2 修复Bug流程

```bash
# 1. 切换到develop分支
git checkout develop

# 2. 拉取最新代码
git pull origin develop

# 3. 创建修复分支
git checkout -b fix/login-validation

# 4. 修复Bug...

# 5. 提交代码
git add .
git commit -m "fix(auth): 修复登录验证逻辑错误"

# 6. 推送到远程仓库
git push origin fix/login-validation

# 7. 在GitHub上创建Pull Request
```

### 3.3 热修复流程

```bash
# 1. 切换到main分支
git checkout main

# 2. 拉取最新代码
git pull origin main

# 3. 创建热修复分支
git checkout -b hotfix/security-patch

# 4. 修复问题...

# 5. 提交代码
git add .
git commit -m "hotfix(security): 修复XSS安全漏洞"

# 6. 推送到远程仓库
git push origin hotfix/security-patch

# 7. 创建PR合并到main和develop
```

---

## 4. 代码合并流程

### 4.1 Pull Request流程

1. **创建PR**
   - 在GitHub上创建Pull Request
   - 填写PR标题和描述
   - 关联相关Issue
   - 指定审核人员

2. **PR标题格式**
   ```
   [类型] 简短描述
   ```
   例如：`[Feature] 添加用户个人资料页面`

3. **PR描述模板**
   ```markdown
   ## 变更类型
   - [ ] 新功能
   - [ ] Bug修复
   - [ ] 代码重构
   - [ ] 文档更新
   - [ ] 其他

   ## 变更说明
   详细描述本次变更的内容和原因

   ## 测试说明
   描述如何测试这些变更

   ## 相关Issue
   Closes #123

   ## 检查清单
   - [ ] 代码符合编码规范
   - [ ] 已添加测试用例
   - [ ] 已更新文档
   - [ ] 无TypeScript编译错误
   - [ ] 无ESLint警告
   ```

4. **代码审核**
   - 至少需要1位审核人员批准
   - 通过所有自动化测试
   - 解决所有审核意见

5. **合并代码**
   - 使用Squash and Merge方式
   - 删除功能分支

### 4.2 合并策略

| 场景 | 合并方式 | 说明 |
|------|---------|------|
| 功能分支 → develop | Squash and Merge | 保持develop分支历史整洁 |
| develop → staging | Merge Commit | 保留完整历史 |
| staging → main | Merge Commit | 保留完整历史 |
| hotfix → main | Merge Commit | 保留热修复历史 |
| hotfix → develop | Cherry-pick | 避免重复提交 |

---

## 5. 版本发布流程

### 5.1 发布准备

```bash
# 1. 创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 2. 更新版本号
# 更新package.json中的版本号

# 3. 更新CHANGELOG
# 记录本次发布的变更内容

# 4. 提交版本更新
git add .
git commit -m "chore(release): 准备v1.0.0发布"

# 5. 推送发布分支
git push origin release/v1.0.0
```

### 5.2 发布到staging

```bash
# 1. 合并到staging
git checkout staging
git merge release/v1.0.0

# 2. 推送到远程
git push origin staging

# 3. 在staging环境进行最终测试
```

### 5.3 发布到生产

```bash
# 1. 合并到main
git checkout main
git merge staging

# 2. 打标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. 推送到远程
git push origin main --tags

# 4. 部署到生产环境
```

### 5.4 版本号规范

遵循语义化版本规范 (SemVer)：

```
MAJOR.MINOR.PATCH

MAJOR: 不兼容的API变更
MINOR: 向后兼容的功能新增
PATCH: 向后兼容的Bug修复
```

示例：
- `1.0.0` - 初始版本
- `1.1.0` - 新增功能
- `1.1.1` - Bug修复
- `2.0.0` - 重大更新

---

## 6. 冲突解决指南

### 6.1 预防冲突

- 频繁从develop分支拉取最新代码
- 小步提交，避免大范围修改
- 团队沟通，避免同时修改同一文件

### 6.2 解决冲突步骤

```bash
# 1. 拉取最新代码
git checkout develop
git pull origin develop

# 2. 切换到功能分支
git checkout feature/user-profile

# 3. 合并develop到功能分支
git merge develop

# 4. 如果有冲突，查看冲突文件
git status

# 5. 手动解决冲突
# 编辑冲突文件，选择保留的代码

# 6. 标记冲突已解决
git add <冲突文件>

# 7. 完成合并
git commit -m "merge: 解决与develop分支的冲突"

# 8. 推送代码
git push origin feature/user-profile
```

### 6.3 冲突标记说明

```bash
<<<<<<< HEAD
当前分支的代码
=======
要合并进来的代码
>>>>>>> develop
```

---

## 相关文档

- [编码规范](./02-coding-standards.md)
- [测试指南](./04-testing-guide.md)

---

## 联系方式

- **技术支持**: tech@cloudcurtain.com
- **开发团队**: dev@cloudcurtain.com

---

**文档维护团队**: 云幕开发团队  
**最后更新**: 2026-03-14
