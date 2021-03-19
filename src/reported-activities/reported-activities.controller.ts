import { Body, Controller, Get, HttpCode, Post, Query, UseGuards, Param } from '@nestjs/common';
import { ReportedActivitiesService } from './reported-activities.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportedActivitiesListDto } from './dto/reportedActivitiesList.dto';
import { AddReportDto } from './dto/addReport.dto';
import { GetUser } from '../auth/get-user.decorator';
import { CoursesService } from '../courses/courses.service';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { ReportedActivityIdDto } from '../common/dto/reportedActivityId.dto';
import { ResolveReportedActivityDto, ResolveReportedActivityStatusEnum } from './dto/resolveReportedActivity.dto';
import { LearnersService } from '../learners/learners.service';

@ApiTags('Reported Activities (Admin Panel)')
@Controller('reported-activities')
export class ReportedActivitiesController {
  constructor(
    private readonly reportedActivitiesService: ReportedActivitiesService,
    private readonly learnersService: LearnersService,
    private readonly coursesService: CoursesService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a list of reported activities with pagination.' })
  @Get()
  async GetReportedActivities(@Query() reportedActivitiesListDto: ReportedActivitiesListDto): Promise<SuccessInterface> {
    reportedActivitiesListDto.sortOrder = reportedActivitiesListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.reportedActivitiesService.getReportedActivities(reportedActivitiesListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get details of a reported activity.' })
  @Get('/details/:reportedActivityId')
  async GetReportedActivityDetails(@Param() reportedActivityIdDto: ReportedActivityIdDto): Promise<SuccessInterface> {
    return await this.reportedActivitiesService.getReportedActivityDetails(reportedActivityIdDto.reportedActivityId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Add a reported activity (college).' })
  @Post('college')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddReportedActivityByCollege(@Body() addReportDto: AddReportDto, @GetUser() user): Promise<SuccessInterface> {
    const reviewResp = await this.coursesService.getReviewById(addReportDto.reviewId);

    if (reviewResp.data) {
      const review = reviewResp.data;

      addReportDto.reportedLearnerId = review.learner;
      addReportDto.reportingCollegeId = user.collegeId;
      addReportDto.reportingUserId = user._id;
      addReportDto.reportDate = new Date();
      addReportDto.reviewDate = review.dateAdded;
      addReportDto.status = 'pending';
      addReportDto.comment = review.review;

      return await this.reportedActivitiesService.addReport(addReportDto);
    } else {
      return ResponseHandler.fail('Review not found.');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Add a reported activity (college).' })
  @Post('resolve')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async ResolveReportedActivity(
    @Body() resolveReportedActivityDto: ResolveReportedActivityDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    const report = await this.reportedActivitiesService.updateReportStatus(resolveReportedActivityDto);

    if (resolveReportedActivityDto.status === ResolveReportedActivityStatusEnum.SUSPENDED) {
      await this.learnersService.blacklistLearner(report.data.learnerId);
    }
    // actions on warning and suspend remaining
    // will complete it when we get further information

    return ResponseHandler.success({
      report: report.data,
    });
  }
}
