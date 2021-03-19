import * as mongoose from 'mongoose';
export declare const EmployerAdminSchema: mongoose.Schema<any>;
export declare const TrashedEmployerAdminSchema: mongoose.Schema<any>;
export interface EmployerAdmin extends mongoose.Document {
    fullname: string;
    emailAddress: string;
    password: string;
    role: string;
    employerId?: string;
    designation?: string;
    profilePhoto?: string;
    profilePhotoThumbnail?: string;
}
