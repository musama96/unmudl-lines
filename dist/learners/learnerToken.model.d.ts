import * as mongoose from 'mongoose';
export declare const LearnerTokenSchema: mongoose.Schema<any>;
export interface LearnerToken extends mongoose.Document {
    learnerId: string;
    token?: string;
    verificationCode?: number;
}
