import { BlogTag } from './blog-tag.model';
export declare class BlogTagsService {
    private readonly blogTagModel;
    private readonly blogModel;
    constructor(blogTagModel: any, blogModel: any);
    createBlogTag(tag: BlogTag): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTags(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTagBySlug(slug: string): Promise<any>;
    getAllTags(keyword: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTagList(): Promise<any>;
    deleteTag(tagId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
