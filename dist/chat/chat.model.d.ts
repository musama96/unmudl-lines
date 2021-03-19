import * as mongoose from 'mongoose';
export declare enum ChatType {
    COLLEGE = "college",
    EMPLOYER = "employer",
    LEARNER = "learner"
}
export declare const ChatSchema: mongoose.Schema<any>;
export interface Chat {
    _id?: string;
    learner?: any | string;
    employerAdmins?: any[] | string[];
    users?: any[] | string[];
    course: any | string;
    college?: any | string;
    employer?: any | string;
    createdBy?: any | string;
    module?: string;
}
