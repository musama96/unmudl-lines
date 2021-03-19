import * as mongoose from 'mongoose';
export declare const EmployerPostSchema: mongoose.Schema<any>;
export interface Post {
    user?: string;
    employerAdmin?: string;
    topic: string;
    content: string;
}
