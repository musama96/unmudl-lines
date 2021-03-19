import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from '../enquiries/dto/addMembers.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AddEmployerEnquiryDto } from './dto/addEmployerEnquiry.dto';
import { MailerService } from '@nest-modules/mailer';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class EmployerEnquiriesService {
    private readonly employerEnquiryModel;
    private readonly employerEnquiryMessagesModel;
    private readonly employerAdminModel;
    private readonly collegeModel;
    private readonly userModel;
    private readonly notificationsService;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(employerEnquiryModel: any, employerEnquiryMessagesModel: any, employerAdminModel: any, collegeModel: any, userModel: any, notificationsService: NotificationsService, mailerService: MailerService, emailLogsService: EmailLogsService);
    addEmployerEnquiryMessage(enquiryData: AddEmployerEnquiryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUserEnquiries(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnquiryMessages(params: GetEnquiryMessagesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addUserEnquiry(userEnquiry: AddUserEnquiryDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addMembers(addMembers: AddEnquiryMembersDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateReadBy(updateMessage: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getChatGroupDetail(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
