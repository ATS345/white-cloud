import { Module, Global, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "@elastic/elasticsearch";

const logger = new Logger("ElasticsearchModule");

@Global()
@Module({
  providers: [
    {
      provide: "ELASTICSEARCH_CLIENT",
      useFactory: (configService: ConfigService) => {
        const node = configService.get("ELASTICSEARCH_NODE");

        if (!node) {
          logger.warn(
            "Elasticsearch not configured, search features will be disabled",
          );
          return null;
        }

        try {
          const client = new Client({
            node,
            auth: {
              username:
                configService.get("ELASTICSEARCH_USERNAME") || undefined,
              password:
                configService.get("ELASTICSEARCH_PASSWORD") || undefined,
            },
          });

          client
            .ping()
            .then(() => logger.log("Elasticsearch connected successfully"))
            .catch((err) =>
              logger.warn(`Elasticsearch connection failed: ${err.message}`),
            );

          return client;
        } catch (error) {
          logger.warn(`Elasticsearch initialization failed: ${error.message}`);
          return null;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ["ELASTICSEARCH_CLIENT"],
})
export class ElasticsearchModule {}
