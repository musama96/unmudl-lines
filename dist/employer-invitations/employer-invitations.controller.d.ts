import { EmployerInvitationsService } from './employer-invitations.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerInvitationDto } from './employer-invitation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CollegeInvitationIdDto } from '../college-invitations/dto/collegeInvitationId.dto';
export declare class EmployerInvitationsController {
    private readonly employerInvitationsService;
    private readonly employerAdminsService;
    constructor(employerInvitationsService: EmployerInvitationsService, employerAdminsService: EmployerAdminsService);
    InviteEmployer(employerInvitationDto: EmployerInvitationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployerInvites(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployerInvitesCsv(paginationDto: PaginationDto): Promise<any>;
    ResendCollegeInvite(collegeInvitationIdDto: CollegeInvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SuspendUnsuspendCollegeInvite(collegeInvitationIdDto: CollegeInvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteCollegeInvite(collegeInvitationIdDto: CollegeInvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
