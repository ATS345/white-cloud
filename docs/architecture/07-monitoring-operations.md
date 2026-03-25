# 监控和运维方案

## 文档概述

本文档详细描述了云幕游戏商店平台的监控和运维方案，包括监控体系、告警机制、日志管理、运维流程、故障处理等。

**文档版本**: v1.0  
**最后更新**: 2024-03-14

---

## 目录

1. [监控体系概述](#1-监控体系概述)
2. [基础设施监控](#2-基础设施监控)
3. [应用监控](#3-应用监控)
4. [业务监控](#4-业务监控)
5. [告警机制](#5-告警机制)
6. [日志管理](#6-日志管理)
7. [运维流程](#7-运维流程)
8. [故障处理](#8-故障处理)
9. [性能优化](#9-性能优化)
10. [容量管理](#10-容量管理)

---

## 1. 监控体系概述

### 1.1 监控架构

```
┌─────────────────────────────────────────────────────────┐
│                    监控数据采集                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 基础设施  │  │  应用     │  │  业务     │          │
│  │  指标     │  │  指标     │  │  指标     │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│                    监控数据处理                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Prometheus│  │ Grafana  │  │AlertMgr │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│                    监控数据展示                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 仪表板   │  │  报表    │  │  告警    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 监控层次

| 监控层次 | 监控内容 | 工具 | 频率 |
|---------|---------|------|------|
| 基础设施 | CPU、内存、磁盘、网络 | Prometheus | 15s |
| 应用 | API响应、错误率、吞吐量 | APM | 30s |
| 业务 | 订单量、注册量、下载量 | 自定义 | 1m |
| 用户体验 | 页面加载、交互响应 | RUM | 实时 |

### 1.3 监控指标

#### 1.3.1 基础指标

- **CPU使用率**: < 70%
- **内存使用率**: < 80%
- **磁盘使用率**: < 80%
- **网络带宽**: < 80%
- **磁盘IO**: < 70%

#### 1.3.2 应用指标

- **API响应时间**: P95 < 200ms
- **错误率**: < 0.1%
- **吞吐量**: > 1000 req/s
- **可用性**: > 99.9%

#### 1.3.3 业务指标

- **日活用户**: DAU
- **订单量**: 订单数/小时
- **支付成功率**: > 95%
- **用户满意度**: > 4.5/5

---

## 2. 基础设施监控

### 2.1 服务器监控

#### 2.1.1 Node Exporter配置

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true
      hostPID: true
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        args:
        - '--path.procfs=/host/proc'
        - '--path.sysfs=/host/sys'
        - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)'
        ports:
        - containerPort: 9100
          hostPort: 9100
        volumeMounts:
        - name: proc
          mountPath: /host/proc
        - name: sys
          mountPath: /host/sys
        - name: root
          mountPath: /host
          mountPropagation: HostToContainer
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
      volumes:
      - name: proc
        hostPath:
          path: /proc
      - name: sys
        hostPath:
          path: /sys
      - name: root
        hostPath:
          path: /
```

#### 2.1.2 监控指标

**CPU指标**:
```yaml
- cpu_usage_user
- cpu_usage_system
- cpu_usage_idle
- cpu_usage_iowait
- cpu_usage_steal
```

**内存指标**:
```yaml
- memory_total
- memory_available
- memory_used
- memory_cached
- memory_buffers
```

**磁盘指标**:
```yaml
- disk_total
- disk_used
- disk_free
- disk_inodes_total
- disk_inodes_free
- disk_io_read_bytes
- disk_io_write_bytes
```

**网络指标**:
```yaml
- network_receive_bytes
- network_transmit_bytes
- network_receive_packets
- network_transmit_packets
- network_receive_errors
- network_transmit_errors
```

### 2.2 数据库监控

#### 2.2.1 PostgreSQL Exporter

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-exporter
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres-exporter
  template:
    metadata:
      labels:
        app: postgres-exporter
    spec:
      containers:
      - name: postgres-exporter
        image: prometheuscommunity/postgres-exporter:latest
        env:
        - name: DATA_SOURCE_NAME
          value: "postgresql://user:password@postgres:5432/yunmu?sslmode=disable"
        ports:
        - containerPort: 9187
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

#### 2.2.2 数据库指标

**连接指标**:
```yaml
- pg_stat_database_numbackends
- pg_stat_activity_count
- pg_settings_max_connections
```

**性能指标**:
```yaml
- pg_stat_database_blks_hit
- pg_stat_database_blks_read
- pg_stat_statements_mean_exec_time
- pg_stat_statements_calls
```

**事务指标**:
```yaml
- pg_stat_database_xact_commit
- pg_stat_database_xact_rollback
- pg_stat_database_conflicts
```

### 2.3 Redis监控

#### 2.3.1 Redis Exporter

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-exporter
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis-exporter
  template:
    metadata:
      labels:
        app: redis-exporter
    spec:
      containers:
      - name: redis-exporter
        image: oliver006/redis_exporter:latest
        env:
        - name: REDIS_ADDR
          value: "redis://redis:6379"
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secrets
              key: password
        ports:
        - containerPort: 9121
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

#### 2.3.2 Redis指标

**内存指标**:
```yaml
- redis_memory_used_bytes
- redis_memory_max_bytes
- redis_memory_used_percentage
```

**连接指标**:
```yaml
- redis_connected_clients
- redis_blocked_clients
- redis_rejected_connections
```

**性能指标**:
```yaml
- redis_keyspace_hits
- redis_keyspace_misses
- redis_commands_processed_total
- redis_instantaneous_ops_per_sec
```

---

## 3. 应用监控

### 3.1 APM监控

#### 3.1.1 New Relic集成

```typescript
import newrelic from 'newrelic'

newrelic.initialize({
  app_name: ['Yunmu Game Store'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  },
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true
    }
  }
})

app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    newrelic.recordMetric('WebTransaction/Duration', duration)
    newrelic.recordMetric('WebTransaction/Count', 1)
  })
  
  next()
})
```

#### 3.1.2 自定义指标

```typescript
class MetricsService {
  recordApiCall(endpoint: string, duration: number, success: boolean): void {
    newrelic.recordMetric(`ApiCall/${endpoint}`, duration)
    newrelic.recordMetric(`ApiCall/${endpoint}/Count`, 1)
    
    if (!success) {
      newrelic.recordMetric(`ApiCall/${endpoint}/Error`, 1)
    }
  }

  recordDatabaseQuery(query: string, duration: number): void {
    newrelic.recordMetric(`DatabaseQuery/${query}`, duration)
  }

  recordBusinessEvent(event: string, attributes: Record<string, any>): void {
    newrelic.recordCustomEvent(event, attributes)
  }
}

export const metricsService = new MetricsService()
```

### 3.2 性能监控

#### 3.2.1 响应时间监控

```typescript
interface PerformanceMetrics {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  timestamp: Date
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []

  recordRequest(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    if (this.metrics.length > 10000) {
      this.metrics.shift()
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint)
    if (endpointMetrics.length === 0) return 0
    
    const total = endpointMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / endpointMetrics.length
  }

  getP95ResponseTime(endpoint: string): number {
    const endpointMetrics = this.metrics
      .filter(m => m.endpoint === endpoint)
      .sort((a, b) => a.duration - b.duration)
    
    if (endpointMetrics.length === 0) return 0
    
    const index = Math.ceil(endpointMetrics.length * 0.95) - 1
    return endpointMetrics[index].duration
  }

  getErrorRate(endpoint: string): number {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint)
    if (endpointMetrics.length === 0) return 0
    
    const errors = endpointMetrics.filter(m => m.statusCode >= 400).length
    return (errors / endpointMetrics.length) * 100
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

#### 3.2.2 性能仪表板

```typescript
import { Gauge, Histogram } from 'prom-client'

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

const httpRequestCount = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
})

export const metrics = {
  httpRequestDuration,
  httpRequestCount,
  activeConnections
}
```

---

## 4. 业务监控

### 4.1 核心业务指标

#### 4.1.1 用户指标

```typescript
interface UserMetrics {
  dailyActiveUsers: number
  monthlyActiveUsers: number
  newRegistrations: number
  userRetention: number
  averageSessionDuration: number
}

class UserMetricsCollector {
  async collectDailyMetrics(): Promise<UserMetrics> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dailyActiveUsers = await prisma.session.count({
      where: {
        lastActivity: {
          gte: today
        }
      }
    })
    
    const monthlyActiveUsers = await prisma.session.count({
      where: {
        lastActivity: {
          gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
    
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })
    
    return {
      dailyActiveUsers,
      monthlyActiveUsers,
      newRegistrations,
      userRetention: 0,
      averageSessionDuration: 0
    }
  }
}

export const userMetricsCollector = new UserMetricsCollector()
```

#### 4.1.2 订单指标

```typescript
interface OrderMetrics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  paymentSuccessRate: number
}

class OrderMetricsCollector {
  async collectDailyMetrics(): Promise<OrderMetrics> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today
        }
      }
    })
    
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    const paidOrders = orders.filter(order => order.status === 'paid')
    const paymentSuccessRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0
    
    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      conversionRate: 0,
      paymentSuccessRate
    }
  }
}

export const orderMetricsCollector = new OrderMetricsCollector()
```

### 4.2 业务仪表板

#### 4.2.1 Grafana仪表板配置

```json
{
  "dashboard": {
    "title": "Yunmu Business Dashboard",
    "panels": [
      {
        "title": "Daily Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "yunmu_daily_active_users"
          }
        ]
      },
      {
        "title": "Order Volume",
        "type": "graph",
        "targets": [
          {
            "expr": "yunmu_orders_total"
          }
        ]
      },
      {
        "title": "Revenue",
        "type": "graph",
        "targets": [
          {
            "expr": "yunmu_revenue_total"
          }
        ]
      },
      {
        "title": "Payment Success Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "yunmu_payment_success_rate"
          }
        ]
      }
    ]
  }
}
```

---

## 5. 告警机制

### 5.1 告警规则

#### 5.1.1 Prometheus告警规则

```yaml
groups:
  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for more than 5 minutes on {{ $labels.instance }}"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space detected"
          description: "Disk space is below 20% on {{ $labels.instance }}"

  - name: application
    rules:
      - alert: HighErrorRate
        expr: (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100 > 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 1% for more than 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "P95 response time is above 500ms for more than 5 minutes"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.job }} on {{ $labels.instance }} is down"

  - name: business
    rules:
      - alert: LowOrderVolume
        expr: yunmu_orders_total < 100
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Low order volume detected"
          description: "Order volume is below 100 for more than 30 minutes"

      - alert: LowPaymentSuccessRate
        expr: yunmu_payment_success_rate < 90
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Low payment success rate detected"
          description: "Payment success rate is below 90% for more than 10 minutes"
```

#### 5.1.2 Alertmanager配置

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true

    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        send_resolved: true

  - name: 'critical-alerts'
    slack_configs:
      - channel: '#critical-alerts'
        send_resolved: true
    email_configs:
      - to: 'oncall@yunmu.com'
        send_resolved: true

  - name: 'warning-alerts'
    slack_configs:
      - channel: '#warnings'
        send_resolved: true
```

### 5.2 告警级别

| 级别 | 响应时间 | 通知方式 | 升级条件 |
|------|---------|---------|---------|
| P0 (严重) | 5分钟 | 电话+短信+邮件 | 立即升级到管理层 |
| P1 (重要) | 15分钟 | 短信+邮件 | 2小时内未解决升级 |
| P2 (一般) | 1小时 | 邮件 | 8小时内未解决升级 |
| P3 (提示) | 4小时 | 邮件 | 48小时内未解决升级 |

---

## 6. 日志管理

### 6.1 日志收集

#### 6.1.1 Filebeat配置

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/yunmu/*.log
    fields:
      app: yunmu
      environment: production
    fields_under_root: true
    multiline.pattern: '^\['
    multiline.negate: true
    multiline.match: after

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  indices:
    - index: "yunmu-%{+yyyy.MM.dd}"
      when.contains:
        app: "yunmu"

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~
```

#### 6.1.2 日志格式

```typescript
interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, any>
  error?: Error
  userId?: number
  requestId?: string
  duration?: number
}

class Logger {
  private context: Record<string, any> = {}

  withContext(context: Record<string, any>): Logger {
    const logger = new Logger()
    logger.context = { ...this.context, ...context }
    return logger
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, { ...context, error })
  }

  private log(level: string, message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level: level as any,
      message,
      context: { ...this.context, ...context }
    }

    console.log(JSON.stringify(logEntry))
  }
}

export const logger = new Logger()
```

### 6.2 日志分析

#### 6.2.1 Kibana仪表板

```json
{
  "dashboard": {
    "title": "Yunmu Logs Dashboard",
    "panels": [
      {
        "title": "Log Volume",
        "type": "area",
        "queries": [
          {
            "query": "app:yunmu"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "line",
        "queries": [
          {
            "query": "app:yunmu AND level:error"
          }
        ]
      },
      {
        "title": "Response Time Distribution",
        "type": "histogram",
        "queries": [
          {
            "query": "app:yunmu AND duration:*"
          }
        ]
      }
    ]
  }
}
```

---

## 7. 运维流程

### 7.1 日常运维

#### 7.1.1 每日检查清单

- [ ] 检查系统健康状态
- [ ] 检查告警信息
- [ ] 检查日志异常
- [ ] 检查性能指标
- [ ] 检查备份状态
- [ ] 检查安全事件

#### 7.1.2 每周检查清单

- [ ] 系统性能评估
- [ ] 容量规划评估
- [ ] 安全漏洞扫描
- [ ] 备份恢复测试
- [ ] 运维文档更新

### 7.2 变更管理

#### 7.2.1 变更流程

1. **变更申请**
   - 提交变更请求
   - 评估变更影响
   - 制定变更计划

2. **变更审批**
   - 技术评审
   - 风险评估
   - 获得批准

3. **变更实施**
   - 执行变更
   - 监控影响
   - 验证结果

4. **变更回顾**
   - 记录变更
   - 总结经验
   - 更新文档

#### 7.2.2 变更类型

| 变更类型 | 审批级别 | 回滚要求 | 测试要求 |
|---------|---------|---------|---------|
| 紧急变更 | 技术负责人 | 必须 | 最小化 |
| 标准变更 | 团队负责人 | 建议 | 完整测试 |
| 重大变更 | 技术总监 | 必须 | 完整测试+压力测试 |

---

## 8. 故障处理

### 8.1 故障分类

| 故障级别 | 影响范围 | 响应时间 | 恢复时间 |
|---------|---------|---------|---------|
| P0 | 全部用户无法使用 | 5分钟 | 30分钟 |
| P1 | 大部分用户受影响 | 15分钟 | 2小时 |
| P2 | 部分用户受影响 | 1小时 | 4小时 |
| P3 | 轻微影响 | 4小时 | 24小时 |

### 8.2 故障处理流程

#### 8.2.1 故障响应

1. **故障发现**
   - 监控告警
   - 用户报告
   - 主动巡检

2. **故障确认**
   - 验证故障
   - 评估影响
   - 确定级别

3. **故障响应**
   - 通知相关人员
   - 启动应急预案
   - 开始故障处理

#### 8.2.2 故障处理

1. **故障定位**
   - 分析日志
   - 检查指标
   - 确定根因

2. **故障修复**
   - 实施修复
   - 验证效果
   - 恢复服务

3. **故障恢复**
   - 监控恢复
   - 验证功能
   - 通知用户

#### 8.2.3 故障复盘

1. **故障分析**
   - 收集信息
   - 分析原因
   - 总结教训

2. **改进措施**
   - 制定改进计划
   - 实施改进
   - 验证效果

3. **文档更新**
   - 更新文档
   - 分享经验
   - 培训团队

---

## 9. 性能优化

### 9.1 性能分析

#### 9.1.1 慢查询分析

```sql
-- 查找慢查询
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- 分析查询计划
EXPLAIN ANALYZE
SELECT * FROM games
WHERE category = 'action'
ORDER BY rating DESC
LIMIT 20;
```

#### 9.1.2 性能瓶颈分析

```typescript
class PerformanceAnalyzer {
  async analyzePerformance(): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      slowQueries: [],
      bottlenecks: [],
      recommendations: []
    }

    const slowQueries = await this.findSlowQueries()
    report.slowQueries = slowQueries

    const bottlenecks = await this.identifyBottlenecks()
    report.bottlenecks = bottlenecks

    const recommendations = this.generateRecommendations(slowQueries, bottlenecks)
    report.recommendations = recommendations

    return report
  }

  private async findSlowQueries(): Promise<SlowQuery[]> {
    return prisma.$queryRaw`
      SELECT query, calls, total_time, mean_time
      FROM pg_stat_statements
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 10
    `
  }

  private async identifyBottlenecks(): Promise<Bottleneck[]> {
    const bottlenecks: Bottleneck[] = []

    const cpuUsage = await this.getCPUUsage()
    if (cpuUsage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        value: cpuUsage
      })
    }

    const memoryUsage = await this.getMemoryUsage()
    if (memoryUsage > 85) {
      bottlenecks.push({
        type: 'memory',
        severity: 'high',
        value: memoryUsage
      })
    }

    return bottlenecks
  }

  private generateRecommendations(
    slowQueries: SlowQuery[],
    bottlenecks: Bottleneck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (slowQueries.length > 0) {
      recommendations.push({
        type: 'query_optimization',
        priority: 'high',
        description: '优化慢查询'
      })
    }

    if (bottlenecks.some(b => b.type === 'cpu')) {
      recommendations.push({
        type: 'horizontal_scaling',
        priority: 'medium',
        description: '增加应用实例'
      })
    }

    return recommendations
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer()
```

### 9.2 优化实施

#### 9.2.1 数据库优化

```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_games_category_rating 
ON games(category, rating DESC);

-- 更新统计信息
ANALYZE games;

-- 清理死元组
VACUUM ANALYZE games;
```

#### 9.2.2 缓存优化

```typescript
const optimizeCache = async (): Promise<void> => {
  const hotGames = await prisma.game.findMany({
    where: {
      isHot: true
    },
    take: 100
  })

  for (const game of hotGames) {
    await cacheService.set(game.id.toString(), game, cacheConfigs.game)
  }

  await cacheService.set('hot', hotGames, cacheConfigs.hotGames)
}
```

---

## 10. 容量管理

### 10.1 容量规划

#### 10.1.1 容量评估

```typescript
interface CapacityReport {
  current: CapacityMetrics
  projected: CapacityMetrics
  recommendations: Recommendation[]
}

class CapacityPlanner {
  async generateCapacityReport(): Promise<CapacityReport> {
    const current = await this.getCurrentCapacity()
    const projected = await this.getProjectedCapacity()
    const recommendations = this.generateRecommendations(current, projected)

    return {
      current,
      projected,
      recommendations
    }
  }

  private async getCurrentCapacity(): Promise<CapacityMetrics> {
    return {
      users: await this.getUserCount(),
      requests: await this.getRequestCount(),
      storage: await this.getStorageUsage(),
      bandwidth: await this.getBandwidthUsage()
    }
  }

  private async getProjectedCapacity(): Promise<CapacityMetrics> {
    const current = await this.getCurrentCapacity()
    const growthRate = 0.15 // 15% monthly growth

    return {
      users: Math.ceil(current.users * Math.pow(1 + growthRate, 6)),
      requests: Math.ceil(current.requests * Math.pow(1 + growthRate, 6)),
      storage: Math.ceil(current.storage * Math.pow(1 + growthRate, 6)),
      bandwidth: Math.ceil(current.bandwidth * Math.pow(1 + growthRate, 6))
    }
  }

  private generateRecommendations(
    current: CapacityMetrics,
    projected: CapacityMetrics
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (projected.users > current.users * 2) {
      recommendations.push({
        type: 'user_capacity',
        priority: 'high',
        description: '用户容量预计翻倍，建议扩容'
      })
    }

    if (projected.storage > current.storage * 1.5) {
      recommendations.push({
        type: 'storage_capacity',
        priority: 'medium',
        description: '存储容量预计增长50%，建议扩容'
      })
    }

    return recommendations
  }
}

export const capacityPlanner = new CapacityPlanner()
```

### 10.2 自动扩缩容

#### 10.2.1 HPA配置

```yaml
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
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

---

## 附录

### A. 监控工具推荐

| 工具 | 用途 | 链接 |
|------|------|------|
| Prometheus | 指标收集 | https://prometheus.io/ |
| Grafana | 可视化 | https://grafana.com/ |
| Alertmanager | 告警管理 | https://prometheus.io/docs/alerting/latest/alertmanager/ |
| ELK Stack | 日志管理 | https://www.elastic.co/ |
| New Relic | APM | https://newrelic.com/ |
| Datadog | 综合监控 | https://www.datadoghq.com/ |

### B. 运维检查清单

#### 日常检查
- [ ] 系统健康检查
- [ ] 告警检查
- [ ] 日志检查
- [ ] 备份检查

#### 每周检查
- [ ] 性能评估
- [ ] 容量评估
- [ ] 安全检查
- [ ] 文档更新

#### 每月检查
- [ ] 灾备演练
- [ ] 性能优化
- [ ] 安全审计
- [ ] 培训更新

---

**文档结束**