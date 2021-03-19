import { EmployerAdminsService } from './employer-admins.service';
import { EmailDto } from '../common/dto/email.dto';
import { ResetPasswordDto } from '../users/dto/resetPassword.dto';
import { TokenDto } from '../users/dto/token.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ListDto } from '../common/dto/list.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { EmployerAdminInvitationsService } from '../employer-admin-invitations/employer-admin-invitations.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { EmployerAdminIdDto } from '../common/dto/employerAdminId.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateEmployerAdminPreferencesDto } from './dto/updateEmployerAdminPreferences.dto';
import { UpdateEmployerAdminRoleDto } from './dto/update-employer-admin-role.dto';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { StripeService } from '../stripe/stripe.service';
import { EmployerSubscriptionsService } from 'src/employer-subscriptions/employer-subscriptions.service';
export declare class EmployerAdminsController {
    private readonly employerAdminsService;
    private readonly employerAdminInvitationsService;
    private readonly notificationsService;
    private readonly stripeService;
    private readonly employerSubscriptionsService;
    constructor(employerAdminsService: EmployerAdminsService, employerAdminInvitationsService: EmployerAdminInvitationsService, notificationsService: NotificationsService, stripeService: StripeService, employerSubscriptionsService: EmployerSubscriptionsService);
    getAdminsList(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminNamesList(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminsListCsv(listDto: ListDto, user: any): Promise<any>;
    addOtherAdmin(createUserDto: CreateUserDto, user: any, files: any): Promise<SuccessInterface>;
    updateEmployerAdmin(updateAdminDto: UpdateAdminDto, user: any, files: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addCard(stripeTokenDto: StripeTokenDto, user: any): Promise<SuccessInterface>;
    getEmployerAdminProfile(user: any): Promise<any>;
    getEmployerAdminProfileData(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerAdminDetails(employerAdminIdDto: EmployerAdminIdDto, user: any): Promise<any>;
    sendPasswordResetLink(emailDto: EmailDto): Promise<SuccessInterface>;
    UpdateEmployerAdminPassword(updatePasswordDto: UpdatePasswordDto, user: any): Promise<SuccessInterface>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface>;
    UpdateUserRole(employerAdminIdDto: EmployerAdminIdDto, updateEmployerAdminRole: UpdateEmployerAdminRoleDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RemoveAdmin(employerAdminIdDto: EmployerAdminIdDto, user: any): Promise<SuccessInterface>;
    SuspendUser(employerAdminIdDto: EmployerAdminIdDto, user: any): Promise<SuccessInterface>;
    GetAdminByToken(tokenDto: TokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetNotifications(paginationDto: PaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateUserPreferences(updateEmployerAdminPreferencesDto: UpdateEmployerAdminPreferencesDto, user: any): Promise<SuccessInterface>;
    initializeContactUnmudlChatsForAllEmployerAdmins(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
