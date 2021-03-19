import { CollegeInvitationsService } from './college-invitations.service';
import { CollegeInvitationDto } from './dto/college-invitation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
import { PartnerRequestsService } from '../partner-requests/partner-requests.service';
import { CollegeInvitationIdDto } from './dto/collegeInvitationId.dto';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { EmployerRequestsService } from '../employer-requests/employer-requests.service';
export declare class CollegeInvitationsController {
    private readonly collegeInvitationsService;
    private readonly usersService;
    private readonly partnerRequestsService;
    private readonly employerInvitationsService;
    private readonly employerRequestsService;
    constructor(collegeInvitationsService: CollegeInvitationsService, usersService: UsersService, partnerRequestsService: PartnerRequestsService, employerInvitationsService: EmployerInvitationsService, employerRequestsService: EmployerRequestsService);
    GetCollegeInvitesAndRequest(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCollegeInvites(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCollegeInvitesCsv(paginationDto: PaginationDto): Promise<any>;
    InviteCollege(collegeInvitaionDto: CollegeInvitationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
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
