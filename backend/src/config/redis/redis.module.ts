import { Module, Global, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

const logger = new Logger("RedisModule");

@Global()
@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: (configService: ConfigService) => {
        const host = configService.get("REDIS_HOST");
        const port = configService.get("REDIS_PORT");
        const password = configService.get("REDIS_PASSWORD");

        if (!host) {
          logger.warn("Redis not configured, using mock client");
          return null;
        }

        const client = new Redis({
          host,
          port: port || 6379,
          password: password || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.warn(
                "Redis connection failed after 3 retries, continuing without Redis",
              );
              return null;
            }
            return Math.min(times * 100, 3000);
          },
        });

        client.on("error", (err) => {
          logger.warn(`Redis connection error: ${err.message}`);
        });

        client.on("connect", () => {
          logger.log("Redis connected successfully");
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
