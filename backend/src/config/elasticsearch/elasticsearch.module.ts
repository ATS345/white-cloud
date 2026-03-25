import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Global()
@Module({
  providers: [
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Client({
          node: configService.get('ELASTICSEARCH_NODE'),
          auth: {
            username: configService.get('ELASTICSEARCH_USERNAME'),
            password: configService.get('ELASTICSEARCH_PASSWORD'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['ELASTICSEARCH_CLIENT'],
})
export class ElasticsearchModule {}
