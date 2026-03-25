import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("健康检查")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 简单健康检查（用于负载均衡器）
   */
  @Get()
  @ApiOperation({ summary: "简单健康检查" })
  @ApiResponse({ status: 200, description: "服务健康" })
  @ApiResponse({ status: 503, description: "服务不健康" })
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    return {
      status: "ok",
      timestamp: new Date(),
    };
  }

  /**
   * 详细健康检查
   */
  @Get("detailed")
  @ApiOperation({ summary: "详细健康检查" })
  @ApiResponse({ status: 200, description: "返回详细健康报告" })
  async detailedHealthCheck() {
    return this.healthService.getDetailedHealth();
  }

  /**
   * 数据库健康检查
   */
  @Get("database")
  @ApiOperation({ summary: "数据库健康检查" })
  @ApiResponse({ status: 200, description: "返回数据库健康状态" })
  async databaseHealth() {
    return this.healthService.checkDatabase();
  }

  /**
   * Redis健康检查
   */
  @Get("redis")
  @ApiOperation({ summary: "Redis健康检查" })
  @ApiResponse({ status: 200, description: "返回Redis健康状态" })
  async redisHealth() {
    return this.healthService.checkRedis();
  }

  /**
   * Elasticsearch健康检查
   */
  @Get("elasticsearch")
  @ApiOperation({ summary: "Elasticsearch健康检查" })
  @ApiResponse({ status: 200, description: "返回Elasticsearch健康状态" })
  async elasticsearchHealth() {
    return this.healthService.checkElasticsearch();
  }

  /**
   * 系统信息
   */
  @Get("info")
  @ApiOperation({ summary: "获取系统信息" })
  @ApiResponse({ status: 200, description: "返回系统信息" })
  async systemInfo() {
    return {
      name: "云幕游戏商店平台",
      version: process.env.npm_package_version || "1.0.0",
      nodeVersion: process.version,
      platform: process.platform,
      uptime: this.healthService.getUptime(),
      startTime: this.healthService.getStartTime(),
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date(),
    };
  }
}
