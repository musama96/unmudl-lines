import { DashboardService } from './dashboard.service';
import { GetDashboardDataDto } from './dto/getDashboardData.dto';
import { RevenueAnalyticsCountDto } from '../enrollments/dto/revenueAnalyticsCount.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { PerformanceIndicatorsDto } from './dto/performanceIndicators.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { OptionalDurationDto } from '../common/dto/optionalDuration.dto';
import { GetRefundStatisticsDto } from '../courses/dto/getRefundStatistics.dto';
import { GetEnrollmentStatisticsDto } from '../courses/dto/getEnrollmentStatistics.dto';
import { GetHighRejectionCoursesDto } from '../courses/dto/getHighRejectionCourses.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    GetDashboardData(getDashboardDataDto: GetDashboardDataDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRevenueAnalytics(revenueAnalyticsCountDto: RevenueAnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetPerformanceIndicators(performanceIndicatorsDto: PerformanceIndicatorsDto, user: any): Promise<SuccessInterface>;
    GetTopCourses(optionalDurationPaginationDto: OptionalDurationPaginationDto, user: any): Promise<SuccessInterface>;
    GetTopPerformingColleges(optionalDurationPaginationDto: OptionalDurationPaginationDto): Promise<SuccessInterface>;
    GetTopPerformingInstructors(optionalDurationPaginationDto: OptionalDurationPaginationDto): Promise<SuccessInterface>;
    GetCourseRefundList(getRefundStatisticsDto: GetRefundStatisticsDto, user: any): Promise<SuccessInterface>;
    GetCourseEnrollmentStatistics(getEnrollmentStatisticsDto: GetEnrollmentStatisticsDto, user: any): Promise<SuccessInterface>;
    GetCourseRejectionRateList(getHighRejectionCoursesDto: GetHighRejectionCoursesDto, user: any): Promise<SuccessInterface>;
    GetTopCoursesCsv(optionalDurationDto: OptionalDurationDto, user: any): Promise<SuccessInterface>;
    GetTopInstructorsCsv(optionalDurationPaginationDto: OptionalDurationPaginationDto, user: any): Promise<SuccessInterface>;
    GetTopCollegesCsv(optionalDurationPaginationDto: OptionalDurationPaginationDto, user: any): Promise<SuccessInterface>;
}
