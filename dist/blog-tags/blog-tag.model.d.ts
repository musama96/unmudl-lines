import * as mongoose from 'mongoose';
export declare const BlogTagSchema: mongoose.Schema<any>;
export interface BlogTag {
    title: string;
    slug?: string;
}
