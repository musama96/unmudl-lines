import * as mongoose from 'mongoose';
export declare const PostSchema: mongoose.Schema<any>;
export interface Post {
    author: string;
    topic: string;
    content: string;
    numId?: number;
}
