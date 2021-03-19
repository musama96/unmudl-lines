import { EnrollmentsService } from '../enrollments/enrollments.service';
import { GetDashboardDataDto } from './dto/getDashboardData.dto';
import { CoursesService } from '../courses/courses.service';
import { LearnersService } from '../learners/learners.service';
import { CollegesService } from '../colleges/colleges.service';
import { RevenueAnalyticsCountDto } from '../enrollments/dto/revenueAnalyticsCount.dto';
import { PerformanceIndicatorsDto } from './dto/performanceIndicators.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { OptionalDurationDto } from '../common/dto/optionalDuration.dto';
import { GetRefundStatisticsDto } from '../courses/dto/getRefundStatistics.dto';
import { GetEnrollmentStatisticsDto } from '../courses/dto/getEnrollmentStatistics.dto';
import { GetHighRejectionCoursesDto } from '../courses/dto/getHighRejectionCourses.dto';
import { UsersService } from '../users/users.service';
export declare class DashboardService {
    private readonly enrollmentsService;
    private readonly coursesService;
    private readonly learnersService;
    private readonly collegesService;
    private readonly usersService;
    constructor(enrollmentsService: EnrollmentsService, coursesService: CoursesService, learnersService: LearnersService, collegesService: CollegesService, usersService: UsersService);
    getDashboardData(params: GetDashboardDataDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEarningsData(params: RevenueAnalyticsCountDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPerformanceIndicators(params: PerformanceIndicatorsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopCourses(params: OptionalDurationPaginationDto | OptionalDurationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopCoursesCsv(params: OptionalDurationPaginationDto | OptionalDurationDto): Promise<any>;
    getTopPerformingColleges(params: OptionalDurationPaginationDto): Promise<import("../common/ResponseHandler").SuccessInterface>;
    getTopPerformingCollegesCsv(params: OptionalDurationPaginationDto): Promise<import("../common/ResponseHandler").SuccessInterface>;
    getTopPerformingInstructors(params: OptionalDurationPaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopPerformingInstructorsCsv(params: OptionalDurationPaginationDto): Promise<any>;
    getCourseRefundList(params: GetRefundStatisticsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseEnrollmentStatistics(params: GetEnrollmentStatisticsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseRejectionRateList(params: GetHighRejectionCoursesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
