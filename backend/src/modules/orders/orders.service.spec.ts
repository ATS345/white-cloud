import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../../config/prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { OrderStatus } from "./dto";

describe("OrdersService", () => {
  let service: OrdersService;

  const mockPrismaService = {
    game: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCartService = {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockGame = {
    id: 1,
    title: "Test Game",
    slug: "test-game",
    price: 99.99,
    currency: "CNY",
    status: "published",
    coverImage: "https://example.com/cover.jpg",
    developer: "Test Developer",
    publisher: "Test Publisher",
  };

  const mockOrder = {
    id: 1,
    orderNumber: "ORD202401010001",
    userId: 1,
    totalAmount: 99.99,
    currency: "CNY",
    status: OrderStatus.PENDING,
    paymentMethod: null,
    createdAt: new Date(),
    completedAt: null,
    items: [
      {
        id: 1,
        gameId: 1,
        title: "Test Game",
        price: 99.99,
        quantity: 1,
        game: mockGame,
      },
    ],
    payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order successfully", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(1, { gameIds: [1] });

      expect(result).toHaveProperty("orderNumber");
      expect(result).toHaveProperty("totalAmount", 99.99);
    });

    it("should throw BadRequestException if game not found", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([]);

      await expect(service.createOrder(1, { gameIds: [999] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if game already purchased", async () => {
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.order.findMany.mockResolvedValue([
        { items: [{ gameId: 1 }] },
      ]);

      await expect(service.createOrder(1, { gameIds: [1] })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("createOrderFromCart", () => {
    it("should create order from cart successfully", async () => {
      mockCartService.getCart.mockResolvedValue({
        items: [{ gameId: 1, game: mockGame }],
      });
      mockPrismaService.game.findMany.mockResolvedValue([mockGame]);
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockCartService.clearCart.mockResolvedValue({});

      await service.createOrderFromCart(1);

      expect(mockCartService.clearCart).toHaveBeenCalled();
    });

    it("should throw BadRequestException if cart is empty", async () => {
      mockCartService.getCart.mockResolvedValue({ items: [] });

      await expect(service.createOrderFromCart(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.findAll(1, { page: 1, limit: 10 });

      expect(result).toHaveProperty("list");
      expect(result).toHaveProperty("pagination");
      expect(result.list).toHaveLength(1);
    });

    it("should filter orders by status", async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      await service.findAll(1, { status: OrderStatus.PENDING });

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: OrderStatus.PENDING }),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return order by id", async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne(1, 1);

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("orderNumber");
    });

    it("should throw NotFoundException if order not found", async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel pending order", async () => {
      mockPrismaService.order.findFirst
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce({ ...mockOrder, status: OrderStatus.CANCELLED });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.cancelOrder(1, 1);

      expect(mockPrismaService.order.update).toHaveBeenCalled();
    });

    it("should throw NotFoundException if order not found", async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.cancelOrder(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if order not pending", async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      });

      await expect(service.cancelOrder(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getMyGames", () => {
    it("should return purchased games", async () => {
      mockPrismaService.order.findMany.mockResolvedValue([
        {
          ...mockOrder,
          status: OrderStatus.PAID,
          completedAt: new Date(),
          items: [
            {
              id: 1,
              gameId: 1,
              title: "Test Game",
              price: 99.99,
              quantity: 1,
              game: {
                ...mockGame,
                genres: [],
                platforms: [],
              },
            },
          ],
        },
      ]);

      const result = await service.getMyGames(1);

      expect(result).toHaveProperty("games");
      expect(result).toHaveProperty("total");
    });
  });
});
