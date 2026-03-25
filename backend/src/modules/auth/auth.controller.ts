import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "../users/dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "用户注册" })
  @ApiResponse({ status: 201, description: "注册成功" })
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  @ApiResponse({ status: 200, description: "登录成功" })
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "刷新令牌" })
  @ApiResponse({ status: 200, description: "刷新成功" })
  @ApiResponse({ status: 401, description: "无效的刷新令牌" })
  async refresh(@Body("refreshToken") refreshToken: string) {
    const result = await this.authService.refreshTokens(refreshToken);
    if (!result) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return result;
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }
}
