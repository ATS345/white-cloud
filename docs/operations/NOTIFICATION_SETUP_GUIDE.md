# 告警通知配置指南

**文档版本**: v1.0  
**最后更新**: 2026-03-26

---

## 概述

本指南详细说明了如何配置云幕游戏商店平台的告警通知系统，包括SMTP邮件通知和企业微信、钉钉、飞书等即时通讯工具的Webhook集成。

---

## 1. 邮件通知配置

### 1.1 SMTP配置参数

在 `monitoring/alertmanager.yml` 中配置以下参数：

```yaml
global:
  smtp_smarthost: 'smtp.your-company.com:587'      # SMTP服务器地址和端口
  smtp_from: 'alert@yunmu-game-store.com'        # 发件人邮箱
  smtp_auth_username: 'alert@yunmu-game-store.com'  # SMTP认证用户名
  smtp_auth_password: 'your-actual-smtp-password'   # SMTP认证密码
  smtp_require_tls: true                            # 是否启用TLS
```

### 1.2 常见SMTP服务器配置

| 邮件服务商 | SMTP服务器 | 端口 | TLS |
|-----------|-----------|------|-----|
| 阿里云邮箱 | smtp.aliyun.com | 465 | 是 |
| 腾讯企业邮 | smtp.exmail.qq.com | 465 | 是 |
| 网易企业邮 | smtp.qiye.163.com | 465 | 是 |
| Gmail | smtp.gmail.com | 587 | 是 |
| Outlook/Office 365 | smtp.office365.com | 587 | 是 |

### 1.3 配置步骤

1. 复制配置模板：
   ```bash
   cp monitoring/alertmanager.example.yml monitoring/alertmanager.yml
   ```

2. 编辑 `monitoring/alertmanager.yml`，填入实际的SMTP参数

3. 重启Alertmanager：
   ```bash
   docker restart yunmu-alertmanager
   ```

4. 验证配置：
   ```bash
   docker logs yunmu-alertmanager --tail 50
   ```

---

## 2. 企业微信Webhook配置

### 2.1 获取Webhook URL

1. 登录企业微信管理后台
2. 进入「应用管理」→ 「自建应用」
3. 创建或选择告警通知应用
4. 在「webhook」页面获取Webhook地址

格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY`

### 2.2 配置到Alertmanager

在 `monitoring/alertmanager.yml` 的 `critical-receiver` 中添加：

```yaml
webhook_configs:
  - url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_WECHAT_WEBHOOK_KEY'
    send_resolved: true
```

---

## 3. 钉钉Webhook配置

### 3.1 获取Webhook URL

1. 打开钉钉PC端或移动端
2. 进入目标群聊 → 群设置 → 智能群助手
3. 添加「自定义机器人」
4. 复制Webhook地址

格式：`https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN`

### 3.2 配置到Alertmanager

在 `monitoring/alertmanager.yml` 的 `critical-receiver` 中添加：

```yaml
webhook_configs:
  - url: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_DINGTALK_ACCESS_TOKEN'
    send_resolved: true
```

---

## 4. 飞书Webhook配置

### 4.1 获取Webhook URL

1. 打开飞书PC端或移动端
2. 进入目标群组 → 群设置 → 群机器人
3. 添加「自定义机器人」
4. 复制Webhook地址

格式：`https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_KEY`

### 4.2 配置到Alertmanager

在 `monitoring/alertmanager.yml` 的 `critical-receiver` 中添加：

```yaml
webhook_configs:
  - url: 'https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_FEISHU_HOOK_KEY'
    send_resolved: true
```

---

## 5. 完整配置示例

### 5.1 配置文件结构

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.your-company.com:587'
  smtp_from: 'alert@yunmu-game-store.com'
  smtp_auth_username: 'alert@yunmu-game-store.com'
  smtp_auth_password: 'your-actual-smtp-password'
  smtp_require_tls: true

route:
  group_by: ['alertname', 'severity', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default-receiver'
  routes:
    - match:
        severity: critical
      receiver: 'critical-receiver'
      continue: true
    - match:
        severity: warning
      receiver: 'warning-receiver'
    - match:
        severity: info
      receiver: 'info-receiver'

receivers:
  - name: 'default-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com'
        from: 'alert@yunmu-game-store.com'
        smarthost: 'smtp.your-company.com:587'
        auth_username: 'alert@yunmu-game-store.com'
        auth_password: 'your-actual-smtp-password'
        require_tls: true
        send_resolved: true
        headers:
          subject: '[云幕游戏商店] 告警通知'

  - name: 'critical-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com,oncall@yunmu-game-store.com'
        from: 'alert@yunmu-game-store.com'
        smarthost: 'smtp.your-company.com:587'
        auth_username: 'alert@yunmu-game-store.com'
        auth_password: 'your-actual-smtp-password'
        require_tls: true
        send_resolved: true
        headers:
          subject: '[紧急] [云幕游戏商店] 严重告警'
    webhook_configs:
      - url: 'http://backend:3000/api/v1/alert/webhook'
        send_resolved: true
      - url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_WECHAT_WEBHOOK_KEY'
        send_resolved: true
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_DINGTALK_ACCESS_TOKEN'
        send_resolved: true
      - url: 'https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_FEISHU_HOOK_KEY'
        send_resolved: true

  - name: 'warning-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com'
        from: 'alert@yunmu-game-store.com'
        smarthost: 'smtp.your-company.com:587'
        auth_username: 'alert@yunmu-game-store.com'
        auth_password: 'your-actual-smtp-password'
        require_tls: true
        send_resolved: true
        headers:
          subject: '[警告] [云幕游戏商店] 告警通知'

  - name: 'info-receiver'
    email_configs:
      - to: 'admin@yunmu-game-store.com'
        from: 'alert@yunmu-game-store.com'
        smarthost: 'smtp.your-company.com:587'
        auth_username: 'alert@yunmu-game-store.com'
        auth_password: 'your-actual-smtp-password'
        require_tls: true
        send_resolved: true
        headers:
          subject: '[信息] [云幕游戏商店] 通知'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance', 'job']
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'info'
    equal: ['alertname', 'instance', 'job']
```

---

## 6. 配置验证与测试

### 6.1 验证Alertmanager配置

```bash
# 检查Alertmanager状态
docker ps | grep alertmanager

# 查看Alertmanager日志
docker logs yunmu-alertmanager --tail 50

# 访问Alertmanager UI
# 打开浏览器访问: http://localhost:9093
```

### 6.2 测试告警通知

#### 方法1：通过Prometheus UI测试

1. 访问 http://localhost:9090
2. 进入「Alerts」页面
3. 查看已配置的告警规则
4. 可以临时修改告警阈值来触发测试

#### 方法2：手动触发测试告警

```bash
# 连接到Prometheus容器
docker exec -it yunmu-prometheus sh

# 或者通过API临时创建告警（需要自定义）
```

#### 方法3：模拟服务故障

```bash
# 停止某个服务来触发告警
docker stop yunmu-backend

# 等待1分钟后检查告警
# 访问 http://localhost:9093 查看告警状态

# 恢复服务
docker start yunmu-backend
```

### 6.3 验证通知接收

配置完成后，请验证：
- [ ] 邮件通知是否正常接收
- [ ] 企业微信告警是否正常推送
- [ ] 钉钉告警是否正常推送
- [ ] 飞书告警是否正常推送
- [ ] 告警解除通知是否正常发送

---

## 7. Grafana仪表盘管理

### 7.1 访问Grafana

1. 打开浏览器访问：http://localhost:3001
2. 使用默认凭证登录：
   - 用户名：`admin`
   - 密码：`admin123`

### 7.2 查看和配置仪表盘

#### 现有仪表盘

系统已预置以下仪表盘配置：
- 系统总览仪表盘 (`system-overview.json`)

#### 操作步骤

1. **查看现有仪表盘**
   - 登录Grafana
   - 点击左侧菜单「Dashboards」→ 「Browse」
   - 查看「Yunmu」文件夹下的仪表盘

2. **添加新的仪表盘**
   - 点击「+」→ 「New Dashboard」
   - 添加Panel，选择Prometheus数据源
   - 配置查询语句，例如：
     ```promql
     rate(yunmu_http_requests_total[5m])
     ```

3. **导入仪表盘**
   - 点击「+」→ 「Import」
   - 上传JSON文件或输入仪表盘ID
   - 选择Prometheus数据源

### 7.3 常用PromQL查询示例

#### HTTP请求量
```promql
rate(yunmu_http_requests_total[5m])
```

#### HTTP错误率
```promql
rate(yunmu_http_requests_total{status_code=~"5.."}[5m]) 
/ rate(yunmu_http_requests_total[5m])
```

#### P95响应时间
```promql
histogram_quantile(0.95, sum(rate(yunmu_http_request_duration_seconds_bucket[5m])) by (le))
```

#### CPU使用率
```promql
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

#### 内存使用率
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

---

## 8. 安全注意事项

### 8.1 凭据安全

- 不要将包含真实密码的 `alertmanager.yml` 提交到Git
- 使用环境变量或Secret管理工具存储敏感信息
- 定期更换SMTP密码和Webhook密钥

### 8.2 Git忽略配置

确保 `.gitignore` 包含：
```
monitoring/alertmanager.yml
*.env
*.env.local
```

### 8.3 Webhook安全

- 为Webhook设置IP白名单
- 使用签名验证（如支持）
- 定期轮换Webhook密钥

---

## 9. 故障排查

### 9.1 邮件通知问题

**问题**：邮件未发送

**排查步骤**：
1. 检查Alertmanager日志：`docker logs yunmu-alertmanager`
2. 验证SMTP服务器连接
3. 确认邮箱地址正确
4. 检查垃圾邮件文件夹

### 9.2 Webhook问题

**问题**：Webhook未触发

**排查步骤**：
1. 验证Webhook URL是否正确
2. 检查网络连接
3. 确认Webhook服务端正常运行
4. 查看Alertmanager日志

### 9.3 Grafana问题

**问题**：Grafana无法显示数据

**排查步骤**：
1. 确认Prometheus数据源配置正确
2. 检查Prometheus是否正常运行
3. 验证查询语句语法
4. 查看Grafana日志：`docker logs yunmu-grafana`

---

## 10. 附录

### 10.1 相关文件

- `monitoring/alertmanager.example.yml` - 配置模板
- `monitoring/alertmanager.yml` - 实际配置文件（需自己创建）
- `monitoring/alert.rules.yml` - 告警规则
- `docs/operations/NOTIFICATION_SETUP_GUIDE.md` - 本文档

### 10.2 参考链接

- [Alertmanager官方文档](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [企业微信机器人文档](https://developer.work.weixin.qq.com/document/path/91770)
- [钉钉机器人文档](https://open.dingtalk.com/document/robots/custom-robot-access)
- [飞书机器人文档](https://open.feishu.cn/document/ukTMukTMukTM/uETOyYjLkMjM24SO5IjN)

---

**文档结束**
