import { SitemapsService } from './sitemaps.service';
export declare class SitemapsController {
    private readonly sitemapsService;
    constructor(sitemapsService: SitemapsService);
    GetCollegesForSitemap(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCoursesForSitemap(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
