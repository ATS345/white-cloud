import { Injectable, Inject, Optional, Logger } from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";

export interface SearchHit {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  coverImage: string;
  averageRating: number | null;
  type: string;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  query: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(
    query: string,
    options?: { page?: number; limit?: number; type?: string },
  ): Promise<SearchResult> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return {
        hits: [],
        total: 0,
        query: query || "",
      };
    }

    const searchTerm = query.trim().toLowerCase();

    const games = await this.prisma.game.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { developer: { contains: searchTerm } },
          { publisher: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        coverImage: true,
        averageRating: true,
        developer: true,
        publisher: true,
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.game.count({
      where: {
        status: "published",
        OR: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { developer: { contains: searchTerm } },
          { publisher: { contains: searchTerm } },
        ],
      },
    });

    const hits: SearchHit[] = games.map((game) => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.shortDescription || game.description.substring(0, 200),
      price: game.price,
      coverImage: game.coverImage,
      averageRating: game.averageRating,
      type: "game",
    }));

    this.logger.debug(`Search for "${query}" found ${total} results`);

    return {
      hits,
      total,
      query,
    };
  }

  async searchGames(
    query: string,
    options?: { page?: number; limit?: number },
  ) {
    const result = await this.search(query, { ...options, type: "game" });
    return result;
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();

    const games = await this.prisma.game.findMany({
      where: {
        status: "published",
        title: { contains: searchTerm },
      },
      select: {
        title: true,
      },
      take: limit,
    });

    return games.map((game) => game.title);
  }

  async getPopularSearches(limit: number = 10): Promise<string[]> {
    const games = await this.prisma.game.findMany({
      where: {
        status: "published",
      },
      orderBy: {
        reviewCount: "desc",
      },
      select: {
        title: true,
      },
      take: limit,
    });

    return games.map((game) => game.title);
  }

  async advancedSearch(options: {
    query?: string;
    genre?: string;
    platform?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: "price" | "rating" | "releaseDate" | "popularity";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: "published",
    };

    if (options.query) {
      const searchTerm = options.query.trim().toLowerCase();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { developer: { contains: searchTerm } },
      ];
    }

    if (options.genre) {
      where.genres = {
        some: {
          genre: {
            slug: options.genre,
          },
        },
      };
    }

    if (options.platform) {
      where.platforms = {
        some: {
          platform: {
            slug: options.platform,
          },
        },
      };
    }

    if (options.priceMin !== undefined || options.priceMax !== undefined) {
      where.price = {};
      if (options.priceMin !== undefined) {
        where.price.gte = options.priceMin;
      }
      if (options.priceMax !== undefined) {
        where.price.lte = options.priceMax;
      }
    }

    let orderBy: any = { createdAt: "desc" };
    switch (options.sortBy) {
      case "price":
        orderBy = { price: options.sortOrder || "asc" };
        break;
      case "rating":
        orderBy = { averageRating: options.sortOrder || "desc" };
        break;
      case "releaseDate":
        orderBy = { releaseDate: options.sortOrder || "desc" };
        break;
      case "popularity":
        orderBy = { reviewCount: options.sortOrder || "desc" };
        break;
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
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      hits: games.map((game) => ({
        id: game.id,
        title: game.title,
        slug: game.slug,
        description:
          game.shortDescription || game.description.substring(0, 200),
        price: game.price,
        coverImage: game.coverImage,
        averageRating: game.averageRating,
        genres: game.genres.map((g) => ({
          id: g.genre.id,
          name: g.genre.name,
        })),
        platforms: game.platforms.map((p) => ({
          id: p.platform.id,
          name: p.platform.name,
        })),
        type: "game",
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
