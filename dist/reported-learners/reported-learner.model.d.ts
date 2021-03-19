import * as mongoose from 'mongoose';
export declare enum ReportLearnerStatus {
    SUSPENDED = "suspended",
    PENDING = "pending",
    IGNORED = "ignored"
}
export declare const ReportedLearnerSchema: mongoose.Schema<any>;
