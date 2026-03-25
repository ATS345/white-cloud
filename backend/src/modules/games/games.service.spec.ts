import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { GamesService } from "./games.service";
import { PrismaService } from "../../config/prisma/prisma.service";

describe("GamesService", () => {
  let service: GamesService;

  const mockPrismaService = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    genre: {
      findMany: jest.fn(),
    },
    platform: {
      findMany: jest.fn(),
    },
  };

  const mockGame = {
    id: 1,
    title: "Test Game",
    slug: "test-game",
    description: "A test game",
    shortDescription: "Test",
    price: 99.99,
    currency: "CNY",
    developer: "Test Developer",
    publisher: "Test Publisher",
    releaseDate: new Date("2024-01-01"),
    status: "published",
    coverImage: "https://example.com/cover.jpg",
    headerImage: "https://example.com/header.jpg",
    averageRating: 4.5,
    reviewCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    genres: [{ genre: { id: 1, name: "Action" } }],
    platforms: [{ platform: { id: 1, name: "Windows" } }],
    tags: [{ tag: { id: 1, name: "Indie" } }],
    screenshots: [],
    videos: [],
    features: [],
    languages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated games list", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.game.count.mockResolvedValue(1);

      const result = await service.findAll({ page: "1", limit: "10" });

      expect(result).toHaveProperty("list");
      expect(result).toHaveProperty("pagination");
      expect(result.list).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should filter games by genre", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.game.count.mockResolvedValue(1);

      await service.findAll({ genre: "1" });

      expect(mockPrismaService.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            genres: { some: { genreId: 1 } },
          }),
        }),
      );
    });

    it("should filter games by price range", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.game.count.mockResolvedValue(1);

      await service.findAll({ price_min: "50", price_max: "100" });

      expect(mockPrismaService.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50, lte: 100 },
          }),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return game by id", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(mockGame);

      const result = await service.findOne(1);

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("title", "Test Game");
    });

    it("should throw NotFoundException if game not found", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findBySlug", () => {
    it("should return game by slug", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(mockGame);

      const result = await service.findBySlug("test-game");

      expect(result).toHaveProperty("slug", "test-game");
    });

    it("should throw NotFoundException if game not found", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findHot", () => {
    it("should return hot games", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);

      await service.findHot(10);

      expect(mockPrismaService.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { reviewCount: "desc" },
        }),
      );
    });
  });

  describe("findNew", () => {
    it("should return new games", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);

      await service.findNew(10);

      expect(mockPrismaService.game.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("findGenres", () => {
    it("should return all genres", async () => {
      mockPrismaService.genre.findMany.mockResolvedValue([
        { id: 1, name: "Action", slug: "action" },
      ]);

      const result = await service.findGenres();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("name", "Action");
    });
  });

  describe("findPlatforms", () => {
    it("should return all platforms", async () => {
      mockPrismaService.platform.findMany.mockResolvedValue([
        { id: 1, name: "Windows", slug: "windows" },
      ]);

      const result = await service.findPlatforms();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("name", "Windows");
    });
  });
});
