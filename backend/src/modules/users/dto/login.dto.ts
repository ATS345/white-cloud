import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ description: "邮箱" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "密码" })
  @IsString()
  @MinLength(6)
  password: string;
}
