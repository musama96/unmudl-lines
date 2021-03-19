import { MailerService } from '@nest-modules/mailer';
import { UsersService } from '../users/users.service';
import { UserTokensService } from '../users/userTokens.service';
import { CollegesService } from '../colleges/colleges.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class InvitationsService {
    private readonly invitationModel;
    private readonly mailerService;
    private readonly usersService;
    private readonly collegesService;
    private readonly userTokensService;
    private readonly emailLogsService;
    constructor(invitationModel: any, mailerService: MailerService, usersService: UsersService, collegesService: CollegesService, userTokensService: UserTokensService, emailLogsService: EmailLogsService);
    inviteUser(invitation: any, token: any): Promise<{
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
    getInvitationByEmail(emailAddress: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInvitationById(id: string): Promise<{
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
    deleteInvitation(invitationId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
