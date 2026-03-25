import { Injectable, Optional } from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "../../config/prisma/prisma.service";
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from "@nestjs/terminus";

/**
 * 健康状态枚举
 */
export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
}

/**
 * 组件健康状态
 */
export interface ComponentHealth {
  status: HealthStatus;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * 系统健康报告
 */
export interface SystemHealthReport {
  status: HealthStatus;
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    elasticsearch: ComponentHealth;
    api: ComponentHealth;
  };
  uptime: number;
  version: string;
  timestamp: Date;
}

/**
 * 健康检查服务
 * 提供系统各组件的健康状态检查
 */
@Injectable()
export class HealthService {
  private readonly startTime: Date;

  constructor(
    private healthCheckService: HealthCheckService,
    @Optional() private readonly redis: Redis | null,
    private readonly prisma: PrismaService,
  ) {
    this.startTime = new Date();
  }

  /**
   * 执行完整健康检查
   */
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([]);
  }

  /**
   * 获取详细健康报告
   */
  async getDetailedHealth(): Promise<SystemHealthReport> {
    const [databaseHealth, redisHealth, esHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkElasticsearch(),
    ]);

    // 确定整体状态
    const statuses = [
      databaseHealth.status,
      redisHealth.status,
      esHealth.status,
    ];
    let overallStatus = HealthStatus.HEALTHY;

    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (statuses.includes(HealthStatus.DEGRADED)) {
      overallStatus = HealthStatus.DEGRADED;
    }

    return {
      status: overallStatus,
      components: {
        database: databaseHealth,
        redis: redisHealth,
        elasticsearch: esHealth,
        api: {
          status: HealthStatus.HEALTHY,
          message: "API服务正常运行",
          timestamp: new Date(),
        },
      },
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date(),
    };
  }

  /**
   * 检查数据库健康状态
   */
  async checkDatabase(): Promise<ComponentHealth> {
    try {
      const startTime = Date.now();

      // 执行简单查询测试连接
      await this.prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;

      // 获取连接池状态
      const connectionResult = await this.prisma.$queryRaw<
        Array<{ count: bigint }>
      >`
        SELECT count(*) FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      const activeConnections = Number(connectionResult[0]?.count || 0);

      // 获取最大连接数
      const maxConnResult = await this.prisma.$queryRaw<
        Array<{ setting: string }>
      >`
        SELECT setting FROM pg_settings WHERE name = 'max_connections'
      `;
      const maxConnections = Number(maxConnResult[0]?.setting || 100);

      // 判断健康状态
      let status = HealthStatus.HEALTHY;
      let message = "数据库连接正常";

      const connectionUsage = activeConnections / maxConnections;

      if (responseTime > 1000) {
        status = HealthStatus.DEGRADED;
        message = "数据库响应时间过长";
      }

      if (connectionUsage > 0.9) {
        status = HealthStatus.UNHEALTHY;
        message = "数据库连接数接近上限";
      } else if (connectionUsage > 0.7) {
        status = HealthStatus.DEGRADED;
        message = "数据库连接数较高";
      }

      return {
        status,
        message,
        details: {
          responseTime: `${responseTime}ms`,
          activeConnections,
          maxConnections,
          connectionUsage: `${(connectionUsage * 100).toFixed(1)}%`,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `数据库连接失败: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 检查Redis健康状态
   */
  async checkRedis(): Promise<ComponentHealth> {
    if (!this.redis) {
      return {
        status: HealthStatus.DEGRADED,
        message: "Redis未配置，使用降级模式运行",
        details: {
          mode: "disabled",
        },
        timestamp: new Date(),
      };
    }

    try {
      const startTime = Date.now();

      // 执行PING命令
      const pong = await this.redis.ping();
      const responseTime = Date.now() - startTime;

      if (pong !== "PONG") {
        throw new Error("Redis PING返回异常");
      }

      // 获取Redis信息
      const info = await this.redis.info("memory");
      const clientsInfo = await this.redis.info("clients");

      // 解析内存使用
      const usedMemoryMatch = info.match(/used_memory:(\d+)/);
      const maxMemoryMatch = info.match(/maxmemory:(\d+)/);
      const usedMemory = usedMemoryMatch ? Number(usedMemoryMatch[1]) : 0;
      const maxMemory = maxMemoryMatch ? Number(maxMemoryMatch[1]) : 0;

      // 解析连接数
      const connectedClientsMatch = clientsInfo.match(
        /connected_clients:(\d+)/,
      );
      const connectedClients = connectedClientsMatch
        ? Number(connectedClientsMatch[1])
        : 0;

      // 判断健康状态
      let status = HealthStatus.HEALTHY;
      let message = "Redis连接正常";

      if (responseTime > 100) {
        status = HealthStatus.DEGRADED;
        message = "Redis响应时间过长";
      }

      if (maxMemory > 0) {
        const memoryUsage = usedMemory / maxMemory;
        if (memoryUsage > 0.9) {
          status = HealthStatus.UNHEALTHY;
          message = "Redis内存使用接近上限";
        } else if (memoryUsage > 0.7) {
          status = HealthStatus.DEGRADED;
          message = "Redis内存使用较高";
        }
      }

      return {
        status,
        message,
        details: {
          responseTime: `${responseTime}ms`,
          usedMemory: `${(usedMemory / 1024 / 1024).toFixed(2)}MB`,
          maxMemory:
            maxMemory > 0
              ? `${(maxMemory / 1024 / 1024).toFixed(2)}MB`
              : "unlimited",
          connectedClients,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Redis连接失败: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 检查Elasticsearch健康状态
   */
  async checkElasticsearch(): Promise<ComponentHealth> {
    try {
      const esNode = process.env.ELASTICSEARCH_NODE || "http://localhost:9200";

      const startTime = Date.now();
      const response = await fetch(`${esNode}/_cluster/health`);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const health = await response.json();

      // 判断健康状态
      let status = HealthStatus.HEALTHY;
      let message = "Elasticsearch集群正常";

      if (health.status === "red") {
        status = HealthStatus.UNHEALTHY;
        message = "Elasticsearch集群状态异常";
      } else if (health.status === "yellow") {
        status = HealthStatus.DEGRADED;
        message = "Elasticsearch集群状态降级";
      }

      return {
        status,
        message,
        details: {
          responseTime: `${responseTime}ms`,
          clusterName: health.cluster_name,
          clusterStatus: health.status,
          numberOfNodes: health.number_of_nodes,
          numberOfDataNodes: health.number_of_data_nodes,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Elasticsearch连接失败: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 获取系统运行时间
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * 获取系统启动时间
   */
  getStartTime(): Date {
    return this.startTime;
  }
}
