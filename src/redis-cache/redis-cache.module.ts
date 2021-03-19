import { Module, CacheModule, Inject, CACHE_MANAGER } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      // imports: [ConfigModule],
      // inject: [ConfigService],
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        ttl: process.env.REDIS_TTL,
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {
  constructor(@Inject(CACHE_MANAGER) cacheManager) {
    const client = cacheManager.store.getClient();
    // console.log(client);
    client.on('error', (error) => {
        console.error(error);
    });
}
}
