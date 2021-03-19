import { BlogStatus } from '../../common/enums/createBlog.enum';
export declare class CreateBlogDto {
    headerImage?: any;
    headerImageThumbnail?: string;
    author?: string;
    employerAuthor?: string;
    collegeId?: string;
    employerId?: string;
    type?: string;
    title: string;
    featured?: number;
    altText?: string;
    contributors?: string[];
    employerContributors?: string[];
    tags?: string[];
    content: string;
    excerpt: string;
    tagline: string;
    status?: BlogStatus;
    publishDate?: string;
}
