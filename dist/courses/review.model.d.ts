import * as mongoose from 'mongoose';
export declare const ReviewSchema: mongoose.Schema<any>;
export interface Review extends mongoose.Document {
    full_name: string;
    email_address: string;
    username: string;
    password: string;
}
