# 云幕游戏商店平台 - 开发指南索引

## 文档概述

本目录包含了云幕游戏商店平台的开发指南文档，帮助开发团队快速上手并遵循统一的开发规范。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕开发团队

---

## 文档列表

### 1. 快速开始指南
**文件**: [01-getting-started.md](./01-getting-started.md)

**内容概述**:
- 开发环境搭建
- 项目结构说明
- 依赖安装和配置
- 本地开发服务器启动
- 常见问题解答

**适用人群**: 所有开发人员

---

### 2. 编码规范
**文件**: [02-coding-standards.md](./02-coding-standards.md)

**内容概述**:
- 代码风格规范
- TypeScript编码规范
- React组件规范
- 命名约定
- 注释规范
- 代码审查标准

**适用人群**: 所有开发人员

---

### 3. Git工作流程
**文件**: [03-git-workflow.md](./03-git-workflow.md)

**内容概述**:
- Git分支策略
- 提交信息规范
- 代码合并流程
- 版本发布流程
- 冲突解决指南

**适用人群**: 所有开发人员

---

### 4. 测试指南
**文件**: [04-testing-guide.md](./04-testing-guide.md)

**内容概述**:
- 测试策略概述
- 单元测试编写
- 集成测试编写
- E2E测试编写
- 测试覆盖率要求
- 测试最佳实践

**适用人群**: 开发人员、测试工程师

---

## 开发环境要求

### 必需软件

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | 20 LTS | JavaScript运行环境 |
| npm/yarn | 最新版本 | 包管理器 |
| Git | 2.42+ | 版本控制 |
| VS Code | 最新版本 | 代码编辑器（推荐） |

### 推荐VS Code扩展

- ESLint
- Prettier
- TypeScript Hero
- React Developer Tools
- Redux DevTools

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/cloudcurtain/game-store-platform.git
cd game-store-platform
```

### 2. 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd backend
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑环境变量
# 根据实际情况修改数据库连接等配置
```

### 4. 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动后端开发服务器（新终端）
cd backend
npm run start:dev
```

---

## 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/功能名称
```

### 2. 开发功能

- 遵循编码规范
- 编写单元测试
- 更新相关文档

### 3. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/功能名称
```

### 4. 创建Pull Request

- 在GitHub上创建Pull Request
- 填写PR描述
- 等待代码审查

### 5. 合并代码

- 通过代码审查后合并到主分支
- 删除功能分支

---

## 常用命令

### 前端命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm run lint         # 代码检查
npm run format       # 代码格式化
```

### 后端命令

```bash
npm run start:dev    # 启动开发服务器
npm run build        # 构建生产版本
npm run start:prod   # 启动生产服务器
npm run test         # 运行测试
npm run lint         # 代码检查
```

---

## 相关文档

- [API接口规范](../api/01-api-specification.md)
- [系统架构设计](../architecture/01-system-architecture.md)
- [部署文档](../deployment/README.md)

---

## 联系方式

- **技术支持**: tech@cloudcurtain.com
- **开发团队**: dev@cloudcurtain.com

---

**文档维护团队**: 云幕开发团队  
**最后更新**: 2026-03-14
