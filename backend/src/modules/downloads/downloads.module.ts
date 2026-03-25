import { Module } from "@nestjs/common";
import { DownloadsController } from "./downloads.controller";
import { DownloadsService } from "./downloads.service";
import { PrismaModule } from "../../config/prisma/prisma.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
