# 监控告警系统配置指南

## 一、系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    监控告警架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   应用服务   │───▶│  Prometheus │───▶│   Grafana   │     │
│  │  :3000/metrics   │   :9090     │    │   :3001     │     │
│  └─────────────┘    └──────┬──────┘    └─────────────┘     │
│                            │                                │
│                            ▼                                │
│                     ┌─────────────┐                        │
│                     │AlertManager│                        │
│                     │   :9093    │                        │
│                     └──────┬──────┘                        │
│                            │                                │
│         ┌──────────────────┼──────────────────┐           │
│         ▼                  ▼                  ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   邮件通知   │    │  Webhook    │    │  短信通知   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

## 二、Redis配置

### 2.1 安装Redis

**Windows:**
```powershell
# 使用Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 或下载Windows版本
# https://github.com/microsoftarchive/redis/releases
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2.2 配置Redis连接

在 `.env` 文件中添加:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## 三、Prometheus配置

### 3.1 prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - /etc/prometheus/alert.rules.yml

scrape_configs:
  - job_name: 'yunmu-game-store'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/api/v1/metrics'
```

### 3.2 告警规则 (alert.rules.yml)

```yaml
groups:
  - name: yunmu-alerts
    rules:
      # 服务可用性告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务不可用"
          description: "服务 {{ $labels.instance }} 已停止响应超过1分钟"

      # 高CPU使用率告警
      - alert: HighCPUUsage
        expr: process_cpu_seconds_total > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU使用率过高"
          description: "CPU使用率超过80%持续5分钟"

      # 高内存使用率告警
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "内存使用率超过85%持续5分钟"

      # API响应时间告警
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(yunmu_http_request_duration_seconds_bucket[5m])) > 1
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "API响应缓慢"
          description: "P95响应时间超过1秒"

      # 错误率告警
      - alert: HighErrorRate
        expr: rate(yunmu_http_requests_total{status_code=~"5.."}[5m]) / rate(yunmu_http_requests_total[5m]) > 0.05
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "错误率过高"
          description: "5xx错误率超过5%"

      # Redis连接告警
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis服务不可用"
          description: "Redis服务已停止"

      # 数据库连接告警
      - alert: DatabaseConnectionFailed
        expr: yunmu_db_connections_active == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "数据库连接失败"
          description: "无法连接到数据库"
```

## 四、AlertManager配置

### 4.1 alertmanager.yml

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alert@yunmu-game-store.com'
  smtp_auth_username: 'alert@yunmu-game-store.com'
  smtp_auth_password: 'your_email_password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default-receiver'
  routes:
    - match:
        severity: critical
      receiver: 'critical-receiver'
    - match:
        severity: warning
      receiver: 'warning-receiver'

receivers:
  - name: 'default-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com'

  - name: 'critical-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com,oncall@yunmu-game-store.com'
    webhook_configs:
      - url: 'http://backend:3000/api/v1/alert/webhook'
        send_resolved: true

  - name: 'warning-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

## 五、Grafana仪表盘

### 5.1 导入仪表盘

1. 访问 Grafana (http://localhost:3001)
2. 登录 (默认: admin/admin)
3. 添加 Prometheus 数据源
4. 导入仪表盘 JSON

### 5.2 关键监控面板

| 面板名称 | 指标 | 说明 |
|---------|------|------|
| 请求速率 | rate(http_requests_total[5m]) | 每秒请求数 |
| 响应时间 | histogram_quantile(0.95, ...) | P95延迟 |
| 错误率 | rate(http_requests_total{status=~"5.."}[5m]) | 5xx错误率 |
| 活跃用户 | yunmu_business_active_users | 当前活跃用户数 |
| 订单数量 | yunmu_business_orders_total | 订单统计 |
| 收入统计 | yunmu_business_revenue_total | 总收入 |

## 六、Docker Compose监控栈

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: yunmu-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alert.rules.yml:/etc/prometheus/alert.rules.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    networks:
      - yunmu-network

  grafana:
    image: grafana/grafana:latest
    container_name: yunmu-grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - yunmu-network

  alertmanager:
    image: prom/alertmanager:latest
    container_name: yunmu-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - yunmu-network

volumes:
  grafana_data:

networks:
  yunmu-network:
    external: true
```

## 七、启动监控服务

```powershell
# 1. 创建监控配置目录
mkdir monitoring

# 2. 复制配置文件到 monitoring 目录

# 3. 启动监控栈
docker-compose -f docker-compose.monitoring.yml up -d

# 4. 访问服务
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
# AlertManager: http://localhost:9093
```

## 八、告警阈值建议

| 指标 | 警告阈值 | 严重阈值 | 检查间隔 |
|-----|---------|---------|---------|
| CPU使用率 | >70% | >90% | 5分钟 |
| 内存使用率 | >80% | >95% | 5分钟 |
| 磁盘使用率 | >80% | >95% | 10分钟 |
| API响应时间 | >500ms | >2s | 3分钟 |
| 错误率 | >1% | >5% | 3分钟 |
| 服务不可用 | - | >1分钟 | 1分钟 |

## 九、验证监控配置

```bash
# 检查Prometheus目标状态
curl http://localhost:9090/api/v1/targets

# 检查告警规则
curl http://localhost:9090/api/v1/rules

# 检查AlertManager状态
curl http://localhost:9093/api/v2/status
```
