import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreatePaymentDto, PaymentMethod, PaymentStatus } from './dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async createPayment(userId: number, orderId: number, createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许支付');
    }

    const existingPayment = order.payments.find(
      (p) => p.status === PaymentStatus.PENDING,
    );

    if (existingPayment) {
      return this.getPaymentUrl(existingPayment.id, createPaymentDto.returnUrl);
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        paymentMethod: createPaymentDto.paymentMethod,
        amount: order.totalAmount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      },
    });

    const paymentUrl = await this.getPaymentUrl(payment.id, createPaymentDto.returnUrl);

    return {
      paymentId: payment.id,
      paymentUrl,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      currency: payment.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async getPaymentUrl(paymentId: number, returnUrl?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    switch (payment.paymentMethod) {
      case PaymentMethod.ALIPAY:
        return this.createAlipayPayment(payment, returnUrl);
      case PaymentMethod.WECHAT:
        return this.createWechatPayment(payment, returnUrl);
      case PaymentMethod.CREDIT_CARD:
        return this.createCreditCardPayment(payment, returnUrl);
      default:
        throw new BadRequestException('不支持的支付方式');
    }
  }

  async handleCallback(transactionId: string, callbackData: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, message: '支付已处理' };
    }

    const isValid = await this.verifyCallback(payment.paymentMethod, callbackData);

    if (!isValid) {
      throw new BadRequestException('支付验证失败');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          completedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'paid',
          paymentMethod: payment.paymentMethod,
          completedAt: new Date(),
        },
      });
    });

    return { success: true, message: '支付成功' };
  }

  async queryPayment(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return {
      id: payment.id,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      order: {
        id: payment.order.id,
        orderNumber: payment.order.orderNumber,
        totalAmount: payment.order.totalAmount,
        status: payment.order.status,
      },
    };
  }

  async refundPayment(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('只能退款已成功的支付');
    }

    if (payment.order.status === 'completed') {
      throw new BadRequestException('已完成的订单无法退款');
    }

    const refundResult = await this.processRefund(payment);

    if (refundResult.success) {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'refunded' },
        });
      });
    }

    return refundResult;
  }

  private async createAlipayPayment(payment: any, returnUrl?: string): Promise<string> {
    const baseUrl = process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do';
    const appId = process.env.ALIPAY_APP_ID;
    const timestamp = new Date().toISOString();
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL;

    const params = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp,
      version: '1.0',
      notify_url: notifyUrl,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/return`,
      biz_content: JSON.stringify({
        out_trade_no: `PAY${payment.id}`,
        total_amount: Number(payment.amount).toFixed(2),
        subject: `订单 ${payment.order.orderNumber}`,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      }),
    };

    const signature = this.generateAlipaySignature(params);
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${baseUrl}?${queryString}&sign=${signature}`;
  }

  private async createWechatPayment(payment: any, returnUrl?: string): Promise<string> {
    return `${process.env.FRONTEND_URL}/payment/wechat?paymentId=${payment.id}`;
  }

  private async createCreditCardPayment(payment: any, returnUrl?: string): Promise<string> {
    return `${process.env.FRONTEND_URL}/payment/credit-card?paymentId=${payment.id}`;
  }

  private async verifyCallback(paymentMethod: string, callbackData: any): Promise<boolean> {
    switch (paymentMethod) {
      case PaymentMethod.ALIPAY:
        return this.verifyAlipayCallback(callbackData);
      case PaymentMethod.WECHAT:
        return this.verifyWechatCallback(callbackData);
      case PaymentMethod.CREDIT_CARD:
        return this.verifyCreditCardCallback(callbackData);
      default:
        return false;
    }
  }

  private verifyAlipayCallback(callbackData: any): boolean {
    return true;
  }

  private verifyWechatCallback(callbackData: any): boolean {
    return true;
  }

  private verifyCreditCardCallback(callbackData: any): boolean {
    return true;
  }

  private async processRefund(payment: any): Promise<any> {
    return { success: true, message: '退款成功' };
  }

  private generateAlipaySignature(params: any): string {
    return 'mock_signature';
  }

  async simulatePaymentSuccess(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, message: '支付已完成' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          completedAt: new Date(),
          transactionId: `SIM${Date.now()}`,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'paid',
          paymentMethod: payment.paymentMethod,
          completedAt: new Date(),
        },
      });
    });

    return { success: true, message: '模拟支付成功' };
  }
}