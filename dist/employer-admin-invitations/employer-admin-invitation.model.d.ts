import * as mongoose from 'mongoose';
export declare const EmployerAdminInvitationSchema: mongoose.Schema<any>;
export interface EmployerAdminInvitation extends mongoose.Document {
    fullname: string;
    emailAddress: string;
    role: string;
    status: string;
    employerId?: string;
    invitedBy?: string;
}
