# Git Remote 配置指南

## 问题分析

在 PowerShell 中执行以下命令时遇到了语法错误：
```bash
git remote add origin <your-git-repository-url>
```

**错误原因**：PowerShell 将 `<>` 尖括号视为重定向运算符，而不是占位符。

## 解决方案

### 正确的命令格式

在 PowerShell 中，直接使用实际的仓库 URL，不要包含 `<>` 尖括号：

```bash
# 示例：使用 GitHub 仓库 URL
git remote add origin https://github.com/username/repository-name.git

# 示例：使用 GitLab 仓库 URL
git remote add origin https://gitlab.com/username/repository-name.git

# 示例：使用 SSH URL
git remote add origin git@github.com:username/repository-name.git
```

### 详细步骤

1. **确定远程仓库 URL**
   - 登录您的 Git 托管平台（GitHub, GitLab, Gitee 等）
   - 创建一个新的仓库或使用现有仓库
   - 复制仓库的 HTTPS 或 SSH URL

2. **添加远程仓库**
   ```bash
   git remote add origin <actual-repository-url>
   ```
   例如：
   ```bash
   git remote add origin https://github.com/example/cloud-game-platform.git
   ```

3. **验证远程仓库配置**
   ```bash
   git remote -v
   ```
   预期输出：
   ```
   origin  https://github.com/example/cloud-game-platform.git (fetch)
   origin  https://github.com/example/cloud-game-platform.git (push)
   ```

4. **推送代码到远程仓库**
   ```bash
   git push -u origin main
   ```

## 常见问题解决

### 1. 权限错误

**错误信息**：
```
fatal: Could not read from remote repository.
Please make sure you have the correct access rights
and the repository exists.
```

**解决方案**：
- 检查仓库 URL 是否正确
- 确保您有权限访问该仓库
- 如果使用 SSH URL，确保 SSH 密钥已正确配置

### 2. 分支不存在

**错误信息**：
```
fatal: The current branch main has no upstream branch.
```

**解决方案**：
```bash
git push --set-upstream origin main
```

### 3. 本地分支与远程分支不匹配

**解决方案**：
```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 拉取远程分支
git fetch origin

# 关联本地分支与远程分支
git branch --set-upstream-to=origin/main main
```

## 本地部署验证

在配置远程仓库之前，您可以通过以下方式验证本地部署：

1. 确保生产构建成功：
   ```bash
   cd cloud-game-platform
   npm run build
   ```

2. 启动本地预览服务：
   ```bash
   npm run preview
   ```

3. 访问 http://localhost:4173/ 验证网站功能

## 自动化部署

配置远程仓库后，GitHub Actions 会自动执行以下流程：
1. 代码质量检查
2. 单元测试
3. 生产构建
4. 部署到 GitHub Pages

您可以在 GitHub 仓库的 Actions 页面查看部署状态。

## 联系支持

如果遇到其他问题，请：
1. 检查 Git 命令是否正确
2. 验证仓库 URL 是否有效
3. 确保您有仓库访问权限
4. 查看 Git 错误信息并搜索解决方案

---

**日期**: 2025-12-30
**版本**: 1.0