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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiQuery({ name: 'gameId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: CommentQueryDto) {
    return this.commentsService.findAll(query);
  }

  @Get('games/:gameId')
  @ApiOperation({ summary: '获取游戏评论' })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getGameComments(
    @Param('gameId') gameId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.getGameComments(parseInt(gameId), query);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: '获取用户评论' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserComments(
    @Param('userId') userId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.getUserComments(parseInt(userId), query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(parseInt(id));
  }

  @Put(':id')
  @ApiOperation({ summary: '更新评论' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(req.user.id, parseInt(id), updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评论' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Request() req, @Param('id') id: string) {
    return this.commentsService.remove(req.user.id, parseInt(id));
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞评论' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async like(@Request() req, @Param('id') id: string) {
    return this.commentsService.like(req.user.id, parseInt(id));
  }

  @Post(':id/dislike')
  @ApiOperation({ summary: '点踩评论' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async dislike(@Request() req, @Param('id') id: string) {
    return this.commentsService.dislike(req.user.id, parseInt(id));
  }
}