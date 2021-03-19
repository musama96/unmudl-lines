import * as mongoose from 'mongoose';
export declare enum RefundRequestReason {
    DUPLICATE = "duplicate",
    UNINTENTIONAL = "unintentional",
    WRONG_AMOUNT = "wrong-amount",
    NEEDS_NOT_MET = "needs-not-met",
    NOT_AS_ADVERTISED = "not-as-advertised",
    CHANGED_MIND = "changed-mind"
}
export declare const RefundRequestSchema: mongoose.Schema<any>;
export interface RefundRequest {
    requestedBy?: string;
    courseId?: string;
    enrollmentId: string;
    status?: string;
    dateResolved?: any;
    reason: string[];
}
