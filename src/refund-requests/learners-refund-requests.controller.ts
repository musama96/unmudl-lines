import { Body, Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { CreateRefundDto } from './dto/createRefund.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import ResponseHandler from '../common/ResponseHandler';
import { RefundStatus } from '../common/enums/createRefund.enum';
import responseMessages from '../config/responseMessages';
import { StripeService } from '../stripe/stripe.service';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTypes } from '../activities/activity.model';
import * as mongoose from 'mongoose';
import { TransactionActivities } from '../activities/transactionActivityCategory.model';
import EmailHtmls from '../common/emailHtml';
import { MailerService } from '@nest-modules/mailer';
import { CoursesService } from '../courses/courses.service';
import { ExternalService } from '../external/external.service';
import { LearnersService } from '../learners/learners.service';
import { CollegesService } from '../colleges/colleges.service';
import { InjectModel } from '@nestjs/mongoose';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@ApiTags('Refund Requests (User Portal)')
@Controller('refund-requests')
export class LearnersRefundRequestsController {
  logger = new Logger(LearnersRefundRequestsController.name);
  constructor(
    @InjectModel('gift-course') private readonly giftCourseModel,
    private readonly refundRequestsService: RefundRequestsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly stripeService: StripeService,
    private readonly activitiesService: ActivitiesService,
    private readonly mailerService: MailerService,
    private readonly coursesService: CoursesService,
    private readonly externalService: ExternalService,
    private readonly learnersService: LearnersService,
    private readonly collegesService: CollegesService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a refund request.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  @HttpCode(200)
  async Create(@Body() createRefundDto: CreateRefundDto, @GetUser() user) {
    const enrollmentResponse = await this.enrollmentsService.getEnrollmentById(createRefundDto.enrollmentId);
    if (enrollmentResponse.data) {
      const enrollment = enrollmentResponse.data;
      const { data: refundRequest } = await this.refundRequestsService.getRefundRequestByEnrollment(createRefundDto.enrollmentId);

      if (refundRequest) {
        return ResponseHandler.fail('You have already applied for refund.');
      }

      this.logger.warn('Refund Request');
      this.logger.log(enrollment._id.toString());
      this.logger.log(enrollment.status);

      if (['processed', 'transferred'].includes(enrollment.status)) {
        createRefundDto.courseId = enrollment.courseId;
        createRefundDto.requestedBy = enrollment.learnerId;
        createRefundDto.transactionId = enrollment.transactionId;
        createRefundDto.status = RefundStatus.PENDING;

        if (user._id.toString() !== enrollment.learnerId.toString()) {
          return ResponseHandler.fail(`Enrollment doesn't belong to the user.`);
        }

        const requestResponse = await this.refundRequestsService.createRefundRequest(createRefundDto);

        return ResponseHandler.success(
          {
            requestType: 'refund',
            request: requestResponse.data,
            enrollment,
          },
          'Refund request created successfully.',
        );
      } else if (['pending', 'approved'].includes(enrollment.status)) {
        let stripeResponse = null;
        let updatedEnrollmentResponse = null;

        try {
          stripeResponse = enrollment.transactionId
            ? await this.stripeService.refundPaymentToCustomer(enrollment.transactionId)
            : { data: '' };
          updatedEnrollmentResponse = await this.enrollmentsService.refundEnrollment(enrollment._id, 'canceled');
          if (enrollment.giftId) {
            await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'canceled' } });
          }
        } catch (e) {
          return ResponseHandler.fail(e.response ? e.response.message : e.message ? e.message : e);
        }

        const activities = [
          {
            type: ActivityTypes.Transaction,
            learner: enrollment.learnerId,
            course: enrollment.courseId,
            enrollment: enrollment._id,
            transactionActivity: mongoose.Types.ObjectId(
              await this.activitiesService.getTransactionActivityId(TransactionActivities.EnrollmentCanceled),
            ),
          },
        ];

        const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);

        const learner = await this.learnersService.getLearnerById(enrollment.learnerId);

        if (course.externalCourseId && course.collegeId.orgId) {
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

        const { data: collegeAdmins } = await this.collegesService.getCollegeAdminsForEmail(course.collegeId._id);

        try {
          const mailData = {
            to: user.emailAddress,
            from: process.env.LEARNER_NOTIFICATION_FROM,
            subject: 'Your Unmudl course was successfully canceled',
            template: 'learnerCancelUnapprovedEnrollment',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              course: course.title,
              college: course.collegeId.title,
            },
          };
          const [activity, mail, collegeMails] = await Promise.all([
            this.activitiesService.createActivities(activities),
            this.mailerService.sendMail(mailData),
            collegeAdmins.map(async admin => {
              const mailData = {
                to: admin.emailAddress,
                from: process.env.PARTNER_NOTIFICATION_FROM,
                subject: 'UNMUDL Notification',
                template: 'learnerCancelUnapprovedEnrollmentMailForAdmin',
                context: {
                  unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                  course: course.title,
                  learner: learner.fullname,
                },
              };
              const mail = await this.mailerService.sendMail(mailData);

              mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
              return mail;
            }),
          ]);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
        } catch (e) {
          return ResponseHandler.fail(
            e.response ? e.response.message : e.response.message ? e.message : 'Something went wrong. Please try again later',
          );
        }

        return ResponseHandler.success(
          {
            requestType: 'cancel',
            stripe: stripeResponse.data,
            enrollment: updatedEnrollmentResponse.data,
          },
          'Enrollment canceled successfully.',
        );
      } else {
        return ResponseHandler.fail(responseMessages.approveRefund.status(enrollment.status));
      }
    } else {
      return ResponseHandler.fail('Enrollment not found.');
    }
  }
}
