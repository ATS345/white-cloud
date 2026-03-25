import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { AlertService, AlertRule, AlertSeverity } from "./alert.service";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("告警管理")
@Controller("alert")
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  /**
   * 获取所有告警规则
   */
  @Get("rules")
  @ApiOperation({ summary: "获取所有告警规则" })
  @ApiResponse({ status: 200, description: "返回告警规则列表" })
  async getAlertRules(): Promise<AlertRule[]> {
    return this.alertService.getAlertRules();
  }

  /**
   * 获取单个告警规则
   */
  @Get("rules/:id")
  @ApiOperation({ summary: "获取单个告警规则" })
  @ApiParam({ name: "id", description: "告警规则ID" })
  @ApiResponse({ status: 200, description: "返回告警规则详情" })
  async getAlertRule(@Param("id") id: string): Promise<AlertRule | null> {
    return this.alertService.getAlertRule(id);
  }

  /**
   * 创建告警规则
   */
  @Post("rules")
  @ApiOperation({ summary: "创建告警规则" })
  @ApiResponse({ status: 201, description: "告警规则创建成功" })
  async createAlertRule(@Body() rule: AlertRule): Promise<{ message: string }> {
    await this.alertService.createAlertRule(rule);
    return { message: "告警规则创建成功" };
  }

  /**
   * 更新告警规则
   */
  @Put("rules/:id")
  @ApiOperation({ summary: "更新告警规则" })
  @ApiParam({ name: "id", description: "告警规则ID" })
  @ApiResponse({ status: 200, description: "告警规则更新成功" })
  async updateAlertRule(
    @Param("id") id: string,
    @Body() updates: Partial<AlertRule>,
  ): Promise<{ message: string }> {
    await this.alertService.updateAlertRule(id, updates);
    return { message: "告警规则更新成功" };
  }

  /**
   * 删除告警规则
   */
  @Delete("rules/:id")
  @ApiOperation({ summary: "删除告警规则" })
  @ApiParam({ name: "id", description: "告警规则ID" })
  @ApiResponse({ status: 200, description: "告警规则删除成功" })
  async deleteAlertRule(@Param("id") id: string): Promise<{ message: string }> {
    await this.alertService.deleteAlertRule(id);
    return { message: "告警规则删除成功" };
  }

  /**
   * 获取活跃告警
   */
  @Get("active")
  @ApiOperation({ summary: "获取活跃告警" })
  @ApiResponse({ status: 200, description: "返回活跃告警列表" })
  async getActiveAlerts() {
    return this.alertService.getActiveAlerts();
  }

  /**
   * 获取告警历史
   */
  @Get("history")
  @ApiOperation({ summary: "获取告警历史" })
  @ApiResponse({ status: 200, description: "返回告警历史记录" })
  async getAlertHistory(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("limit") limit?: number,
  ) {
    return this.alertService.getAlertHistory(
      new Date(startDate),
      new Date(endDate),
      limit ? Number(limit) : 100,
    );
  }

  /**
   * 获取告警级别定义
   */
  @Get("severities")
  @ApiOperation({ summary: "获取告警级别定义" })
  @ApiResponse({ status: 200, description: "返回告警级别定义" })
  getSeverities() {
    return {
      severities: [
        {
          value: AlertSeverity.INFO,
          label: "信息",
          description: "一般性信息通知",
          color: "#1890ff",
        },
        {
          value: AlertSeverity.WARNING,
          label: "警告",
          description: "需要关注的警告",
          color: "#faad14",
        },
        {
          value: AlertSeverity.CRITICAL,
          label: "严重",
          description: "需要立即处理的严重问题",
          color: "#ff4d4f",
        },
        {
          value: AlertSeverity.EMERGENCY,
          label: "紧急",
          description: "影响业务运行的紧急问题",
          color: "#a8071a",
        },
      ],
    };
  }
}
