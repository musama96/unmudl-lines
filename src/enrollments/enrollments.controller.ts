import { Body, Controller, Get, Header, HttpCode, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { EnrollmentsService } from './enrollments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCSVDto } from '../common/dto/getCSV.dto';
import { GetCountDto } from '../common/dto/getCount.dto';
import { SuspendLearnerDto } from './dto/suspendLearner.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { ChangeEnrollmentStatusDto } from './dto/changeEnrollmentStatus.dto';
import { EnrollmentIdDto } from '../common/dto/enrollmentId.dto';
import { RejectEnrollmentDto } from './dto/rejectEnrollment.dto';
import { LearnersService } from '../learners/learners.service';
import { UpdateLearnerEnrollmentActivityDto } from './dto/updateLearnerEnrollmentActivity.dto';
import { TransferPaymentDto } from './dto/transferPayment.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService, private readonly learnersService: LearnersService) {}

  logger = new Logger(EnrollmentsController.name);

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change learner enrollment status.' })
  @Post('/learners/reject-enrollment/:enrollmentId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiConsumes('application/x-www-form-urlencoded')
  async rejectEnrollment(@Body() rejectEnrollmentDto: RejectEnrollmentDto, @Param() enrollmentIdDto: EnrollmentIdDto, @GetUser() user) {
    return await this.enrollmentsService.rejectEnrollment(rejectEnrollmentDto, enrollmentIdDto.enrollmentId, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'pragya: Change learner enrollment status.' })
  @Post('/learners/reject-enrollment/:enrollmentId/external')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  // @Roles('api')
  @ApiConsumes('application/x-www-form-urlencoded')
  async rejectEnrollmentByExternalUser(
    @Body() rejectEnrollmentDto: RejectEnrollmentDto,
    @Param() enrollmentIdDto: EnrollmentIdDto,
    @GetUser() user,
  ) {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }
    try {
      this.logger.log(`Pragya call for reject learner enrollment. Enrollment Id: ${enrollmentIdDto.enrollmentId}`);
      const { data, message } = await this.enrollmentsService.rejectEnrollment(rejectEnrollmentDto, enrollmentIdDto.enrollmentId, user);
      this.logger.log('Enrollment rejected successfully.');
      return ResponseHandler.success(data, message);
    } catch (e) {
      this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change learner enrollment status.' })
  @Post('/learners/change-status')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiConsumes('application/x-www-form-urlencoded')
  async ChangeLearnerEnrollmentStatus(
    @Body() changeEnrollmentStatusDto: ChangeEnrollmentStatusDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    /*const collegeId = user.collegeId;

    if (collegeId) {
      const response = await this.coursesService.checkIfCourseBelongsToCollege(changeEnrollmentStatusDto.courseId, collegeId);
      if (!response.success) {
        return response;
      }
    }

    let activityType = '';
    if (changeEnrollmentStatusDto.status === EnrollmentStatus.APPROVED) {
      activityType = TransactionActivities.EnrollmentApproved;
    } else if (changeEnrollmentStatusDto.status === EnrollmentStatus.DECLINED) {
      activityType = TransactionActivities.EnrollmentDeclined;
    } else if (changeEnrollmentStatusDto.status === EnrollmentStatus.REFUNDED) {
      activityType = TransactionActivities.EnrollmentRefunded;
    }
    const activities = [{
      type: ActivityTypes.Transaction,
      user: mongoose.Types.ObjectId(user._id),
      learnerId: changeEnrollmentStatusDto.learnerId,
      enrollment: mongoose.Types.ObjectId(changeEnrollmentStatusDto.courseId),
      transactionActivity:
      mongoose.Types.ObjectId(await this.activitiesService.getTransactionActivityId(activityType)),
    }];

    await this.activitiesService.createActivities(activities);*/

    return await this.enrollmentsService.changeEnrollmentStatus(changeEnrollmentStatusDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'pragya: Change learner enrollment status.' })
  @Post('/learners/change-status/external')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  // @Roles('api')
  @ApiConsumes('application/x-www-form-urlencoded')
  async ChangeLearnerEnrollmentStatusByExternalUser(@Body() changeEnrollmentStatusDto: ChangeEnrollmentStatusDto, @GetUser() user) {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    try {
      this.logger.log(`Pragya call for changing learner enrollment status. Enrollment Id: ${changeEnrollmentStatusDto.enrollmentId}`);
      const { data, message } = await this.enrollmentsService.changeEnrollmentStatus(changeEnrollmentStatusDto);
      this.logger.log('Enrollment status changed successfully.');

      return ResponseHandler.success(data, message);
    } catch (e) {
      this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
      return ResponseHandler.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'pragya: Update learner enrollment activity.' })
  @Post('/learners/update-activity/:enrollmentId/external')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  // @Roles('api')
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateLearnerEnrollmentActivityByExternalUser(
    @Body() updateLearnerEnrollmentActivityDto: UpdateLearnerEnrollmentActivityDto,
    @Param() enrollmentIdDto: EnrollmentIdDto,
    @GetUser() user,
  ) {
    if (user.role !== 'api') {
      return ResponseHandler.fail('Unauthorized', '', 401);
    }

    try {
      this.logger.log(`Pragya call for updating learner course activity. Enrollment Id: ${enrollmentIdDto.enrollmentId}`);
      const { data, message } = await this.enrollmentsService.updateLearnerEnrollmentActivityByExternalUser(
        enrollmentIdDto.enrollmentId,
        updateLearnerEnrollmentActivityDto,
      );
      this.logger.log('Learner course activity updated successfully.');

      return ResponseHandler.success(data, message);
    } catch (e) {
      this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
    }
  }
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Charge all payments.' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin', 'manager')
  // @Get('capture-all')
  // async CaptureAllTransactions(): Promise<SuccessInterface> {
  //   const { nonStripeColleges, enrollments } = await this.enrollmentsService.CaptureChargedAmountFromCustomerManually();
  //
  //   if (nonStripeColleges.length > 0) {
  //     return ResponseHandler.fail(
  //       `${nonStripeColleges.length === 1 ? `One of the colleges isn't` : `Some of the colleges aren't`} registered on stripe`,
  //       nonStripeColleges,
  //     );
  //   } else {
  //     return ResponseHandler.success(
  //       null,
  //       enrollments > 0 ? 'All pending payments captured and transferred successfully' : 'No pending payment was found',
  //     );
  //   }
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change learner enrollment status.' })
  @Post('/learners/suspend-all')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiConsumes('application/x-www-form-urlencoded')
  async SuspendLearnerEnrollment(@Body() suspendLearnerDto: SuspendLearnerDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.enrollmentsService.suspendLearnerEnrollments(suspendLearnerDto.learnerId, user.collegeId);
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get revenue details for marketplace analytics page graph.' })
  // @Get('/analytics/revenue/graph')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  // async GetRevenueAnalyticsForGraph(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
  //   if (analyticsCountDto.type === 'college') {
  //     analyticsCountDto.collegeId = user.collegeId ? user.collegeId : analyticsCountDto.collegeId;
  //   } else {
  //     analyticsCountDto.collegeId = null;
  //   }
  //   analyticsCountDto.interval = analyticsCountDto.interval ? Number(analyticsCountDto.interval) : 1;
  //   return await this.enrollmentsService.getRevenueAnalyticsForGraph(analyticsCountDto);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of all enrollments between a start and end date optionally by college.' })
  @Get('/learner-details/:enrollmentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async getEnrolledLearnerDetails(@Param() enrollmentIdDto: EnrollmentIdDto) {
    const details = await this.enrollmentsService.getEnrolledLearnerDetails(enrollmentIdDto.enrollmentId);
    return ResponseHandler.success(details[0]);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of all enrollments between a start and end date optionally by college.' })
  @Get('/learners/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async getLearnersCount(@Query() getCountDto: GetCountDto, @GetUser() user): Promise<SuccessInterface> {
    getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId ? getCountDto.collegeId : null;

    const newLearners = await this.learnersService.getAnalyticsCount(getCountDto);
    getCountDto.start = null;
    getCountDto.end = null;
    const totalLearners = await this.learnersService.getAnalyticsCount(getCountDto);

    return ResponseHandler.success({
      new: newLearners.data,
      total: totalLearners.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get growth of all enrollments between a start and end date defined by intervals, optionally by college.' })
  @Get('/learners/growth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async getLearnersGrowth(@Query() getCountDto: GetCountDto, @GetUser() user): Promise<SuccessInterface> {
    getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId ? getCountDto.collegeId : null;
    getCountDto.interval = Number(getCountDto.interval) ? Number(getCountDto.interval) : 1;

    return await this.enrollmentsService.getLearnersGrowth(getCountDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total enrollments allowed and total enrollments in the course with enrollment deadline and course dates.' })
  @Get('/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async GetTotalEnrollmentsAllowed(@Query() courseIdDto: CourseIdDto): Promise<SuccessInterface> {
    return await this.enrollmentsService.getTotalEnrollmentsAndEnrollmentsAllowed(courseIdDto.courseId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of all learners enrolled in a college in a csv file.' })
  @Get('/learners/csv')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=learners.csv')
  async getLearnersInCSV(@Query() getCsvDto: GetCSVDto, @GetUser() user) {
    getCsvDto.collegeId = user.collegeId ? user.collegeId : getCsvDto.collegeId;
    getCsvDto.keyword = getCsvDto.keyword ? getCsvDto.keyword : '';

    return await this.enrollmentsService.getLearnersInCSV(getCsvDto);
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Transfer a payment to college against enrollment.' })
  // @Post('transfer-payment')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  // @ApiConsumes('application/x-www-form-urlencoded')
  // async transferPaymentToCollegeAgainstEnrollment(@Body() transferPaymentDto: TransferPaymentDto) {
  //   return await this.enrollmentsService.transferPaymentToCollegeAgainstEnrollment(transferPaymentDto);
  // }
}
