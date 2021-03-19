import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/createBlog.dto';
import { BlogIdDto } from '../common/dto/blogId.dto';
import { UpdateBlogPublishedDto } from './dto/updateBlogPublished.dto';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { BlogsListDto } from './dto/blogsList.dto';
import { SetBlogsFeaturedDto } from './dto/setBlogsFeatured.dto';
export declare class BlogsController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    Create(createBlogDto: CreateBlogDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateBlog(updateBlogDto: UpdateBlogDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogs(blogsListDto: BlogsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCompleteBlogsSectionData(blogsListDto: BlogsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogDetails(blogIdDto: BlogIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateBlogPublishedStatus(updateBlogPublishedDto: UpdateBlogPublishedDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateBlogsFeatured(setBlogsFeaturedDto: SetBlogsFeaturedDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteBlogById(blogIdDto: BlogIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RestoreBlogByOldId(blogIdDto: BlogIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
