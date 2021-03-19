import * as mongoose from 'mongoose';
export declare enum PostReportStatus {
    Ignored = "ignored",
    Warned = "warned",
    Delete = "deleted"
}
export declare const PostReportSchema: mongoose.Schema<any>;
