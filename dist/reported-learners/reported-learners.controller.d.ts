import { SuccessInterface } from '../common/ResponseHandler';
import { ReportedLearnersService } from './reported-learners.service';
import { AddLearnerReportDto } from './dto/addLearnerReport.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateLearnerReportDto } from './dto/updateReport.dto';
export declare class ReportedLearnersController {
    private readonly reportedLearnersService;
    constructor(reportedLearnersService: ReportedLearnersService);
    GetLearnerReports(paginationDto: PaginationDto, user: any): Promise<SuccessInterface>;
    AddLearnerReport(addLearnerReport: AddLearnerReportDto, user: any): Promise<SuccessInterface>;
    UpdateLearnerReportStatus(updateLearnerReport: UpdateLearnerReportDto, user: any): Promise<SuccessInterface>;
}
