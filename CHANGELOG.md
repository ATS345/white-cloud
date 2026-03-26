# 云幕游戏商店平台 - 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.1.0] - 2026-03-26

### 新增功能
- ✨ 完整的合并发布流程文档
- ✨ Git分支策略（main/develop/staging/testing）
- ✨ 发布检查清单模板
- ✨ 回滚预案文档

### Bug修复
- 🐛 修复前端测试用例（Games.test.tsx、Home.test.tsx、AppFooter.test.tsx、AppHeader.test.tsx）
- 🐛 修复useNavigate() Hook使用问题（添加BrowserRouter包装器）
- 🐛 修复按钮文本匹配器问题（使用文本包含匹配）

### 测试改进
- ✅ 前端测试通过率从 54/58 提升到 58/58（100%）
- ✅ 后端测试保持 51/51 通过率（100%）

### 文档完善
- 📚 添加完整的发布流程文档（docs/RELEASE_PROCESS.md）
- 📚 添加任务完成最终报告（docs/TASK_COMPLETION_FINAL_REPORT.md）
- 📚 添加发布日志模板（docs/RELEASE_LOG_2025-05-24.md）

### 配置优化
- ⚙️ 验证监控配置（Alertmanager、Prometheus、Grafana）
- ⚙️ 更新.gitignore文件

## [1.0.0] - 2026-03-19

### 新增功能
- ✨ 用户认证系统（注册、登录、JWT令牌）
- ✨ 游戏浏览与搜索功能
- ✨ 购物车系统
- ✨ 订单管理系统
- ✨ 游戏库（已购买游戏）
- ✨ 用户个人中心
- ✨ 管理员后台（用户管理、游戏管理）
- ✨ 评论与评分系统
- ✨ 下载管理功能
- ✨ Prometheus 监控指标
- ✨ 健康检查端点

### 技术栈
- 前端: React 18 + TypeScript + Vite + Ant Design + Redux Toolkit
- 后端: NestJS + Prisma + SQLite
- 测试: Jest (后端 54 测试) + Vitest (前端 57 测试)
- 监控: Prometheus + Grafana
- 部署: Docker + Docker Compose

### 安全特性
- 🔐 JWT 认证与刷新令牌
- 🔐 密码加密存储 (bcrypt)
- 🔐 角色权限控制 (RBAC)
- 🔐 Helmet 安全头配置
- 🔐 CORS 跨域配置

### 性能优化
- ⚡ 响应压缩中间件
- ⚡ Redis 缓存支持（可选）
- ⚡ Elasticsearch 搜索支持（可选）

### 文档
- 📚 API 文档 (Swagger)
- 📚 系统架构文档
- 📚 部署指南
- 📚 用户手册

---

## 版本说明

### 版本号格式: MAJOR.MINOR.PATCH

- **MAJOR**: 不兼容的 API 更改
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

### 更改类型

- `新增` - 新功能
- `更改` - 现有功能的更改
- `弃用` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - Bug 修复
- `安全` - 安全相关修复
