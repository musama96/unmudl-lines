import { LandingPage } from './landing-page.model';
import { UpdateFooterContentDto } from './dto/updateFooterContent.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
export declare class LandingPageService {
    private readonly landingPageModel;
    private readonly courseModel;
    private readonly collegeModel;
    private readonly blogModel;
    private readonly employerModel;
    private readonly redisCacheService;
    constructor(landingPageModel: any, courseModel: any, collegeModel: any, blogModel: any, employerModel: any, redisCacheService: RedisCacheService);
    updateLandingPageInfo(landingInfo: LandingPage): Promise<any>;
    updateLandingPagePartners(partners: string[]): Promise<any>;
    updateLandingPageFeaturedCourses(featured: object): Promise<any>;
    updateLandingPageHighlyRatedCourses(highlyRated: object): Promise<any>;
    updateLandingPageCredentialCourses(credentialCourses: object): Promise<any>;
    updateLandingPageBlogs(blogs: object): Promise<any>;
    getLandingPageInfo(): Promise<any>;
    getAboutUs(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getWhyUnmudl(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPrivacyPolicy(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTermsOfService(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAccessibility(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPreviewContent(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersLandingPage(): Promise<any>;
    getLandingPage(): Promise<any>;
    getSpecifiedCourses(courseIds: any): Promise<any>;
    getCoursesDropdown(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSearchedCourses(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateFooterContent(footerPagesContent: UpdateFooterContentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePreviewContent(previewContent: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
