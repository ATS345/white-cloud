# 项目部署指南

## 1. 准备工作

### 1.1 配置远程仓库

在执行部署之前，需要配置远程仓库：

```bash
git remote add origin <your-git-repository-url>
git push -u origin main
```

### 1.2 环境变量配置

根据项目需要，配置必要的环境变量，如API地址等。

## 2. 部署方式

### 2.1 自动化部署（推荐）

项目已配置GitHub Actions CI/CD流水线，位于 `.github/workflows/ci-cd.yml`。当代码推送到 `main` 或 `master` 分支时，会自动执行：

1. 代码质量检查（ESLint, TypeScript）
2. 单元测试
3. 生产构建
4. 部署到GitHub Pages

**步骤：**

1. 将代码推送到远程仓库的 `main` 分支：
   ```bash
   git push origin main
   ```

2. 前往GitHub仓库的 Actions 页面查看部署状态

3. 部署完成后，访问 `https://<username>.github.io/<repository-name>` 查看网站

### 2.2 手动部署

#### 2.2.1 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录中。

#### 2.2.2 部署到静态网站托管服务

将 `dist/` 目录下的所有文件部署到您选择的静态网站托管服务，如：

- GitHub Pages
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx 服务器

## 3. 本地预览

在部署前，可以通过以下命令在本地预览生产构建：

```bash
npm run preview
```

访问 `http://localhost:4173/` 查看预览效果。

## 4. 回滚方案

### 4.1 GitHub Actions 部署回滚

1. 前往GitHub仓库的 Actions 页面
2. 找到最新的部署 workflow run
3. 点击 "Re-run jobs" 按钮重新部署，或使用 "Delete workflow run" 删除部署

### 4.2 手动回滚

1. 切换到之前的稳定版本：
   ```bash
   git checkout <stable-commit-hash>
   ```

2. 重新构建并部署：
   ```bash
   npm run build
   # 部署 dist/ 目录到您的托管服务
   ```

3. 切换回主分支：
   ```bash
   git checkout main
   ```

## 5. 监控与维护

### 5.1 错误监控

项目已集成 Sentry 监控，配置位于 `src/main.tsx`。确保在生产环境中配置正确的 Sentry DSN。

### 5.2 性能监控

使用浏览器开发者工具的 Performance 面板监控网站性能。

### 5.3 定期维护

- 定期更新依赖：`npm update`
- 定期检查安全漏洞：`npm audit`
- 定期执行代码质量检查：`npm run lint`
- 定期运行测试：`npm run test:run`

## 6. 常见问题

### 6.1 构建失败

**问题**：执行 `npm run build` 失败

**解决方案**：
1. 检查 TypeScript 错误：`npx tsc -b`
2. 检查 ESLint 错误：`npm run lint`
3. 检查依赖是否正确安装：`npm install`

### 6.2 部署后页面空白

**问题**：部署后访问网站出现空白页面

**解决方案**：
1. 检查浏览器控制台是否有 JavaScript 错误
2. 检查构建产物是否完整上传
3. 确保路由配置正确，特别是使用 React Router 时
4. 检查环境变量是否正确配置

## 7. 技术支持

如果遇到部署问题，请：

1. 查看项目文档
2. 检查 GitHub Issues
3. 提交新的 Issue 描述问题

## 8. 部署成功验证

部署完成后，通过以下方式验证：

1. 访问网站，检查页面是否正常加载
2. 测试核心功能是否正常工作
3. 检查浏览器控制台是否有错误
4. 验证性能指标是否符合预期

---

**版本**: 1.1.0
**更新日期**: 2025-12-30
**作者**: 自动生成