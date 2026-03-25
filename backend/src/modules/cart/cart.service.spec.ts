import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { CartService } from "./cart.service";
import { PrismaService } from "../../config/prisma/prisma.service";

describe("CartService", () => {
  let service: CartService;

  const mockPrismaService = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    game: {
      findUnique: jest.fn(),
    },
  };

  const mockCart = {
    id: 1,
    userId: 1,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    releaseDate: new Date(),
    averageRating: 4.5,
    reviewCount: 100,
    genres: [],
    platforms: [],
  };

  const mockCartItem = {
    id: 1,
    cartId: 1,
    gameId: 1,
    quantity: 1,
    game: mockGame,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return existing cart", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      const result = await service.getCart(1);

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
    });

    it("should create new cart if not exists", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue(mockCart);

      const result = await service.getCart(1);

      expect(mockPrismaService.cart.create).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 1);
    });
  });

  describe("addToCart", () => {
    it("should add game to cart successfully", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(mockGame);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
      mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      await service.addToCart(1, { gameId: 1 });

      expect(mockPrismaService.cartItem.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException if game not found", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(null);

      await expect(service.addToCart(1, { gameId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException if game not published", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue({
        ...mockGame,
        status: "draft",
      });

      await expect(service.addToCart(1, { gameId: 1 })).rejects.toThrow(
        ConflictException,
      );
    });

    it("should update quantity if game already in cart", async () => {
      mockPrismaService.game.findUnique.mockResolvedValue(mockGame);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 2,
      });
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 2 }],
      });

      await service.addToCart(1, { gameId: 1 });

      expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
    });
  });

  describe("updateCartItem", () => {
    it("should update cart item quantity", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 2,
      });
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 2 }],
      });

      await service.updateCartItem(1, 1, { quantity: 2 });

      expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 2 },
        }),
      );
    });

    it("should throw NotFoundException if cart not found", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCartItem(1, 1, { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if cart item not found", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateCartItem(1, 999, { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      await service.removeFromCart(1, 1);

      expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException if cart not found", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      await expect(service.removeFromCart(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      await service.clearCart(1);

      expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 1 },
      });
    });

    it("should throw NotFoundException if cart not found", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      await expect(service.clearCart(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getCartItemCount", () => {
    it("should return item count", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem, { ...mockCartItem, id: 2 }],
      });

      const result = await service.getCartItemCount(1);

      expect(result).toEqual({ count: 2 });
    });

    it("should return 0 if cart not found", async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      const result = await service.getCartItemCount(1);

      expect(result).toEqual({ count: 0 });
    });
  });
});
