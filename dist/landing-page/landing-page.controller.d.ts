import { CoursesService } from '../courses/courses.service';
import { BlogsService } from '../blogs/blogs.service';
import { UpdateLandingPageDto } from './dto/updateLandingPage.dto';
import { LandingPageService } from './landing-page.service';
import { UpdateLandingPartnersDto } from './dto/updateLandingPartners.dto';
import { UpdateLandingFeaturedCoursesDto } from './dto/updateLandingFeaturedCourses.dto';
import { UpdateLandingHighlyRatedCoursesDto } from './dto/updateLandingHighlyRatedCourses.dto';
import { UpdateLandingBlogsDto } from './dto/updateLandingBlogs.dto';
import { SearchCoursesDto } from './dto/searchCourses.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { UpdateFooterContentDto } from './dto/updateFooterContent.dto';
import { UpdateLandingCredentialCoursesDto } from './dto/updateLandingCredentialCourses.dto';
import { UpdatePreviewContentDto } from './dto/updatePreviewContent.dto';
export declare class LandingPageController {
    private readonly coursesService;
    private readonly blogsService;
    private readonly landingPageService;
    constructor(coursesService: CoursesService, blogsService: BlogsService, landingPageService: LandingPageService);
    GetLandingPageInfo(): Promise<any>;
    GetLandingPageData(): Promise<any>;
    GetCoursesDropdown(searchCoursesDto: SearchCoursesDto): Promise<SuccessInterface>;
    GetCoursesList(searchCoursesDto: SearchCoursesDto): Promise<SuccessInterface>;
    UpdateLandingPageInfo(updateLandingDto: UpdateLandingPageDto, files: any): Promise<any>;
    UpdateLandingPagePartners(updateLandingPartnersDto: UpdateLandingPartnersDto): Promise<any>;
    UpdateLandingPageFeaturedCourses(updateLandingFeaturedCoursesDto: UpdateLandingFeaturedCoursesDto): Promise<any>;
    UpdateLandingPageHighlyRatedCourses(updateLandingHighlyRatedCoursesDto: UpdateLandingHighlyRatedCoursesDto): Promise<any>;
    UpdateLandingPageCredentialCourses(updateLandingCredentialCoursesDto: UpdateLandingCredentialCoursesDto): Promise<any>;
    UpdateLandingPageBlogs(updateLandingBlogsDto: UpdateLandingBlogsDto): Promise<any>;
    updateFooterContent(updateFooterContentDto: UpdateFooterContentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePreviewContent(updatePreviewContentDto: UpdatePreviewContentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
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
}
