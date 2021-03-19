import { AddLearnerReportDto } from './dto/addLearnerReport.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateLearnerReportDto } from './dto/updateReport.dto';
export declare class ReportedLearnersService {
    private readonly reportedLearnerModel;
    private readonly learnerModel;
    constructor(reportedLearnerModel: any, learnerModel: any);
    addReport(reportDetails: AddLearnerReportDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateReport(params: UpdateLearnerReportDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReports(params: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
