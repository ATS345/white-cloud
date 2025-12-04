# 木鱼游戏平台部署指南

## 1. 环境要求

### 1.1 系统要求
- **操作系统**: Linux (推荐 Ubuntu 20.04+) 或 Windows Server 2019+
- **CPU**: 至少 4 核
- **内存**: 至少 8GB RAM
- **存储**: 至少 50GB 可用磁盘空间

### 1.2 软件依赖
- **Node.js**: 18.x LTS
- **npm**: 9.x
- **PostgreSQL**: 14.x
- **Redis**: 6.x (可选，用于缓存)
- **Docker**: 20.10.x (可选，用于容器化部署)

## 2. 部署前准备

### 2.1 数据库配置
1. 创建 PostgreSQL 数据库
   ```sql
   CREATE DATABASE muyu_game;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE muyu_game TO postgres;
   ```

2. 启用 PostgreSQL 扩展
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### 2.2 环境变量配置
1. 复制环境变量示例文件
   ```bash
   cd backend
   cp .env.example .env
   ```

2. 根据实际情况修改 `.env` 文件中的配置项
   ```env
   # 服务器配置
   PORT=5000
   NODE_ENV=production

   # 数据库配置
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=muyu_game
   DB_USER=postgres
   DB_PASSWORD=password

   # JWT配置
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # CORS配置
   CORS_ORIGIN=https://your-domain.com

   # 其他配置...
   ```

## 3. 部署流程

### 3.1 后端部署

1. 安装依赖
   ```bash
   cd backend
   npm install --production
   ```

2. 运行数据库迁移
   ```bash
   npm run migrate
   ```

3. 运行种子数据 (可选)
   ```bash
   npm run seed
   ```

4. 启动后端服务
   ```bash
   # 使用 PM2 启动 (推荐)
   pm2 start server.js --name "muyu-backend"
   
   # 或使用 Node.js 直接启动
   node server.js
   ```

### 3.2 前端部署

1. 安装依赖
   ```bash
   cd frontend
   npm install
   ```

2. 构建生产版本
   ```bash
   npm run build
   ```

3. 部署构建产物
   ```bash
   # 使用 Nginx 部署 (推荐)
   # 将构建产物复制到 Nginx 静态目录
   cp -r dist/* /var/www/html/
   
   # 或使用 Vite 预览服务器
   npm run preview -- --port 3000
   ```

### 3.3 使用 Docker 部署 (可选)

1. 构建 Docker 镜像
   ```bash
   # 构建后端镜像
   cd backend
   docker build -t muyu-backend .
   
   # 构建前端镜像
   cd ../frontend
   docker build -t muyu-frontend .
   ```

2. 运行 Docker 容器
   ```bash
   # 运行后端容器
   docker run -d -p 5000:5000 --name muyu-backend muyu-backend
   
   # 运行前端容器
   docker run -d -p 3000:80 --name muyu-frontend muyu-frontend
   ```

## 4. 配置 Nginx

### 4.1 安装 Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 4.2 配置 Nginx 虚拟主机

创建 `/etc/nginx/sites-available/muyu-game.conf` 文件:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/v1/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:5000/api/v1/health;
    }
}
```

启用虚拟主机:
```bash
sudo ln -s /etc/nginx/sites-available/muyu-game.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 配置 HTTPS

### 5.1 安装 Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5.2 配置自动续期
```bash
sudo crontab -e
```

添加以下行:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. 部署验证

### 6.1 健康检查
- 后端健康检查: `http://localhost:5000/api/v1/health`
- 前端访问: `http://localhost:3000`

### 6.2 功能验证
1. 访问前端页面，确保页面正常加载
2. 尝试注册和登录功能
3. 查看游戏列表和详情
4. 测试购物车和支付流程
5. 测试开发者仪表板功能

## 7. 监控与维护

### 7.1 日志管理
- 后端日志: 使用 PM2 或直接查看 Node.js 日志
  ```bash
  pm2 logs muyu-backend
  ```

- Nginx 日志: `/var/log/nginx/access.log` 和 `/var/log/nginx/error.log`

### 7.2 数据库备份
```bash
# 每日备份数据库
0 2 * * * pg_dump -h localhost -U postgres muyu_game > /backup/muyu_game_$(date +%Y%m%d).sql
```

### 7.3 性能监控
- 使用 PM2 监控后端性能
  ```bash
  pm2 monit
  ```

- 使用 Nginx 日志分析工具
  ```bash
  sudo apt install goaccess
  sudo goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
  ```

## 8. 常见问题

### 8.1 数据库连接失败
- 检查数据库服务是否运行
  ```bash
  systemctl status postgresql
  ```

- 检查数据库配置是否正确
  ```bash
  psql -h localhost -U postgres -d muyu_game
  ```

### 8.2 端口被占用
- 检查端口占用情况
  ```bash
  lsof -i :5000
  ```

- 关闭占用端口的进程
  ```bash
  kill -9 <PID>
  ```

### 8.3 前端页面空白
- 检查构建产物是否正确
  ```bash
  ls -la frontend/dist/
  ```

- 检查 Nginx 配置是否正确
  ```bash
  sudo nginx -t
  ```

## 9. 版本更新

### 9.1 后端更新
1. 拉取最新代码
   ```bash
   git pull origin main
   ```

2. 安装新依赖
   ```bash
   npm install --production
   ```

3. 运行数据库迁移
   ```bash
   npm run migrate
   ```

4. 重启服务
   ```bash
   pm2 restart muyu-backend
   ```

### 9.2 前端更新
1. 拉取最新代码
   ```bash
   git pull origin main
   ```

2. 安装新依赖
   ```bash
   npm install
   ```

3. 构建新的生产版本
   ```bash
   npm run build
   ```

4. 部署构建产物
   ```bash
   cp -r dist/* /var/www/html/
   ```

## 10. 安全建议

1. 定期更新依赖
   ```bash
   npm audit
   npm update
   ```

2. 启用防火墙
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 5000/tcp
   ```

3. 配置安全组 (云服务器)
   - 仅开放必要的端口
   - 限制访问 IP 范围

4. 定期进行安全扫描
   ```bash
   sudo apt install nmap
   nmap -sV localhost
   ```

## 11. 联系支持

如有任何部署问题，请联系开发团队:
- 邮件: support@muyu-game.com
- 文档: https://docs.muyu-game.com
- 社区: https://community.muyu-game.com

---

**部署完成后，访问 `https://your-domain.com` 即可使用木鱼游戏平台！**