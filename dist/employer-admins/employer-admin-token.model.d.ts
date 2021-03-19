import * as mongoose from 'mongoose';
export declare const EmployerAdminTokenSchema: mongoose.Schema<any>;
export interface EmployerAdminToken extends mongoose.Document {
    adminId: string;
    token: string;
}
