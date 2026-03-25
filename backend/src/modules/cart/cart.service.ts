import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
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
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
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
      });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.game.price) * item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        gameId: item.gameId,
        quantity: item.quantity,
        game: {
          id: item.game.id,
          title: item.game.title,
          slug: item.game.slug,
          price: item.game.price,
          currency: item.game.currency,
          coverImage: item.game.coverImage,
          developer: item.game.developer,
          publisher: item.game.publisher,
          releaseDate: item.game.releaseDate,
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
        },
      })),
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: addToCartDto.gameId },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    if (game.status !== "published") {
      throw new ConflictException("该游戏暂不可购买");
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_gameId: {
          cartId: cart.id,
          gameId: addToCartDto.gameId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (addToCartDto.quantity || 1),
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          gameId: addToCartDto.gameId,
          quantity: addToCartDto.quantity || 1,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException("购物车不存在");
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException("购物车项不存在");
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: updateCartItemDto.quantity },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: number, cartItemId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException("购物车不存在");
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException("购物车项不存在");
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException("购物车不存在");
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  async getCartItemCount(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return { count: 0 };
    }

    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { count };
  }
}
