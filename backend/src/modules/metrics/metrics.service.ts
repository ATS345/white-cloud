import { Injectable, Optional } from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "../../config/prisma/prisma.service";
import {
  Registry,
  Counter,
  Gauge,
  Histogram,
  collectDefaultMetrics,
} from "prom-client";

/**
 * 监控指标服务
 * 负责收集和暴露系统性能指标、业务指标
 */
@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // HTTP请求相关指标
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestTotal: Counter;
  private readonly httpRequestInProgress: Gauge;

  // 数据库相关指标
  private readonly dbQueryDuration: Histogram;
  private readonly dbConnectionPool: Gauge;
  private readonly dbActiveConnections: Gauge;

  // Redis相关指标
  private readonly redisConnections: Gauge;
  private readonly redisMemoryUsage: Gauge;
  private readonly redisCommandDuration: Histogram;

  // 业务指标
  private readonly businessOrdersTotal: Counter;
  private readonly businessRevenueTotal: Counter;
  private readonly businessActiveUsers: Gauge;
  private readonly businessGamesDownloaded: Counter;
  private readonly businessPaymentSuccess: Counter;
  private readonly businessPaymentFailed: Counter;

  // 系统资源指标
  private readonly systemCpuUsage: Gauge;
  private readonly systemMemoryUsage: Gauge;
  private readonly systemDiskUsage: Gauge;

  constructor(
    @Optional() private readonly redis: Redis | null,
    private readonly prisma: PrismaService,
  ) {
    this.registry = new Registry();

    // 收集默认指标（CPU、内存等）
    collectDefaultMetrics({ register: this.registry });

    // 初始化HTTP请求指标
    this.httpRequestDuration = new Histogram({
      name: "yunmu_http_request_duration_seconds",
      help: "HTTP请求响应时间（秒）",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: "yunmu_http_requests_total",
      help: "HTTP请求总数",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestInProgress = new Gauge({
      name: "yunmu_http_requests_in_progress",
      help: "正在处理的HTTP请求数",
      labelNames: ["method", "route"],
      registers: [this.registry],
    });

    // 初始化数据库指标
    this.dbQueryDuration = new Histogram({
      name: "yunmu_db_query_duration_seconds",
      help: "数据库查询响应时间（秒）",
      labelNames: ["query_type", "table"],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.registry],
    });

    this.dbConnectionPool = new Gauge({
      name: "yunmu_db_connection_pool_size",
      help: "数据库连接池大小",
      registers: [this.registry],
    });

    this.dbActiveConnections = new Gauge({
      name: "yunmu_db_active_connections",
      help: "数据库活跃连接数",
      registers: [this.registry],
    });

    // 初始化Redis指标
    this.redisConnections = new Gauge({
      name: "yunmu_redis_connections",
      help: "Redis连接数",
      registers: [this.registry],
    });

    this.redisMemoryUsage = new Gauge({
      name: "yunmu_redis_memory_usage_bytes",
      help: "Redis内存使用量（字节）",
      registers: [this.registry],
    });

    this.redisCommandDuration = new Histogram({
      name: "yunmu_redis_command_duration_seconds",
      help: "Redis命令执行时间（秒）",
      labelNames: ["command"],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
      registers: [this.registry],
    });

    // 初始化业务指标
    this.businessOrdersTotal = new Counter({
      name: "yunmu_business_orders_total",
      help: "订单总数",
      labelNames: ["status"],
      registers: [this.registry],
    });

    this.businessRevenueTotal = new Counter({
      name: "yunmu_business_revenue_total",
      help: "总收入（分）",
      registers: [this.registry],
    });

    this.businessActiveUsers = new Gauge({
      name: "yunmu_business_active_users",
      help: "活跃用户数",
      labelNames: ["period"],
      registers: [this.registry],
    });

    this.businessGamesDownloaded = new Counter({
      name: "yunmu_business_games_downloaded_total",
      help: "游戏下载总数",
      labelNames: ["game_id"],
      registers: [this.registry],
    });

    this.businessPaymentSuccess = new Counter({
      name: "yunmu_business_payment_success_total",
      help: "支付成功次数",
      registers: [this.registry],
    });

    this.businessPaymentFailed = new Counter({
      name: "yunmu_business_payment_failed_total",
      help: "支付失败次数",
      labelNames: ["error_type"],
      registers: [this.registry],
    });

    // 初始化系统资源指标
    this.systemCpuUsage = new Gauge({
      name: "yunmu_system_cpu_usage_percent",
      help: "系统CPU使用率（百分比）",
      registers: [this.registry],
    });

    this.systemMemoryUsage = new Gauge({
      name: "yunmu_system_memory_usage_percent",
      help: "系统内存使用率（百分比）",
      registers: [this.registry],
    });

    this.systemDiskUsage = new Gauge({
      name: "yunmu_system_disk_usage_percent",
      help: "系统磁盘使用率（百分比）",
      registers: [this.registry],
    });

    // 启动定时收集任务
    this.startPeriodicCollection();
  }

  /**
   * 记录HTTP请求
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const routeNormalized = this.normalizeRoute(route);

    this.httpRequestDuration
      .labels(method, routeNormalized, statusCode.toString())
      .observe(duration);

    this.httpRequestTotal
      .labels(method, routeNormalized, statusCode.toString())
      .inc();
  }

  /**
   * 开始HTTP请求跟踪
   */
  startHttpRequest(
    method: string,
    route: string,
  ): (statusCode: number) => void {
    const routeNormalized = this.normalizeRoute(route);
    this.httpRequestInProgress.labels(method, routeNormalized).inc();

    const startTime = Date.now();

    return (statusCode: number) => {
      const duration = (Date.now() - startTime) / 1000;
      this.recordHttpRequest(method, route, statusCode, duration);
      this.httpRequestInProgress.labels(method, routeNormalized).dec();
    };
  }

  /**
   * 记录数据库查询
   */
  recordDbQuery(queryType: string, table: string, duration: number): void {
    this.dbQueryDuration.labels(queryType, table).observe(duration);
  }

  /**
   * 记录Redis命令
   */
  recordRedisCommand(command: string, duration: number): void {
    this.redisCommandDuration.labels(command).observe(duration);
  }

  /**
   * 记录订单
   */
  recordOrder(status: string, amount: number): void {
    this.businessOrdersTotal.labels(status).inc();
    if (status === "paid") {
      this.businessRevenueTotal.inc(amount);
    }
  }

  /**
   * 记录支付结果
   */
  recordPayment(success: boolean, errorType?: string): void {
    if (success) {
      this.businessPaymentSuccess.inc();
    } else {
      this.businessPaymentFailed.labels(errorType || "unknown").inc();
    }
  }

  /**
   * 记录游戏下载
   */
  recordGameDownload(gameId: number): void {
    this.businessGamesDownloaded.labels(gameId.toString()).inc();
  }

  /**
   * 获取指标数据
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * 获取指标JSON格式
   */
  async getMetricsJson(): Promise<Record<string, any>> {
    const metrics = await this.registry.getMetricsAsJSON();
    const result: Record<string, any> = {};

    for (const metric of metrics) {
      result[metric.name] = {
        help: metric.help,
        type: metric.type,
        values: metric.values,
      };
    }

    return result;
  }

  /**
   * 收集业务指标
   */
  async collectBusinessMetrics(): Promise<void> {
    try {
      // 收集活跃用户数
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 日活用户
      const dailyActiveUsers = await this.prisma.user.count({
        where: {
          lastLoginAt: { gte: todayStart },
        },
      });
      this.businessActiveUsers.labels("daily").set(dailyActiveUsers);

      // 周活用户
      const weeklyActiveUsers = await this.prisma.user.count({
        where: {
          lastLoginAt: { gte: weekAgo },
        },
      });
      this.businessActiveUsers.labels("weekly").set(weeklyActiveUsers);

      // 月活用户
      const monthlyActiveUsers = await this.prisma.user.count({
        where: {
          lastLoginAt: { gte: monthAgo },
        },
      });
      this.businessActiveUsers.labels("monthly").set(monthlyActiveUsers);
    } catch (error) {
      console.error("Failed to collect business metrics:", error);
    }
  }

  /**
   * 收集数据库指标
   */
  async collectDatabaseMetrics(): Promise<void> {
    try {
      // SQLite兼容：获取数据库文件大小
      const dbSizeResult = await this.prisma.$queryRaw<
        Array<{ page_count: bigint }>
      >`
        PRAGMA page_count
      `;
      const pageSizeResult = await this.prisma.$queryRaw<
        Array<{ page_size: bigint }>
      >`
        PRAGMA page_size
      `;

      const pageCount = Number(dbSizeResult[0]?.page_count || 0);
      const pageSize = Number(pageSizeResult[0]?.page_size || 4096);
      const dbSizeBytes = pageCount * pageSize;

      // 设置数据库大小（MB）
      this.dbConnectionPool.set(Math.floor(dbSizeBytes / (1024 * 1024)));

      // SQLite是嵌入式数据库，活跃连接数为1
      this.dbActiveConnections.set(1);
    } catch (error) {
      // 静默处理错误，避免日志污染
    }
  }

  /**
   * 收集Redis指标
   */
  async collectRedisMetrics(): Promise<void> {
    if (!this.redis) {
      return;
    }
    try {
      // 获取Redis信息
      const info = await this.redis.info("clients");
      const memoryInfo = await this.redis.info("memory");

      // 解析连接数
      const connectedClientsMatch = info.match(/connected_clients:(\d+)/);
      if (connectedClientsMatch) {
        this.redisConnections.set(Number(connectedClientsMatch[1]));
      }

      // 解析内存使用
      const usedMemoryMatch = memoryInfo.match(/used_memory:(\d+)/);
      if (usedMemoryMatch) {
        this.redisMemoryUsage.set(Number(usedMemoryMatch[1]));
      }
    } catch (error) {
      console.error("Failed to collect Redis metrics:", error);
    }
  }

  /**
   * 启动定时收集任务
   */
  private startPeriodicCollection(): void {
    // 每30秒收集一次指标
    setInterval(async () => {
      await Promise.all([
        this.collectBusinessMetrics(),
        this.collectDatabaseMetrics(),
        this.collectRedisMetrics(),
      ]);
    }, 30000);

    // 初始收集
    setTimeout(async () => {
      await Promise.all([
        this.collectBusinessMetrics(),
        this.collectDatabaseMetrics(),
        this.collectRedisMetrics(),
      ]);
    }, 5000);
  }

  /**
   * 规范化路由路径
   */
  private normalizeRoute(route: string): string {
    // 替换数字ID为占位符
    return route
      .replace(/\/\d+/g, "/:id")
      .replace(/\/[a-f0-9-]{36}/g, "/:uuid");
  }
}
