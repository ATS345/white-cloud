import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MaxLength, IsUrl } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ description: "显示名称", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({ description: "头像URL", required: false })
  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  avatar?: string;

  @ApiProperty({ description: "个人简介", required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: "位置", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ description: "个人网站", required: false })
  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;
}
