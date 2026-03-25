import { IsEnum, IsString, IsOptional, IsNumber } from "class-validator";

export enum PaymentMethod {
  ALIPAY = "alipay",
  WECHAT = "wechat",
  CREDIT_CARD = "credit_card",
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  notifyUrl?: string;
}

export class PaymentCallbackDto {
  @IsString()
  transactionId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  signature?: string;
}
