import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUpdateUserDto, AdminUserQueryDto, AdminBanUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('管理后台')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取平台统计数据' })
  async getStatistics() {
    return this.adminService.getPlatformStatistics();
  }

  @Get('orders')
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getOrders(@Query() query: any) {
    return this.adminService.getOrders(query);
  }

  @Get('users')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'emailVerified', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/stats')
  @ApiOperation({ summary: '获取用户统计信息' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('users/:id')
  @ApiOperation({ summary: '获取用户详情' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(parseInt(id));
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUser(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(parseInt(id), adminUpdateUserDto);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: '封禁用户' })
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') id: string,
    @Body() adminBanUserDto: AdminBanUserDto,
  ) {
    return this.adminService.banUser(parseInt(id), adminBanUserDto);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: '解封用户' })
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(parseInt(id));
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(parseInt(id));
  }
}
