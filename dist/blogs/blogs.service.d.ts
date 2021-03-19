import { Blog } from './blog.model';
import { BlogsListDto } from './dto/blogsList.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nest-modules/mailer';
export declare class BlogsService {
    private readonly blogModel;
    private readonly counterModel;
    private readonly trashedBlogModel;
    private readonly employerCompanyModel;
    private readonly notificationsService;
    private readonly mailerService;
    constructor(blogModel: any, counterModel: any, trashedBlogModel: any, employerCompanyModel: any, notificationsService: NotificationsService, mailerService: MailerService);
    createBlog(blog: Blog): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getBlogById(blogId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getBlogDetails(blogId: number): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getBlogs(params: BlogsListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getBlogsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPublishedBlogs(params: any): Promise<{
        blogsList: any;
        blogsCount: any;
    }>;
    getBlogPostsByEmployer(employerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSidebarBlogs(params: any): Promise<any>;
    updateBlog(blog: Blog): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateBlogPublishedStatus({ blogId, status }: {
        blogId: any;
        status: any;
    }, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateFeatured(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteBlogById(blogId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getFeaturedBlog(): Promise<any>;
    restoreBlogByOldId(blogId: any, { employerId, collegeId, userId }: {
        employerId: any;
        collegeId: any;
        userId: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
