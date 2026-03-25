import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto, ReviewSort } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: createReviewDto.gameId },
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        gameId_userId: {
          gameId: createReviewDto.gameId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new ForbiddenException('您已经评价过此游戏');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        gameId: createReviewDto.gameId,
        rating: createReviewDto.rating,
        content: createReviewDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    await this.updateGameRating(createReviewDto.gameId);

    return {
      id: review.id,
      gameId: review.gameId,
      userId: review.userId,
      rating: review.rating,
      content: review.content,
      likes: review.likes,
      dislikes: review.dislikes,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user,
    };
  }

  async findAll(query: ReviewQueryDto) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.gameId) {
      where.gameId = query.gameId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.minRating !== undefined) {
      where.rating = { ...where.rating, gte: query.minRating };
    }

    if (query.maxRating !== undefined) {
      where.rating = { ...where.rating, lte: query.maxRating };
    }

    let orderBy: any = { createdAt: 'desc' };

    switch (query.sort) {
      case ReviewSort.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case ReviewSort.HIGHEST_RATING:
        orderBy = { rating: 'desc' };
        break;
      case ReviewSort.LOWEST_RATING:
        orderBy = { rating: 'asc' };
        break;
      case ReviewSort.MOST_LIKED:
        orderBy = { likes: 'desc' };
        break;
      case ReviewSort.LATEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      list: reviews.map((review) => ({
        id: review.id,
        gameId: review.gameId,
        userId: review.userId,
        rating: review.rating,
        content: review.content,
        likes: review.likes,
        dislikes: review.dislikes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    return {
      id: review.id,
      gameId: review.gameId,
      userId: review.userId,
      rating: review.rating,
      content: review.content,
      likes: review.likes,
      dislikes: review.dislikes,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user,
    };
  }

  async update(userId: number, id: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('无权修改此评价');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        rating: updateReviewDto.rating,
        content: updateReviewDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    await this.updateGameRating(updated.gameId);

    return {
      id: updated.id,
      gameId: updated.gameId,
      userId: updated.userId,
      rating: updated.rating,
      content: updated.content,
      likes: updated.likes,
      dislikes: updated.dislikes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      user: updated.user,
    };
  }

  async remove(userId: number, id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('无权删除此评价');
    }

    const gameId = review.gameId;

    await this.prisma.review.delete({
      where: { id },
    });

    await this.updateGameRating(gameId);

    return { message: '评价删除成功' };
  }

  async like(userId: number, id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return {
      id: updated.id,
      rating: updated.rating,
      likes: updated.likes,
      dislikes: updated.dislikes,
    };
  }

  async dislike(userId: number, id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { dislikes: { increment: 1 } },
    });

    return {
      id: updated.id,
      rating: updated.rating,
      likes: updated.likes,
      dislikes: updated.dislikes,
    };
  }

  async getGameReviews(gameId: number, query: ReviewQueryDto) {
    return this.findAll({ ...query, gameId });
  }

  async getUserReviews(userId: number, query: ReviewQueryDto) {
    return this.findAll({ ...query, userId });
  }

  async getGameRating(gameId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { gameId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        gameId,
        averageRating: 0,
        reviewCount: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      ratingDistribution[review.rating - 1]++;
    });

    return {
      gameId,
      averageRating: Math.round(averageRating * 100) / 100,
      reviewCount: reviews.length,
      ratingDistribution,
    };
  }

  private async updateGameRating(gameId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { gameId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          averageRating: null,
          reviewCount: 0,
        },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100,
        reviewCount: reviews.length,
      },
    });
  }
}