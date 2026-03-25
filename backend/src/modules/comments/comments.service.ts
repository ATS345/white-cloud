import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentQueryDto,
  CommentSort,
} from "./dto";

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: createCommentDto.gameId },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        gameId: createCommentDto.gameId,
        content: createCommentDto.content,
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

    return {
      id: comment.id,
      gameId: comment.gameId,
      userId: comment.userId,
      content: comment.content,
      likes: comment.likes,
      dislikes: comment.dislikes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
    };
  }

  async findAll(query: CommentQueryDto) {
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

    let orderBy: any = { createdAt: "desc" };

    switch (query.sort) {
      case CommentSort.OLDEST:
        orderBy = { createdAt: "asc" };
        break;
      case CommentSort.MOST_LIKED:
        orderBy = { likes: "desc" };
        break;
      case CommentSort.LATEST:
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
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
      this.prisma.comment.count({ where }),
    ]);

    return {
      list: comments.map((comment) => ({
        id: comment.id,
        gameId: comment.gameId,
        userId: comment.userId,
        content: comment.content,
        likes: comment.likes,
        dislikes: comment.dislikes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user,
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
    const comment = await this.prisma.comment.findUnique({
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

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    return {
      id: comment.id,
      gameId: comment.gameId,
      userId: comment.userId,
      content: comment.content,
      likes: comment.likes,
      dislikes: comment.dislikes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
    };
  }

  async update(userId: number, id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException("无权修改此评论");
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
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

    return {
      id: updated.id,
      gameId: updated.gameId,
      userId: updated.userId,
      content: updated.content,
      likes: updated.likes,
      dislikes: updated.dislikes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      user: updated.user,
    };
  }

  async remove(userId: number, id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException("无权删除此评论");
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: "评论删除成功" };
  }

  async like(userId: number, id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return {
      id: updated.id,
      likes: updated.likes,
      dislikes: updated.dislikes,
    };
  }

  async dislike(userId: number, id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("评论不存在");
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { dislikes: { increment: 1 } },
    });

    return {
      id: updated.id,
      likes: updated.likes,
      dislikes: updated.dislikes,
    };
  }

  async getGameComments(gameId: number, query: CommentQueryDto) {
    return this.findAll({ ...query, gameId });
  }

  async getUserComments(userId: number, query: CommentQueryDto) {
    return this.findAll({ ...query, userId });
  }
}
