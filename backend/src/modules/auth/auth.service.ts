import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * 认证服务
 * 负责JWT令牌的验证和刷新
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * 验证JWT令牌有效性
   * @param token JWT令牌
   * @returns 令牌载荷，如果无效返回null
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 刷新访问令牌
   * 使用刷新令牌生成新的访问令牌和刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的令牌对，如果无效返回null
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newToken = this.jwtService.sign(
        { userId: payload.userId, email: payload.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      const newRefreshToken = this.jwtService.sign(
        { userId: payload.userId, email: payload.email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return null;
    }
  }
}
