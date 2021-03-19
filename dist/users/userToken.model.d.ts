import * as mongoose from 'mongoose';
export declare const UserTokenSchema: mongoose.Schema<any>;
export interface UserToken extends mongoose.Document {
    userId: string;
    token: string;
}
