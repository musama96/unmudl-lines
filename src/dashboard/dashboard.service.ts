import { Injectable } from '@nestjs/common';
import ResponseHandler from '../common/ResponseHandler';
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
import * as moment from 'moment';
import { ListDto } from '../common/dto/list.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly coursesService: CoursesService,
    private readonly learnersService: LearnersService,
    private readonly collegesService: CollegesService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboardData(params: GetDashboardDataDto) {
    const revenueResponse = await this.enrollmentsService.getRevenueAnalytics(params);
    const dropResponse = await this.enrollmentsService.getCourseDropAnalytics(params);

    // params.collegeId = params.userCollegeId;
    let totalLearners = { data: null };
    let newLearners = { data: null };
    let newColleges = { data: null };
    let totalColleges = { data: null };
    let topColleges = { data: null };
    let topInstructors = { data: null };

    const newCourses = await this.coursesService.getCoursesCount(params);
    const totalCourses = await this.coursesService.getCoursesCount({ collegeId: params.collegeId });

    if (params.type === 'college') {
      newLearners = await this.learnersService.getAnalyticsCount(params);
      totalLearners = await this.learnersService.getAnalyticsCount({ collegeId: params.collegeId });
    } else {
      newLearners = await this.learnersService.getAnalyticsCountForAdmin(params);
      totalLearners = await this.learnersService.getAnalyticsCountForAdmin();

      newColleges = await this.collegesService.getCollegesCount(params);
      totalColleges = await this.collegesService.getCollegesCount({});
    }

    if (params.isUnmudlAdmin) {
      topColleges = await this.collegesService.getTopColleges(params);
      topInstructors = await this.usersService.getTopInstructors(params);
    }

    // @ts-ignore
    params.start = params.start
      ? params.start
      : new Date(
          moment()
            .subtract(30, 'day')
            .toISOString(),
        );
    // @ts-ignore
    params.end = params.end ? params.end : new Date(moment().toISOString());
    const topCourses = await this.coursesService.getTopCourses(params);
    const courseRefundList = await this.coursesService.getRefundStatistics(params);
    const enrollmentStats = await this.coursesService.getEnrollmentStatistics(params);
    const rejectionRates = await this.coursesService.getHighRejectionCourses(params);

    params.start = params.graphStart;
    params.end = params.graphEnd;
    const graphResponse = await this.enrollmentsService.getRevenueAnalyticsForGraph(params);

    revenueResponse.data.createdAt = moment(revenueResponse.data.createdAt).format('MMMM DD, YYYY');

    return ResponseHandler.success({
      revenue: {
        createdAt: revenueResponse.data.createdAt,
        ...revenueResponse.data,
      },
      dropRate: dropResponse.data,
      revenueGraph: graphResponse.data,
      performanceIndicators: {
        newCourses: newCourses.data,
        totalCourses: totalCourses.data,
        newLearners: newLearners.data,
        totalLearners: totalLearners.data,
        newColleges: newColleges ? newColleges.data : null,
        totalColleges: totalColleges ? totalColleges.data : null,
      },
      topCourses: topCourses.data,
      courseRefundList: courseRefundList.data,
      enrollmentStats: enrollmentStats.data,
      rejectionRatesList: rejectionRates.data,
      topColleges: topColleges.data,
      topInstructors: topInstructors.data,
    });
  }

  async getEarningsData(params: RevenueAnalyticsCountDto) {
    const revenueResponse = await this.enrollmentsService.getRevenueAnalytics(params);
    const dropResponse = await this.enrollmentsService.getCourseDropAnalytics(params);
    params.start = params.graphStart;
    params.end = params.graphEnd;
    const graphResponse = await this.enrollmentsService.getRevenueAnalyticsForGraph(params);

    revenueResponse.data.createdAt = moment(revenueResponse.data.createdAt).format('MMMM DD, YYYY');

    return ResponseHandler.success({
      revenue: {
        createdAt: revenueResponse.data.createdAt,
        ...revenueResponse.data,
      },
      dropRate: dropResponse.data,
      revenueGraph: graphResponse.data,
    });
  }

  async getPerformanceIndicators(params: PerformanceIndicatorsDto) {
    let newLearners;
    let totalLearners;

    params.start = params.learnersStart;
    params.end = params.learnersEnd;
    if (params.collegeId) {
      const newEnrolledCount = await this.learnersService.getAnalyticsCount(params);
      const totalEnrolledCount = await this.learnersService.getAnalyticsCount({ collegeId: params.collegeId });

      newLearners = newEnrolledCount.data;
      totalLearners = totalEnrolledCount.data;
    } else {
      const newCount = await this.learnersService.getAnalyticsCountForAdmin(params);
      const totalCount = await this.learnersService.getAnalyticsCountForAdmin();

      newLearners = newCount.data;
      totalLearners = totalCount.data;
    }

    params.start = params.coursesStart;
    params.end = params.coursesEnd;
    const newCourses = await this.coursesService.getCoursesCount(params);
    const totalCourses = await this.coursesService.getCoursesCount({ collegeId: params.collegeId });

    let newColleges = null;
    let totalColleges = null;
    if (!params.collegeId) {
      params.start = params.collegesStart;
      params.end = params.collegesEnd;
      newColleges = await this.collegesService.getCollegesCount(params);
      totalColleges = await this.collegesService.getCollegesCount({ collegeId: params.collegeId });
    }

    return ResponseHandler.success({
      newLearners,
      totalLearners,
      newCourses: newCourses.data,
      totalCourses: totalCourses.data,
      newColleges: newColleges ? newColleges.data : null,
      totalColleges: totalColleges ? totalColleges.data : null,
    });
  }

  async getTopCourses(params: OptionalDurationPaginationDto | OptionalDurationDto) {
    return this.coursesService.getTopCourses(params);
  }

  async getTopCoursesCsv(params: OptionalDurationPaginationDto | OptionalDurationDto) {
    return this.coursesService.getTopCoursesCsv(params);
  }

  async getTopPerformingColleges(params: OptionalDurationPaginationDto) {
    return this.collegesService.getTopColleges(params);
  }

  async getTopPerformingCollegesCsv(params: OptionalDurationPaginationDto) {
    return this.collegesService.getTopCollegesCsv(params);
  }

  async getTopPerformingInstructors(params: OptionalDurationPaginationDto) {
    return await this.usersService.getTopInstructors(params);
  }

  async getTopPerformingInstructorsCsv(params: OptionalDurationPaginationDto) {
    return await this.usersService.getTopInstructorsCsv(params);
  }

  async getCourseRefundList(params: GetRefundStatisticsDto) {
    return this.coursesService.getRefundStatistics(params);
  }

  async getCourseEnrollmentStatistics(params: GetEnrollmentStatisticsDto) {
    return this.coursesService.getEnrollmentStatistics(params);
  }

  async getCourseRejectionRateList(params: GetHighRejectionCoursesDto) {
    return this.coursesService.getHighRejectionCourses(params);
  }
}
