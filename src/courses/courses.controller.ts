import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Delete,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CoursesService } from './courses.service';
import { EmployersService } from '../employers/employers.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { CreateCourseDto } from './dto/createCourse.dto';
import { EditCourseDto } from './dto/editCourse.dto';
import { CoursesListDto, CourseListStatus } from './dto/coursesList.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { SetEnrollmentCancelledStatusDto } from './dto/setEnrollmentCancelledStatus.dto';
import responseMessages from '../config/responseMessages';
import { ValidPromoDto } from './dto/validPromo.dto';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { TitleDto } from '../common/dto/title.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { GetEnrollmentStatisticsDto } from './dto/getEnrollmentStatistics.dto';
import { GetRefundStatisticsDto } from './dto/getRefundStatistics.dto';
import { GetHighRejectionCoursesDto } from './dto/getHighRejectionCourses.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTypes } from '../activities/activity.model';
import { UserActivities } from '../activities/userActivityCategory.model';
import * as mongoose from 'mongoose';
import { UpdatePublishedStatusDto } from './dto/updatePublishedStatus.dto';
import { COURSES_ATTACHMENTS_PATH, COURSES_IMG_PATH, EMPLOYERS_LOGOS_PATH, COURSE_THUMBNAIL_SIZE } from '../config/config';
import * as moment from 'moment';
import { GetCoursePromosDto } from './dto/getCoursePromos.dto';
import { FollowUpCoursesDto } from './dto/getFollowupCourses.dto';
import { CoursesSectionDataDto } from './dto/coursesSectionData.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { PromosService } from '../promos/promos.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CoursePaginationDto } from './dto/coursePagination.dto';
import { OccupationCodesDto } from './dto/occupationCodes.dto';
import { CoursePromoDataDto } from './dto/coursePromoData.dto';
import { GetAnchorsDto } from './dto/getAnchors.dto';
import { CreateDraftDto } from './dto/createDraft.dto';
import { DraftIdDto } from './dto/draftId.dto';
import { EditDraftDto } from './dto/editDraft.dto';
import { DraftNumIdDto } from './dto/draftNumId.dto';
import { CoursesCsvDto } from './dto/coursesCsv.dto';
import { CopyDraftDto } from './dto/copyDraft.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { userInfo } from 'os';
import { CreateDraftExternalDto } from './dto/createDraftExternal.dto';
import { UpdateDraftExternalDto } from './dto/updateDraftExternal.dto';
import { GetPriceAfterCommissionDto } from './dto/getPriceAfterCommission.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';
import { CancelCourseDto } from './dto/cancelCourse.dto';
import { UsersService } from '../users/users.service';
import { CollegesService } from '../colleges/colleges.service';
import { MailerService } from '@nest-modules/mailer';
import { CourseStatus } from './courses.model';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
const axios = require('axios');
const sharp = require('sharp');
import * as fs from 'fs';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly coursesService: CoursesService,
    private readonly collegesService: CollegesService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly activitiesService: ActivitiesService,
    private readonly employersService: EmployersService,
    private readonly promosService: PromosService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  private readonly logger = new Logger(CoursesController.name);

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get()
  async GetCoursesList(@Query() coursesListDto: CoursesListDto, @GetUser() user): Promise<SuccessInterface> {
    coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
    coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
    coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
    coursesListDto.daysLeft = Number(coursesListDto.daysLeft) ? Number(coursesListDto.daysLeft) : null;
    coursesListDto.minPrice = Number(coursesListDto.minPrice) ? Number(coursesListDto.minPrice) : null;
    coursesListDto.maxPrice = Number(coursesListDto.maxPrice) ? Number(coursesListDto.maxPrice) : null;
    coursesListDto.open = Number(coursesListDto.open) ? Number(coursesListDto.open) : 0;
    coursesListDto.openApplied = coursesListDto.openApplied ? coursesListDto.openApplied : false;
    coursesListDto.rating = coursesListDto.rating ? Number(coursesListDto.rating) : null;
    coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
    coursesListDto.sortOrder = coursesListDto.sortOrder === 'asc' ? '1' : '-1';
    coursesListDto.instructorId = user.role === 'instructor' ? user._id : null;
    coursesListDto.status =
      !coursesListDto.status || coursesListDto.status === CourseListStatus.ALL ? CourseListStatus.PUBLISHED : coursesListDto.status;
    // coursesListDto.courseIds = coursesListDto.courseIds && coursesListDto.courseIds.length > 0 ? coursesListDto.courseIds : null;

    return await this.coursesService.getCourses(coursesListDto, true);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('dropdown')
  async GetCoursesDropdown(@Query() coursesListDto: CoursesListDto, @GetUser() user): Promise<SuccessInterface> {
    coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
    coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
    coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
    coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;

    return await this.coursesService.getCoursesDropdown(coursesListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor', 'recruiter')
  @Get('/employer-portal/dropdown')
  async getCoursesDropdownForEmployerPortal(@Query() coursesListDto: CoursesListDto, @GetUser() user): Promise<SuccessInterface> {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
    coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
    coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
    coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;

    return await this.coursesService.getCoursesDropdownForEmployerPortal(coursesListDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=courses.csv')
  async GetCoursesListCsv(@Query() coursesCsvDto: CoursesCsvDto, @GetUser() user): Promise<SuccessInterface> {
    coursesCsvDto.keyword = coursesCsvDto.keyword ? coursesCsvDto.keyword : '';
    coursesCsvDto.daysLeft = Number(coursesCsvDto.daysLeft) ? Number(coursesCsvDto.daysLeft) : null;
    coursesCsvDto.minPrice = Number(coursesCsvDto.minPrice) ? Number(coursesCsvDto.minPrice) : null;
    coursesCsvDto.maxPrice = Number(coursesCsvDto.maxPrice) ? Number(coursesCsvDto.maxPrice) : null;
    coursesCsvDto.open = Number(coursesCsvDto.open) ? Number(coursesCsvDto.open) : 0;
    coursesCsvDto.openApplied = coursesCsvDto.openApplied ? coursesCsvDto.openApplied : false;
    coursesCsvDto.rating = coursesCsvDto.rating ? Number(coursesCsvDto.rating) : null;
    coursesCsvDto.collegeId = user.collegeId ? user.collegeId : coursesCsvDto.collegeId;
    coursesCsvDto.sortOrder = coursesCsvDto.sortOrder === 'asc' ? '1' : '-1';
    coursesCsvDto.instructorId = user.role === 'instructor' ? user._id : null;
    coursesCsvDto.status = !coursesCsvDto.status || coursesCsvDto.status === 'all' ? '' : coursesCsvDto.status;

    return await this.coursesService.GetCoursesCsv(coursesCsvDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('draft')
  async GetDraftCoursesList(@Query() coursesListDto: CoursesListDto, @GetUser() user): Promise<SuccessInterface> {
    coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
    coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
    coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
    coursesListDto.daysLeft = Number(coursesListDto.daysLeft) ? Number(coursesListDto.daysLeft) : null;
    coursesListDto.minPrice = Number(coursesListDto.minPrice) ? Number(coursesListDto.minPrice) : null;
    coursesListDto.maxPrice = Number(coursesListDto.maxPrice) ? Number(coursesListDto.maxPrice) : null;
    coursesListDto.open = Number(coursesListDto.open) ? Number(coursesListDto.open) : 0;
    coursesListDto.openApplied = coursesListDto.openApplied ? coursesListDto.openApplied : false;
    coursesListDto.rating = coursesListDto.rating ? Number(coursesListDto.rating) : null;
    coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
    coursesListDto.sortOrder = coursesListDto.sortOrder === 'asc' ? '1' : '-1';
    coursesListDto.instructorId = user.role === 'instructor' ? user._id : null;

    return await this.coursesService.getDraftCourses(coursesListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if draft exists.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('draft/external/:draftId')
  async GetDraftCourseForExterbal(@Param() draftIdDto: DraftIdDto, @GetUser() user): Promise<SuccessInterface> {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    return await this.coursesService.getDraftExist(draftIdDto.draftId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('/draft/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=courses.csv')
  async GetDraftCoursesListCsv(@Query() coursesCsvDto: CoursesCsvDto, @GetUser() user): Promise<SuccessInterface> {
    coursesCsvDto.keyword = coursesCsvDto.keyword ? coursesCsvDto.keyword : '';
    coursesCsvDto.daysLeft = Number(coursesCsvDto.daysLeft) ? Number(coursesCsvDto.daysLeft) : null;
    coursesCsvDto.minPrice = Number(coursesCsvDto.minPrice) ? Number(coursesCsvDto.minPrice) : null;
    coursesCsvDto.maxPrice = Number(coursesCsvDto.maxPrice) ? Number(coursesCsvDto.maxPrice) : null;
    coursesCsvDto.open = Number(coursesCsvDto.open) ? Number(coursesCsvDto.open) : 0;
    coursesCsvDto.openApplied = coursesCsvDto.openApplied ? coursesCsvDto.openApplied : false;
    coursesCsvDto.rating = coursesCsvDto.rating ? Number(coursesCsvDto.rating) : null;
    coursesCsvDto.collegeId = user.collegeId ? user.collegeId : coursesCsvDto.collegeId;
    coursesCsvDto.sortOrder = coursesCsvDto.sortOrder === 'asc' ? '1' : '-1';
    coursesCsvDto.instructorId = user.role === 'instructor' ? user._id : null;

    return await this.coursesService.getDraftCoursesCsv(coursesCsvDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete data for courses section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('admin-home')
  async GetCompleteCoursesSectionData(@Query() coursesSectionDataDto: CoursesSectionDataDto, @GetUser() user): Promise<SuccessInterface> {
    coursesSectionDataDto.keyword = coursesSectionDataDto.keyword ? coursesSectionDataDto.keyword : '';
    coursesSectionDataDto.page = Number(coursesSectionDataDto.page) ? Number(coursesSectionDataDto.page) : 1;
    coursesSectionDataDto.perPage = Number(coursesSectionDataDto.perPage) ? Number(coursesSectionDataDto.perPage) : 10;
    coursesSectionDataDto.daysLeft = Number(coursesSectionDataDto.daysLeft) ? Number(coursesSectionDataDto.daysLeft) : null;
    coursesSectionDataDto.minPrice = Number(coursesSectionDataDto.minPrice) ? Number(coursesSectionDataDto.minPrice) : null;
    coursesSectionDataDto.maxPrice = Number(coursesSectionDataDto.maxPrice) ? Number(coursesSectionDataDto.maxPrice) : null;
    coursesSectionDataDto.open = Number(coursesSectionDataDto.open) ? Number(coursesSectionDataDto.open) : 0;
    coursesSectionDataDto.openApplied = coursesSectionDataDto.openApplied ? coursesSectionDataDto.openApplied : false;
    coursesSectionDataDto.rating = coursesSectionDataDto.rating ? coursesSectionDataDto.rating : null;
    coursesSectionDataDto.collegeId = user.collegeId ? user.collegeId : coursesSectionDataDto.collegeId;
    coursesSectionDataDto.sortOrder = coursesSectionDataDto.sortOrder === 'asc' ? '1' : '-1';
    coursesSectionDataDto.instructorId = user.role === 'instructor' ? user._id : null;
    coursesSectionDataDto.status =
      !coursesSectionDataDto.status || coursesSectionDataDto.status === 'all' ? '' : coursesSectionDataDto.status;

    const coursesResponse = await this.coursesService.getCourses(coursesSectionDataDto, true);

    return ResponseHandler.success({
      courses: coursesResponse.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete data for view course section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/admin-home')
  async GetCompleteViewCourseSectionData(@Query() courseIdDto: CourseIdDto, @GetUser() user): Promise<SuccessInterface> {
    const [
      enrolledLearnersResponse,
      enrollmentRequestsData,
      courseData,
      courseRating,
      courseReviews,
      transactionHistory,
    ] = await Promise.all([
      this.enrollmentsService.getApprovedLearnersForCourse({
        courseId: courseIdDto.courseId,
        page: 1,
        perPage: 10,
        sortBy: 'fullname',
        sortOrder: '1',
      }),
      this.enrollmentsService.getCourseEnrollmentRequests({
        courseId: courseIdDto.courseId,
        page: 1,
        perPage: 10,
      }),
      this.coursesService.getCourseData(courseIdDto.courseId),
      this.coursesService.getRatings(courseIdDto.courseId),
      this.coursesService.getReviews(courseIdDto.courseId, user._id, { page: 1, perPage: 10 }),
      this.collegesService.getTransactionActivities({
        courseId: courseIdDto.courseId,
        keyword: '',
        start: new Date(
          moment()
            .subtract(30, 'd')
            .toISOString(),
        ).toISOString(),
        end: new Date().toISOString(),
        page: 1,
        perPage: Infinity,
      }),
    ]);

    const {
      data: { promos, rows },
    } = await this.promosService.getAppliedPromos(
      {
        courseId: courseIdDto.courseId,
        page: 1,
        perPage: 10,
        sortBy: 'title',
        sortOrder: '1',
      },
      courseData.totalPrice,
    );

    return ResponseHandler.success({
      courseData: {
        title: courseData.title,
        autoEnroll: courseData.autoEnroll,
      },
      enrolledLearners: {
        learners: enrolledLearnersResponse.data.learners,
        rows: enrolledLearnersResponse.data.rows,
        ratings: courseRating.ratings,
        overallExperience: {
          // ask haseeb bhai for its criteria
          value: courseRating.satisfiedRating,
          // type: 'satisfied',
        },
        reviewsCount: courseData.reviews.length,
        revenue: {
          total: courseData.totalRevenue,
          college: courseData.collegeRevenue,
          shared: courseData.unmudlRevenue,
        },
      },
      enrollmentRequests: {
        requests: enrollmentRequestsData.enrollmentRequests,
        rows: enrollmentRequestsData.enrollmentRequestsCount,
        enrollmentsAllowed: courseData.enrollmentsAllowed,
        totalEnrollments: enrolledLearnersResponse.data.rows,
        enrollmentDeadline: courseData.enrollmentDeadline,
        courseDates: courseData.date,
      },
      reviewsData: {
        reviews: courseReviews.data,
        rows: courseData.reviews.length,
      },
      promosApplied: {
        promos,
        rows,
        transactionHistory: transactionHistory.data,
      },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics data for view course section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/admin-home/statistics')
  async GetViewCourseStatisticsData(@Query() coursePaginationDto: CoursePaginationDto): Promise<SuccessInterface> {
    coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
    coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;
    coursePaginationDto.sortOrder = coursePaginationDto.sortOrder === 'asc' ? '1' : '-1';

    const [enrolledLearnersResponse, courseData, courseRating] = await Promise.all([
      this.enrollmentsService.getApprovedLearnersForCourse(coursePaginationDto),
      this.coursesService.getCourseData(coursePaginationDto.courseId),
      this.coursesService.getRatings(coursePaginationDto.courseId),
    ]);
    // console.log(courseRating);
    return ResponseHandler.success({
      learners: enrolledLearnersResponse.data.learners,
      rows: enrolledLearnersResponse.data.rows,
      ratings: courseRating.ratings,
      overallExperience: {
        // ask haseeb bhai for its criteria
        value: courseRating.satisfiedRating,
        // type: 'satisfied',
      },
      reviewsCount: courseData.reviews.length,
      revenue: {
        total: courseData.totalRevenue,
        college: courseData.collegeRevenue,
        shared: courseData.unmudlRevenue,
      },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrollments data for view course section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/admin-home/enrollments')
  async GetViewCourseEnrollmentsData(@Query() coursePaginationDto: CoursePaginationDto): Promise<SuccessInterface> {
    coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
    coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;

    const [enrollmentRequestsData, courseData, totalEnrollments] = await Promise.all([
      this.enrollmentsService.getCourseEnrollmentRequests({
        courseId: coursePaginationDto.courseId,
        page: coursePaginationDto.page,
        perPage: coursePaginationDto.perPage,
      }),
      this.coursesService.getCourseData(coursePaginationDto.courseId),
      this.enrollmentsService.getApprovedLearnersForCourseCount(coursePaginationDto),
    ]);

    return ResponseHandler.success({
      requests: enrollmentRequestsData.enrollmentRequests,
      rows: enrollmentRequestsData.enrollmentRequestsCount,
      enrollmentsAllowed: courseData.enrollmentsAllowed,
      totalEnrollments,
      enrollmentDeadline: courseData.enrollmentDeadline,
      courseDates: courseData.date,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews data for view course section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/admin-home/reviews')
  async GetViewCourseReviewsData(@Query() coursePaginationDto: CoursePaginationDto, @GetUser() user): Promise<SuccessInterface> {
    coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
    coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;

    const [courseReviews, rows] = await Promise.all([
      this.coursesService.getReviews(coursePaginationDto.courseId, user._id, {
        page: coursePaginationDto.page,
        perPage: coursePaginationDto.perPage,
      }),
      this.coursesService.getReviewsCount(coursePaginationDto.courseId),
    ]);

    return ResponseHandler.success({
      reviews: courseReviews.data,
      rows,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promos data for view course section on admin panel.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/admin-home/promos')
  async GetViewCoursePromosData(@Query() coursePromoDataDto: CoursePromoDataDto): Promise<SuccessInterface> {
    coursePromoDataDto.page = coursePromoDataDto.page ? Number(coursePromoDataDto.page) : 1;
    coursePromoDataDto.perPage = coursePromoDataDto.perPage ? Number(coursePromoDataDto.perPage) : 10;
    coursePromoDataDto.sortOrder = coursePromoDataDto.sortOrder === 'asc' ? '1' : '-1';

    const [courseData, transactionHistory] = await Promise.all([
      this.coursesService.getCourseData(coursePromoDataDto.courseId),
      this.collegesService.getTransactionActivities({
        courseId: coursePromoDataDto.courseId,
        keyword: '',
        start: coursePromoDataDto.start
          ? coursePromoDataDto.start
          : new Date(
              moment()
                .subtract(1, 'd')
                .toISOString(),
            ).toISOString(),
        end: coursePromoDataDto.end ? coursePromoDataDto.end : new Date().toISOString(),
        page: 1,
        perPage: Infinity,
      }),
    ]);

    const {
      data: { promos, rows },
    } = await this.promosService.getAppliedPromos(coursePromoDataDto, courseData.totalPrice);

    return ResponseHandler.success({
      promos,
      rows,
      transactionHistory: transactionHistory.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available performance outcomes for courses.' })
  @Get('/performace-outcomes')
  @UseGuards(AuthGuard('jwt'))
  async GetPerformance(@Query() keywordDto: KeywordDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    return await this.coursesService.getPerformanceOutcomes(keywordDto.keyword);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for courses.' })
  @Get('/analytics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCoursesAnalytics(@Query() durationDto: OptionalDurationPaginationDto, @GetUser() user) {
    durationDto.page = durationDto.page ? Number(durationDto.page) : 1;
    durationDto.perPage = durationDto.perPage ? Number(durationDto.perPage) : 10;

    return await this.coursesService.getTopCoursesCsv({ ...durationDto, collegeId: user.collegeId });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get new and total courses count.' })
  @Get('/analytics/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCoursesCount(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user) {
    if (analyticsCountDto.type === 'college') {
      analyticsCountDto.collegeId = user.collegeId ? user.collegeId : analyticsCountDto.collegeId;
    } else {
      analyticsCountDto.collegeId = null;
    }
    const newCourses = await this.coursesService.getCoursesCount(analyticsCountDto);
    const totalCourses = await this.coursesService.getCoursesCount({ collegeId: analyticsCountDto.collegeId });

    return ResponseHandler.success({
      newCourses: newCourses.data,
      totalCourses: totalCourses.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for course.' })
  @Get('/analytics/:courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCoursesAnalyticsByCourse(@Param() courseIdDto: CourseIdDto) {
    return await this.coursesService.getCoursesAnalyticsById(courseIdDto.courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course details.' })
  @Get('details')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  async GetCourseDetails(@Query() courseIdDto: CourseIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.coursesService.getCourse(courseIdDto.courseId, user.collegeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course details.' })
  @Get('draft/details')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCourseDraftDetails(@Query() draftIdDto: DraftIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.coursesService.getCourseDraft(draftIdDto.draftId, user.collegeId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course revenue.' })
  @Get('/revenue/:courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetCourseRevenue(@Param() courseIdDto: CourseIdDto): Promise<SuccessInterface> {
    return await this.coursesService.getRevenue(courseIdDto.courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course revenue.' })
  @Get('/reviews/:courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCourseReviews(@Param() courseIdDto: CourseIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.coursesService.getReviews(courseIdDto.courseId, user._id, { page: 1, perPage: 10 });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get valid courses for promo dropdown.' })
  @Get('/promos/valid')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetValidPromoCourses(@Query() validPromoDto: ValidPromoDto, @GetUser() user): Promise<SuccessInterface> {
    validPromoDto.keyword = validPromoDto.keyword ? validPromoDto.keyword : '';
    validPromoDto.promoTitle = validPromoDto.promoTitle ? validPromoDto.promoTitle : '';
    validPromoDto.page = validPromoDto.page ? Number(validPromoDto.page) : 1;
    validPromoDto.perPage = validPromoDto.perPage ? Number(validPromoDto.perPage) : 10;
    validPromoDto.collegeId = user.collegeId ? user.collegeId : validPromoDto.collegeId;

    return await this.coursesService.getValidCoursesForPromo(validPromoDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promos for a course.' })
  @Get('/promos/:courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetPromosForCourse(@Query() getCoursePromosDto: GetCoursePromosDto) {
    const course = await this.coursesService.getCourseDetailsByMongoId(getCoursePromosDto.courseId);

    if (course && course.collegeId) {
      getCoursePromosDto.collegeId = course.collegeId._id;
      getCoursePromosDto.keyword = getCoursePromosDto.keyword ? getCoursePromosDto.keyword : '';
      getCoursePromosDto.page = getCoursePromosDto.page ? getCoursePromosDto.page : 1;
      getCoursePromosDto.perPage = getCoursePromosDto.perPage ? getCoursePromosDto.perPage : 10;

      return await this.coursesService.getPromosForCourse(getCoursePromosDto);
    } else {
      return ResponseHandler.fail('Course information incomplete.');
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course revenue.' })
  @Get('/ratings/:courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetCourseRatings(@Param() courseIdDto: CourseIdDto): Promise<SuccessInterface> {
    const ratings = await this.coursesService.getRatings(courseIdDto.courseId);
    return ResponseHandler.success(ratings);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new performance outcome Tag.' })
  @Post('createPerformaceOutcomeTag')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiConsumes('application/x-www-form-urlencoded')
  async CreatePerformanceOutcome(@Body() titleDto: TitleDto) {
    return await this.coursesService.createPerformanceOutcomeTag(titleDto.title);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set course active status.' })
  @Post('setEnrollmentCancelled')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiConsumes('application/x-www-form-urlencoded')
  async SetEnrollmentCancelledStatus(
    @Body() setEnrollmentCancelledStatusDto: SetEnrollmentCancelledStatusDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    const status = Boolean(setEnrollmentCancelledStatusDto.status);
    const courseId = setEnrollmentCancelledStatusDto.courseId;
    const collegeId = user.collegeId;

    if (collegeId) {
      await this.coursesService.checkIfCourseBelongsToCollege(courseId, collegeId);
    }

    return await this.coursesService.setEnrollmentCancelledStatus(courseId, status);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Post('create')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'attachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async CreateCourse(@Body() createCourseDto: CreateCourseDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    if (createCourseDto.newEmployers && createCourseDto.newEmployers.length > 0) {
      if (files && files.employersLogos) {
        files.employersLogos.forEach((logo, index) => {
          // @ts-ignore
          createCourseDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
        });

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.employersLogos.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
        }
      }
      // @ts-ignore
      const employers = await this.employersService.createEmployers(createCourseDto.newEmployers);
      // @ts-ignore
      createCourseDto.employers = createCourseDto.employers && createCourseDto.employers.length > 0 ? createCourseDto.employers : [];
      employers.forEach(employer => {
        // @ts-ignore
        createCourseDto.employers.push(employer._id);
      });
    }
    if (!user.collegeId && !createCourseDto.collegeId) {
      return ResponseHandler.fail('collegeId is required.');
    }
    createCourseDto.collegeId = user.collegeId ? user.collegeId : createCourseDto.collegeId;

    createCourseDto.coverPhoto =
      files && files.coverPhoto ? COURSES_IMG_PATH + files.coverPhoto[0].filename : createCourseDto.coverPhotoPath;
    // createCourseDto.coverPhotoThumbnail = createCourseDto.coverPhotoPath ? createCourseDto.coverPhotoPath.replace('.', '_t.') : '';
    if (files && files.coverPhoto) {
      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_IMG_PATH, files);
        files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);

        moveFilesToS3(COURSES_IMG_PATH, files);
      }
    }
    //  else if (createCourseDto.coverPhotoPath) {
    //   const coverPhoto = 'public' + createCourseDto.coverPhotoPath;
    //   // console.log(coverPhoto);
    //   await sharp(coverPhoto)
    //     .resize({ height: 400 })
    //     .toFile(coverPhoto.replace('.', '_t.'));
    //   createCourseDto.coverPhotoThumbnail = createCourseDto.coverPhotoPath.replace('.', '_t.');
    // }

    createCourseDto.coverPhotoThumbnail =
      files && files.coverPhotoThumbnail
        ? COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
        : createCourseDto.coverPhotoThumbnailPath;
    if (files && files.coverPhotoThumbnail) {
      await sharp(files.coverPhotoThumbnail[0].path)
        .resize(COURSE_THUMBNAIL_SIZE)
        .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
      createCourseDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_IMG_PATH, files);
        files.coverPhotoThumbnail = [
          {
            ...files.coverPhotoThumbnail[0],
            buffer: await sharp(files.coverPhotoThumbnail[0].path)
              .resize(COURSE_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(COURSES_IMG_PATH, files);
      }
    }

    createCourseDto.attachments = createCourseDto.attachmentPaths ? createCourseDto.attachmentPaths : [];
    if (files && files.attachments) {
      files.attachments.forEach(attachment => {
        createCourseDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
      });

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
      }
    }

    if (createCourseDto.time && createCourseDto.time.length > 0) {
      createCourseDto.time.forEach(time => {
        time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
        time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
      });
    }

    const course = await this.coursesService.createCourse(createCourseDto, user);

    const activities = [
      {
        type: ActivityTypes.User,
        user: mongoose.Types.ObjectId(user._id),
        course: mongoose.Types.ObjectId(course._id),
        userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.UploadCourse)),
      },
    ];

    await Promise.all([
      this.activitiesService.createActivities(activities),
      this.notificationsService.adminEnrollmentDeadlineNotifications(course._id),
    ]);

    return ResponseHandler.success({
      course,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Post('create-draft')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'attachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async CreateCourseDraft(@Body() createDraftDto: CreateDraftDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    if (createDraftDto.newEmployers && createDraftDto.newEmployers.length > 0) {
      if (files && files.employersLogos) {
        files.employersLogos.forEach((logo, index) => {
          // @ts-ignore
          createDraftDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
        });

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.employersLogos.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
        }
      }
      // @ts-ignore
      const employers = await this.employersService.createEmployers(createDraftDto.newEmployers);
      // @ts-ignore
      createDraftDto.employers = createDraftDto.employers && createDraftDto.employers.length > 0 ? createDraftDto.employers : [];
      employers.forEach(employer => {
        // @ts-ignore
        createDraftDto.employers.push(employer._id);
      });
    }
    if (!user.collegeId && !createDraftDto.collegeId) {
      return ResponseHandler.fail('collegeId is required.');
    }
    createDraftDto.collegeId = user.collegeId ? user.collegeId : createDraftDto.collegeId;

    createDraftDto.coverPhoto = files && files.coverPhoto ? COURSES_IMG_PATH + files.coverPhoto[0].filename : createDraftDto.coverPhotoPath;
    if (files && files.coverPhoto) {
      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_IMG_PATH, files);
        files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);

        moveFilesToS3(COURSES_IMG_PATH, files);
      }
    }
    // else if (createDraftDto.coverPhotoPath) {
    //   const coverPhoto = 'public' + createDraftDto.coverPhotoPath;
    //   // console.log(coverPhoto);
    //   await sharp(coverPhoto)
    //     .resize({ height: 400, width: 400 })
    //     .toFile(coverPhoto.replace('.', '_t.'));
    //   createDraftDto.coverPhotoThumbnail = createDraftDto.coverPhotoPath.replace('.', '_t.');
    // }

    createDraftDto.coverPhotoThumbnail =
      files && files.coverPhotoThumbnail
        ? COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
        : createDraftDto.coverPhotoThumbnailPath;
    if (files && files.coverPhotoThumbnail) {
      await sharp(files.coverPhotoThumbnail[0].path)
        .resize(COURSE_THUMBNAIL_SIZE)
        .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
      createDraftDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_IMG_PATH, files);
        files.coverPhotoThumbnail = [
          {
            ...files.coverPhotoThumbnail[0],
            buffer: await sharp(files.coverPhotoThumbnail[0].path)
              .resize(COURSE_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(COURSES_IMG_PATH, files);
      }
    }

    createDraftDto.attachments = [];
    if (files && files.attachments) {
      files.attachments.forEach(attachment => {
        createDraftDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
      });

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(
          files.attachments.map(async attachment => {
            attachment.buffer = fs.readFileSync(attachment.path);
            return null;
          }),
        );

        moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
      }
    }

    if (createDraftDto.time && createDraftDto.time.length > 0) {
      createDraftDto.time.forEach(time => {
        time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
        time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
      });
    }

    const courseDraft = await this.coursesService.createCourseDraft(createDraftDto);

    return ResponseHandler.success({
      courseDraft,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'pragya: External api for pragya to create a course draft.' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/create-draft/external')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'attachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async createCourseDraftExternal(
    @Body() createDraftDto: CreateDraftExternalDto,
    @GetUser() user,
    @UploadedFiles() files,
  ): Promise<SuccessInterface> {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    this.logger.log(`Pragya call for adding course draft. Course Title: ${createDraftDto.title}`);

    const { data: college } = await this.collegesService.getCollegeByOrgId(createDraftDto.orgId);

    if (college) {
      try {
        if (createDraftDto.newEmployers && createDraftDto.newEmployers.length > 0) {
          if (files && files.employersLogos) {
            files.employersLogos.forEach((logo, index) => {
              // @ts-ignore
              createDraftDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
            });

            // S3 uploads
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
              files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
              // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
              await Promise.all(
                files.employersLogos.map(async attachment => {
                  attachment.buffer = fs.readFileSync(attachment.path);
                  return null;
                }),
              );

              moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
            }
          }
          // @ts-ignore
          const employers = await this.employersService.createEmployers(createDraftDto.newEmployers);
          // @ts-ignore
          createDraftDto.employers = createDraftDto.employers && createDraftDto.employers.length > 0 ? createDraftDto.employers : [];
          employers.forEach(employer => {
            // @ts-ignore
            createDraftDto.employers.push(employer._id);
          });
        }
        createDraftDto.coverPhoto =
          files && files.coverPhoto ? COURSES_IMG_PATH + files.coverPhoto[0].filename : createDraftDto.coverPhotoPath;

        createDraftDto.collegeId = college._id;
        if (files && files.coverPhoto) {
          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(COURSES_IMG_PATH, files);
            files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);

            moveFilesToS3(COURSES_IMG_PATH, files);
          }
        }
        //  else if (createDraftDto.coverPhotoPath) {
        //   const coverPhoto = 'public' + createDraftDto.coverPhotoPath;
        //   // console.log(coverPhoto);
        //   await sharp(coverPhoto)
        //     .resize({ height: 400, width: 400 })
        //     .toFile(coverPhoto.replace('.', '_t.'));
        //   createDraftDto.coverPhotoThumbnail = createDraftDto.coverPhotoPath.replace('.', '_t.');
        // }

        createDraftDto.coverPhotoThumbnail =
          files && files.coverPhotoThumbnail
            ? COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
            : createDraftDto.coverPhotoThumbnailPath;
        if (files && files.coverPhotoThumbnail) {
          await sharp(files.coverPhotoThumbnail[0].path)
            .resize(COURSE_THUMBNAIL_SIZE)
            .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
          createDraftDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(COURSES_IMG_PATH, files);
            files.coverPhotoThumbnail = [
              {
                ...files.coverPhotoThumbnail[0],
                buffer: await sharp(files.coverPhotoThumbnail[0].path)
                  .resize(COURSE_THUMBNAIL_SIZE)
                  .toBuffer(),
                filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.'),
              },
            ];

            moveFilesToS3(COURSES_IMG_PATH, files);
          }
        }

        createDraftDto.attachments = [];
        if (files && files.attachments) {
          files.attachments.forEach(attachment => {
            createDraftDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
          });

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
            // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
            await Promise.all(
              files.attachments.map(async attachment => {
                attachment.buffer = fs.readFileSync(attachment.path);
                return null;
              }),
            );

            moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
          }
        }

        if (createDraftDto.time && createDraftDto.time.length > 0) {
          createDraftDto.time.forEach(time => {
            time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
            time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
          });
        }

        const courseDraft = (await this.coursesService.createCourseDraft(createDraftDto)).toObject();

        this.logger.log(`Course draft created. Course Title: ${courseDraft.title} CourseId: ${courseDraft._id}`);

        return ResponseHandler.success({
          courseDraft,
        });
      } catch (e) {
        this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
        return ResponseHandler.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
      }
    } else {
      this.logger.error(`College with orgId: ${createDraftDto.orgId} could not be found.`);
      return ResponseHandler.fail('College not found.');
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'pragya: External api for pragya to update a course draft.' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/update-draft/external')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'attachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async updateCourseDraftExternal(
    @Body() updateDraftExternalDto: UpdateDraftExternalDto,
    @GetUser() user,
    @UploadedFiles() files,
  ): Promise<SuccessInterface> {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    this.logger.log(`Pragya call for updating course draft. Course Title: ${updateDraftExternalDto.title}`);

    const { data: college } = await this.collegesService.getCollegeByOrgId(updateDraftExternalDto.orgId);

    if (college) {
      try {
        if (updateDraftExternalDto.newEmployers && updateDraftExternalDto.newEmployers.length > 0) {
          if (files && files.employersLogos) {
            files.employersLogos.forEach((logo, index) => {
              // @ts-ignore
              updateDraftExternalDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
            });

            // S3 uploads
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
              files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
              // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
              await Promise.all(
                files.employersLogos.map(async attachment => {
                  attachment.buffer = fs.readFileSync(attachment.path);
                  return null;
                }),
              );

              moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
            }
          }
          // @ts-ignore
          const employers = await this.employersService.createEmployers(updateDraftExternalDto.newEmployers);
          // @ts-ignore
          updateDraftExternalDto.employers =
            updateDraftExternalDto.employers && updateDraftExternalDto.employers.length > 0 ? updateDraftExternalDto.employers : [];
          employers.forEach(employer => {
            // @ts-ignore
            updateDraftExternalDto.employers.push(employer._id);
          });
        }
        if (files && files.coverPhoto) {
          updateDraftExternalDto.coverPhoto = COURSES_IMG_PATH + files.coverPhoto[0].filename;

          if (files && files.coverPhoto) {
            // S3 uploads
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
              files = setFilenameAndDestination(COURSES_IMG_PATH, files);
              files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);

              moveFilesToS3(COURSES_IMG_PATH, files);
            }
          }
        } else {
          delete updateDraftExternalDto.coverPhoto;
        }

        updateDraftExternalDto.collegeId = college._id;

        if (files && files.coverPhotoThumbnail) {
          updateDraftExternalDto.coverPhotoThumbnail = COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename;
        } else {
          delete updateDraftExternalDto.coverPhotoThumbnail;
        }

        if (files && files.coverPhotoThumbnail) {
          await sharp(files.coverPhotoThumbnail[0].path)
            .resize(COURSE_THUMBNAIL_SIZE)
            .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
          updateDraftExternalDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(COURSES_IMG_PATH, files);
            files.coverPhotoThumbnail = [
              {
                ...files.coverPhotoThumbnail[0],
                buffer: await sharp(files.coverPhotoThumbnail[0].path)
                  .resize(COURSE_THUMBNAIL_SIZE)
                  .toBuffer(),
                filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.'),
              },
            ];

            moveFilesToS3(COURSES_IMG_PATH, files);
          }
        } else {
          delete updateDraftExternalDto.coverPhotoThumbnail;
        }

        updateDraftExternalDto.attachments = [];
        if (files && files.attachments) {
          files.attachments.forEach(attachment => {
            updateDraftExternalDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
          });

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
            // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
            await Promise.all(
              files.attachments.map(async attachment => {
                attachment.buffer = fs.readFileSync(attachment.path);
                return null;
              }),
            );

            moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
          }
        } else {
          delete updateDraftExternalDto.attachments;
        }

        if (updateDraftExternalDto.time && updateDraftExternalDto.time.length > 0) {
          updateDraftExternalDto.time.forEach(time => {
            time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
            time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
          });
        }

        const { data, message } = await this.coursesService.updateCourseDraft(updateDraftExternalDto);
        const courseDraft = data.toObject();

        this.logger.log(`Course draft updated. Course Title: ${courseDraft.title} CourseId: ${courseDraft._id}`);

        return ResponseHandler.success(courseDraft, message);
      } catch (e) {
        this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
        return ResponseHandler.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
      }
    } else {
      this.logger.error(`College with orgId: ${updateDraftExternalDto.orgId} could not be found.`);
      return ResponseHandler.fail('College not found.');
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Craete draft from existing course.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Post('copy-draft')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async CreateDraftFromCourse(@Body() copyDraftDto: CopyDraftDto, @GetUser() user) {
    return await this.coursesService.createDraftFromCourse(copyDraftDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Post('edit')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'updatedCoverPhoto', maxCount: 1 },
        { name: 'updatedCoverPhotoThumbnail', maxCount: 1 },
        { name: 'uploadedAttachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'updatedCoverPhoto' || file.fieldname === 'updatedCoverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'uploadedAttachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async UpdateCourse(@Body() editCourseDto: EditCourseDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    if (user.collegeId && editCourseDto.collegeId !== user.collegeId.toString()) {
      return ResponseHandler.fail(responseMessages.editCourse.wrongCollege);
    } else {
      if (user.role === 'instructor' && !editCourseDto.instructorIds.includes(user._id.toString())) {
        return ResponseHandler.fail(responseMessages.editCourse.wrongCourse);
      }
      if (editCourseDto.newEmployers && editCourseDto.newEmployers.length > 0) {
        if (files && files.employersLogos) {
          files.employersLogos.forEach((logo, index) => {
            // @ts-ignore
            editCourseDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
          });

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
            // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
            await Promise.all(
              files.employersLogos.map(async attachment => {
                attachment.buffer = fs.readFileSync(attachment.path);
                return null;
              }),
            );

            moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
          }
        }
        // @ts-ignore
        const employers = await this.employersService.createEmployers(editCourseDto.newEmployers);
        // @ts-ignore
        editCourseDto.employers = editCourseDto.employers && editCourseDto.employers.length > 0 ? editCourseDto.employers : [];
        employers.forEach(employer => {
          // @ts-ignore
          editCourseDto.employers.push(employer._id);
        });
      }

      // delete editCourseDto.coverPhotoThumbnail;
      editCourseDto.coverPhotoThumbnail =
        files && files.updatedCoverPhotoThumbnail
          ? COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename
          : editCourseDto.coverPhotoThumbnail;
      if (files && files.updatedCoverPhotoThumbnail) {
        await sharp(files.updatedCoverPhotoThumbnail[0].path)
          .resize(COURSE_THUMBNAIL_SIZE)
          .toFile(files.updatedCoverPhotoThumbnail[0].path.replace('.', '_t.'));
        editCourseDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename).replace('.', '_t.');

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_IMG_PATH, files);
          files.updatedCoverPhotoThumbnail = [
            {
              ...files.updatedCoverPhotoThumbnail[0],
              buffer: await sharp(files.updatedCoverPhotoThumbnail[0].path)
                .resize(COURSE_THUMBNAIL_SIZE)
                .toBuffer(),
              filename: files.updatedCoverPhotoThumbnail[0].filename.replace('.', '_t.'),
            },
          ];

          moveFilesToS3(COURSES_IMG_PATH, files);
        }
      }
      editCourseDto.coverPhoto =
        files && files.updatedCoverPhoto ? COURSES_IMG_PATH + files.updatedCoverPhoto[0].filename : editCourseDto.coverPhoto;
      if (files && files.updatedCoverPhoto) {
        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_IMG_PATH, files);
          files.updatedCoverPhoto[0].buffer = fs.readFileSync(files.updatedCoverPhoto[0].path);

          moveFilesToS3(COURSES_IMG_PATH, files);
        }
      }
      if (files && files.uploadedAttachments) {
        editCourseDto.attachments = editCourseDto.attachments ? editCourseDto.attachments : [];
        files.uploadedAttachments.forEach(attachment => {
          editCourseDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
        });

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.uploadedAttachments.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
        }
      }
      if (editCourseDto.time && editCourseDto.time.length > 0) {
        editCourseDto.time.forEach(time => {
          time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
          time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
        });
      }

      editCourseDto.altTag = editCourseDto.altTag ? editCourseDto.altTag : '';
      editCourseDto.url = editCourseDto.url ? editCourseDto.url : '';
      editCourseDto.instructorDisplayName = editCourseDto.instructorDisplayName ? editCourseDto.instructorDisplayName : '';
      // editCourseDto.followUpCourseId = editCourseDto.followUpCourseId ? editCourseDto.followUpCourseId : '';
      editCourseDto.outline = editCourseDto.outline ? editCourseDto.outline : '';
      editCourseDto.eligibilityRestrictions = editCourseDto.eligibilityRestrictions ? editCourseDto.eligibilityRestrictions : '';
      editCourseDto.attendanceInformation = editCourseDto.attendanceInformation ? editCourseDto.attendanceInformation : '';
      editCourseDto.address = editCourseDto.address ? editCourseDto.address : '';
      editCourseDto.city = editCourseDto.city ? editCourseDto.city : '';
      editCourseDto.zip = editCourseDto.zip ? editCourseDto.zip : '';
      editCourseDto.externalCourseId = editCourseDto.externalCourseId ? editCourseDto.externalCourseId : '';
      // @ts-ignore
      editCourseDto.customSchedule = editCourseDto.customSchedule ? editCourseDto.customSchedule : {};
      editCourseDto.date = editCourseDto.date ? editCourseDto.date : { start: null, end: null };
      editCourseDto.isCollegeRequest = user.collegeId ? true : false;

      const course = await this.coursesService.updateCourse(editCourseDto);

      if (course) {
        const activities = [
          {
            type: ActivityTypes.User,
            user: mongoose.Types.ObjectId(user._id),
            course: mongoose.Types.ObjectId(course._id),
            userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.UpdateCourse)),
          },
        ];

        await Promise.all([
          this.activitiesService.createActivities(activities),
          this.notificationsService.courseEdited(course, user),
          this.notificationsService.adminEnrollmentDeadlineNotifications(course._id),
        ]);

        return ResponseHandler.success({
          course,
        });
      } else {
        return ResponseHandler.fail('Cannot edit course 24 hours before deadline');
      }
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Post('edit-draft')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'updatedCoverPhoto', maxCount: 1 },
        { name: 'updatedCoverPhotoThumbnail', maxCount: 1 },
        { name: 'uploadedAttachments' },
        { name: 'employersLogos' },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'updatedCoverPhoto' || file.fieldname === 'updatedCoverPhotoThumbnail') {
              cb(null, './public/uploads/courses-images/');
            } else if (file.fieldname === 'uploadedAttachments') {
              cb(null, './public/uploads/courses-attachments/');
            } else if (file.fieldname === 'employersLogos') {
              cb(null, './public/uploads/employers-logos/');
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async UpdateCourseDraft(@Body() editDraftDto: EditDraftDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    if (user.collegeId && editDraftDto.collegeId !== user.collegeId.toString()) {
      return ResponseHandler.fail(responseMessages.editCourse.wrongCollege);
    } else {
      if (user.role === 'instructor' && !editDraftDto.instructorIds.includes(user._id.toString())) {
        return ResponseHandler.fail(responseMessages.editCourse.wrongCourse);
      }
      if (editDraftDto.newEmployers && editDraftDto.newEmployers.length > 0) {
        if (files && files.employersLogos) {
          files.employersLogos.forEach((logo, index) => {
            // @ts-ignore
            editDraftDto.newEmployers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
          });

          // S3 uploads
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
            // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
            await Promise.all(
              files.employersLogos.map(async attachment => {
                attachment.buffer = fs.readFileSync(attachment.path);
                return null;
              }),
            );

            moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
          }
        }
        // @ts-ignore
        const employers = await this.employersService.createEmployers(editDraftDto.newEmployers);
        // @ts-ignore
        editDraftDto.employers = editDraftDto.employers && editDraftDto.employers.length > 0 ? editDraftDto.employers : [];
        employers.forEach(employer => {
          // @ts-ignore
          editDraftDto.employers.push(employer._id);
        });
      }

      // delete editDraftDto.coverPhotoThumbnail;
      editDraftDto.coverPhotoThumbnail =
        files && files.updatedCoverPhotoThumbnail
          ? COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename
          : editDraftDto.coverPhotoThumbnail;
      if (files && files.updatedCoverPhotoThumbnail) {
        await sharp(files.updatedCoverPhotoThumbnail[0].path)
          .resize(COURSE_THUMBNAIL_SIZE)
          .toFile(files.updatedCoverPhotoThumbnail[0].path.replace('.', '_t.'));
        editDraftDto.coverPhotoThumbnail = (COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename).replace('.', '_t.');

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_IMG_PATH, files);
          files.updatedCoverPhotoThumbnail = [
            {
              ...files.updatedCoverPhotoThumbnail[0],
              buffer: await sharp(files.updatedCoverPhotoThumbnail[0].path)
                .resize(COURSE_THUMBNAIL_SIZE)
                .toBuffer(),
              filename: files.updatedCoverPhotoThumbnail[0].filename.replace('.', '_t.'),
            },
          ];

          moveFilesToS3(COURSES_IMG_PATH, files);
        }
      }
      editDraftDto.coverPhoto =
        files && files.updatedCoverPhoto ? COURSES_IMG_PATH + files.updatedCoverPhoto[0].filename : editDraftDto.coverPhoto;
      if (files && files.updatedCoverPhoto) {
        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_IMG_PATH, files);
          files.updatedCoverPhoto[0].buffer = fs.readFileSync(files.updatedCoverPhoto[0].path);

          moveFilesToS3(COURSES_IMG_PATH, files);
        }
      }
      if (files && files.uploadedAttachments) {
        editDraftDto.attachments = editDraftDto.attachments ? editDraftDto.attachments : [];
        files.uploadedAttachments.forEach(attachment => {
          editDraftDto.attachments.push(COURSES_ATTACHMENTS_PATH + attachment.filename);
        });

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          files = setFilenameAndDestination(COURSES_ATTACHMENTS_PATH, files);
          // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
          await Promise.all(
            files.uploadedAttachments.map(async attachment => {
              attachment.buffer = fs.readFileSync(attachment.path);
              return null;
            }),
          );

          moveFilesToS3(COURSES_ATTACHMENTS_PATH, files);
        }
      }
      if (editDraftDto.time && editDraftDto.time.length > 0) {
        editDraftDto.time.forEach(time => {
          time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
          time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
        });
      }

      editDraftDto.altTag = editDraftDto.altTag ? editDraftDto.altTag : '';
      editDraftDto.url = editDraftDto.url ? editDraftDto.url : '';
      editDraftDto.instructorDisplayName = editDraftDto.instructorDisplayName ? editDraftDto.instructorDisplayName : '';
      // editDraftDto.followUpCourseId = editDraftDto.followUpCourseId ? editDraftDto.followUpCourseId : '';
      editDraftDto.outline = editDraftDto.outline ? editDraftDto.outline : '';
      editDraftDto.eligibilityRestrictions = editDraftDto.eligibilityRestrictions ? editDraftDto.eligibilityRestrictions : '';
      editDraftDto.attendanceInformation = editDraftDto.attendanceInformation ? editDraftDto.attendanceInformation : '';
      editDraftDto.address = editDraftDto.address ? editDraftDto.address : '';
      editDraftDto.city = editDraftDto.city ? editDraftDto.city : '';
      editDraftDto.zip = editDraftDto.zip ? editDraftDto.zip : '';
      editDraftDto.externalCourseId = editDraftDto.externalCourseId ? editDraftDto.externalCourseId : '';
      // @ts-ignore
      editDraftDto.customSchedule = editDraftDto.customSchedule ? editDraftDto.customSchedule : {};
      editDraftDto.date = editDraftDto.date ? editDraftDto.date : { start: null, end: null };

      const draft = await this.coursesService.updateDraft(editDraftDto);

      if (draft) {
        return ResponseHandler.success({
          draft,
        });
      } else {
        return ResponseHandler.fail('Cannot edit draft 24 hours before deadline');
      }
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a course and cancel all enrollments with full refund.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Post('/cancel/:courseId')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async cancelCourse(@Param() courseIdDto: CourseIdDto, @Body() cancelCourseDto: CancelCourseDto, @GetUser() user) {
    try {
      const authorized = await this.usersService.validateUserForLogin({
        emailAddress: user.emailAddress,
        password: cancelCourseDto.password,
      });

      if (authorized) {
        this.logger.log(`Canceling course: ${courseIdDto.courseId}`);
        this.logger.log(`Calling cancel all enrollments method.`);
        const {
          data: { canceledEnrollments },
        } = await this.enrollmentsService.cancelAllEnrollmentsForCourse(courseIdDto.courseId);
        this.logger.log(`Calling cancel course.`);
        const { data: course } = await this.coursesService.cancelCourse(courseIdDto.courseId, cancelCourseDto.reasons, user._id);
        this.logger.log('Sending mails to admins and learners.');
        const { data: admins } = await this.collegesService.getCollegeAdminsForEmail(user.collegeId);

        const learners = canceledEnrollments.map(async enrollment => {
          enrollment.refundAmount = Number(enrollment.totalPaid.toFixed(2)).toLocaleString();
          try {
            const mailData = {
              to: enrollment.learnerId.emailAddress,
              from: process.env.LEARNER_NOTIFICATION_FROM,
              subject: `We're sorry - your Unmudl course has been cancelled`,
              template: 'cancelCourseLearner',
              context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                enrollment,
                cancelReasons: cancelCourseDto.reasons,
              },
            };
            const mail = await this.mailerService.sendMail(mailData);

            mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;
            // tslint:disable-next-line: no-empty
          } catch (e) {}

          return {
            ...enrollment.learnerId,
            refundAmount: Number(enrollment.totalPaid.toFixed(2)).toLocaleString(),
            collegeId: user.collegeId.toString(),
          };
        });

        try {
          admins.forEach(async admin => {
            const mailData = {
              to: admin.emailAddress,
              from: process.env.PARTNER_NOTIFICATION_FROM,
              subject: 'Unmudl course cancellation successful',
              template: 'cancelCourseAdmin',
              context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                learners,
                admin,
                course,
              },
            };
            const mail = await this.mailerService.sendMail(mailData);

            mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;
          });
        } catch (e) {
          return ResponseHandler.fail(e.response ? (e.response.message ? e.response.message : e.response) : e.message);
        }

        return ResponseHandler.success({ canceledEnrollments, course }, 'Course canceled and all enrollments refunded successfully.');
      } else {
        return ResponseHandler.fail('Invalid password.');
      }
    } catch (e) {
      return ResponseHandler.fail(e.response ? e.response.message : e.message);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course enrollment statistics.' })
  @Get('/enrollment-statistics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetEnrollmentStatistics(@Query() getEnrollmentStatisticsDto: GetEnrollmentStatisticsDto, @GetUser() user) {
    getEnrollmentStatisticsDto.collegeId = user.collegeId;
    return await this.coursesService.getEnrollmentStatistics(getEnrollmentStatisticsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses to set followupCourse.' })
  @Get('followup')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetFollowupCourses(@Query() followUpCoursesDto: FollowUpCoursesDto, @GetUser() user) {
    followUpCoursesDto.keyword = followUpCoursesDto.keyword ? followUpCoursesDto.keyword : '';
    followUpCoursesDto.perPage = Number(followUpCoursesDto.perPage) ? Number(followUpCoursesDto.perPage) : 10;
    // @ts-ignore
    followUpCoursesDto.collegeId = user.collegeId ? user.collegeId : '';

    return await this.coursesService.getFollowUpCourses(followUpCoursesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course refund statistics.' })
  @Get('/refund-statistics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetRefundStatistics(@Query() getRefundStatisticsDto: GetRefundStatisticsDto, @GetUser() user) {
    getRefundStatisticsDto.collegeId = user.collegeId;
    return await this.coursesService.getRefundStatistics(getRefundStatisticsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course rejection rate statistics.' })
  @Get('/rejection-statistics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetHighRejectionCourses(@Query() getHighRejectionCoursesDto: GetHighRejectionCoursesDto, @GetUser() user) {
    getHighRejectionCoursesDto.collegeId = user.collegeId;
    return await this.coursesService.getHighRejectionCourses(getHighRejectionCoursesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course published status.' })
  @Post('update-published')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateCoursePublishedStatus(@Body() updatePublishedStatusDto: UpdatePublishedStatusDto, @GetUser() user) {
    // @ts-ignore
    updatePublishedStatusDto.unpublishedBy = updatePublishedStatusDto.status === CourseStatus.UNPUBLISH ? user._id : null;
    // @ts-ignore
    updatePublishedStatusDto.unpublishedDate = updatePublishedStatusDto.status === CourseStatus.UNPUBLISH ? new Date().toISOString() : null;

    return await this.coursesService.updateCoursePublishedStatus(updatePublishedStatusDto);
  }

  @Get('occupations')
  async GetOccupations(@Query() paginationDto: PaginationDto) {
    if (!paginationDto.keyword) {
      return ResponseHandler.fail('keyword is required');
    }
    const response = await axios.get('https://services.onetcenter.org/ws/mnm/search', {
      auth: {
        username: process.env.ONET_API_USER,
        password: process.env.ONET_API_PASSWORD,
      },
      params: {
        keyword: paginationDto.keyword,
        end: paginationDto.perPage ? Number(paginationDto.perPage) : 20,
      },
    });
    return ResponseHandler.success(response.data.career);
  }

  @Get('certifications')
  async GetCertifications(@Query() paginationDto: PaginationDto) {
    try {
      if (!paginationDto.keyword) {
        return ResponseHandler.fail('keyword is required');
      } // console.log(process.env.CAREER_ONE_STOP_TOKEN)
      // /v1/certificationfinder/{userId}/{keyword}/{directFlag}/{industry}/{certType}/{organization}/{occupation}/
      // {agency}/{sortColumn}/{sortDirections}/{startRecord}/{limitRecord}
      const response = await axios.get(
        `https://api.careeronestop.org/v1/certificationfinder/${process.env.CAREER_ONE_STOP_USER_ID}/${
          paginationDto.keyword
        }/0/0/0/0/0/0/Name/0/0/${paginationDto.perPage ? Number(paginationDto.perPage) : 20}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CAREER_ONE_STOP_TOKEN}`,
          },
        },
      );
      const list = response.data.CertList.map(certificate => {
        return {
          Id: certificate.Id,
          Name: certificate.Name,
          Organization: certificate.Organization,
          Description: certificate.Description,
        };
      });
      return ResponseHandler.success(list, 'Successfull request');
    } catch (err) {
      return ResponseHandler.fail('', err);
    }
  }

  @Get('licenses')
  async GetLicenses(@Query() paginationDto: PaginationDto) {
    try {
      if (!paginationDto.keyword) {
        return ResponseHandler.fail('keyword is required');
      } // console.log(process.env.CAREER_ONE_STOP_TOKEN)
      // /v1/license/{userId}/{keyword}/{location}/{sortColumns}/{sortDirections}/{startRecord}/{limitRecord}
      const response = await axios.get(
        `https://api.careeronestop.org/v1/license/${process.env.CAREER_ONE_STOP_USER_ID}/${paginationDto.keyword}/US/0/0/0/${
          paginationDto.perPage ? Number(paginationDto.perPage) : 20
        }/?searchMode=literal`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CAREER_ONE_STOP_TOKEN}`,
          },
        },
      );
      return ResponseHandler.success(response.data.LicenseList, 'Successfull request');
    } catch (err) {
      return ResponseHandler.fail('', err);
    }
  }

  @Get('occupations/details')
  async GetOccupationDetails(@Query() occupationCodesDto: OccupationCodesDto) {
    try {
      const promises = occupationCodesDto.occupationCodes.map(code => {
        return axios.get(`https://services.onetcenter.org/ws/online/occupations/${code}/details/`, {
          auth: {
            username: process.env.ONET_API_USER,
            password: process.env.ONET_API_PASSWORD,
          },
        });
      });

      const data = await Promise.all(promises);
      const { knowledge, skills, experience } = this.coursesService.mergeArrays(...data);
      const prefillKnowledge = knowledge
        .filter(item => item.score.value > 50)
        .sort((a, b) => b.score.value - a.score.value)
        .slice(0, 7);
      const prefillSkills = skills
        .filter(item => item.score.value > 50)
        .sort((a, b) => b.score.value - a.score.value)
        .slice(0, 7);
      const prefillExperience = experience.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 7);
      return ResponseHandler.success({ prefillKnowledge, knowledge, prefillSkills, skills, prefillExperience, experience });
    } catch (e) {
      return ResponseHandler.fail(e.message);
    }
  }

  @Get('occupations/test')
  async GetOccupationTests(@Query() paginationDto: PaginationDto) {
    const response = await axios.get('https://services.onetcenter.org/ws/online/occupations/17-2051.00/details/', {
      auth: {
        username: process.env.ONET_API_USER,
        password: process.env.ONET_API_PASSWORD,
      },
      params: {
        // keyword: paginationDto.keyword,
        // end: paginationDto.perPage ? Number(paginationDto.perPage) : 20,
      },
    });
    return ResponseHandler.success(response.data);
  }

  @Get('level-anchors')
  async GetLevelAnchors(@Query() getAnchorsDto: GetAnchorsDto) {
    getAnchorsDto.limit = getAnchorsDto.limit ? Number(getAnchorsDto.limit) : 3;

    return await this.coursesService.getLevelAnchors(getAnchorsDto);
  }

  @Get('cip-certificates')
  async GetCipCertificates(@Query() paginationDto: PaginationDto) {
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 8;

    return this.coursesService.getCipCertificates(paginationDto);
  }

  @ApiOperation({ summary: 'Get course details.' })
  @Get('draft/preview/:draftId')
  async GetDraftPeview(@Param() draftIdDto: DraftNumIdDto) {
    const [course /*, enrollmentsCount, ratings*/] = await Promise.all([
      this.coursesService.getDraftDetails(draftIdDto.draftId),
      // this.enrollmentsService.getCourseEnrollmentsCount(draftIdDto.draftId),
      // this.coursesService.getRatingsById(draftIdDto.draftId, true),
    ]);
    course.reviewsCount = 0; // course.reviews.length;
    // course.reviews.splice(2);

    if (course.time && course.time[0]) {
      course.time[0].hours = moment(course.time[0].end).diff(moment(course.time[0].start), 'hours');
    }

    let prevRatings = null;
    if (course /*&& course.reviews.length < 1*/ && course.followUpCourseId && course.followUpCourseId._id) {
      prevRatings = await this.coursesService.getRatingsById(course.followUpCourseId.numId, true);
      course.followUpCourseId.reviewsCount = course.followUpCourseId.reviews ? course.followUpCourseId.reviews.length : 0;
      course.followUpCourseId.reviews.splice(2);
    }
    // console.log(req);
    let enrollmentStatus = null;
    let enrollmentId = null;
    // course.availableSlots = course.enrollmentsAllowed - enrollmentsCount;
    course.coursePrice = course.price + (course.collegeId.unmudlShare / 100) * course.price;
    course.salesTax = course.collegeId.salesTax;
    course.totalPrice = course.coursePrice;
    course.totalPriceWithTax = course.coursePrice + (course.collegeId.salesTax / 100) * course.coursePrice;
    delete course.price;
    const instructorRating = course.instructorIds[0] ? await this.coursesService.getInstructorRatings(course.instructorIds[0]._id) : null;
    course.instructor = course.instructorIds[0];
    delete course.instructorIds;

    if (course.instructor) {
      course.instructor.rating = instructorRating ? instructorRating.rating : null;
      course.instructor.reviewsCount = instructorRating ? instructorRating.reviewsCount : 0;
    }

    course.enrollmentStatus = enrollmentStatus;
    course.enrollmentId = enrollmentId;
    course.ratingDetails = prevRatings ? prevRatings : null; // ratings;
    course.college = course.collegeId;
    delete course.collegeId;
    return course
      ? ResponseHandler.success({
          course,
        })
      : ResponseHandler.fail(responseMessages.common.invalidCourseId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete unpublished course with no enrollment.' })
  @Delete(':courseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  async DeleteCourse(@Param() courseIdDto: CourseIdDto, @GetUser() user) {
    return await this.coursesService.deleteCourse(courseIdDto.courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of courses.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor')
  @Get('price-with-commission')
  async getCoursePriceWithCommission(@Query() getPriceAfterCommissionDto: GetPriceAfterCommissionDto, @GetUser() user) {
    getPriceAfterCommissionDto.collegeId = user.collegeId ? user.collegeId : getPriceAfterCommissionDto.collegeId;
    return await this.coursesService.getCoursePriceAfterCommission(getPriceAfterCommissionDto);
  }

  @ApiOperation({ summary: 'Get course categories.' })
  @Get('categories')
  async getCourseCategories(@Query() keywordDto: KeywordDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
    return await this.coursesService.getCourseCategories(keywordDto.keyword);
  }

  // @Get('resizeThumbnails')
  // async ResizeThumbnails() {
  //   // return await this.coursesService.resizeThumbnails();
  //   return await this.coursesService.updateCategories();
  // }
}
