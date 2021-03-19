import * as mongoose from 'mongoose';
export declare const ReportedActivitySchema: mongoose.Schema<any>;
export interface ReportedActivity {
    reviewId: string;
    resolutionDate?: any;
    reportDate?: any;
    status?: string;
    reportedLearnerId?: string;
    reportingLearnerId?: string;
    reportingCollegeId?: string;
    reportingUserId?: string;
    comment?: string;
}
