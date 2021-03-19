import * as mongoose from 'mongoose';
import { Severity } from '../common/enums/createBugReport.enum';
export declare const BugReportSchema: mongoose.Schema<any>;
export interface BugReport {
    _id?: string;
    reportedBy?: string;
    title: string;
    description?: string;
    severity: Severity;
    comment?: string;
}
