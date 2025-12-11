# 使用官方Node.js 18镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码到工作目录
COPY . .

# 暴露应用端口
EXPOSE 5000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "start.js"]
