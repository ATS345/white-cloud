# 云幕游戏商店平台 - 部署文档索引

## 文档概述

本目录包含了云幕游戏商店平台的部署文档，涵盖环境搭建、Docker部署、生产环境部署等内容。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕运维团队

---

## 文档列表

### 1. 环境搭建指南
**文件**: [01-environment-setup.md](./01-environment-setup.md)

**内容概述**:
- 开发环境配置
- 测试环境配置
- 预发布环境配置
- 生产环境配置
- 环境变量管理

**适用人群**: 运维工程师、开发工程师

---

### 2. Docker部署指南
**文件**: [02-docker-deployment.md](./02-docker-deployment.md)

**内容概述**:
- Docker镜像构建
- Docker Compose配置
- 容器编排和管理
- 数据持久化配置

**适用人群**: 运维工程师、DevOps工程师

---

### 3. 生产环境部署指南
**文件**: [03-production-deployment.md](./03-production-deployment.md)

**内容概述**:
- Kubernetes部署
- 负载均衡配置
- 数据库集群配置
- 监控和日志配置
- 备份和恢复策略

**适用人群**: 运维工程师、SRE工程师

---

## 部署架构

### 环境架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   开发环境       │     │   测试环境       │     │   生产环境       │
│   Development   │     │   Staging       │     │   Production    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • 本地开发      │     │ • 功能测试      │     │ • 高可用部署    │
│ • Docker Compose│     │ • 集成测试      │     │ • Kubernetes    │
│ • 单机部署      │     │ • 性能测试      │     │ • 负载均衡      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 服务架构

```
                    ┌─────────────────┐
                    │   负载均衡器     │
                    │   (Nginx/ALB)   │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   前端服务     │ │  API网关    │ │  API网关    │
    │   (React)     │ │  (Node.js)  │ │  (Node.js)  │
    └───────────────┘ └──────┬──────┘ └──────┬──────┘
                             │                │
            ┌────────────────┼────────────────┤
            │                │                │
    ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  PostgreSQL   │ │    Redis    │ │Elasticsearch│
    │    主从集群    │ │   哨兵集群   │ │    集群     │
    └───────────────┘ └─────────────┘ └─────────────┘
```

---

## 部署检查清单

### 部署前检查

- [ ] 代码已通过所有测试
- [ ] 环境变量已配置
- [ ] 数据库迁移脚本已准备
- [ ] SSL证书已配置
- [ ] 监控和告警已配置

### 部署中检查

- [ ] 服务启动正常
- [ ] 数据库连接正常
- [ ] API接口响应正常
- [ ] 前端页面加载正常
- [ ] 日志输出正常

### 部署后检查

- [ ] 功能测试通过
- [ ] 性能指标达标
- [ ] 安全扫描通过
- [ ] 备份任务配置完成
- [ ] 文档已更新

---

## 常用命令

### Docker命令

```bash
# 构建镜像
docker build -t cloudcurtain-frontend .
docker build -t cloudcurtain-backend ./backend

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Kubernetes命令

```bash
# 应用配置
kubectl apply -f k8s/

# 查看状态
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/cloudcurtain-backend

# 扩容
kubectl scale deployment cloudcurtain-backend --replicas=3
```

---

## 相关文档

- [部署方案和CI/CD流程](../architecture/05-deployment-cicd.md)
- [监控和运维方案](../architecture/07-monitoring-operations.md)

---

## 联系方式

- **运维支持**: ops@cloudcurtain.com
- **技术支持**: tech@cloudcurtain.com

---

**文档维护团队**: 云幕运维团队  
**最后更新**: 2026-03-14
