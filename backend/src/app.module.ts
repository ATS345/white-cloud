import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { PrismaModule } from "./config/prisma/prisma.module";
import { RedisModule } from "./config/redis/redis.module";
import { ElasticsearchModule } from "./config/elasticsearch/elasticsearch.module";
import { UsersModule } from "./modules/users/users.module";
import { GamesModule } from "./modules/games/games.module";
import { CartModule } from "./modules/cart/cart.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ContentModule } from "./modules/content/content.module";
import { CommunityModule } from "./modules/community/community.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { DownloadsModule } from "./modules/downloads/downloads.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AdminGamesModule } from "./modules/admin-games/admin-games.module";
import { SearchModule } from "./modules/search/search.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { HealthModule } from "./modules/health/health.module";
import { AlertModule } from "./modules/alert/alert.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    PrismaModule,
    RedisModule,
    ElasticsearchModule,
    AuthModule,
    UsersModule,
    GamesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ContentModule,
    CommunityModule,
    CommentsModule,
    ReviewsModule,
    DownloadsModule,
    AdminModule,
    AdminGamesModule,
    SearchModule,
    NotificationsModule,
    MetricsModule,
    HealthModule,
    AlertModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
