import * as mongoose from 'mongoose';
export declare const TransactionActivities: {
    CourseApplied: string;
    CourseBought: string;
    CourseBoughtWithPromo: string;
    EnrollmentApproved: string;
    EnrollmentDeclined: string;
    EnrollmentCanceled: string;
    EnrollmentRefunded: string;
};
export declare const TransactionActivityCategorySchema: mongoose.Schema<any>;
