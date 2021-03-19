import * as mongoose from 'mongoose';
export declare const ReplySchema: mongoose.Schema<any>;
export interface Reply {
    postId: string;
    learner?: string;
    user?: string;
    content: string;
}
