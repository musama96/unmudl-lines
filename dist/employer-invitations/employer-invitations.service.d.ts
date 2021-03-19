import { EmployerInvitationDto } from './employer-invitation.dto';
import { MailerService } from '@nest-modules/mailer';
import { PaginationDto } from '../common/dto/pagination.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
import { StripeService } from '../stripe/stripe.service';
import { ChatService } from '../chat/chat.service';
export declare class EmployerInvitationsService {
    private readonly employerInvitationModel;
    private readonly counterModel;
    private readonly employerCompanyModel;
    private readonly employerAdminTokenModel;
    private readonly employerAdminModel;
    private readonly employerCompanyTokenModel;
    private readonly mailerService;
    private readonly emailLogsService;
    private readonly employerSubscriptionsService;
    private readonly stripeService;
    private readonly chatService;
    constructor(employerInvitationModel: any, counterModel: any, employerCompanyModel: any, employerAdminTokenModel: any, employerAdminModel: any, employerCompanyTokenModel: any, mailerService: MailerService, emailLogsService: EmailLogsService, employerSubscriptionsService: EmployerSubscriptionsService, stripeService: StripeService, chatService: ChatService);
    createInvitation(invitationData: EmployerInvitationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    resendInvitationEmail(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateAcceptedInvitation(employerId: string): Promise<any>;
    toggleSuspend(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkExistingInvitationByEmployerName(collegeName: string): Promise<any>;
    getEmployerInvitations(params: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerInvitationsCsv(params: PaginationDto): Promise<any>;
    deleteInvitation(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
