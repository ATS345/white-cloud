import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import {
  AdminCreateGameDto,
  AdminUpdateGameDto,
  AdminGameQueryDto,
  GameStatus,
} from "./dto";

@Injectable()
export class AdminGamesService {
  constructor(private prisma: PrismaService) {}

  async create(adminCreateGameDto: AdminCreateGameDto) {
    const existingGame = await this.prisma.game.findUnique({
      where: { slug: adminCreateGameDto.slug },
    });

    if (existingGame) {
      throw new BadRequestException("游戏slug已存在");
    }

    const game = await this.prisma.game.create({
      data: {
        title: adminCreateGameDto.title,
        slug: adminCreateGameDto.slug,
        description: adminCreateGameDto.description,
        shortDescription: adminCreateGameDto.shortDescription,
        price: adminCreateGameDto.price,
        currency: adminCreateGameDto.currency || "CNY",
        developer: adminCreateGameDto.developer,
        publisher: adminCreateGameDto.publisher,
        releaseDate: new Date(adminCreateGameDto.releaseDate),
        coverImage: adminCreateGameDto.coverImage,
        headerImage: adminCreateGameDto.headerImage,
        status: adminCreateGameDto.status || GameStatus.DRAFT,
        genres: adminCreateGameDto.genreIds
          ? {
              create: adminCreateGameDto.genreIds.map((genreId) => ({
                genreId,
              })),
            }
          : undefined,
        platforms: adminCreateGameDto.platformIds
          ? {
              create: adminCreateGameDto.platformIds.map((platformId) => ({
                platformId,
              })),
            }
          : undefined,
        tags: adminCreateGameDto.tagIds
          ? {
              create: adminCreateGameDto.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        tags: { include: { tag: true } },
      },
    });

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      shortDescription: game.shortDescription,
      price: game.price,
      currency: game.currency,
      developer: game.developer,
      publisher: game.publisher,
      releaseDate: game.releaseDate,
      coverImage: game.coverImage,
      headerImage: game.headerImage,
      status: game.status,
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      genres: game.genres.map((g) => ({ id: g.genre.id, name: g.genre.name })),
      platforms: game.platforms.map((p) => ({
        id: p.platform.id,
        name: p.platform.name,
      })),
      tags: game.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }

  async findAll(query: AdminGameQueryDto) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { developer: { contains: query.search, mode: "insensitive" } },
        { publisher: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.genreId) {
      where.genres = { some: { genreId: query.genreId } };
    }

    if (query.platformId) {
      where.platforms = { some: { platformId: query.platformId } };
    }

    let orderBy: any = { createdAt: "desc" };

    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || "desc" };
    }

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
          tags: { include: { tag: true } },
          _count: {
            select: {
              orderItems: true,
              reviews: true,
              comments: true,
              downloads: true,
            },
          },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      list: games.map((game) => ({
        id: game.id,
        title: game.title,
        slug: game.slug,
        description: game.description,
        shortDescription: game.shortDescription,
        price: game.price,
        currency: game.currency,
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: game.releaseDate,
        coverImage: game.coverImage,
        headerImage: game.headerImage,
        status: game.status,
        averageRating: game.averageRating,
        reviewCount: game.reviewCount,
        genres: game.genres.map((g) => ({
          id: g.genre.id,
          name: g.genre.name,
        })),
        platforms: game.platforms.map((p) => ({
          id: p.platform.id,
          name: p.platform.name,
        })),
        tags: game.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        stats: {
          salesCount: game._count.orderItems,
          reviewsCount: game._count.reviews,
          commentsCount: game._count.comments,
          downloadsCount: game._count.downloads,
        },
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
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        tags: { include: { tag: true } },
        screenshots: true,
        videos: true,
        features: true,
        languages: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
            comments: true,
            downloads: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      shortDescription: game.shortDescription,
      price: game.price,
      currency: game.currency,
      developer: game.developer,
      publisher: game.publisher,
      releaseDate: game.releaseDate,
      coverImage: game.coverImage,
      headerImage: game.headerImage,
      status: game.status,
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      genres: game.genres.map((g) => ({ id: g.genre.id, name: g.genre.name })),
      platforms: game.platforms.map((p) => ({
        id: p.platform.id,
        name: p.platform.name,
      })),
      tags: game.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
      screenshots: game.screenshots,
      videos: game.videos,
      features: game.features,
      languages: game.languages,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      stats: {
        salesCount: game._count.orderItems,
        reviewsCount: game._count.reviews,
        commentsCount: game._count.comments,
        downloadsCount: game._count.downloads,
      },
    };
  }

  async update(id: number, adminUpdateGameDto: AdminUpdateGameDto) {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    if (adminUpdateGameDto.slug && adminUpdateGameDto.slug !== game.slug) {
      const existingGame = await this.prisma.game.findUnique({
        where: { slug: adminUpdateGameDto.slug },
      });

      if (existingGame) {
        throw new BadRequestException("游戏slug已存在");
      }
    }

    const updateData: any = {
      title: adminUpdateGameDto.title,
      slug: adminUpdateGameDto.slug,
      description: adminUpdateGameDto.description,
      shortDescription: adminUpdateGameDto.shortDescription,
      price: adminUpdateGameDto.price,
      currency: adminUpdateGameDto.currency,
      developer: adminUpdateGameDto.developer,
      publisher: adminUpdateGameDto.publisher,
      releaseDate: adminUpdateGameDto.releaseDate
        ? new Date(adminUpdateGameDto.releaseDate)
        : undefined,
      coverImage: adminUpdateGameDto.coverImage,
      headerImage: adminUpdateGameDto.headerImage,
      status: adminUpdateGameDto.status,
    };

    if (adminUpdateGameDto.genreIds) {
      await this.prisma.gameGenre.deleteMany({
        where: { gameId: id },
      });
      updateData.genres = {
        create: adminUpdateGameDto.genreIds.map((genreId) => ({
          genreId,
        })),
      };
    }

    if (adminUpdateGameDto.platformIds) {
      await this.prisma.gamePlatform.deleteMany({
        where: { gameId: id },
      });
      updateData.platforms = {
        create: adminUpdateGameDto.platformIds.map((platformId) => ({
          platformId,
        })),
      };
    }

    if (adminUpdateGameDto.tagIds) {
      await this.prisma.gameTag.deleteMany({
        where: { gameId: id },
      });
      updateData.tags = {
        create: adminUpdateGameDto.tagIds.map((tagId) => ({
          tagId,
        })),
      };
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: updateData,
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        tags: { include: { tag: true } },
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      description: updated.description,
      shortDescription: updated.shortDescription,
      price: updated.price,
      currency: updated.currency,
      developer: updated.developer,
      publisher: updated.publisher,
      releaseDate: updated.releaseDate,
      coverImage: updated.coverImage,
      headerImage: updated.headerImage,
      status: updated.status,
      averageRating: updated.averageRating,
      reviewCount: updated.reviewCount,
      genres: updated.genres.map((g) => ({
        id: g.genre.id,
        name: g.genre.name,
      })),
      platforms: updated.platforms.map((p) => ({
        id: p.platform.id,
        name: p.platform.name,
      })),
      tags: updated.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    await this.prisma.game.delete({
      where: { id },
    });

    return { message: "游戏已删除" };
  }

  async getGameStats() {
    const [
      totalGames,
      publishedGames,
      draftGames,
      archivedGames,
      gamesByGenre,
      topSellingGames,
      topRatedGames,
    ] = await Promise.all([
      this.prisma.game.count(),
      this.prisma.game.count({ where: { status: GameStatus.PUBLISHED } }),
      this.prisma.game.count({ where: { status: GameStatus.DRAFT } }),
      this.prisma.game.count({ where: { status: GameStatus.ARCHIVED } }),
      this.prisma.gameGenre.groupBy({
        by: ["genreId"],
        _count: true,
      }),
      this.prisma.orderItem.groupBy({
        by: ["gameId"],
        _count: true,
        orderBy: { _count: { gameId: "desc" } },
        take: 10,
      }),
      this.prisma.game.findMany({
        where: { status: GameStatus.PUBLISHED },
        orderBy: { averageRating: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          averageRating: true,
          reviewCount: true,
        },
      }),
    ]);

    const genreIds = gamesByGenre.map((g) => g.genreId);
    const genres = await this.prisma.genre.findMany({
      where: { id: { in: genreIds } },
    });

    const gamesByGenreMap = gamesByGenre.reduce(
      (acc, item) => {
        const genre = genres.find((g) => g.id === item.genreId);
        if (genre) {
          acc[genre.name] = item._count;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const topSellingGameIds = topSellingGames.map((g) => g.gameId);
    const topSellingGamesData = await this.prisma.game.findMany({
      where: { id: { in: topSellingGameIds } },
    });

    const topSellingGamesMap = topSellingGames.map((item) => {
      const game = topSellingGamesData.find((g) => g.id === item.gameId);
      return {
        id: game?.id,
        title: game?.title,
        salesCount: item._count,
      };
    });

    return {
      totalGames,
      publishedGames,
      draftGames,
      archivedGames,
      gamesByGenre: gamesByGenreMap,
      topSellingGames: topSellingGamesMap,
      topRatedGames,
    };
  }
}
