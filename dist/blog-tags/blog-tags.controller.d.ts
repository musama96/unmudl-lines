import { BlogTagsService } from './blog-tags.service';
import { CreateBlogTagDto } from './dto/createBlogTag.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { ListDto } from './dto/list.dto';
import { TagIdDto } from './dto/tagIdDto.dto';
export declare class BlogTagsController {
    private readonly blogTagsService;
    constructor(blogTagsService: BlogTagsService);
    CreateBlogTag(createBlogTagDto: CreateBlogTagDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogTags(keywordDto: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetAllBlogTags(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteTag(tagIdDto: TagIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
