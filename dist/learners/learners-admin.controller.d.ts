import { LearnersService } from './learners.service';
import { LearnerTokensService } from './learnerTokens.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { GetCountDto } from '../common/dto/getCount.dto';
import { ReportedLearnersService } from '../reported-learners/reported-learners.service';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { LearnerAnalyticsCountDto } from './dto/learnerAnalyticsCount.dto';
import { LearnerDetailsDto } from '../enrollments/dto/learnerDetails.dto';
import { LearnersListDto } from '../common/dto/learnersList.dto';
import { EnrollmentLearnersListDto } from './dto/enrollmentLearnersList.dto';
import { LearnersSectionAdminDto } from './dto/LearnersSectionAdmin.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { UpdateSuspendLearnerDto } from './dto/updateSuspend.dto';
export declare class LearnersAdminController {
    private readonly learnersService;
    private readonly learnerTokenService;
    private readonly reportedLearnersService;
    private readonly enrollmentsService;
    constructor(learnersService: LearnersService, learnerTokenService: LearnerTokensService, reportedLearnersService: ReportedLearnersService, enrollmentsService: EnrollmentsService);
    GetLearnersEnrolledCountAnalytics(analyticsCountDto: AnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetLearnersSectionForAdminPanel(learnersSectionAdminDto: LearnersSectionAdminDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetLearnersEnrolledCountAnalyticsForAdmin(learnerAnalyticsCountDto: LearnerAnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetLearnersEnrolledCount(getCountDto: GetCountDto, user: any): Promise<SuccessInterface>;
    GetUserGrowthStats(getCountDto: GetCountDto, user: any): Promise<SuccessInterface>;
    GetUserGrowthStatsCsv(getCountDto: GetCountDto, user: any): Promise<SuccessInterface>;
    getLearnersByCollege(listDto: LearnersListDto, user: any): Promise<SuccessInterface>;
    GetLearnerDetails(learnerDetailsDto: LearnerDetailsDto, user: any): Promise<SuccessInterface>;
    getApprovedLearnersByCollege(listDto: EnrollmentLearnersListDto, user: any): Promise<SuccessInterface>;
    getLearnersByCollegeCsv(listDto: LearnersListDto, user: any): Promise<SuccessInterface>;
    SuspendLearner(suspendLearnerDto: UpdateSuspendLearnerDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
