import { Module } from "@nestjs/common";
import { AdminGamesController } from "./admin-games.controller";
import { AdminGamesService } from "./admin-games.service";
import { PrismaModule } from "../../config/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdminGamesController],
  providers: [AdminGamesService],
  exports: [AdminGamesService],
})
export class AdminGamesModule {}
