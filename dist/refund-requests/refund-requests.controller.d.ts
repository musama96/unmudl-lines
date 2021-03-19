import { Logger } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { RefundRequestIdDto } from '../common/dto/refundRequestId.dto';
import { StripeService } from '../stripe/stripe.service';
import { RefundRequestListDto } from './dto/refundRequestList.dto';
import { MailerService } from '@nest-modules/mailer';
import { CoursesService } from '../courses/courses.service';
import { LearnersService } from '../learners/learners.service';
import { ExternalService } from '../external/external.service';
import { CollegesService } from '../colleges/colleges.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class RefundRequestsController {
    private readonly giftCourseModel;
    private readonly refundRequestsService;
    private readonly enrollmentsService;
    private readonly stripeService;
    private readonly mailerService;
    private readonly coursesService;
    private readonly collegesService;
    private readonly learnersService;
    private readonly externalService;
    private readonly emailLogsService;
    logger: Logger;
    constructor(giftCourseModel: any, refundRequestsService: RefundRequestsService, enrollmentsService: EnrollmentsService, stripeService: StripeService, mailerService: MailerService, coursesService: CoursesService, collegesService: CollegesService, learnersService: LearnersService, externalService: ExternalService, emailLogsService: EmailLogsService);
    GetRefundRequests(refundRequestListDto: RefundRequestListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRefundRequestDetails(refundRequestIdDto: RefundRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RejectRefundRequest(refundRequestIdDto: RefundRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    ApproveRefund(refundRequestIdDto: RefundRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    ApproveNegativeRefundRefund(refundRequestIdDto: RefundRequestIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
