import { AuthCredentialsDto } from '../auth/dto/authCredentialsDto';
import { EmployerAdmin } from './employer-admin.model';
import { MailerService } from '@nest-modules/mailer';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { InviteEmployerAdminDto } from '../employer-admin-invitations/dto/invite-employer-admin.dto';
import { ListDto } from '../common/dto/list.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { UpdateEmployerAdminRoleDto } from './dto/update-employer-admin-role.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { ChatService } from '../chat/chat.service';
export declare class EmployerAdminsService {
    private readonly mailerService;
    private readonly notificationsService;
    private readonly employerAdminModel;
    private readonly employerAdminInvitationModel;
    private readonly employerAdminNotificationModel;
    private readonly trashedEmployerAdminModel;
    private readonly counterModel;
    private readonly employerAdminTokenModel;
    private readonly emailLogsService;
    private readonly chatService;
    private saltRounds;
    constructor(mailerService: MailerService, notificationsService: NotificationsService, employerAdminModel: any, employerAdminInvitationModel: any, employerAdminNotificationModel: any, trashedEmployerAdminModel: any, counterModel: any, employerAdminTokenModel: any, emailLogsService: EmailLogsService, chatService: ChatService);
    getAdminsList(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminNamesList({ keyword, employerId }: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminsListCsv(params: ListDto): Promise<any>;
    validateEmployerAdminForLogin(authCredentialsDto: AuthCredentialsDto): Promise<any>;
    updateLastLoggedIn(userId: any): Promise<void>;
    changePassword(params: UpdatePasswordDto, adminId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePassword(password: string, adminId: string): Promise<boolean>;
    updateDetails(details: any, adminId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateRole(updateRole: UpdateEmployerAdminRoleDto, admin: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createEmployerAdminToken(adminId: string): Promise<string>;
    insertInvitedAdmin(admin: InviteEmployerAdminDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
    removeUser(adminId: any): Promise<any>;
    verifyToken(employerAdminToken: ResetPasswordDto, remove?: boolean): Promise<any>;
    getUserByEmail(emailAddress: string, lean?: boolean): Promise<SuccessInterface>;
    sendResetPasswordLink(admin: EmployerAdmin): Promise<boolean>;
    getAdminByEmail(emailAddress: string, lean?: boolean): Promise<any>;
    getAdminById(id: string, lean?: boolean): Promise<any>;
    suspendAdditionalAdmins(employer: any, limit: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    unSuspendAdditionalAdmins(employer: any, limit: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    initializeContactUnmudlChatsForAllEmployerAdmins(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminData(id: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerAdminNotifications(params: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEmployerAdmin(user: any): Promise<any>;
    updateEmployerAdminById(user: any, id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePreferences(details: any, employerAdminId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    compareHash(password: string | undefined, hash: string | undefined): Promise<boolean>;
    getHash(password: string | undefined): Promise<string>;
}
