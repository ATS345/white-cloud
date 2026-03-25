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
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { DownloadsService } from "./downloads.service";
import { CreateDownloadDto, UpdateDownloadDto, DownloadQueryDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("下载")
@Controller("downloads")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  @ApiOperation({ summary: "创建下载任务" })
  async create(@Request() req, @Body() createDownloadDto: CreateDownloadDto) {
    return this.downloadsService.create(req.user.id, createDownloadDto);
  }

  @Get()
  @ApiOperation({ summary: "获取下载列表" })
  @ApiQuery({ name: "gameId", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findAll(@Request() req, @Query() query: DownloadQueryDto) {
    return this.downloadsService.findAll(req.user.id, query);
  }

  @Get("url/:gameId")
  @ApiOperation({ summary: "获取游戏下载链接" })
  @ApiQuery({ name: "platform", required: false })
  async getDownloadUrl(
    @Request() req,
    @Param("gameId") gameId: string,
    @Query("platform") platform?: string,
  ) {
    return this.downloadsService.getDownloadUrl(
      req.user.id,
      parseInt(gameId),
      platform || "windows",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "获取下载详情" })
  async findOne(@Request() req, @Param("id") id: string) {
    return this.downloadsService.findOne(parseInt(id));
  }

  @Put(":id")
  @ApiOperation({ summary: "更新下载状态" })
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateDownloadDto: UpdateDownloadDto,
  ) {
    return this.downloadsService.update(
      req.user.id,
      parseInt(id),
      updateDownloadDto,
    );
  }

  @Post(":id/pause")
  @ApiOperation({ summary: "暂停下载" })
  @HttpCode(HttpStatus.OK)
  async pause(@Request() req, @Param("id") id: string) {
    return this.downloadsService.pause(req.user.id, parseInt(id));
  }

  @Post(":id/resume")
  @ApiOperation({ summary: "恢复下载" })
  @HttpCode(HttpStatus.OK)
  async resume(@Request() req, @Param("id") id: string) {
    return this.downloadsService.resume(req.user.id, parseInt(id));
  }

  @Delete(":id")
  @ApiOperation({ summary: "取消下载" })
  async cancel(@Request() req, @Param("id") id: string) {
    return this.downloadsService.cancel(req.user.id, parseInt(id));
  }
}
