import * as mongoose from 'mongoose';
export declare const InvitationSchema: mongoose.Schema<any>;
export interface Invitation extends mongoose.Document {
    fullname: string;
    emailAddress: string;
    role: string;
    collegeId?: string;
    invitedBy?: string;
    courseIds?: string[];
}
