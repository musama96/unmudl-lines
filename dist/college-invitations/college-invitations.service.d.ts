import { MailerService } from '@nest-modules/mailer';
import { CollegeInvitationDto } from './dto/college-invitation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class CollegeInvitationsService {
    private readonly collegeModel;
    private readonly collegeTokenModel;
    private readonly collegeInvitaionsModel;
    private readonly counterModel;
    private readonly userModel;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(collegeModel: any, collegeTokenModel: any, collegeInvitaionsModel: any, counterModel: any, userModel: any, mailerService: MailerService, emailLogsService: EmailLogsService);
    checkExistingInvitationByCollegeName(collegeName: string): Promise<any>;
    getCollegeInvitations(params: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeInvitationsCsv(params: PaginationDto): Promise<any>;
    createInvitation(invitationData: CollegeInvitationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateAcceptedInvitation(collegeId: string): Promise<any>;
    resendInvitationEmail(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    toggleSuspend(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteInvitation(invitationId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
