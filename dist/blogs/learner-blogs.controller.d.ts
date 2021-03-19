import { BlogsService } from './blogs.service';
import { BlogTagsService } from '../blog-tags/blog-tags.service';
import { BlogNumIdDto } from '../common/dto/blogNumId.dto';
import { LearnerBlogsListDto } from './dto/learnerBlogsList.dto';
import { SideBarBlogsDto } from './dto/sideBarBlogs.dto';
import { BlogMainPageDto } from './dto/blogMainPage.dto';
export declare class LearnersBlogsController {
    private readonly blogsService;
    private readonly blogTagsService;
    constructor(blogsService: BlogsService, blogTagsService: BlogTagsService);
    GetBlogs(blogsListDto: LearnerBlogsListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogsPageData(blogsMainPageDto: BlogMainPageDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetSideBarBlogs(sideBarBlogsDto: SideBarBlogsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogDetails(blogNumIdDto: BlogNumIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
