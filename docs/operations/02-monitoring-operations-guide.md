# 云幕游戏商店平台 - 运维监控操作手册

## 文档概述

本文档详细描述了云幕游戏商店平台运维监控体系的操作流程、故障响应机制和日常维护规范。

**文档版本**: v2.0  
**最后更新**: 2024-03-16

---

## 目录

1. [监控体系架构](#1-监控体系架构)
2. [日常运维流程](#2-日常运维流程)
3. [告警处理流程](#3-告警处理流程)
4. [故障响应机制](#4-故障响应机制)
5. [监控指标优化流程](#5-监控指标优化流程)
6. [告警规则更新流程](#6-告警规则更新流程)
7. [数据采集与存储策略](#7-数据采集与存储策略)
8. [运维工具使用指南](#8-运维工具使用指南)

---

## 1. 监控体系架构

### 1.1 监控组件

| 组件 | 功能 | 端口 | 访问地址 |
|------|------|------|---------|
| Prometheus | 指标收集与存储 | 9090 | http://localhost:9090 |
| Grafana | 可视化仪表板 | 3001 | http://localhost:3001 |
| Alertmanager | 告警管理 | 9093 | http://localhost:9093 |
| Node Exporter | 系统指标采集 | 9100 | http://localhost:9100/metrics |
| PostgreSQL Exporter | 数据库指标采集 | 9187 | http://localhost:9187/metrics |
| Redis Exporter | 缓存指标采集 | 9121 | http://localhost:9121/metrics |
| Elasticsearch Exporter | 搜索引擎指标采集 | 9114 | http://localhost:9114/metrics |
| cAdvisor | 容器指标采集 | 8081 | http://localhost:8081/metrics |

### 1.2 监控指标分类

```
监控指标
├── 基础设施指标
│   ├── CPU使用率
│   ├── 内存使用率
│   ├── 磁盘I/O
│   └── 网络流量
├── 应用服务指标
│   ├── HTTP请求量
│   ├── 响应时间
│   ├── 错误率
│   └── 并发连接数
├── 数据库指标
│   ├── 连接数
│   ├── 查询性能
│   ├── 事务数
│   └── 锁等待
├── 缓存指标
│   ├── 内存使用
│   ├── 命中率
│   ├── 连接数
│   └── 命令延迟
└── 业务指标
    ├── 活跃用户
    ├── 订单量
    ├── 支付成功率
    └── 收入统计
```

---

## 2. 日常运维流程

### 2.1 每日检查清单

**检查时间**: 每日上午 9:00

#### 2.1.1 系统健康检查

```bash
# 1. 检查所有服务状态
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml ps

# 2. 检查服务健康状态
curl -s http://localhost:3000/api/health/detailed | jq .

# 3. 检查活跃告警
curl -s http://localhost:9093/api/v1/alerts | jq '.data[] | select(.status.state=="active")'
```

#### 2.1.2 资源使用检查

| 检查项 | 正常范围 | 告警阈值 | 检查方法 |
|--------|---------|---------|---------|
| CPU使用率 | < 70% | > 80% | Grafana系统总览仪表板 |
| 内存使用率 | < 80% | > 85% | Grafana系统总览仪表板 |
| 磁盘使用率 | < 80% | > 85% | Grafana系统总览仪表板 |
| 数据库连接数 | < 70% | > 80% | Grafana数据库仪表板 |
| Redis内存 | < 70% | > 80% | Grafana Redis仪表板 |

#### 2.1.3 日志检查

```bash
# 检查后端错误日志
docker logs yunmu-backend --since 24h | grep -i error | head -50

# 检查Nginx访问日志
docker logs yunmu-frontend --since 24h | grep -E "5[0-9]{2}" | head -50

# 检查数据库慢查询
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC 
LIMIT 10;
"
```

### 2.2 每周检查清单

**检查时间**: 每周一上午 10:00

#### 2.2.1 性能趋势分析

1. **API响应时间趋势**
   - 访问 Grafana -> API性能仪表板
   - 查看过去7天的P95/P99响应时间
   - 识别性能退化趋势

2. **请求量趋势**
   - 分析请求量峰值时段
   - 评估是否需要扩容

3. **错误率趋势**
   - 统计各类错误发生频率
   - 分析错误根因

#### 2.2.2 容量规划评估

```bash
# 数据库容量评估
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 10;
"

# Redis内存评估
docker exec yunmu-redis redis-cli -a redis123 INFO memory | grep -E "used_memory_human|maxmemory_human"
```

#### 2.2.3 备份验证

```bash
# 验证数据库备份
ls -lh /backup/postgres/

# 验证备份完整性（测试恢复）
# 注意：在测试环境执行
pg_restore --list /backup/postgres/latest.dump
```

### 2.3 每月检查清单

**检查时间**: 每月第一周周一

#### 2.3.1 安全审计

1. 检查用户权限
2. 审查访问日志
3. 更新安全补丁
4. 漏洞扫描

#### 2.3.2 性能优化

1. 分析慢查询
2. 优化索引
3. 清理过期数据
4. 更新统计信息

#### 2.3.3 文档更新

1. 更新运维文档
2. 更新架构图
3. 更新联系人列表

---

## 3. 告警处理流程

### 3.1 告警级别定义

| 级别 | 严重程度 | 响应时间 | 通知方式 | 示例 |
|------|---------|---------|---------|------|
| P0 - 紧急 | 系统不可用 | 5分钟 | 电话+短信+邮件 | 服务宕机、数据库不可用 |
| P1 - 严重 | 核心功能受损 | 15分钟 | 短信+邮件 | 支付失败率过高 |
| P2 - 警告 | 性能下降 | 1小时 | 邮件 | CPU/内存使用过高 |
| P3 - 信息 | 需要关注 | 4小时 | 邮件 | 磁盘空间不足 |

### 3.2 告警处理步骤

```
告警触发
    │
    ▼
确认告警 ──────► 误报 ──► 标记为误报 ──► 调整告警规则
    │
    │ 确认问题
    ▼
评估影响范围
    │
    ├── P0/P1 ──► 立即升级 ──► 通知相关负责人
    │                    │
    │                    ▼
    │              启动应急预案
    │                    │
    ├── P2 ──────────────┼──► 分析根因
    │                    │
    ├── P3 ──────────────┘
    │
    ▼
实施修复
    │
    ▼
验证修复效果
    │
    ▼
更新文档 ──► 关闭告警
```

### 3.3 常见告警处理手册

#### 3.3.1 CPU使用率过高

**告警**: HighCPUUsage / CriticalCPUUsage

**诊断步骤**:

```bash
# 1. 查看CPU使用情况
top -b -n 1 | head -20

# 2. 查看进程CPU使用
ps aux --sort=-%cpu | head -10

# 3. 查看容器资源使用
docker stats --no-stream

# 4. 分析系统调用
strace -c -p <pid>
```

**处理措施**:

1. **临时缓解**:
   - 重启高CPU进程
   - 扩容服务实例
   - 限流

2. **根本解决**:
   - 优化代码逻辑
   - 增加缓存
   - 数据库查询优化

#### 3.3.2 内存使用率过高

**告警**: HighMemoryUsage / CriticalMemoryUsage

**诊断步骤**:

```bash
# 1. 查看内存使用
free -h

# 2. 查看进程内存使用
ps aux --sort=-%mem | head -10

# 3. 查看内存详情
cat /proc/meminfo

# 4. 检查内存泄漏
valgrind --leak-check=full <command>
```

**处理措施**:

1. **临时缓解**:
   - 重启服务
   - 清理缓存
   - 扩容内存

2. **根本解决**:
   - 修复内存泄漏
   - 优化数据结构
   - 调整JVM参数

#### 3.3.3 数据库连接数过高

**告警**: HighDatabaseConnections / CriticalDatabaseConnections

**诊断步骤**:

```bash
# 1. 查看当前连接
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "
SELECT pid, usename, application_name, client_addr, state, query_start, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;
"

# 2. 查看连接统计
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
"

# 3. 查看锁等待
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "
SELECT * FROM pg_locks WHERE NOT granted;
"
```

**处理措施**:

1. **临时缓解**:
   - 终止空闲连接
   - 增加最大连接数
   - 重启应用服务

2. **根本解决**:
   - 优化连接池配置
   - 修复连接泄漏
   - 优化长事务

#### 3.3.4 API错误率过高

**告警**: HighErrorRate

**诊断步骤**:

```bash
# 1. 查看错误日志
docker logs yunmu-backend --since 1h | grep -i error

# 2. 查看慢请求
curl -s http://localhost:3000/api/metrics/json | jq '.yunmu_http_request_duration_seconds'

# 3. 分析错误类型
docker logs yunmu-backend --since 1h | grep -E "5[0-9]{2}" | awk '{print $NF}' | sort | uniq -c
```

**处理措施**:

1. **临时缓解**:
   - 回滚最近变更
   - 重启服务
   - 限流降级

2. **根本解决**:
   - 修复代码bug
   - 优化数据库查询
   - 增加容错处理

---

## 4. 故障响应机制

### 4.1 故障分级

| 级别 | 定义 | 影响范围 | 响应时间 | 恢复时间 |
|------|------|---------|---------|---------|
| P0 | 系统完全不可用 | 全部用户 | 5分钟 | 30分钟 |
| P1 | 核心功能不可用 | 大部分用户 | 15分钟 | 2小时 |
| P2 | 部分功能异常 | 部分用户 | 1小时 | 4小时 |
| P3 | 轻微问题 | 少量用户 | 4小时 | 24小时 |

### 4.2 故障响应流程

```
故障发现
    │
    ├── 监控告警
    ├── 用户报告
    └── 主动巡检
    │
    ▼
故障确认 ──────► 非故障 ──► 关闭
    │
    │ 确认故障
    ▼
故障定级
    │
    ├── P0 ──► 启动紧急响应 ──► 通知管理层
    │
    ├── P1 ──► 启动快速响应 ──► 通知技术负责人
    │
    ├── P2 ──► 启动标准响应
    │
    └── P3 ──► 启动常规响应
    │
    ▼
故障处理
    │
    ├── 快速恢复
    ├── 根因分析
    └── 实施修复
    │
    ▼
故障恢复
    │
    ├── 服务验证
    ├── 监控恢复
    └── 用户通知
    │
    ▼
故障复盘
    │
    ├── 编写故障报告
    ├── 总结经验教训
    └── 制定改进措施
```

### 4.3 故障处理Runbook

#### 4.3.1 服务不可用

**症状**: 服务健康检查失败，无法访问

**诊断**:

```bash
# 1. 检查服务状态
docker-compose ps

# 2. 检查服务日志
docker logs yunmu-backend --tail 100

# 3. 检查依赖服务
docker exec yunmu-backend curl -s http://postgres:5432
docker exec yunmu-backend curl -s http://redis:6379
```

**恢复步骤**:

```bash
# 1. 重启服务
docker-compose restart backend

# 2. 如果重启失败，回滚到上一版本
docker-compose down
docker tag yunmu-backend:latest yunmu-backend:failed
docker tag yunmu-backend:previous yunmu-backend:latest
docker-compose up -d

# 3. 验证服务恢复
curl http://localhost:3000/api/health
```

#### 4.3.2 数据库不可用

**症状**: 数据库连接失败，查询超时

**诊断**:

```bash
# 1. 检查数据库状态
docker exec yunmu-postgres pg_isready

# 2. 检查数据库日志
docker logs yunmu-postgres --tail 100

# 3. 检查磁盘空间
df -h /var/lib/postgresql
```

**恢复步骤**:

```bash
# 1. 重启数据库
docker-compose restart postgres

# 2. 如果数据损坏，从备份恢复
docker-compose down
rm -rf /var/lib/postgresql/data/*
pg_restore -d yunmu_game_store /backup/postgres/latest.dump
docker-compose up -d

# 3. 验证数据完整性
docker exec yunmu-postgres psql -U yunmu -d yunmu_game_store -c "SELECT count(*) FROM users;"
```

---

## 5. 监控指标优化流程

### 5.1 指标评估标准

| 维度 | 评估标准 | 权重 |
|------|---------|------|
| 业务价值 | 是否反映关键业务状态 | 40% |
| 技术价值 | 是否有助于问题定位 | 30% |
| 采集成本 | 资源消耗是否合理 | 20% |
| 可操作性 | 是否能指导行动 | 10% |

### 5.2 指标优化步骤

```
指标评估
    │
    ├── 收集反馈
    ├── 分析使用频率
    └── 评估有效性
    │
    ▼
指标优化
    │
    ├── 调整采集频率
    ├── 修改聚合方式
    ├── 增加标签
    └── 删除无用指标
    │
    ▼
测试验证
    │
    ├── 验证数据准确性
    ├── 验证告警有效性
    └── 验证仪表板展示
    │
    ▼
上线发布
    │
    ├── 更新配置
    ├── 重启服务
    └── 验证效果
```

### 5.3 新增指标流程

1. **需求分析**
   - 明确监控目标
   - 确定指标类型
   - 设计标签结构

2. **开发实现**
   - 编写采集代码
   - 添加到MetricsService
   - 编写单元测试

3. **测试验证**
   - 验证指标暴露
   - 验证数据准确性
   - 验证性能影响

4. **上线部署**
   - 合并代码
   - 部署服务
   - 配置告警规则
   - 更新仪表板

---

## 6. 告警规则更新流程

### 6.1 告警规则评估

**评估周期**: 每月一次

**评估内容**:

1. 告警频率统计
2. 误报率分析
3. 响应时间分析
4. 有效性行动分析

### 6.2 告警规则更新步骤

```yaml
# 1. 创建新规则或修改现有规则
# 文件: monitoring/prometheus/rules/alert_rules.yml

groups:
  - name: application
    rules:
      - alert: NewAlertRule
        expr: <promql_expression>
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "告警摘要"
          description: "告警详情"
```

```bash
# 2. 验证规则语法
docker exec yunmu-prometheus promtool check rules /etc/prometheus/rules/alert_rules.yml

# 3. 热加载配置
curl -X POST http://localhost:9090/-/reload

# 4. 验证规则生效
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name=="NewAlertRule")'
```

### 6.3 告警规则模板

```yaml
- alert: <AlertName>
  expr: <PromQL表达式>
  for: <持续时间>
  labels:
    severity: <info|warning|critical|emergency>
    category: <infrastructure|application|database|business>
    component: <组件名称>
  annotations:
    summary: "<简短描述>"
    description: "<详细描述>: {{ $value }}"
    runbook_url: "<操作手册链接>"
```

---

## 7. 数据采集与存储策略

### 7.1 数据采集规范

| 指标类型 | 采集频率 | 保留周期 | 存储位置 |
|---------|---------|---------|---------|
| 系统指标 | 15秒 | 30天 | Prometheus |
| 应用指标 | 15秒 | 30天 | Prometheus |
| 业务指标 | 30秒 | 30天 | Prometheus |
| 日志数据 | 实时 | 7天 | Elasticsearch |
| 审计日志 | 实时 | 90天 | Elasticsearch |

### 7.2 存储容量规划

```bash
# Prometheus存储估算
# 每个指标约 1-2 bytes/sample
# 指标数量 * 采样频率 * 保留天数 * 每样本大小

# 示例: 10000指标 * 5760次/天(15秒间隔) * 30天 * 2 bytes
# = 10000 * 5760 * 30 * 2 = 3.456 GB

# 建议预留空间: 估算值 * 2
```

### 7.3 数据清理策略

```bash
# Prometheus数据清理
# 通过配置自动清理
# storage.tsdb.retention.time=30d
# storage.tsdb.retention.size=10GB

# Elasticsearch索引清理
# 使用ILM策略自动清理
PUT _ilm/policy/yunmu_policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          }
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

## 8. 运维工具使用指南

### 8.1 Prometheus查询示例

```promql
# CPU使用率
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# HTTP请求错误率
(sum(rate(yunmu_http_requests_total{status_code=~"5.."}[5m])) 
/ sum(rate(yunmu_http_requests_total[5m]))) * 100

# P95响应时间
histogram_quantile(0.95, sum(rate(yunmu_http_request_duration_seconds_bucket[5m])) by (le))

# 数据库连接使用率
(yunmu_db_active_connections / yunmu_db_connection_pool_size) * 100

# Redis命中率
(redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses)) * 100
```

### 8.2 Grafana仪表板使用

**访问地址**: http://localhost:3001

**默认账号**: admin / admin123

**常用仪表板**:

1. 系统总览仪表板
   - 实时监控所有核心指标
   - 查看系统健康状态

2. API性能仪表板
   - 查看API响应时间
   - 分析请求量趋势

3. 数据库仪表板
   - 监控数据库性能
   - 分析慢查询

4. 业务指标仪表板
   - 查看业务数据
   - 分析用户行为

### 8.3 Alertmanager管理

**访问地址**: http://localhost:9093

**常用操作**:

```bash
# 查看活跃告警
curl -s http://localhost:9093/api/v1/alerts | jq '.data[] | select(.status.state=="active")'

# 静默告警
curl -X POST http://localhost:9093/api/v1/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [
      {"name": "alertname", "value": "HighCPUUsage", "isRegex": false}
    ],
    "startsAt": "2024-03-16T00:00:00Z",
    "endsAt": "2024-03-16T01:00:00Z",
    "createdBy": "admin",
    "comment": "计划内维护"
  }'

# 查看静默规则
curl -s http://localhost:9093/api/v1/silences | jq .
```

---

## 附录

### A. 联系人列表

| 角色 | 姓名 | 电话 | 邮箱 | 职责 |
|------|------|------|------|------|
| 运维负责人 | - | - | - | 整体运维管理 |
| 后端开发 | - | - | - | 后端服务维护 |
| DBA | - | - | - | 数据库管理 |
| 安全工程师 | - | - | - | 安全审计 |

### B. 相关文档

- [系统架构文档](./architecture/01-system-architecture.md)
- [API规范文档](./api/01-api-specification.md)
- [部署文档](./DEPLOYMENT.md)
- [测试文档](./TEST_PLAN.md)

### C. 常用命令速查

```bash
# 服务管理
docker-compose up -d                    # 启动所有服务
docker-compose down                     # 停止所有服务
docker-compose restart <service>        # 重启单个服务
docker-compose logs -f <service>        # 查看服务日志

# 监控管理
docker-compose -f docker-compose.monitoring.yml up -d    # 启动监控系统
curl -X POST http://localhost:9090/-/reload              # 重载Prometheus配置
curl -X POST http://localhost:9093/-/reload              # 重载Alertmanager配置

# 数据库管理
docker exec -it yunmu-postgres psql -U yunmu -d yunmu_game_store  # 连接数据库
docker exec yunmu-postgres pg_dump -U yunmu yunmu_game_store > backup.sql  # 备份数据库

# Redis管理
docker exec -it yunmu-redis redis-cli -a redis123        # 连接Redis
docker exec yunmu-redis redis-cli -a redis123 INFO       # 查看Redis信息
```

---

**文档结束**
