import { IsString, IsNotEmpty, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({ description: "通知类型", example: "system" })
  @IsString()
  @IsNotEmpty()
  @IsIn(["system", "order", "payment", "download", "promotion"])
  type: string;

  @ApiProperty({ description: "通知标题", example: "系统通知" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "通知内容", example: "这是一条系统通知" })
  @IsString()
  @IsNotEmpty()
  content: string;
}
