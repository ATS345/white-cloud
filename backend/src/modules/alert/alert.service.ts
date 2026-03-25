import { Injectable, Logger, Optional } from "@nestjs/common";
import Redis from "ioredis";

/**
 * 告警级别
 */
export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
  EMERGENCY = "emergency",
}

/**
 * 告警状态
 */
export enum AlertStatus {
  FIRING = "firing",
  RESOLVED = "resolved",
}

/**
 * 告警配置
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  threshold: number;
  duration: number; // 持续时间（秒）
  severity: AlertSeverity;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  enabled: boolean;
}

/**
 * 告警事件
 */
export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  status: AlertStatus;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: Date;
  endsAt?: Date;
  fingerprint: string;
}

/**
 * 通知渠道
 */
export interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "webhook" | "slack" | "wechat";
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * 告警服务
 * 负责告警规则管理、告警触发和通知发送
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly alertRulesKey = "yunmu:alert:rules";
  private readonly alertEventsKey = "yunmu:alert:events";
  private readonly alertStateKey = "yunmu:alert:state";

  // 默认告警规则
  private readonly defaultRules: AlertRule[] = [
    {
      id: "high_cpu_usage",
      name: "CPU使用率过高",
      description: "CPU使用率超过80%持续5分钟",
      metric: "yunmu_system_cpu_usage_percent",
      operator: ">",
      threshold: 80,
      duration: 300,
      severity: AlertSeverity.WARNING,
      labels: { category: "infrastructure", component: "cpu" },
      annotations: {
        summary: "CPU使用率告警",
        description: "CPU使用率超过阈值",
      },
      enabled: true,
    },
    {
      id: "high_memory_usage",
      name: "内存使用率过高",
      description: "内存使用率超过85%持续5分钟",
      metric: "yunmu_system_memory_usage_percent",
      operator: ">",
      threshold: 85,
      duration: 300,
      severity: AlertSeverity.WARNING,
      labels: { category: "infrastructure", component: "memory" },
      annotations: {
        summary: "内存使用率告警",
        description: "内存使用率超过阈值",
      },
      enabled: true,
    },
    {
      id: "high_error_rate",
      name: "API错误率过高",
      description: "HTTP 5xx错误率超过1%持续5分钟",
      metric: "yunmu_http_error_rate",
      operator: ">",
      threshold: 1,
      duration: 300,
      severity: AlertSeverity.CRITICAL,
      labels: { category: "application", component: "api" },
      annotations: {
        summary: "API错误率告警",
        description: "API错误率超过阈值",
      },
      enabled: true,
    },
    {
      id: "high_response_time",
      name: "API响应时间过长",
      description: "P95响应时间超过500ms持续5分钟",
      metric: "yunmu_http_request_duration_seconds_p95",
      operator: ">",
      threshold: 0.5,
      duration: 300,
      severity: AlertSeverity.WARNING,
      labels: { category: "application", component: "api" },
      annotations: {
        summary: "API响应时间告警",
        description: "API响应时间超过阈值",
      },
      enabled: true,
    },
    {
      id: "database_connection_high",
      name: "数据库连接数过高",
      description: "数据库连接数超过80%持续5分钟",
      metric: "yunmu_db_connection_usage",
      operator: ">",
      threshold: 80,
      duration: 300,
      severity: AlertSeverity.WARNING,
      labels: { category: "infrastructure", component: "database" },
      annotations: {
        summary: "数据库连接告警",
        description: "数据库连接数过高",
      },
      enabled: true,
    },
    {
      id: "redis_memory_high",
      name: "Redis内存使用过高",
      description: "Redis内存使用超过80%持续5分钟",
      metric: "yunmu_redis_memory_usage_percent",
      operator: ">",
      threshold: 80,
      duration: 300,
      severity: AlertSeverity.WARNING,
      labels: { category: "infrastructure", component: "redis" },
      annotations: {
        summary: "Redis内存告警",
        description: "Redis内存使用过高",
      },
      enabled: true,
    },
    {
      id: "low_payment_success_rate",
      name: "支付成功率过低",
      description: "支付成功率低于90%持续10分钟",
      metric: "yunmu_payment_success_rate",
      operator: "<",
      threshold: 90,
      duration: 600,
      severity: AlertSeverity.CRITICAL,
      labels: { category: "business", component: "payment" },
      annotations: {
        summary: "支付成功率告警",
        description: "支付成功率低于阈值",
      },
      enabled: true,
    },
    {
      id: "service_down",
      name: "服务不可用",
      description: "服务健康检查失败持续1分钟",
      metric: "yunmu_service_up",
      operator: "==",
      threshold: 0,
      duration: 60,
      severity: AlertSeverity.EMERGENCY,
      labels: { category: "infrastructure", component: "service" },
      annotations: {
        summary: "服务不可用告警",
        description: "服务健康检查失败",
      },
      enabled: true,
    },
  ];

  constructor(@Optional() private readonly redis: Redis | null) {
    if (this.redis) {
      this.initializeDefaultRules();
    } else {
      this.logger.warn(
        "Redis not configured, alert service running in degraded mode",
      );
    }
  }

  /**
   * 初始化默认告警规则
   */
  private async initializeDefaultRules(): Promise<void> {
    if (!this.redis) {
      return;
    }
    try {
      for (const rule of this.defaultRules) {
        const exists = await this.redis.hexists(this.alertRulesKey, rule.id);
        if (!exists) {
          await this.redis.hset(
            this.alertRulesKey,
            rule.id,
            JSON.stringify(rule),
          );
        }
      }
      this.logger.log("Default alert rules initialized");
    } catch (error) {
      this.logger.error("Failed to initialize default rules", error);
    }
  }

  /**
   * 检查Redis是否可用
   */
  private checkRedis(): void {
    if (!this.redis) {
      throw new Error("Redis is not configured. Alert service is unavailable.");
    }
  }

  /**
   * 获取所有告警规则
   */
  async getAlertRules(): Promise<AlertRule[]> {
    this.checkRedis();
    const rules = await this.redis.hgetall(this.alertRulesKey);
    return Object.values(rules).map((r) => JSON.parse(r));
  }

  /**
   * 获取单个告警规则
   */
  async getAlertRule(id: string): Promise<AlertRule | null> {
    this.checkRedis();
    const rule = await this.redis.hget(this.alertRulesKey, id);
    return rule ? JSON.parse(rule) : null;
  }

  /**
   * 创建告警规则
   */
  async createAlertRule(rule: AlertRule): Promise<void> {
    this.checkRedis();
    await this.redis.hset(this.alertRulesKey, rule.id, JSON.stringify(rule));
    this.logger.log(`Alert rule created: ${rule.id}`);
  }

  /**
   * 更新告警规则
   */
  async updateAlertRule(
    id: string,
    updates: Partial<AlertRule>,
  ): Promise<void> {
    this.checkRedis();
    const rule = await this.getAlertRule(id);
    if (!rule) {
      throw new Error(`Alert rule not found: ${id}`);
    }

    const updatedRule = { ...rule, ...updates };
    await this.redis.hset(this.alertRulesKey, id, JSON.stringify(updatedRule));
    this.logger.log(`Alert rule updated: ${id}`);
  }

  /**
   * 删除告警规则
   */
  async deleteAlertRule(id: string): Promise<void> {
    this.checkRedis();
    await this.redis.hdel(this.alertRulesKey, id);
    this.logger.log(`Alert rule deleted: ${id}`);
  }

  /**
   * 评估告警规则
   */
  async evaluateRule(
    rule: AlertRule,
    currentValue: number,
  ): Promise<AlertEvent | null> {
    this.checkRedis();
    const shouldFire = this.evaluateCondition(
      currentValue,
      rule.operator,
      rule.threshold,
    );

    const stateKey = `${this.alertStateKey}:${rule.id}`;
    const stateStr = await this.redis.get(stateKey);
    const state = stateStr ? JSON.parse(stateStr) : null;

    const now = Date.now();

    if (shouldFire) {
      if (!state) {
        // 开始计时
        await this.redis.set(
          stateKey,
          JSON.stringify({ startTime: now, fired: false }),
          "EX",
          rule.duration * 2,
        );
        return null;
      }

      const duration = (now - state.startTime) / 1000;

      if (!state.fired && duration >= rule.duration) {
        // 触发告警
        const event: AlertEvent = {
          id: `alert-${rule.id}-${now}`,
          ruleId: rule.id,
          ruleName: rule.name,
          status: AlertStatus.FIRING,
          severity: rule.severity,
          message: `${rule.name}: 当前值 ${currentValue.toFixed(2)}, 阈值 ${rule.threshold}`,
          value: currentValue,
          threshold: rule.threshold,
          labels: rule.labels,
          annotations: rule.annotations,
          startsAt: new Date(state.startTime),
          fingerprint: this.generateFingerprint(rule.id),
        };

        // 更新状态
        await this.redis.set(
          stateKey,
          JSON.stringify({ ...state, fired: true, eventId: event.id }),
          "EX",
          rule.duration * 2,
        );

        // 存储告警事件
        await this.storeAlertEvent(event);

        // 发送通知
        await this.sendNotification(event);

        return event;
      }
    } else {
      if (state?.fired) {
        // 告警恢复
        const event: AlertEvent = {
          id: `alert-${rule.id}-resolved-${now}`,
          ruleId: rule.id,
          ruleName: rule.name,
          status: AlertStatus.RESOLVED,
          severity: rule.severity,
          message: `${rule.name} 已恢复`,
          value: currentValue,
          threshold: rule.threshold,
          labels: rule.labels,
          annotations: rule.annotations,
          startsAt: new Date(state.startTime),
          endsAt: new Date(),
          fingerprint: this.generateFingerprint(rule.id),
        };

        // 清除状态
        await this.redis.del(stateKey);

        // 存储告警事件
        await this.storeAlertEvent(event);

        // 发送恢复通知
        await this.sendNotification(event);

        return event;
      }

      // 清除计时状态
      await this.redis.del(stateKey);
    }

    return null;
  }

  /**
   * 评估条件
   */
  private evaluateCondition(
    value: number,
    operator: string,
    threshold: number,
  ): boolean {
    switch (operator) {
      case ">":
        return value > threshold;
      case "<":
        return value < threshold;
      case ">=":
        return value >= threshold;
      case "<=":
        return value <= threshold;
      case "==":
        return value === threshold;
      case "!=":
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * 存储告警事件
   */
  private async storeAlertEvent(event: AlertEvent): Promise<void> {
    const key = `${this.alertEventsKey}:${new Date().toISOString().split("T")[0]}`;
    await this.redis.lpush(key, JSON.stringify(event));
    await this.redis.expire(key, 30 * 24 * 60 * 60); // 保留30天
  }

  /**
   * 获取告警历史
   */
  async getAlertHistory(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
  ): Promise<AlertEvent[]> {
    const events: AlertEvent[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
      const key = `${this.alertEventsKey}:${start.toISOString().split("T")[0]}`;
      const dayEvents = await this.redis.lrange(key, 0, limit - events.length);

      for (const eventStr of dayEvents) {
        events.push(JSON.parse(eventStr));
        if (events.length >= limit) break;
      }

      if (events.length >= limit) break;
      start.setDate(start.getDate() + 1);
    }

    return events.sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
  }

  /**
   * 获取活跃告警
   */
  async getActiveAlerts(): Promise<AlertEvent[]> {
    const keys = await this.redis.keys(`${this.alertStateKey}:*`);
    const activeAlerts: AlertEvent[] = [];

    for (const key of keys) {
      const stateStr = await this.redis.get(key);
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.fired && state.eventId) {
          // 从最近的日志中查找事件
          const today = new Date().toISOString().split("T")[0];
          const eventKey = `${this.alertEventsKey}:${today}`;
          const events = await this.redis.lrange(eventKey, 0, -1);

          for (const eventStr of events) {
            const event: AlertEvent = JSON.parse(eventStr);
            if (
              event.id === state.eventId &&
              event.status === AlertStatus.FIRING
            ) {
              activeAlerts.push(event);
              break;
            }
          }
        }
      }
    }

    return activeAlerts;
  }

  /**
   * 发送通知
   * 支持Webhook通知，可扩展邮件、Slack等渠道
   */
  private async sendNotification(event: AlertEvent): Promise<void> {
    this.logger.log(`Sending notification for alert: ${event.id}`);

    const notification = {
      id: event.id,
      status: event.status,
      severity: event.severity,
      message: event.message,
      labels: event.labels,
      timestamp: new Date().toISOString(),
    };

    // 发送到Webhook
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        });
      } catch (error) {
        this.logger.error("Failed to send webhook notification", error);
      }
    }

    // 记录通知日志
    this.logger.log(`Notification sent: ${JSON.stringify(notification)}`);
  }

  /**
   * 生成告警指纹
   */
  private generateFingerprint(ruleId: string): string {
    return Buffer.from(ruleId).toString("base64");
  }

  /**
   * 配置通知渠道
   */
  async configureNotificationChannel(
    channel: NotificationChannel,
  ): Promise<void> {
    const key = `yunmu:alert:channels:${channel.id}`;
    await this.redis.set(key, JSON.stringify(channel));
    this.logger.log(`Notification channel configured: ${channel.id}`);
  }

  /**
   * 获取通知渠道
   */
  async getNotificationChannels(): Promise<NotificationChannel[]> {
    const keys = await this.redis.keys("yunmu:alert:channels:*");
    const channels: NotificationChannel[] = [];

    for (const key of keys) {
      const channelStr = await this.redis.get(key);
      if (channelStr) {
        channels.push(JSON.parse(channelStr));
      }
    }

    return channels;
  }
}
