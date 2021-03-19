import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetDashboardDataDto } from './dto/getDashboardData.dto';
import { GetUser } from '../auth/get-user.decorator';
import { RevenueAnalyticsCountDto, UserType } from '../enrollments/dto/revenueAnalyticsCount.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { PerformanceIndicatorsDto } from './dto/performanceIndicators.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { OptionalDurationDto } from '../common/dto/optionalDuration.dto';
import { GetRefundStatisticsDto } from '../courses/dto/getRefundStatistics.dto';
import { GetEnrollmentStatisticsDto } from '../courses/dto/getEnrollmentStatistics.dto';
import { GetHighRejectionCoursesDto } from '../courses/dto/getHighRejectionCourses.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete dashboard data.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get()
  async GetDashboardData(@Query() getDashboardDataDto: GetDashboardDataDto, @GetUser() user) {
    getDashboardDataDto.collegeId = user.collegeId ? user.collegeId : getDashboardDataDto.collegeId;
    getDashboardDataDto.interval = getDashboardDataDto.interval ? Number(getDashboardDataDto.interval) : 1;
    getDashboardDataDto.refundRate = getDashboardDataDto.refundRate ? getDashboardDataDto.refundRate : 20;
    getDashboardDataDto.rejectionRate = getDashboardDataDto.rejectionRate ? getDashboardDataDto.rejectionRate : 20;
    getDashboardDataDto.isUnmudlAdmin = !user.collegeId;
    getDashboardDataDto.userCollegeId = user.collegeId ? user.collegeId : null;

    return await this.dashboardService.getDashboardData(getDashboardDataDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings card data for dashboard.' })
  @Get('/earnings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetRevenueAnalytics(@Query() revenueAnalyticsCountDto: RevenueAnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    revenueAnalyticsCountDto.collegeId = user.collegeId
      ? user.collegeId
      : revenueAnalyticsCountDto.collegeId
      ? revenueAnalyticsCountDto.collegeId
      : null;

    return this.dashboardService.getEarningsData(revenueAnalyticsCountDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings card data for dashboard.' })
  @Get('/performance-indicators')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetPerformanceIndicators(@Query() performanceIndicatorsDto: PerformanceIndicatorsDto, @GetUser() user): Promise<SuccessInterface> {
    performanceIndicatorsDto.collegeId = performanceIndicatorsDto.type === UserType.UNMUDL ? null : user.collegeId;

    return this.dashboardService.getPerformanceIndicators(performanceIndicatorsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of top courses.' })
  @Get('/top-courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetTopCourses(@Query() optionalDurationPaginationDto: OptionalDurationPaginationDto, @GetUser() user): Promise<SuccessInterface> {
    optionalDurationPaginationDto.collegeId = user.collegeId;

    return this.dashboardService.getTopCourses(optionalDurationPaginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of top performing colleges.' })
  @Get('/top-colleges')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetTopPerformingColleges(@Query() optionalDurationPaginationDto: OptionalDurationPaginationDto): Promise<SuccessInterface> {
    optionalDurationPaginationDto.page = optionalDurationPaginationDto.page ? optionalDurationPaginationDto.page : 1;
    optionalDurationPaginationDto.perPage = optionalDurationPaginationDto.perPage ? optionalDurationPaginationDto.perPage : 10;

    return this.dashboardService.getTopPerformingColleges(optionalDurationPaginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of top performing instructors.' })
  @Get('/top-instructors')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetTopPerformingInstructors(@Query() optionalDurationPaginationDto: OptionalDurationPaginationDto): Promise<SuccessInterface> {
    optionalDurationPaginationDto.page = optionalDurationPaginationDto.page ? optionalDurationPaginationDto.page : 1;
    optionalDurationPaginationDto.perPage = optionalDurationPaginationDto.perPage ? optionalDurationPaginationDto.perPage : 10;

    return this.dashboardService.getTopPerformingInstructors(optionalDurationPaginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of course refund information.' })
  @Get('/course-refund-list')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetCourseRefundList(@Query() getRefundStatisticsDto: GetRefundStatisticsDto, @GetUser() user): Promise<SuccessInterface> {
    getRefundStatisticsDto.collegeId = user.collegeId;

    return this.dashboardService.getCourseRefundList(getRefundStatisticsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of course enrollment status.' })
  @Get('/course-enrollment-stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetCourseEnrollmentStatistics(
    @Query() getEnrollmentStatisticsDto: GetEnrollmentStatisticsDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    getEnrollmentStatisticsDto.collegeId = user.collegeId;

    return this.dashboardService.getCourseEnrollmentStatistics(getEnrollmentStatisticsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of course rejection rates.' })
  @Get('/rejection-rates-list')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetCourseRejectionRateList(
    @Query() getHighRejectionCoursesDto: GetHighRejectionCoursesDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    getHighRejectionCoursesDto.collegeId = user.collegeId;

    return this.dashboardService.getCourseRejectionRateList(getHighRejectionCoursesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top courses in a csv.' })
  @Get('/top-courses/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=courses.csv')
  async GetTopCoursesCsv(@Query() optionalDurationDto: OptionalDurationDto, @GetUser() user): Promise<SuccessInterface> {
    optionalDurationDto.collegeId = user.collegeId;

    return await this.dashboardService.getTopCoursesCsv(optionalDurationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top instructors in a csv.' })
  @Get('/top-instructors/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=instructors.csv')
  async GetTopInstructorsCsv(
    @Query() optionalDurationPaginationDto: OptionalDurationPaginationDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    optionalDurationPaginationDto.collegeId = user.collegeId;

    return await this.dashboardService.getTopPerformingInstructorsCsv(optionalDurationPaginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top colleges in a csv.' })
  @Get('/top-colleges/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=colleges.csv')
  async GetTopCollegesCsv(
    @Query() optionalDurationPaginationDto: OptionalDurationPaginationDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    optionalDurationPaginationDto.collegeId = user.collegeId;

    return await this.dashboardService.getTopPerformingCollegesCsv(optionalDurationPaginationDto);
  }
}
