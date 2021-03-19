import { PartnerRequestListDto } from './dto/partnerRequestList.dto';
import { MailerService } from '@nest-modules/mailer';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class PartnerRequestsService {
    private readonly partnerRequestModel;
    private readonly userModel;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(partnerRequestModel: any, userModel: any, mailerService: MailerService, emailLogsService: EmailLogsService);
    checkPartnerRequest(collegeName: any): Promise<boolean>;
    createPartnerRequest(collegeRequest: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPartnerRequests(params: PartnerRequestListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPartnerRequestsCsv(params: PartnerRequestListDto): Promise<any>;
    getPartnerRequestDetails(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePartnerRequestStatus({ partnerRequestId, status }: {
        partnerRequestId: any;
        status: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deletePartnerRequest(requestId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
