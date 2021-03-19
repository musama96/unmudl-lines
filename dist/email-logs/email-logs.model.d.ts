import * as mongoose from 'mongoose';
export declare enum Portal {
    COLLEGE = "college",
    ADMIN = "admin",
    LEARNER = "learner",
    EMPLOYER = "employer"
}
export declare const EmailLogSchema: mongoose.Schema<any>;
export interface EmailLog {
    to: String;
    from: String;
    subject: String;
    template: String;
    content?: String;
    portal?: String;
    context?: any;
}
