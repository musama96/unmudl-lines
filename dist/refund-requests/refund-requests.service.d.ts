import { RefundRequest } from './refund-request.model';
import { SuccessInterface } from '../common/ResponseHandler';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nest-modules/mailer';
import { RefundRequestListDto } from './dto/refundRequestList.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class RefundRequestsService {
    private readonly refundRequestModel;
    private readonly userModel;
    private readonly learnerModel;
    private readonly courseModel;
    private readonly notificationsService;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(refundRequestModel: any, userModel: any, learnerModel: any, courseModel: any, notificationsService: NotificationsService, mailerService: MailerService, emailLogsService: EmailLogsService);
    getRefundRequestDetails(requestId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRefundRequestByEnrollment(enrollmentId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRefundRequests(params: RefundRequestListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRefundRequestsRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createRefundRequest(request: RefundRequest): Promise<SuccessInterface>;
    sendCollegeMail(request: RefundRequest): Promise<void>;
    rejectRefundRequest(requestId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRequestDetails(requestId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    setRefundRequestStatus(requestId: any, status: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    approveRefundRequest(requestId: any, stripeData: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
