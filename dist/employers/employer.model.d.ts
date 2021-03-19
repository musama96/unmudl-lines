import * as mongoose from 'mongoose';
export declare const EmployerSchema: mongoose.Schema<any>;
export interface Employer {
    title: string;
    website?: string;
    logo: string;
}
