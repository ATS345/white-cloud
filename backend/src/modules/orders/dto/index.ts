import {
  IsArray,
  IsInt,
  IsPositive,
  IsOptional,
  IsEnum,
} from "class-validator";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export class CreateOrderDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  gameIds: number[];
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}
