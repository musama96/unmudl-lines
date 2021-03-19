import * as mongoose from 'mongoose';
export declare const EmployerCommentSchema: mongoose.Schema<any>;
export interface Reply {
    postId: string;
    employerPost?: string;
    employerAdmin?: string;
    user?: string;
    learner?: string;
    content: string;
}
