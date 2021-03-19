import * as mongoose from 'mongoose';
export declare const EnquirySchema: mongoose.Schema<any>;
export interface Enquiry {
    users?: string[];
    learner: string;
    enquiry?: string;
}
