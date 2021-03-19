import { BugReport } from './bug-report.model';
export declare class BugReportsService {
    private readonly bugReportModel;
    constructor(bugReportModel: any);
    createBugReport(report: BugReport): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    reviewBugReport(report: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getBugReports(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReportDetails(reportId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteBugReport(reportId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
