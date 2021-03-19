import { RedisCacheService } from '../redis-cache/redis-cache.service';
export declare class SitemapsService {
    private readonly collegeModel;
    private readonly courseModel;
    private readonly redisCacheService;
    constructor(collegeModel: any, courseModel: any, redisCacheService: RedisCacheService);
    getCollegesForSiteMap(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesForSiteMap(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
