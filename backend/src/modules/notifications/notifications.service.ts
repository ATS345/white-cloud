import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number): Promise<NotificationResponse[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content,
      status: n.status,
      createdAt: n.createdAt,
    }));
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: "unread",
      },
    });
  }

  async markAsRead(userId: number, notificationId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: "read",
      },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        status: "unread",
      },
      data: {
        status: "read",
      },
    });
  }

  async create(
    userId: number,
    dto: CreateNotificationDto,
  ): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        status: "unread",
      },
    });

    this.logger.log(`创建通知: 用户${userId}, 类型: ${dto.type}`);

    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      createdAt: notification.createdAt,
    };
  }

  async createSystemNotification(
    userId: number,
    title: string,
    content: string,
  ): Promise<void> {
    await this.create(userId, {
      type: "system",
      title,
      content,
    });
  }

  async createOrderNotification(
    userId: number,
    orderNumber: string,
    status: string,
  ): Promise<void> {
    const title = "订单状态更新";
    const content = `您的订单 ${orderNumber} 状态已更新为: ${status}`;

    await this.create(userId, {
      type: "order",
      title,
      content,
    });
  }

  async createPaymentNotification(
    userId: number,
    orderNumber: string,
    success: boolean,
  ): Promise<void> {
    const title = success ? "支付成功" : "支付失败";
    const content = success
      ? `您的订单 ${orderNumber} 支付成功，感谢您的购买！`
      : `您的订单 ${orderNumber} 支付失败，请重试或联系客服。`;

    await this.create(userId, {
      type: "payment",
      title,
      content,
    });
  }

  async createDownloadNotification(
    userId: number,
    gameTitle: string,
    completed: boolean,
  ): Promise<void> {
    const title = completed ? "下载完成" : "下载失败";
    const content = completed
      ? `${gameTitle} 已下载完成，您可以在游戏库中找到它。`
      : `${gameTitle} 下载失败，请检查网络连接后重试。`;

    await this.create(userId, {
      type: "download",
      title,
      content,
    });
  }

  async delete(userId: number, notificationId: number): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async clearAll(userId: number): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    this.logger.log(`清除所有通知: 用户${userId}`);
  }
}
