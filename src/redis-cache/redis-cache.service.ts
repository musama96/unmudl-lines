import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async checkClient() {
    const client = await this.cache.store.getClient();

    return client.connected;
  }

  async get(key) {
    return await this.cache.get(key);
  }

  async del(key) {
    return await this.cache.del(key);
  }

  async set(key, value, ttl?: number) {
    // console.log(value);
    if (ttl) {
      await this.cache.set(key, value, {ttl});
    } else {
      await this.cache.set(key, value);
    }
  }
}
