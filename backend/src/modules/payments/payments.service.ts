import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import { CreatePaymentDto, PaymentMethod, PaymentStatus } from "./dto";
import { OrdersService } from "../orders/orders.service";
import * as crypto from "crypto";

@Injectable()
export class PaymentsService {
  private readonly ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY;
  private readonly WECHAT_API_KEY = process.env.WECHAT_PAY_API_KEY;
  private readonly CALLBACK_SECRET = process.env.PAYMENT_CALLBACK_SECRET;

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {
    this.validateSecrets();
  }

  private validateSecrets() {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && !this.CALLBACK_SECRET) {
      throw new Error(
        "PAYMENT_CALLBACK_SECRET must be configured in production environment!",
      );
    }
  }

  async createPayment(
    userId: number,
    orderId: number,
    createPaymentDto: CreatePaymentDto,
  ) {
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
      throw new NotFoundException("订单不存在");
    }

    if (order.status !== "pending") {
      throw new BadRequestException("订单状态不允许支付");
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

    const paymentUrl = await this.getPaymentUrl(
      payment.id,
      createPaymentDto.returnUrl,
    );

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
      throw new NotFoundException("支付记录不存在");
    }

    switch (payment.paymentMethod) {
      case PaymentMethod.ALIPAY:
        return this.createAlipayPayment(payment, returnUrl);
      case PaymentMethod.WECHAT:
        return this.createWechatPayment(payment, returnUrl);
      case PaymentMethod.CREDIT_CARD:
        return this.createCreditCardPayment(payment, returnUrl);
      default:
        throw new BadRequestException("不支持的支付方式");
    }
  }

  async handleCallback(
    transactionId: string,
    callbackData: any,
    signature: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException("支付记录不存在");
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, message: "支付已处理" };
    }

    const isValid = await this.verifyCallback(
      payment.paymentMethod,
      callbackData,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException("支付验证失败");
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
          status: "paid",
          paymentMethod: payment.paymentMethod,
          completedAt: new Date(),
        },
      });
    });

    return { success: true, message: "支付成功" };
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
      throw new NotFoundException("支付记录不存在");
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
      throw new NotFoundException("支付记录不存在");
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException("只能退款已成功的支付");
    }

    if (payment.order.status === "completed") {
      throw new BadRequestException("已完成的订单无法退款");
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
          data: { status: "refunded" },
        });
      });
    }

    return refundResult;
  }

  private async createAlipayPayment(
    payment: any,
    returnUrl?: string,
  ): Promise<string> {
    const baseUrl =
      process.env.ALIPAY_GATEWAY_URL || "https://openapi.alipay.com/gateway.do";
    const appId = process.env.ALIPAY_APP_ID;
    const timestamp = new Date().toISOString();
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL;

    const params = {
      app_id: appId,
      method: "alipay.trade.page.pay",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp,
      version: "1.0",
      notify_url: notifyUrl,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/return`,
      biz_content: JSON.stringify({
        out_trade_no: `PAY${payment.id}`,
        total_amount: Number(payment.amount).toFixed(2),
        subject: `订单 ${payment.order.orderNumber}`,
        product_code: "FAST_INSTANT_TRADE_PAY",
      }),
    };

    const signature = this.generateAlipaySignature(params);
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    return `${baseUrl}?${queryString}&sign=${encodeURIComponent(signature)}`;
  }

  private async createWechatPayment(
    payment: any,
    _returnUrl?: string,
  ): Promise<string> {
    return `${process.env.FRONTEND_URL}/payment/wechat?paymentId=${payment.id}`;
  }

  private async createCreditCardPayment(
    payment: any,
    _returnUrl?: string,
  ): Promise<string> {
    return `${process.env.FRONTEND_URL}/payment/credit-card?paymentId=${payment.id}`;
  }

  private async verifyCallback(
    paymentMethod: string,
    callbackData: any,
    signature: string,
  ): Promise<boolean> {
    if (!signature) {
      return false;
    }

    switch (paymentMethod) {
      case PaymentMethod.ALIPAY:
        return this.verifyAlipayCallback(callbackData, signature);
      case PaymentMethod.WECHAT:
        return this.verifyWechatCallback(callbackData, signature);
      case PaymentMethod.CREDIT_CARD:
        return this.verifyCreditCardCallback(callbackData, signature);
      default:
        return false;
    }
  }

  private verifyAlipayCallback(callbackData: any, signature: string): boolean {
    try {
      if (!this.ALIPAY_PUBLIC_KEY) {
        console.error("ALIPAY_PUBLIC_KEY not configured");
        return false;
      }

      const verify = crypto.createVerify("RSA-SHA256");
      const signData = Object.keys(callbackData)
        .filter((key) => key !== "sign" && key !== "sign_type")
        .sort()
        .map((key) => `${key}=${callbackData[key]}`)
        .join("&");

      verify.update(signData);

      return verify.verify(this.ALIPAY_PUBLIC_KEY, signature, "base64");
    } catch (error) {
      console.error("Alipay callback verification failed:", error);
      return false;
    }
  }

  private verifyWechatCallback(callbackData: any, signature: string): boolean {
    try {
      if (!this.WECHAT_API_KEY) {
        console.error("WECHAT_PAY_API_KEY not configured");
        return false;
      }

      const {
        appid,
        mch_id,
        nonce_str,
        transaction_id,
        out_trade_no,
        total_fee,
        result_code,
      } = callbackData;

      if (result_code !== "SUCCESS") {
        return false;
      }

      const signData = `appid=${appid}&mch_id=${mch_id}&nonce_str=${nonce_str}&out_trade_no=${out_trade_no}&total_fee=${total_fee}&transaction_id=${transaction_id}&key=${this.WECHAT_API_KEY}`;

      const expectedSign = crypto
        .createHash("md5")
        .update(signData)
        .digest("hex")
        .toUpperCase();

      return signature === expectedSign;
    } catch (error) {
      console.error("Wechat callback verification failed:", error);
      return false;
    }
  }

  private verifyCreditCardCallback(
    callbackData: any,
    signature: string,
  ): boolean {
    try {
      if (!this.CALLBACK_SECRET) {
        console.error("PAYMENT_CALLBACK_SECRET not configured");
        return false;
      }
      const expectedSignature = crypto
        .createHmac("sha256", this.CALLBACK_SECRET)
        .update(JSON.stringify(callbackData))
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (error) {
      console.error("Credit card callback verification failed:", error);
      return false;
    }
  }

  private async processRefund(_payment: any): Promise<any> {
    return { success: true, message: "退款成功" };
  }

  private generateAlipaySignature(params: any): string {
    try {
      const privateKey = process.env.ALIPAY_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("ALIPAY_PRIVATE_KEY not configured");
      }

      const signData = Object.keys(params)
        .filter(
          (key) =>
            params[key] !== undefined && params[key] !== "" && key !== "sign",
        )
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

      const sign = crypto.createSign("RSA-SHA256");
      sign.update(signData);

      return sign.sign(privateKey, "base64");
    } catch (error) {
      console.error("Failed to generate Alipay signature:", error);
      throw new BadRequestException("支付签名生成失败");
    }
  }

  async simulatePaymentSuccess(
    userId: number,
    paymentId: number,
    adminKey: string,
  ) {
    const validAdminKey = process.env.ADMIN_SIMULATION_KEY;

    if (!validAdminKey) {
      throw new BadRequestException(
        "模拟支付功能未配置，请设置 ADMIN_SIMULATION_KEY 环境变量",
      );
    }

    if (adminKey !== validAdminKey) {
      throw new UnauthorizedException("无权执行此操作");
    }

    if (process.env.NODE_ENV === "production") {
      throw new BadRequestException("生产环境禁止模拟支付");
    }

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
      throw new NotFoundException("支付记录不存在");
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, message: "支付已完成" };
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
          status: "paid",
          paymentMethod: payment.paymentMethod,
          completedAt: new Date(),
        },
      });
    });

    return { success: true, message: "模拟支付成功" };
  }
}
