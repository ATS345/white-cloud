import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { AdminUpdateUserDto, AdminUserQueryDto, AdminBanUserDto, UserStatus, UserRole } from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStatistics() {
    const [totalUsers, totalGames, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.game.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: { in: ['paid', 'completed'] } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalUsers,
      totalGames,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  async getOrders(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              displayName: true,
            },
          },
          items: {
            include: {
              game: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count(),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        username: order.user?.displayName || order.user?.username,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          title: item.game.title,
          price: item.price,
        })),
      })),
      total,
    };
  }

  async getUsers(query: AdminUserQueryDto) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { username: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.emailVerified !== undefined) {
      where.emailVerified = query.emailVerified;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'desc' };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatar: true,
          bio: true,
          location: true,
          website: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        stats: {
          ordersCount: user._count.orders,
          reviewsCount: user._count.reviews,
          commentsCount: user._count.comments,
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

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
            status: true,
            createdAt: true,
            completedAt: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            gameId: true,
            rating: true,
            content: true,
            likes: true,
            dislikes: true,
            createdAt: true,
          },
        },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            gameId: true,
            content: true,
            likes: true,
            dislikes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      orders: user.orders,
      reviews: user.reviews,
      comments: user.comments,
    };
  }

  async updateUser(id: number, adminUpdateUserDto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        username: adminUpdateUserDto.username,
        displayName: adminUpdateUserDto.displayName,
        email: adminUpdateUserDto.email,
        bio: adminUpdateUserDto.bio,
        location: adminUpdateUserDto.location,
        website: adminUpdateUserDto.website,
        role: adminUpdateUserDto.role,
        status: adminUpdateUserDto.status,
        emailVerified: adminUpdateUserDto.emailVerified,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return updated;
  }

  async banUser(id: number, adminBanUserDto: AdminBanUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无法封禁超级管理员');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BANNED },
    });

    return { message: '用户已被封禁', reason: adminBanUserDto.reason };
  }

  async unbanUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status !== UserStatus.BANNED) {
      throw new ForbiddenException('用户未被封禁');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
    });

    return { message: '用户已解封' };
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无法删除超级管理员');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: '用户已删除' };
  }

  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      usersByRole,
      usersByStatus,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
      usersByStatus: usersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}