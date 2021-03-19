import { Controller, Get, Query, UseGuards, Header, Body, Post } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnerTokensService } from './learnerTokens.service';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetCountDto } from '../common/dto/getCount.dto';
import { ReportedLearnersService } from '../reported-learners/reported-learners.service';
import { GetUser } from '../auth/get-user.decorator';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { LearnerAnalyticsCountDto } from './dto/learnerAnalyticsCount.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LearnerDetailsDto } from '../enrollments/dto/learnerDetails.dto';
import { LearnersListDto } from '../common/dto/learnersList.dto';
import { EnrollmentLearnersListDto } from './dto/enrollmentLearnersList.dto';
import { LearnersSectionAdminDto } from './dto/LearnersSectionAdmin.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { SuspendLearnerDto } from '../enrollments/dto/suspendLearner.dto';
import { UpdateSuspendLearnerDto } from './dto/updateSuspend.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';

@ApiTags('Learners (Admin Portal)')
@Controller('/admins/learners')
export class LearnersAdminController {
  constructor(
    private readonly learnersService: LearnersService,
    private readonly learnerTokenService: LearnerTokensService,
    private readonly reportedLearnersService: ReportedLearnersService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Report a learner.' })
  // @Post('report')
  // @HttpCode(200)
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin', 'manager', 'moderator')
  // async ReportLearner(@Body() reportLearnerDto: ReportLearnerDto, @GetUser() user): Promise<SuccessInterface> {
  //   reportLearnerDto.collegeId = user.collegeId;
  //   reportLearnerDto.status = 'pending';
  //   reportLearnerDto.userId = user._id;

  //   return await this.reportedLearnersService.reportLearner(reportLearnerDto);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a count of learners enrolled for learners dashboard.' })
  @Get('/dashboard/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetLearnersEnrolledCountAnalytics(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    if (analyticsCountDto.type === 'college') {
      analyticsCountDto.collegeId = user.collegeId ? user.collegeId : analyticsCountDto.collegeId;
    } else {
      analyticsCountDto.collegeId = null;
    }

    if (analyticsCountDto.collegeId) {
      const newEnrolledCount = await this.learnersService.getAnalyticsCount(analyticsCountDto);
      const totalEnrolledCount = await this.learnersService.getAnalyticsCount({ collegeId: analyticsCountDto.collegeId });

      return ResponseHandler.success({
        newLearners: newEnrolledCount.data,
        totalLearners: totalEnrolledCount.data,
      });
    } else {
      const newCount = await this.learnersService.getAnalyticsCountForAdmin(analyticsCountDto);
      const totalCount = await this.learnersService.getAnalyticsCountForAdmin();

      return ResponseHandler.success({
        newLearners: newCount.data,
        totalLearners: totalCount.data,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('admin-home')
  async GetLearnersSectionForAdminPanel(@Query() learnersSectionAdminDto: LearnersSectionAdminDto, @GetUser() user) {
    learnersSectionAdminDto.collegeId = user.collegeId;

    learnersSectionAdminDto.start = learnersSectionAdminDto.graphStart;
    learnersSectionAdminDto.end = learnersSectionAdminDto.graphEnd;
    const growth = await this.enrollmentsService.getLearnersGrowth(learnersSectionAdminDto);

    learnersSectionAdminDto.start = learnersSectionAdminDto.learnersStart;
    learnersSectionAdminDto.end = learnersSectionAdminDto.learnersEnd;
    const newLearners = await this.learnersService.getAnalyticsCount(learnersSectionAdminDto);
    learnersSectionAdminDto.start = null;
    learnersSectionAdminDto.end = null;
    const totalLearners = await this.learnersService.getAnalyticsCount(learnersSectionAdminDto);

    learnersSectionAdminDto.keyword = learnersSectionAdminDto.keyword ? learnersSectionAdminDto.keyword : '';
    learnersSectionAdminDto.sortOrder = learnersSectionAdminDto.sortOrder === 'asc' ? '1' : '-1';
    learnersSectionAdminDto.sortBy = learnersSectionAdminDto.sortBy ? learnersSectionAdminDto.sortBy : 'createdAt';
    const learners = learnersSectionAdminDto.collegeId
      ? await this.learnersService.getLearnersByCollege(learnersSectionAdminDto)
      : await this.learnersService.getLearnersForAdmin(learnersSectionAdminDto);

    return ResponseHandler.success({
      growth: growth.data,
      enrollments: {
        new: newLearners.data,
        total: totalLearners.data,
      },
      learners: learners.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a count of learners enrolled/sign ups for analytics.' })
  @Get('/analytics/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetLearnersEnrolledCountAnalyticsForAdmin(
    @Query() learnerAnalyticsCountDto: LearnerAnalyticsCountDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    if (learnerAnalyticsCountDto.type === 'college') {
      learnerAnalyticsCountDto.collegeId = user.collegeId ? user.collegeId : learnerAnalyticsCountDto.collegeId;
    } else {
      learnerAnalyticsCountDto.collegeId = null;
    }

    if (learnerAnalyticsCountDto.enrolled) {
      const newCount = await this.learnersService.getAnalyticsCount(learnerAnalyticsCountDto);
      const totalCount = await this.learnersService.getAnalyticsCount({ collegeId: learnerAnalyticsCountDto.collegeId });

      return ResponseHandler.success({
        newCount: newCount.data,
        totalCount: totalCount.data,
      });
    } else {
      const newCount = await this.learnersService.getAnalyticsCountForAdmin(learnerAnalyticsCountDto);
      const totalCount = await this.learnersService.getAnalyticsCountForAdmin();

      return ResponseHandler.success({
        newCount: newCount.data,
        totalCount: totalCount.data,
      });
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a count of learners enrolled between a start date and end date.' })
  @Get('count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetLearnersEnrolledCount(@Query() getCountDto: GetCountDto, @GetUser() user): Promise<SuccessInterface> {
    getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
    return await this.learnersService.getCount(getCountDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the growth of learners between start date and end date in day, month or year intervals.' })
  @Get('growth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetUserGrowthStats(@Query() getCountDto: GetCountDto, @GetUser() user): Promise<SuccessInterface> {
    getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
    return await this.enrollmentsService.getLearnersGrowth(getCountDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the growth of learners between start date and end date in day, month or year intervals.' })
  @Get('/growth/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetUserGrowthStatsCsv(@Query() getCountDto: GetCountDto, @GetUser() user): Promise<SuccessInterface> {
    getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
    return await this.enrollmentsService.getLearnersGrowthCsv(getCountDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a paginated list of un approved learners enrolled in a college or a course.' })
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async getLearnersByCollege(@Query() listDto: LearnersListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword && listDto.keyword !== 'undefined' ? listDto.keyword : '';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    if (listDto.courseId) {
      return await this.learnersService.getLearnersByCourse(listDto);
    } else {
      return listDto.collegeId
        ? await this.learnersService.getLearnersByCollege(listDto)
        : await this.learnersService.getLearnersForAdmin(listDto);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get learner details for learner profile view.' })
  @Get('details')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async GetLearnerDetails(@Query() learnerDetailsDto: LearnerDetailsDto, @GetUser() user): Promise<SuccessInterface> {
    learnerDetailsDto.collegeId = user.collegeId ? user.collegeId : learnerDetailsDto.collegeId;
    return await this.learnersService.getLearnerDetails(learnerDetailsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a paginated list of all approved learners enrolled in a college or a course.' })
  @Get('approved')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  async getApprovedLearnersByCollege(@Query() listDto: EnrollmentLearnersListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;

    if (listDto.courseId) {
      return await this.learnersService.getLearnersByCourse(listDto, 'true');
    } else {
      return await this.learnersService.getLearnersByCollege(listDto, 'true');
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a csv file with a list of learners enrolled in a college or a course.' })
  @Get('csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=courses.csv')
  async getLearnersByCollegeCsv(@Query() listDto: LearnersListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword && listDto.keyword !== 'undefined' ? listDto.keyword : '';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    if (listDto.courseId) {
      return await this.learnersService.getLearnersByCourseCsv(listDto);
    } else {
      if (listDto.collegeId) {
        return await this.learnersService.getLearnersByCollegeCsv(listDto);
      } else {
        return await this.learnersService.getLearnersForUnmudlAdminCsv(listDto);
      }
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend/unsuspend learner.' })
  @Post('suspend')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator')
  @RestrictCollegeUser()
  async SuspendLearner(@Body() suspendLearnerDto: UpdateSuspendLearnerDto, @GetUser() user) {
    return await this.learnersService.updateSuspend(suspendLearnerDto);
  }
}
