# 手动部署指南

## 1. 构建生产版本

### 1.1 安装依赖

```bash
npm install
```

### 1.2 执行构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录中。

### 1.3 验证构建产物

```bash
dir dist
```

构建产物应该包括：
- `index.html` - 主页面文件
- `assets/` - 静态资源目录（CSS、JavaScript、图片等）
- `vite.svg` - Vite图标文件

## 2. 手动部署到GitHub Pages

### 2.1 前提条件

- 已创建GitHub仓库
- 已将项目代码推送到GitHub仓库
- 具有仓库的写入权限

### 2.2 部署步骤

1. **安装gh-pages包**

```bash
npm install --save-dev gh-pages
```

2. **在package.json中添加部署脚本**

```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

3. **执行部署命令**

```bash
npm run deploy
```

4. **访问部署后的网站**

部署完成后，访问以下URL查看网站：

```
https://<username>.github.io/<repository-name>
```

例如：

```
https://ATS345.github.io/white-cloud
```

### 2.3 手动部署备选方案

如果上述方法失败，可以使用以下备选方案：

1. **创建gh-pages分支**

```bash
git checkout -b gh-pages
git push origin gh-pages
```

2. **切换回main分支**

```bash
git checkout main
```

3. **构建生产版本**

```bash
npm run build
```

4. **将构建产物复制到gh-pages分支**

```bash
git checkout gh-pages
rm -rf ./*
cp -r dist/* .
git add .
git commit -m "Deploy production build"
git push origin gh-pages
```

5. **切换回main分支**

```bash
git checkout main
```

## 3. 部署到其他静态网站托管服务

### 3.1 Vercel

1. **访问Vercel官网**

访问 [Vercel](https://vercel.com/) 并登录。

2. **导入GitHub仓库**

点击"New Project"，选择要部署的GitHub仓库。

3. **配置部署**

- 保持默认配置
- 点击"Deploy"开始部署

4. **访问部署后的网站**

部署完成后，Vercel将提供一个URL，用于访问部署后的网站。

### 3.2 Netlify

1. **访问Netlify官网**

访问 [Netlify](https://www.netlify.com/) 并登录。

2. **导入GitHub仓库**

点击"Add new site" → "Import an existing project"，选择要部署的GitHub仓库。

3. **配置部署**

- 构建命令：`npm run build`
- 发布目录：`dist`
- 点击"Deploy site"开始部署

4. **访问部署后的网站**

部署完成后，Netlify将提供一个URL，用于访问部署后的网站。

### 3.3 AWS S3 + CloudFront

1. **创建S3存储桶**

- 登录AWS控制台
- 打开S3服务
- 创建新的存储桶，名称与您的域名匹配
- 启用"静态网站托管"
- 配置索引文档为 `index.html`

2. **上传构建产物**

- 点击存储桶名称
- 点击"上传"
- 选择 `dist` 目录下的所有文件
- 上传文件

3. **配置CloudFront**

- 打开CloudFront服务
- 点击"Create Distribution"
- 配置源为您的S3存储桶
- 配置默认根对象为 `index.html`
- 点击"Create Distribution"

4. **访问部署后的网站**

部署完成后，使用CloudFront提供的域名访问网站。

### 3.4 Nginx服务器

1. **安装Nginx**

```bash
sudo apt-get update
sudo apt-get install nginx
```

2. **创建网站配置文件**

```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

3. **配置Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-domain.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. **创建符号链接**

```bash
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
```

5. **上传构建产物**

```bash
sudo mkdir -p /var/www/your-domain.com
sudo cp -r dist/* /var/www/your-domain.com/
sudo chown -R www-data:www-data /var/www/your-domain.com
```

6. **重启Nginx**

```bash
sudo systemctl restart nginx
```

7. **访问部署后的网站**

使用您的域名访问网站。

## 4. 部署验证

### 4.1 访问网站

部署完成后，访问部署后的网站，检查页面是否正常加载。

### 4.2 测试核心功能

- 测试首页是否正常显示
- 测试游戏列表是否正常加载
- 测试游戏详情页面是否正常显示
- 测试登录注册功能是否正常
- 测试响应式设计是否正常

### 4.3 检查浏览器控制台

打开浏览器开发者工具的控制台，检查是否有JavaScript错误。

### 4.4 检查网络请求

检查网络请求是否正常，包括API请求、静态资源请求等。

## 5. 常见问题及解决方案

### 5.1 页面空白

**问题**：访问部署后的网站，页面显示空白。

**解决方案**：
- 检查浏览器控制台是否有JavaScript错误
- 检查构建产物是否完整
- 检查路由配置是否正确
- 检查base路径配置是否正确

### 5.2 资源加载失败

**问题**：页面显示，但CSS、JavaScript或图片等资源加载失败。

**解决方案**：
- 检查构建产物中的资源路径是否正确
- 检查base路径配置是否正确
- 检查服务器配置是否正确

### 5.3 路由刷新404

**问题**：访问页面正常，但刷新页面后显示404错误。

**解决方案**：
- 配置服务器的fallback路由，将所有请求指向index.html
- 对于Nginx，配置 `try_files $uri $uri/ /index.html;`
- 对于GitHub Pages，使用HashRouter代替BrowserRouter

### 5.4 性能问题

**问题**：页面加载速度慢。

**解决方案**：
- 优化图片大小和格式
- 启用gzip压缩
- 配置浏览器缓存
- 使用CDN加速静态资源

## 6. 后续维护

### 6.1 更新部署

```bash
npm run build
# 然后执行部署命令，例如：
npm run deploy
```

### 6.2 监控网站

- 使用Sentry监控网站错误
- 使用Google Analytics分析网站流量
- 使用Lighthouse定期评估网站性能

### 6.3 备份数据

定期备份网站数据，包括：
- 数据库数据
- 用户数据
- 配置文件

## 7. 自动化部署恢复指南

当网络连接恢复后，可以按照以下步骤恢复自动化部署：

1. **推送代码到远程仓库**

```bash
git push origin main
```

2. **查看部署状态**

访问GitHub仓库的Actions页面，查看部署状态。

3. **验证部署结果**

部署完成后，访问部署后的网站，验证部署结果。

## 8. 总结

本指南提供了云游戏平台的手动部署步骤，包括部署到GitHub Pages、Vercel、Netlify、AWS S3 + CloudFront和Nginx服务器的详细步骤。通过本指南，您可以在网络连接问题解决后，轻松完成项目的部署。

如果您遇到任何问题，请参考常见问题及解决方案部分，或联系项目团队获取帮助。