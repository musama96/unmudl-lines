import * as mongoose from 'mongoose';
export declare enum UserRoles {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    MODERATOR = "moderator",
    MANAGER = "manager",
    INSTRUCTOR = "instructor"
}
export declare const UserSchema: mongoose.Schema<any>;
export interface User extends mongoose.Document {
    fullname: string;
    emailAddress: string;
    password: string;
    role: string;
    collegeId?: string;
    employerId?: string;
    designation?: string;
    bio?: string;
    profilePhoto?: string;
    stripeCustomerId?: string;
}
export declare const TrashedUserSchema: mongoose.Schema<any>;
