import * as mongoose from 'mongoose';
export declare const EmployerEnquirySchema: mongoose.Schema<any>;
export interface EmployerEnquiry {
    users?: string[];
    employerAdmin: string;
    type: string;
}
