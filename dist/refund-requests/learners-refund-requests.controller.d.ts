import { Logger } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { CreateRefundDto } from './dto/createRefund.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { StripeService } from '../stripe/stripe.service';
import { ActivitiesService } from '../activities/activities.service';
import { MailerService } from '@nest-modules/mailer';
import { CoursesService } from '../courses/courses.service';
import { ExternalService } from '../external/external.service';
import { LearnersService } from '../learners/learners.service';
import { CollegesService } from '../colleges/colleges.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class LearnersRefundRequestsController {
    private readonly giftCourseModel;
    private readonly refundRequestsService;
    private readonly enrollmentsService;
    private readonly stripeService;
    private readonly activitiesService;
    private readonly mailerService;
    private readonly coursesService;
    private readonly externalService;
    private readonly learnersService;
    private readonly collegesService;
    private readonly emailLogsService;
    logger: Logger;
    constructor(giftCourseModel: any, refundRequestsService: RefundRequestsService, enrollmentsService: EnrollmentsService, stripeService: StripeService, activitiesService: ActivitiesService, mailerService: MailerService, coursesService: CoursesService, externalService: ExternalService, learnersService: LearnersService, collegesService: CollegesService, emailLogsService: EmailLogsService);
    Create(createRefundDto: CreateRefundDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
