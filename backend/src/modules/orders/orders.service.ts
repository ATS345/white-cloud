import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import { CreateOrderDto, OrderStatus, OrderQueryDto } from "./dto";
import { CartService } from "../cart/cart.service";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    if (!createOrderDto.gameIds || createOrderDto.gameIds.length === 0) {
      throw new BadRequestException("游戏列表不能为空");
    }

    const games = await this.prisma.game.findMany({
      where: {
        id: { in: createOrderDto.gameIds },
        status: "published",
      },
    });

    if (games.length !== createOrderDto.gameIds.length) {
      throw new BadRequestException("部分游戏不存在或暂不可购买");
    }

    const existingOrders = await this.prisma.order.findMany({
      where: {
        userId,
        items: {
          some: {
            gameId: { in: createOrderDto.gameIds },
          },
        },
        status: {
          in: ["paid", "completed"],
        },
      },
      include: {
        items: true,
      },
    });

    const purchasedGameIds = existingOrders.flatMap((order) =>
      order.items.map((item) => item.gameId),
    );

    const duplicateGames = createOrderDto.gameIds.filter((id) =>
      purchasedGameIds.includes(id),
    );

    if (duplicateGames.length > 0) {
      throw new ConflictException("您已购买部分游戏，无需重复购买");
    }

    const totalAmount = games.reduce(
      (sum, game) => sum + Number(game.price),
      0,
    );

    const orderNumber = this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        currency: "CNY",
        status: OrderStatus.PENDING,
        items: {
          create: games.map((game) => ({
            gameId: game.id,
            title: game.title,
            price: game.price,
            quantity: 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            game: true,
          },
        },
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        gameId: item.gameId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        game: {
          id: item.game.id,
          title: item.game.title,
          slug: item.game.slug,
          coverImage: item.game.coverImage,
        },
      })),
      createdAt: order.createdAt,
    };
  }

  async createOrderFromCart(userId: number) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException("购物车为空");
    }

    const gameIds = cart.items.map((item) => item.gameId);

    const order = await this.createOrder(userId, { gameIds });

    await this.cartService.clearCart(userId);

    return order;
  }

  async findAll(userId: number, query: OrderQueryDto) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              game: true,
            },
          },
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        items: order.items.map((item) => ({
          id: item.id,
          gameId: item.gameId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          game: {
            id: item.game.id,
            title: item.game.title,
            slug: item.game.slug,
            coverImage: item.game.coverImage,
          },
        })),
        payments: order.payments.map((payment) => ({
          id: payment.id,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
        })),
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            game: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException("订单不存在");
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      items: order.items.map((item) => ({
        id: item.id,
        gameId: item.gameId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        game: {
          id: item.game.id,
          title: item.game.title,
          slug: item.game.slug,
          coverImage: item.game.coverImage,
          developer: item.game.developer,
          publisher: item.game.publisher,
        },
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
      })),
    };
  }

  async cancelOrder(userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("订单不存在");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("只能取消待支付订单");
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    return this.findOne(userId, id);
  }

  async getMyGames(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        status: {
          in: [OrderStatus.PAID, OrderStatus.COMPLETED],
        },
      },
      include: {
        items: {
          include: {
            game: {
              include: {
                genres: { include: { genre: true } },
                platforms: { include: { platform: true } },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const games = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: item.game.id,
        title: item.game.title,
        slug: item.game.slug,
        description: item.game.description,
        price: item.game.price,
        currency: item.game.currency,
        developer: item.game.developer,
        publisher: item.game.publisher,
        releaseDate: item.game.releaseDate,
        coverImage: item.game.coverImage,
        averageRating: item.game.averageRating,
        reviewCount: item.game.reviewCount,
        genres: item.game.genres.map((g) => ({
          id: g.genre.id,
          name: g.genre.name,
        })),
        platforms: item.game.platforms.map((p) => ({
          id: p.platform.id,
          name: p.platform.name,
        })),
        purchaseDate: order.completedAt,
      })),
    );

    return {
      total: games.length,
      games,
    };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `ORD${timestamp}${random}`;
  }
}
