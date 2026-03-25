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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { AdminUpdateUserDto, AdminUserQueryDto, AdminBanUserDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("管理后台")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("statistics")
  @ApiOperation({ summary: "获取统计数据" })
  async getStatistics() {
    return this.adminService.getPlatformStatistics();
  }

  @Get("orders")
  @ApiOperation({ summary: "获取订单列表" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getOrders(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.adminService.getOrders({ page, limit });
  }

  @Get("users")
  @ApiOperation({ summary: "获取用户列表" })
  async getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get("users/stats")
  @ApiOperation({ summary: "获取用户统计信息" })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get("users/:id")
  @ApiOperation({ summary: "获取用户详情" })
  async getUser(@Param("id") id: string) {
    return this.adminService.getUserById(parseInt(id));
  }

  @Put("users/:id")
  @ApiOperation({ summary: "更新用户信息" })
  async updateUser(
    @Param("id") id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(parseInt(id), adminUpdateUserDto);
  }

  @Post("users/:id/ban")
  @ApiOperation({ summary: "封禁用户" })
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param("id") id: string,
    @Body() adminBanUserDto: AdminBanUserDto,
  ) {
    return this.adminService.banUser(parseInt(id), adminBanUserDto);
  }

  @Post("users/:id/unban")
  @ApiOperation({ summary: "解封用户" })
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param("id") id: string) {
    return this.adminService.unbanUser(parseInt(id));
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "删除用户" })
  async deleteUser(@Param("id") id: string) {
    return this.adminService.deleteUser(parseInt(id));
  }
}
