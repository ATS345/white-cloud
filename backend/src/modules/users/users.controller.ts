import { Controller, Get, Post, Body, Put, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto, UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get('me')
  @UseGuards()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Put('me')
  @UseGuards()
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Put('me/password')
  @UseGuards()
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(@Request() req, @Body() changePasswordDto: any) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }
}
