import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.genre) {
      where.genres = { some: { genreId: parseInt(query.genre) } };
    }
    if (query.platform) {
      where.platforms = { some: { platformId: parseInt(query.platform) } };
    }
    if (query.tag) {
      where.tags = { some: { tagId: parseInt(query.tag) } };
    }
    if (query.price_min || query.price_max) {
      where.price = {};
      if (query.price_min) {
        where.price.gte = parseFloat(query.price_min);
      }
      if (query.price_max) {
        where.price.lte = parseFloat(query.price_max);
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: query.sort ? { [query.sort]: query.order || 'desc' } : { createdAt: 'desc' },
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      list: list.map(game => ({
        id: game.id,
        title: game.title,
        slug: game.slug,
        description: game.description,
        price: game.price,
        currency: game.currency,
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: game.releaseDate,
        coverImage: game.coverImage,
        averageRating: game.averageRating,
        reviewCount: game.reviewCount,
        genres: game.genres.map(g => ({ id: g.genre.id, name: g.genre.name })),
        platforms: game.platforms.map(p => ({ id: p.platform.id, name: p.platform.name })),
        tags: game.tags.map(t => ({ id: t.tag.id, name: t.tag.name })),
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
      },
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
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
      status: game.status,
      coverImage: game.coverImage,
      headerImage: game.headerImage,
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      genres: game.genres.map(g => ({ id: g.genre.id, name: g.genre.name })),
      platforms: game.platforms.map(p => ({ id: p.platform.id, name: p.platform.name })),
      tags: game.tags.map(t => ({ id: t.tag.id, name: t.tag.name })),
      screenshots: game.screenshots,
      videos: game.videos,
      features: game.features,
      languages: game.languages,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }

  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        tags: { include: { tag: true } },
        screenshots: true,
        videos: true,
        features: true,
        languages: true,
      },
    });

    if (!game) {
      throw new NotFoundException('游戏不存在');
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
      status: game.status,
      coverImage: game.coverImage,
      headerImage: game.headerImage,
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      genres: game.genres.map(g => ({ id: g.genre.id, name: g.genre.name })),
      platforms: game.platforms.map(p => ({ id: p.platform.id, name: p.platform.name })),
      tags: game.tags.map(t => ({ id: t.tag.id, name: t.tag.name })),
      screenshots: game.screenshots,
      videos: game.videos,
      features: game.features,
      languages: game.languages,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }

  async findHot(limit: number) {
    const games = await this.prisma.game.findMany({
      take: limit,
      orderBy: { reviewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        price: true,
        averageRating: true,
      },
    });

    return games;
  }

  async findNew(limit: number) {
    const games = await this.prisma.game.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        price: true,
        releaseDate: true,
      },
    });

    return games;
  }

  async findGenres() {
    const genres = await this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    return genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    }));
  }

  async findPlatforms() {
    const platforms = await this.prisma.platform.findMany({
      orderBy: { name: 'asc' },
    });

    return platforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
    }));
  }
}
