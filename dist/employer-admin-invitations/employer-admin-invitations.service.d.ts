import { MailerService } from '@nest-modules/mailer';
import { ListDto } from '../common/dto/list.dto';
import { EmployerCompaniesService } from '../employer-companies/employer-companies.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class EmployerAdminInvitationsService {
    private readonly employerAdminModel;
    private readonly employerAdminInvitationModel;
    private readonly mailerService;
    private readonly employerCompaniesService;
    private readonly emailLogsService;
    constructor(employerAdminModel: any, employerAdminInvitationModel: any, mailerService: MailerService, employerCompaniesService: EmployerCompaniesService, emailLogsService: EmailLogsService);
    getAdminInvitations(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminInvitationsCsv(params: ListDto): Promise<any>;
    getEmployerAdminInvitationCount(employer: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminInvitationsRows(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInvitationById(id: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    removeAdminInvitation(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    inviteAdmin(invitation: any, token: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    resendInvitation({ fullname, role, emailAddress, employerId }: {
        fullname: any;
        role: any;
        emailAddress: any;
        employerId: any;
    }, token: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    acceptInvitation(emailAddress: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
