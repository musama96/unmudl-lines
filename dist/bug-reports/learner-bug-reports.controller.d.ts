import { BugReportsService } from './bug-reports.service';
import { CreateBugReportDto } from './dto/createBugReport.dto';
export declare class LearnerBugReportsController {
    private readonly bugReportsService;
    constructor(bugReportsService: BugReportsService);
    UpdateBlogPublishedStatus(createBugReportDto: CreateBugReportDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
