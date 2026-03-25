import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

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
