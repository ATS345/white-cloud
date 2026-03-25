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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AdminGamesService } from "./admin-games.service";
import {
  AdminCreateGameDto,
  AdminUpdateGameDto,
  AdminGameQueryDto,
} from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("管理后台 - 游戏管理")
@Controller("admin/games")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminGamesController {
  constructor(private readonly adminGamesService: AdminGamesService) {}

  @Post()
  @ApiOperation({ summary: "创建游戏" })
  async create(@Body() adminCreateGameDto: AdminCreateGameDto) {
    return this.adminGamesService.create(adminCreateGameDto);
  }

  @Get()
  @ApiOperation({ summary: "获取游戏列表" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "genreId", required: false })
  @ApiQuery({ name: "platformId", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findAll(@Query() query: AdminGameQueryDto) {
    return this.adminGamesService.findAll(query);
  }

  @Get("stats")
  @ApiOperation({ summary: "获取游戏统计信息" })
  async getGameStats() {
    return this.adminGamesService.getGameStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "获取游戏详情" })
  async findOne(@Param("id") id: string) {
    return this.adminGamesService.findOne(parseInt(id));
  }

  @Put(":id")
  @ApiOperation({ summary: "更新游戏信息" })
  async update(
    @Param("id") id: string,
    @Body() adminUpdateGameDto: AdminUpdateGameDto,
  ) {
    return this.adminGamesService.update(parseInt(id), adminUpdateGameDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除游戏" })
  async delete(@Param("id") id: string) {
    return this.adminGamesService.delete(parseInt(id));
  }
}
