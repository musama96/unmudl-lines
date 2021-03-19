import * as mongoose from 'mongoose';
export declare const BlogSchema: mongoose.Schema<any>;
export declare const TrashedBlogSchema: mongoose.Schema<any>;
export interface Blog {
    _id?: string;
    title?: string;
    headerImage?: string;
    headerImageThumbnail?: string;
    altText?: string;
    type?: string;
    tagline?: string;
    contributors?: string[];
    employerContributors?: string[];
    permalink?: string;
    tags?: string[];
    status?: string;
    content: string;
    featured?: number;
    collegeId?: string;
    employerId?: string;
}
