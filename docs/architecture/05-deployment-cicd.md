# 部署方案和CI/CD流程

## 文档概述

本文档详细描述了云幕游戏商店平台的部署方案和CI/CD流程，包括环境配置、容器化部署、自动化流程、监控告警等。

**文档版本**: v1.0  
**最后更新**: 2024-03-14

---

## 目录

1. [部署架构](#1-部署架构)
2. [环境配置](#2-环境配置)
3. [容器化部署](#3-容器化部署)
4. [Kubernetes部署](#4-kubernetes部署)
5. [CI/CD流程](#5-cicd流程)
6. [数据库部署](#6-数据库部署)
7. [监控部署](#7-监控部署)
8. [灾备方案](#8-灾备方案)

---

## 1. 部署架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户层                               │
│  Web浏览器  │  移动应用  │  桌面客户端                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    CDN层                                │
│  Cloudflare CDN  │  静态资源  │  API加速  │  DDoS防护   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    负载均衡层                           │
│  Nginx Load Balancer  │  SSL Termination             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    应用层                               │
│  Kubernetes Cluster                                   │
│  ├── Frontend Pods                                     │
│  ├── API Gateway Pods                                  │
│  ├── User Service Pods                                 │
│  ├── Game Service Pods                                 │
│  ├── Order Service Pods                                │
│  └── Payment Service Pods                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    数据层                               │
│  PostgreSQL Cluster  │  MongoDB Cluster  │  Redis Cluster│
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    存储层                               │
│  AWS S3  │  Cloudflare R2  │  本地存储                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 网络架构

```
Internet
    ↓
┌─────────────────────────────────────────┐
│         Cloudflare WAF/CDN             │
│  - DDoS Protection                   │
│  - Web Application Firewall          │
│  - Global CDN                        │
└──────────────┬──────────────────────┘
               ↓ HTTPS
┌─────────────────────────────────────────┐
│      AWS Application Load Balancer      │
│  - SSL Termination                   │
│  - Health Checks                     │
│  - Auto Scaling                      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      Kubernetes Ingress Controller     │
│  - Nginx Ingress                    │
│  - Route Rules                      │
│  - TLS Termination                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Kubernetes Services            │
│  - Frontend Service                  │
│  - API Gateway Service               │
│  - Microservices                     │
└─────────────────────────────────────────┘
```

---

## 2. 环境配置

### 2.1 环境划分

| 环境 | 用途 | 配置 | 部署方式 |
|------|------|------|---------|
| 开发环境 | 日常开发 | 单机部署 | Docker Compose |
| 测试环境 | 功能测试 | 小规模集群 | Kubernetes |
| 预发布环境 | 生产验证 | 生产配置 | Kubernetes |
| 生产环境 | 正式运行 | 高可用集群 | Kubernetes |

### 2.2 环境变量

#### 2.2.1 通用配置

```env
# 应用配置
APP_NAME=yunmu-game-store
APP_ENV=production
APP_PORT=3000
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/yunmu
DATABASE_READ_URL=postgresql://user:password@localhost:5432/yunmu_read
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=password
REDIS_DB=0

# 消息队列配置
RABBITMQ_URL=amqp://user:password@localhost:5672/yunmu

# 对象存储配置
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=yunmu-game-store
S3_ACCESS_KEY=access_key
S3_SECRET_KEY=secret_key
S3_REGION=us-east-1

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@yunmu.com

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json

# 监控配置
SENTRY_DSN=https://xxx@sentry.io/xxx
NEW_RELIC_LICENSE_KEY=your_license_key
```

#### 2.2.2 环境特定配置

**开发环境**:
```env
APP_ENV=development
LOG_LEVEL=debug
DATABASE_URL=postgresql://dev:dev@localhost:5432/yunmu_dev
```

**测试环境**:
```env
APP_ENV=test
LOG_LEVEL=info
DATABASE_URL=postgresql://test:test@localhost:5432/yunmu_test
```

**生产环境**:
```env
APP_ENV=production
LOG_LEVEL=warn
DATABASE_URL=postgresql://prod:prod@prod-db.example.com:5432/yunmu_prod
```

---

## 3. 容器化部署

### 3.1 Docker镜像

#### 3.1.1 前端Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3.1.2 后端Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 3.2 Docker Compose

#### 3.2.1 开发环境配置

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: yunmu_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: dev
      RABBITMQ_DEFAULT_PASS: dev
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://dev:dev@postgres:5432/yunmu_dev
      - REDIS_HOST=redis
      - RABBITMQ_URL=amqp://dev:dev@rabbitmq:5672/yunmu
    depends_on:
      - postgres
      - redis
      - rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

---

## 4. Kubernetes部署

### 4.1 命名空间

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: yunmu
  labels:
    name: yunmu
    environment: production
```

### 4.2 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yunmu-config
  namespace: yunmu
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  NODE_ENV: "production"
```

### 4.3 Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: yunmu-secrets
  namespace: yunmu
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXNxbDovL3Byb2Q6cHJvZEBwcm9kLWRiLmV4YW1wbGUuY29tOjU0MzIveXVubXVfcHJvZA==
  REDIS_PASSWORD: cGFzc3dvcmQ=
  JWT_SECRET: eW91cl9qd3Rfc2VjcmV0X2tleQ==
  S3_ACCESS_KEY: YWNjZXNzX2tleQ==
  S3_SECRET_KEY: c2VjcmV0X2tleQ==
```

### 4.4 部署配置

#### 4.4.1 前端部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: yunmu
  labels:
    app: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        version: v1
    spec:
      containers:
      - name: frontend
        image: yunmu/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: yunmu
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

#### 4.4.2 API网关部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: yunmu
  labels:
    app: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        version: v1
    spec:
      containers:
      - name: api-gateway
        image: yunmu/api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yunmu-secrets
              key: DATABASE_URL
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: yunmu-secrets
              key: REDIS_PASSWORD
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: yunmu
spec:
  selector:
    app: api-gateway
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### 4.4.3 用户服务部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: yunmu
  labels:
    app: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: yunmu/user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yunmu-secrets
              key: DATABASE_URL
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: yunmu-secrets
              key: REDIS_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: yunmu-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: yunmu
spec:
  selector:
    app: user-service
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
  namespace: yunmu
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 4.5 Ingress配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yunmu-ingress
  namespace: yunmu
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  tls:
  - hosts:
    - www.yunmu.com
    - api.yunmu.com
    secretName: yunmu-tls
  rules:
  - host: www.yunmu.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.yunmu.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8000
```

---

## 5. CI/CD流程

### 5.1 CI/CD架构

```
┌─────────────┐
│   开发者     │
└──────┬──────┘
       ↓ Push
┌─────────────────────────────────────────┐
│         GitHub                        │
│  - 代码仓库                          │
│  - Pull Request                      │
│  - Issues                            │
└──────────────┬──────────────────────┘
               ↓ Trigger
┌─────────────────────────────────────────┐
│      GitHub Actions                   │
│  ├── 代码检查                        │
│  ├── 单元测试                        │
│  ├── 构建镜像                        │
│  ├── 推送镜像                        │
│  └── 部署应用                        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Docker Hub                    │
│  - 镜像存储                          │
│  - 镜像版本管理                      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      Kubernetes Cluster               │
│  - 自动部署                          │
│  - 滚动更新                          │
│  - 回滚                              │
└─────────────────────────────────────────┘
```

### 5.2 GitHub Actions配置

#### 5.2.1 前端CI/CD

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'
  REGISTRY: docker.io
  IMAGE_NAME: yunmu/frontend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - name: Update deployment
        run: |
          kubectl set image deployment/frontend \
            frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -n yunmu

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/frontend -n yunmu

      - name: Verify deployment
        run: |
          kubectl get pods -l app=frontend -n yunmu
```

#### 5.2.2 后端CI/CD

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'
  REGISTRY: docker.io
  IMAGE_NAME: yunmu/api-gateway

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: yunmu_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/yunmu_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Build
        run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api-gateway, user-service, game-service, order-service]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./backend/${{ matrix.service }}
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ matrix.service }}:latest
            ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ matrix.service }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ matrix.service }}:buildcache,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api-gateway, user-service, game-service, order-service]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - name: Update deployment
        run: |
          kubectl set image deployment/${{ matrix.service }} \
            ${{ matrix.service }}=${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }} \
            -n yunmu

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/${{ matrix.service }} -n yunmu

      - name: Verify deployment
        run: |
          kubectl get pods -l app=${{ matrix.service }} -n yunmu
```

### 5.3 部署策略

#### 5.3.1 滚动更新

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: yunmu
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

#### 5.3.2 蓝绿部署

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: user-service
  namespace: yunmu
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: user-service-active
      previewService: user-service-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: user-service-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: user-service-active
```

#### 5.3.3 灰度发布

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: user-service
  namespace: yunmu
spec:
  replicas: 10
  strategy:
    canary:
      canaryService: user-service-canary
      stableService: user-service-stable
      trafficAnalysis:
        templates:
        - templateName: success-rate
        - templateName: latency
      steps:
      - setWeight: 10
      - pause: {duration: 5m}
      - setWeight: 25
      - pause: {duration: 10m}
      - setWeight: 50
      - pause: {duration: 10m}
      - setWeight: 100
```

---

## 6. 数据库部署

### 6.1 PostgreSQL部署

#### 6.1.1 StatefulSet配置

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: yunmu
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: yunmu
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: yunmu
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### 6.2 Redis部署

#### 6.2.1 Redis Cluster配置

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: yunmu
spec:
  serviceName: redis
  replicas: 6
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        - containerPort: 16379
        command:
        - redis-server
        - --cluster-enabled yes
        - --cluster-config-file nodes.conf
        - --cluster-node-timeout 5000
        - --appendonly yes
        - --protected-mode no
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: yunmu
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  clusterIP: None
```

---

## 7. 监控部署

### 7.1 Prometheus部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--web.console.libraries=/usr/share/prometheus/console_libraries'
        - '--web.console.templates=/usr/share/prometheus/consoles'
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus
        - name: prometheus-storage
          mountPath: /prometheus
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
      - name: prometheus-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: monitoring
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
  type: ClusterIP
```

### 7.2 Grafana部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
        - name: grafana-config
          mountPath: /etc/grafana/provisioning
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
      volumes:
      - name: grafana-storage
        emptyDir: {}
      - name: grafana-config
        configMap:
          name: grafana-config
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: monitoring
spec:
  selector:
    app: grafana
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

---

## 8. 灾备方案

### 8.1 备份策略

#### 8.1.1 数据库备份

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: yunmu
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres -U $POSTGRES_USER -d yunmu | gzip > /backup/yunmu_$(date +%Y%m%d_%H%M%S).sql.gz
              aws s3 cp /backup/yunmu_*.sql.gz s3://yunmu-backups/postgres/
            env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: username
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secrets
                  key: password
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-secrets
                  key: access-key
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-secrets
                  key: secret-key
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            emptyDir: {}
          restartPolicy: OnFailure
```

### 8.2 灾难恢复

#### 8.2.1 恢复流程

1. **评估损失**
   - 确定受影响的服务
   - 评估数据丢失情况
   - 确定恢复优先级

2. **恢复数据**
   - 从备份恢复数据库
   - 恢复对象存储数据
   - 恢复配置数据

3. **恢复服务**
   - 启动关键服务
   - 验证服务健康状态
   - 逐步恢复全部服务

4. **验证恢复**
   - 功能测试
   - 性能测试
   - 安全检查

---

## 附录

### A. 部署检查清单

#### 部署前
- [ ] 代码审查完成
- [ ] 测试通过
- [ ] 配置文件准备
- [ ] 备份当前环境
- [ ] 通知相关人员

#### 部署中
- [ ] 执行部署脚本
- [ ] 监控部署进度
- [ ] 检查错误日志
- [ ] 验证服务状态

#### 部署后
- [ ] 功能验证
- [ ] 性能验证
- [ ] 监控告警检查
- [ ] 用户反馈收集
- [ ] 文档更新

### B. 常用命令

```bash
# 查看Pod状态
kubectl get pods -n yunmu

# 查看Service状态
kubectl get services -n yunmu

# 查看日志
kubectl logs -f deployment/user-service -n yunmu

# 进入Pod
kubectl exec -it <pod-name> -n yunmu -- /bin/sh

# 扩容
kubectl scale deployment user-service --replicas=5 -n yunmu

# 回滚
kubectl rollout undo deployment/user-service -n yunmu

# 查看事件
kubectl get events -n yunmu --sort-by='.lastTimestamp'
```

---

**文档结束**