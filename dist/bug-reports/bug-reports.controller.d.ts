import { BugReportsService } from './bug-reports.service';
import { BugReportsListDto } from './dto/bugReportsList.dto';
import { BugReportIdDto } from '../common/dto/bugReportId.dto';
import { ReviewBugReportDto } from './dto/reviewBugReport.dto';
export declare class BugReportsController {
    private readonly bugReportsService;
    constructor(bugReportsService: BugReportsService);
    GetBugReports(bugReportsListDto: BugReportsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetBlogDetails(bugReportIdDto: BugReportIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    ReviewBugReport(reviewBugReportDto: ReviewBugReportDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteBugReport(bugReportIdDto: BugReportIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
