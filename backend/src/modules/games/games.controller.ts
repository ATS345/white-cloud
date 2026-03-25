import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GamesService } from "./games.service";

@ApiTags("games")
@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: "获取游戏列表" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findAll(@Query() query: any) {
    return this.gamesService.findAll(query);
  }

  @Get("hot")
  @ApiOperation({ summary: "获取热门游戏" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findHot(@Query("limit") limit?: string) {
    return this.gamesService.findHot(limit ? parseInt(limit) : 10);
  }

  @Get("new")
  @ApiOperation({ summary: "获取新品游戏" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findNew(@Query("limit") limit?: string) {
    return this.gamesService.findNew(limit ? parseInt(limit) : 10);
  }

  @Get("genres")
  @ApiOperation({ summary: "获取游戏类型" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findGenres() {
    return this.gamesService.findGenres();
  }

  @Get("platforms")
  @ApiOperation({ summary: "获取游戏平台" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findPlatforms() {
    return this.gamesService.findPlatforms();
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "通过slug获取游戏详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findBySlug(@Param("slug") slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "获取游戏详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findOne(@Param("id") id: string) {
    return this.gamesService.findOne(parseInt(id));
  }
}
