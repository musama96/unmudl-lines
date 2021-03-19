import { Cache } from 'cache-manager';
export declare class RedisCacheService {
    private readonly cache;
    constructor(cache: Cache);
    checkClient(): Promise<any>;
    get(key: any): Promise<any>;
    del(key: any): Promise<any>;
    set(key: any, value: any, ttl?: number): Promise<void>;
}
