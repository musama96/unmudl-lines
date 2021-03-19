import { Body, Controller, Get, HttpCode, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RefundRequestIdDto } from '../common/dto/refundRequestId.dto';
import { StripeService } from '../stripe/stripe.service';
import ResponseHandler from '../common/ResponseHandler';
import { RefundRequestListDto } from './dto/refundRequestList.dto';
import { GetUser } from '../auth/get-user.decorator';
import EmailHtmls from '../common/emailHtml';
import { MailerService } from '@nest-modules/mailer';
import { CoursesService } from '../courses/courses.service';
import { LearnersService } from '../learners/learners.service';
import { ExternalService } from '../external/external.service';
import { CollegesService } from '../colleges/colleges.service';
import { InjectModel } from '@nestjs/mongoose';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

@ApiTags('Refund Requests (Admin Panel)')
@Controller('refund-requests')
export class RefundRequestsController {
  logger = new Logger(RefundRequestsController.name);
  constructor(
    @InjectModel('gift-course') private readonly giftCourseModel,
    private readonly refundRequestsService: RefundRequestsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly stripeService: StripeService,
    private readonly mailerService: MailerService,
    private readonly coursesService: CoursesService,
    private readonly collegesService: CollegesService,
    private readonly learnersService: LearnersService,
    private readonly externalService: ExternalService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a list of refund requests.' })
  @Get()
  async GetRefundRequests(@Query() refundRequestListDto: RefundRequestListDto, @GetUser() user) {
    refundRequestListDto.collegeId = user.collegeId ? user.collegeId : refundRequestListDto.collegeId;
    refundRequestListDto.sortOrder = refundRequestListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.refundRequestsService.getRefundRequests(refundRequestListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get refund request details.' })
  @Get('/details/:refundRequestId')
  async GetRefundRequestDetails(@Param() refundRequestIdDto: RefundRequestIdDto) {
    return await this.refundRequestsService.getRefundRequestDetails(refundRequestIdDto.refundRequestId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Reject a refund request.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('reject')
  @HttpCode(200)
  async RejectRefundRequest(@Body() refundRequestIdDto: RefundRequestIdDto) {
    const resp = await this.refundRequestsService.rejectRefundRequest(refundRequestIdDto.refundRequestId);
    const { data: request } = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);
    if (request.status === 'rejected' && request.requestedBy && request.courseId && request.courseId.collegeId) {
      const mailData = {
        to: request.requestedBy.emailAddress,
        from: process.env.LEARNER_NOTIFICATION_FROM,
        subject: 'UNMUDL Notification',
        template: 'learnerRefundRequestRejection',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          course: request.courseId.title,
          college: request.courseId.collegeId.title,
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;
    }
    return resp;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Approve a refund request.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('approve')
  @HttpCode(200)
  async ApproveRefund(@Body() refundRequestIdDto: RefundRequestIdDto) {
    const refundRequestRes = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);

    if (refundRequestRes.data) {
      const request = refundRequestRes.data;

      const {
        data: { enrollmentId: enrollment },
      } = refundRequestRes;

      this.logger.warn('Refund Request Approval');
      this.logger.log(`Enrollment Id: ${enrollment._id.toString()}`);
      this.logger.log(`Enrollment status: ${enrollment.status}`);

      if (!(enrollment.status === 'refunded')) {
        let outstandingBalance = 0;
        if (enrollment.status === 'transferred' && enrollment.transactionId) {
          try {
            await this.stripeService.reverseTransfer(enrollment.transferId);
            if (enrollment.sentToCollege !== enrollment.collegeShare || enrollment.sentToCollege < enrollment.collegeShare) {
              outstandingBalance = enrollment.collegeShare - enrollment.sentToCollege;
            }
          } catch (e) {
            return ResponseHandler.fail(e.raw.message, null, 402);
          }
        }

        let stripeResponse = null;
        try {
          const amount = Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100);
          stripeResponse = request.transactionId
            ? await this.stripeService.refundPaymentToCustomer(request.transactionId, amount)
            : { data: '' };
        } catch (e) {
          return ResponseHandler.fail(e.response.message);
        }

        const enrollmentResponse = await this.enrollmentsService.refundEnrollment(request.enrollmentId, 'refunded', enrollment.transferId);
        const refundRequestResponse = await this.refundRequestsService.approveRefundRequest(
          refundRequestIdDto.refundRequestId,
          stripeResponse.data,
        );

        if (enrollment.giftId) {
          await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
        }

        this.logger.log(`College outstanding balance: ${outstandingBalance}`);
        this.logger.log(`Refunded amount: ${Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100)}`);
        this.logger.log(`Stripe Transaction Id: ${request.transactionId}`);

        if (outstandingBalance > 0) {
          await this.collegesService.updateCollegeOutstandingBalance(request.courseId.collegeId._id, outstandingBalance);
        }

        const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
        this.logger.log(`External Course Id: ${course.externalCourseId}`);
        this.logger.log(`College Org Id: ${course.collegeId.orgId}`);
        if (course.externalCourseId && course.collegeId.orgId) {
          const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
          try {
            const {
              data: { accessToken },
            } = await this.externalService.getLmsToken();
            const { data: externalEnrollment } = await this.externalService.cancelLmsEnrollment({
              userId: learner._id,
              orgId: course.collegeId.orgId,
              courseId: course.externalCourseId,
              courseTitle: course.title,
              enrollmentId: enrollment._id,
              type: 'return',
              accessToken,
            });
            this.logger.log(`Pragya Call Successful.`);
          } catch (e) {
            this.logger.error(`Pragya Call Failed.`);
            return ResponseHandler.fail(e.response ? e.response.message : e.message);
          }
        } else {
          this.logger.warn('No pragya call.');
        }

        try {
          const mailData = {
            to: request.requestedBy.emailAddress,
            from: process.env.LEARNER_NOTIFICATION_FROM,
            subject: 'UNMUDL Notification',
            template: 'learnerRefundRequestApproval',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              course: request.courseId.title,
              college: request.courseId.collegeId.title,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;
        } catch (e) {
          return ResponseHandler.fail(e.response ? e.response.message : e.message);
        }

        return ResponseHandler.success(
          {
            stripe: stripeResponse.data,
            enrollment: enrollmentResponse.data,
            refund: refundRequestResponse.data,
          },
          'Payment refunded successfully.',
        );
      } else {
        await Promise.all([
          this.enrollmentsService.refundEnrollment(refundRequestRes.data.enrollmentId, 'refunded'),
          this.refundRequestsService.setRefundRequestStatus(refundRequestIdDto.refundRequestId, 'refunded'),
        ]);

        if (enrollment.giftId) {
          await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
        }
        return ResponseHandler.fail('Enrollment has already been refunded.');
      }
    } else {
      return ResponseHandler.fail('Enrollment not found.');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Approve a refund request with negative balance.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('approve-negative')
  @HttpCode(200)
  async ApproveNegativeRefundRefund(@Body() refundRequestIdDto: RefundRequestIdDto) {
    const refundRequestRes = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);

    if (refundRequestRes.data) {
      const request = refundRequestRes.data;

      const {
        data: { enrollmentId: enrollment },
      } = refundRequestRes;
      // const { data: balanceData } = await this.stripeService.getConnectAccountBalance(refundRequestRes.data.courseId.collegeId.stripeId);
      // const balance = balanceData.available && balanceData.available.length > 0 ? balanceData.available[0].amount : 0;

      if (!(enrollment.status === 'refunded')) {
        let outstandingBalance = enrollment.keptByUnmudl ? enrollment.keptByUnmudl : 0;
        if (enrollment.status === 'transferred' && enrollment.transactionId && enrollment.transferId) {
          try {
            // const reverseAmount = balance / 100 < enrollment.sentToCollege ? balance : Math.floor(enrollment.sentToCollege * 100);
            // outstandingBalance += balance / 100 < enrollment.sentToCollege ? enrollment.sentToCollege - balance / 100 : 0;
            await this.stripeService.reverseTransfer(enrollment.transferId);
          } catch (e) {
            outstandingBalance += enrollment.sentToCollege;
          }

          let stripeResponse = null;
          try {
            const amount = Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100);
            stripeResponse = request.transactionId
              ? await this.stripeService.refundPaymentToCustomer(request.transactionId, amount)
              : { data: '' };
          } catch (e) {
            return ResponseHandler.fail(e.response.message);
          }

          const enrollmentResponse = await this.enrollmentsService.refundEnrollment(
            request.enrollmentId,
            'refunded',
            enrollment.transferId,
          );
          const refundRequestResponse = await this.refundRequestsService.approveRefundRequest(
            refundRequestIdDto.refundRequestId,
            stripeResponse.data,
          );

          if (outstandingBalance > 0) {
            await this.collegesService.updateCollegeOutstandingBalance(enrollment.courseId.collegeId, outstandingBalance);
          }

          if (enrollment.giftId) {
            await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
          }

          const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
          if (course.externalCourseId && course.collegeId.orgId) {
            const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
            try {
              const {
                data: { accessToken },
              } = await this.externalService.getLmsToken();
              const { data: externalEnrollment } = await this.externalService.cancelLmsEnrollment({
                userId: learner._id,
                orgId: course.collegeId.orgId,
                courseId: course.externalCourseId,
                courseTitle: course.title,
                enrollmentId: enrollment._id,
                type: 'return',
                accessToken,
              });
            } catch (e) {}
          }

          const mailData = {
            to: request.requestedBy.emailAddress,
            from: process.env.LEARNER_NOTIFICATION_FROM,
            subject: 'UNMUDL Notification',
            template: 'learnerRefundRequestApproval',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              course: request.courseId.title,
              college: request.courseId.collegeId.title,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;

          return ResponseHandler.success(
            {
              stripe: stripeResponse.data,
              enrollment: enrollmentResponse.data,
              refund: refundRequestResponse.data,
            },
            'Payment refunded successfully.',
          );
        } else {
          return ResponseHandler.fail('Transfer id does not exist.');
        }
      } else {
        await Promise.all([
          this.enrollmentsService.refundEnrollment(refundRequestRes.data.enrollmentId, 'refunded'),
          this.refundRequestsService.setRefundRequestStatus(refundRequestIdDto.refundRequestId, 'refunded'),
        ]);

        if (enrollment.giftId) {
          await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
        }
        return ResponseHandler.fail('Enrollment has already been refunded.');
      }
    } else {
      return ResponseHandler.fail('Enrollment not found.');
    }
  }
}
