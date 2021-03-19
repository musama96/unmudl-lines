import { NewEnquiryDto } from './dto/newEnquiry.dto';
import { GetEnquiriesDto } from './dto/getEnquiries.dto';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from '../enquiries/dto/addMembers.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nest-modules/mailer';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class EnquiriesService {
    private readonly enquiryModel;
    private readonly enquiryMessagesModel;
    private readonly courseModel;
    private readonly learnerModel;
    private readonly chatModel;
    private readonly messageModel;
    private readonly notificationsService;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(enquiryModel: any, enquiryMessagesModel: any, courseModel: any, learnerModel: any, chatModel: any, messageModel: any, notificationsService: NotificationsService, mailerService: MailerService, emailLogsService: EmailLogsService);
    getUserEnquiries(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerEnquiries(learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addLearnerEnquiryMessage(enquiryData: {
        course: string;
        learner?: string;
        message: string;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnquiryMessages(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createEnquiry(newEnquiryDto: NewEnquiryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnquiries(getEnquiriesDto: GetEnquiriesDto): Promise<{
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
    addMembers(addMembers: AddEnquiryMembersDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersEnquiry(learnerId: any, courseId: any): Promise<any>;
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
