import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma/prisma.service";
import {
  CreateDownloadDto,
  UpdateDownloadDto,
  DownloadQueryDto,
  DownloadStatus,
} from "./dto";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async create(userId: number, createDownloadDto: CreateDownloadDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: createDownloadDto.gameId },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    const myGames = await this.ordersService.getMyGames(userId);
    const hasPurchased = myGames.games.some(
      (g) => g.id === createDownloadDto.gameId,
    );

    if (!hasPurchased) {
      throw new BadRequestException("您未购买此游戏，无法下载");
    }

    const existingDownload = await this.prisma.download.findFirst({
      where: {
        userId,
        gameId: createDownloadDto.gameId,
        platform: createDownloadDto.platform || "windows",
        status: {
          in: [DownloadStatus.PENDING, DownloadStatus.DOWNLOADING],
        },
      },
    });

    if (existingDownload) {
      return this.findOne(existingDownload.id);
    }

    const download = await this.prisma.download.create({
      data: {
        userId,
        gameId: createDownloadDto.gameId,
        platform: createDownloadDto.platform || "windows",
        status: DownloadStatus.PENDING,
      },
      include: {
        game: true,
      },
    });

    return {
      id: download.id,
      gameId: download.gameId,
      platform: download.platform,
      status: download.status,
      progress: download.progress,
      downloadPath: download.downloadPath,
      fileSize: download.fileSize,
      downloadedSize: download.downloadedSize,
      speed: download.speed,
      errorMessage: download.errorMessage,
      createdAt: download.createdAt,
      updatedAt: download.updatedAt,
      completedAt: download.completedAt,
      game: {
        id: download.game.id,
        title: download.game.title,
        slug: download.game.slug,
        coverImage: download.game.coverImage,
      },
    };
  }

  async findAll(userId: number, query: DownloadQueryDto) {
    const page = parseInt(query.page?.toString()) || 1;
    const limit = parseInt(query.limit?.toString()) || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.gameId) {
      where.gameId = query.gameId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [downloads, total] = await Promise.all([
      this.prisma.download.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          game: true,
        },
      }),
      this.prisma.download.count({ where }),
    ]);

    return {
      list: downloads.map((download) => ({
        id: download.id,
        gameId: download.gameId,
        platform: download.platform,
        status: download.status,
        progress: download.progress,
        downloadPath: download.downloadPath,
        fileSize: download.fileSize,
        downloadedSize: download.downloadedSize,
        speed: download.speed,
        errorMessage: download.errorMessage,
        createdAt: download.createdAt,
        updatedAt: download.updatedAt,
        completedAt: download.completedAt,
        game: {
          id: download.game.id,
          title: download.game.title,
          slug: download.game.slug,
          coverImage: download.game.coverImage,
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
    const download = await this.prisma.download.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!download) {
      throw new NotFoundException("下载记录不存在");
    }

    return {
      id: download.id,
      gameId: download.gameId,
      platform: download.platform,
      status: download.status,
      progress: download.progress,
      downloadPath: download.downloadPath,
      fileSize: download.fileSize,
      downloadedSize: download.downloadedSize,
      speed: download.speed,
      errorMessage: download.errorMessage,
      createdAt: download.createdAt,
      updatedAt: download.updatedAt,
      completedAt: download.completedAt,
      game: {
        id: download.game.id,
        title: download.game.title,
        slug: download.game.slug,
        coverImage: download.game.coverImage,
        developer: download.game.developer,
        publisher: download.game.publisher,
      },
    };
  }

  async update(
    userId: number,
    id: number,
    updateDownloadDto: UpdateDownloadDto,
  ) {
    const download = await this.prisma.download.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!download) {
      throw new NotFoundException("下载记录不存在");
    }

    const updateData: any = {
      status: updateDownloadDto.status,
    };

    if (updateDownloadDto.progress !== undefined) {
      updateData.progress = updateDownloadDto.progress;
    }

    if (updateDownloadDto.downloadPath) {
      updateData.downloadPath = updateDownloadDto.downloadPath;
    }

    if (updateDownloadDto.status === DownloadStatus.COMPLETED) {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    const updated = await this.prisma.download.update({
      where: { id },
      data: updateData,
      include: {
        game: true,
      },
    });

    return {
      id: updated.id,
      gameId: updated.gameId,
      platform: updated.platform,
      status: updated.status,
      progress: updated.progress,
      downloadPath: updated.downloadPath,
      fileSize: updated.fileSize,
      downloadedSize: updated.downloadedSize,
      speed: updated.speed,
      errorMessage: updated.errorMessage,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      completedAt: updated.completedAt,
      game: {
        id: updated.game.id,
        title: updated.game.title,
        slug: updated.game.slug,
        coverImage: updated.game.coverImage,
      },
    };
  }

  async pause(userId: number, id: number) {
    const download = await this.prisma.download.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!download) {
      throw new NotFoundException("下载记录不存在");
    }

    if (download.status !== DownloadStatus.DOWNLOADING) {
      throw new BadRequestException("只能暂停正在下载的任务");
    }

    return this.update(userId, id, {
      status: DownloadStatus.PAUSED,
    });
  }

  async resume(userId: number, id: number) {
    const download = await this.prisma.download.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!download) {
      throw new NotFoundException("下载记录不存在");
    }

    if (download.status !== DownloadStatus.PAUSED) {
      throw new BadRequestException("只能恢复已暂停的任务");
    }

    return this.update(userId, id, {
      status: DownloadStatus.DOWNLOADING,
    });
  }

  async cancel(userId: number, id: number) {
    const download = await this.prisma.download.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!download) {
      throw new NotFoundException("下载记录不存在");
    }

    if (download.status === DownloadStatus.COMPLETED) {
      throw new BadRequestException("无法取消已完成的下载");
    }

    await this.prisma.download.delete({
      where: { id },
    });

    return { message: "下载已取消" };
  }

  async getDownloadUrl(
    userId: number,
    gameId: number,
    platform: string = "windows",
  ) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException("游戏不存在");
    }

    const myGames = await this.ordersService.getMyGames(userId);
    const hasPurchased = myGames.games.some((g) => g.id === gameId);

    if (!hasPurchased) {
      throw new BadRequestException("您未购买此游戏，无法下载");
    }

    const cdnUrl = process.env.CDN_URL || "https://cdn.cloudcurtain.com";
    const downloadUrl = `${cdnUrl}/games/${game.slug}/${platform}/installer.exe`;

    return {
      downloadUrl,
      gameId,
      platform,
      title: game.title,
      version: "1.0.0",
      size: "2.5 GB",
      checksum: "abc123def456",
    };
  }
}
