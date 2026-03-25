import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
  Optional,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UsersService } from "../users/users.service";
import Redis from "ioredis";

const CODE_EXPIRY_SECONDS = 600; // 10分钟
const MAX_ATTEMPTS = 5;

@ApiTags("auth")
@Controller("auth")
export class AuthPasswordController {
  private readonly logger = new Logger(AuthPasswordController.name);

  constructor(
    private readonly usersService: UsersService,
    @Optional() private readonly redis: Redis | null,
  ) {}

  @Post("forgot-password")
  @ApiOperation({ summary: "发送密码重置验证码" })
  async forgotPassword(@Body("email") email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("该邮箱未注册");
    }

    const code = this.generateVerificationCode();
    const key = `password_reset:${email}`;

    if (this.redis) {
      await this.redis.setex(
        key,
        CODE_EXPIRY_SECONDS,
        JSON.stringify({
          code,
          attempts: 0,
        }),
      );
    } else {
      this.logger.warn("Redis未配置，验证码将不会持久化存储");
    }

    this.logger.log(`密码重置验证码已生成: ${email}`);
    this.logger.debug(`验证码: ${code} (仅用于开发调试)`);

    return {
      message: "验证码已发送到您的邮箱",
      expiresIn: CODE_EXPIRY_SECONDS,
    };
  }

  @Post("verify-reset-code")
  @ApiOperation({ summary: "验证密码重置验证码" })
  async verifyResetCode(
    @Body("email") email: string,
    @Body("code") code: string,
  ) {
    const resetData = await this.getResetData(email);

    if (!resetData) {
      throw new BadRequestException("请先获取验证码");
    }

    if (resetData.attempts >= MAX_ATTEMPTS) {
      await this.deleteResetData(email);
      throw new BadRequestException("验证次数过多，请重新获取验证码");
    }

    if (resetData.code !== code) {
      resetData.attempts++;
      await this.saveResetData(email, resetData);
      throw new BadRequestException("验证码错误");
    }

    return {
      message: "验证码验证成功",
      verified: true,
    };
  }

  @Post("reset-password")
  @ApiOperation({ summary: "重置密码" })
  async resetPassword(
    @Body("email") email: string,
    @Body("code") code: string,
    @Body("newPassword") newPassword: string,
  ) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("用户不存在");
    }

    const resetData = await this.getResetData(email);

    if (!resetData) {
      throw new BadRequestException("请先获取验证码");
    }

    if (resetData.attempts >= MAX_ATTEMPTS) {
      await this.deleteResetData(email);
      throw new BadRequestException("验证次数过多，请重新获取验证码");
    }

    if (resetData.code !== code) {
      resetData.attempts++;
      await this.saveResetData(email, resetData);
      throw new BadRequestException("验证码错误");
    }

    await this.usersService.updatePassword(user.id, newPassword);

    await this.deleteResetData(email);

    this.logger.log(`密码重置成功: ${email}`);

    return {
      message: "密码重置成功",
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async getResetData(
    email: string,
  ): Promise<{ code: string; attempts: number } | null> {
    const key = `password_reset:${email}`;

    if (this.redis) {
      const data = await this.redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    }

    return null;
  }

  private async saveResetData(
    email: string,
    data: { code: string; attempts: number },
  ): Promise<void> {
    const key = `password_reset:${email}`;

    if (this.redis) {
      const ttl = await this.redis.ttl(key);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
      }
    }
  }

  private async deleteResetData(email: string): Promise<void> {
    const key = `password_reset:${email}`;

    if (this.redis) {
      await this.redis.del(key);
    }
  }
}
