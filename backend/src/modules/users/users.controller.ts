import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { RegisterDto, LoginDto, UpdateUserDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新当前用户信息" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Put("me/password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "修改密码" })
  @ApiResponse({ status: 200, description: "修改成功" })
  async changePassword(@Request() req, @Body() changePasswordDto: any) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Get("me/settings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取用户设置" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getSettings(@Request() req) {
    return this.usersService.getSettings(req.user.id);
  }

  @Put("me/settings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新用户设置" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateSettings(@Request() req, @Body() settingsDto: any) {
    return this.usersService.updateSettings(req.user.id, settingsDto);
  }

  @Post("me/avatar")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "上传头像" })
  @ApiResponse({ status: 200, description: "上传成功" })
  @UseInterceptors(
    FileInterceptor("avatar", {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException("只支持图片文件"), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("请选择要上传的图片");
    }
    return this.usersService.updateAvatar(req.user.id, file);
  }
}
