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
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("评价")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: "创建评价" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: "获取评价列表" })
  @ApiQuery({ name: "gameId", required: false })
  @ApiQuery({ name: "userId", required: false })
  @ApiQuery({ name: "sort", required: false })
  @ApiQuery({ name: "minRating", required: false })
  @ApiQuery({ name: "maxRating", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findAll(@Query() query: ReviewQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get("games/:gameId")
  @ApiOperation({ summary: "获取游戏评价" })
  @ApiQuery({ name: "sort", required: false })
  @ApiQuery({ name: "minRating", required: false })
  @ApiQuery({ name: "maxRating", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getGameReviews(
    @Param("gameId") gameId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.getGameReviews(parseInt(gameId), query);
  }

  @Get("games/:gameId/rating")
  @ApiOperation({ summary: "获取游戏评分统计" })
  async getGameRating(@Param("gameId") gameId: string) {
    return this.reviewsService.getGameRating(parseInt(gameId));
  }

  @Get("users/:userId")
  @ApiOperation({ summary: "获取用户评价" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getUserReviews(
    @Param("userId") userId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.getUserReviews(parseInt(userId), query);
  }

  @Get(":id")
  @ApiOperation({ summary: "获取评价详情" })
  async findOne(@Param("id") id: string) {
    return this.reviewsService.findOne(parseInt(id));
  }

  @Put(":id")
  @ApiOperation({ summary: "更新评价" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      req.user.id,
      parseInt(id),
      updateReviewDto,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除评价" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Request() req, @Param("id") id: string) {
    return this.reviewsService.remove(req.user.id, parseInt(id));
  }

  @Post(":id/like")
  @ApiOperation({ summary: "点赞评价" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async like(@Request() req, @Param("id") id: string) {
    return this.reviewsService.like(req.user.id, parseInt(id));
  }

  @Post(":id/dislike")
  @ApiOperation({ summary: "点踩评价" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async dislike(@Request() req, @Param("id") id: string) {
    return this.reviewsService.dislike(req.user.id, parseInt(id));
  }
}
