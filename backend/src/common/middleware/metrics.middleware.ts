import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { MetricsService } from "../../modules/metrics/metrics.service";

/**
 * 监控指标收集中间件
 * 自动收集HTTP请求的性能指标
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;

    // 开始请求跟踪
    const endTracking = this.metricsService.startHttpRequest(
      method,
      originalUrl,
    );

    // 监听响应完成事件
    res.on("finish", () => {
      endTracking(res.statusCode);
    });

    next();
  }
}
