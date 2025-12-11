# 木鱼游戏平台 - 微服务架构

## 1. 微服务列表

### 1.1 用户服务（user-service）
- **职责**：用户认证、注册、个人资料管理
- **端口**：3001
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.2 游戏服务（game-service）
- **职责**：游戏管理、分类、标签、搜索
- **端口**：3002
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.3 购物车服务（cart-service）
- **职责**：购物车管理、商品添加/删除/更新
- **端口**：3003
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.4 支付服务（payment-service）
- **职责**：订单管理、支付处理、退款
- **端口**：3004
- **技术栈**：Node.js + Express + MySQL + Redis + Stripe

### 1.5 下载服务（download-service）
- **职责**：游戏下载、断点续传、版本管理
- **端口**：3005
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.6 评价服务（review-service）
- **职责**：游戏评价、回复、媒体管理
- **端口**：3006
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.7 开发者服务（developer-service）
- **职责**：开发者后台、游戏发布、销售数据
- **端口**：3007
- **技术栈**：Node.js + Express + MySQL + Redis

### 1.8 推荐服务（recommendation-service）
- **职责**：游戏推荐、个性化推荐
- **端口**：3008
- **技术栈**：Python + Flask + MongoDB + Redis

## 2. 共享资源

### 2.1 公共配置（shared-config）
- **职责**：共享的配置文件
- **位置**：microservices/shared-config/

### 2.2 公共中间件（shared-middleware）
- **职责**：共享的中间件
- **位置**：microservices/shared-middleware/

### 2.3 公共工具函数（shared-utils）
- **职责**：共享的工具函数
- **位置**：microservices/shared-utils/

### 2.4 数据库模型（shared-models）
- **职责**：共享的数据库模型定义
- **位置**：microservices/shared-models/

## 3. 部署说明

### 3.1 Docker Compose
- **文件位置**：microservices/docker-compose.yml
- **启动命令**：docker-compose up -d

### 3.2 Kubernetes
- **文件位置**：microservices/k8s/
- **部署命令**：kubectl apply -f k8s/

## 4. 开发流程

### 4.1 本地开发
1. 启动基础服务（Consul、Kafka、Redis、MySQL）
2. 启动各个微服务
3. 访问API网关（http://localhost:8000）

### 4.2 代码提交
1. 提交代码到GitHub
2. GitHub Actions自动执行测试和构建
3. 镜像推送到Docker Hub

### 4.3 部署
1. 在测试环境部署
2. 进行测试
3. 在生产环境部署

## 5. 监控与日志

### 5.1 监控
- **地址**：http://localhost:3000（Grafana）
- **指标**：API响应时间、错误率、CPU使用率等

### 5.2 日志
- **地址**：http://localhost:5601（Kibana）
- **查询**：支持按服务、时间、级别等查询日志

## 6. 链路追踪

### 6.1 Jaeger
- **地址**：http://localhost:16686
- **功能**：跟踪请求在各个服务之间的流转

## 7. API文档

### 7.1 Swagger UI
- **地址**：http://localhost:8000/api/v1/docs
- **功能**：查看和测试API接口

## 8. 注意事项

1. 每个微服务都是独立的，不要在微服务之间直接调用数据库
2. 微服务之间通过API网关通信
3. 使用消息队列处理异步任务
4. 确保每个微服务都有完善的测试
5. 定期备份数据
6. 监控系统运行状态
7. 及时处理告警

## 9. 联系人

- 架构师：XXX
- 开发负责人：XXX
- 运维负责人：XXX

## 10. 变更记录

| 日期 | 变更内容 | 变更人 |
|------|----------|--------|
| 2025-12-10 | 初始化微服务架构 | XXX |
