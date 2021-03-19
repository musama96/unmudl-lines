import { EmployerCompaniesService } from './employer-companies.service';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { SignUpEmployerDto } from './dto/sign-up-employer.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { TokenDto } from '../users/dto/token.dto';
import { EmployerCompanyIdDto } from '../common/dto/employerCompanyId.dto';
import { UpdateEmployerCompanyDto } from './dto/update-employer-company.dto';
import StatsDto from '../colleges/dto/stats.dto';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { ListDto } from '../common/dto/list.dto';
import AdminHomeDto from '../colleges/dto/adminHomeDto.dto';
import { EmployerAdminInvitationsService } from '../employer-admin-invitations/employer-admin-invitations.service';
import { EmployerSubscriptionsService } from 'src/employer-subscriptions/employer-subscriptions.service';
export declare class EmployerCompaniesController {
    private readonly employerCompaniesService;
    private readonly employerAdminsService;
    private readonly employerInvitationsService;
    private readonly employerAdminInvitationsService;
    private readonly notificationsService;
    private readonly employerSubscriptionsService;
    constructor(employerCompaniesService: EmployerCompaniesService, employerAdminsService: EmployerAdminsService, employerInvitationsService: EmployerInvitationsService, employerAdminInvitationsService: EmployerAdminInvitationsService, notificationsService: NotificationsService, employerSubscriptionsService: EmployerSubscriptionsService);
    create(signUpEmployerDto: SignUpEmployerDto, files: any): Promise<SuccessInterface>;
    updateEmployer(updateEmployerCompanyDto: UpdateEmployerCompanyDto, files: any, user: any): Promise<SuccessInterface>;
    SuspendUnsuspendCollege(employerCompanyIdDto: EmployerCompanyIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployerByToken(tokenDto: TokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerProfile(employerCompanyIdDto: EmployerCompanyIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployers(listDto: ListDto, user: any): Promise<SuccessInterface>;
    GetEmployersAsCsv(listDto: ListDto, user: any): Promise<SuccessInterface>;
    GetEmployerDashboard(adminHomeDto: AdminHomeDto, user: any): Promise<SuccessInterface>;
    GetEmployersStatistics(statsDto: StatsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployerGrowthGraph(analyticsCountDto: AnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetEmployerGrowthGraphAsCsv(analyticsCountDto: AnalyticsCountDto, user: any): Promise<SuccessInterface>;
    UnmudlAdminEmployerPortalAccess(employerCompanyIdDto: EmployerCompanyIdDto, user: any): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: string;
            profilePhotoThumbnail: string;
            employerId: any;
            employer: any;
            employerDomain: any;
            employerLogo: any;
            employerLogoThumbnail: any;
            role: any;
            admin: {
                fullname: any;
                profilePhoto: any;
                profilePhotoThumbnail: any;
            };
            activeSubscription: any;
        };
    }>;
}
