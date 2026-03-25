import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthPasswordController } from "./auth-password.controller";
import { UsersModule } from "../users/users.module";
import { RedisModule } from "../../config/redis/redis.module";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController, AuthPasswordController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
