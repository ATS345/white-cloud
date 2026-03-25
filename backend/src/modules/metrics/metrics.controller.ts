import { Controller, Get, Header } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("监控指标")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Prometheus指标端点
   */
  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  @ApiOperation({ summary: "获取Prometheus格式指标" })
  @ApiResponse({ status: 200, description: "返回Prometheus格式指标数据" })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  /**
   * JSON格式指标端点（用于调试）
   */
  @Get("json")
  @ApiOperation({ summary: "获取JSON格式指标" })
  @ApiResponse({ status: 200, description: "返回JSON格式指标数据" })
  async getMetricsJson(): Promise<Record<string, any>> {
    return this.metricsService.getMetricsJson();
  }
}
