import { User } from './user.model';
import { UserTokensService } from './userTokens.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignUpAdminDto } from './dto/signUpAdmin.dto';
import { InstructorCoursesListDto } from './dto/instructorCoursesList.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { AuthCredentialsDto } from '../auth/dto/authCredentialsDto';
import { SuccessInterface } from '../common/ResponseHandler';
import { MailerService } from '@nest-modules/mailer';
import { InviteUserDto } from '../invitations/dto/inviteUser.dto';
import { ListDto } from '../common/dto/list.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateUserRoleDto } from '../common/dto/updateUserRole.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class UsersService {
    private readonly userModel;
    private readonly trashedUserModel;
    private readonly courseModel;
    private readonly invitationModel;
    private readonly counterModel;
    private readonly notificationsModel;
    private readonly activitiesModel;
    private readonly mailerService;
    private readonly notificationsService;
    private readonly emailLogsService;
    private readonly userTokensService;
    private saltRounds;
    constructor(userModel: any, trashedUserModel: any, courseModel: any, invitationModel: any, counterModel: any, notificationsModel: any, activitiesModel: any, mailerService: MailerService, notificationsService: NotificationsService, emailLogsService: EmailLogsService, userTokensService: UserTokensService);
    insertInvitedUser(user: InviteUserDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    insertUser(user: CreateUserDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    insertAdmin(user: SignUpAdminDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCollegeAdmin(user: any): Promise<any>;
    updateInvitedUser(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateUserRole(role: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateBasicDetails(details: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePreferences(details: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateDetails(details: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkExistingUser(emailAddress: any, userId: any): Promise<any>;
    sendResetPasswordLink(user: User): Promise<boolean>;
    getUsers(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructors(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorNames(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUsersNames(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInvitedInstructors(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInvitedInstructorsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorsCsv(params: ListDto): Promise<any>;
    getInvitedInstructorsCsv(params: ListDto): Promise<any>;
    getAdmins(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInvitedAdmins(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminsCsv(params: ListDto): Promise<any>;
    getInvitedAdminsCsv(params: ListDto): Promise<any>;
    getInvitedAdminsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateRole(updateRole: UpdateUserRoleDto, user: User): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUserByEmail(emailAddress: string): Promise<any>;
    getUserByEmailMongoObj(emailAddress: string): Promise<any>;
    getUsersList(params: any, emailAddress: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUserById(userId: any): Promise<any>;
    getUserByIdMongoObj(userId: any): Promise<any>;
    getCollegeAccountCounts(params?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkIfEmailExists(emailAddress: string): Promise<SuccessInterface>;
    validateUserForLogin(authCredentialsDto: AuthCredentialsDto): Promise<any>;
    updatePassword(password: string, userId: string): Promise<boolean>;
    updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
    getUnmudlAdminsForEmail(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeSuperAdmin(collegeId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeSuperAdmins(collegeId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    changePassword(params: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateLastLoggedIn(userId: any): Promise<void>;
    getAdminData(id: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorDetails(instructor: UserIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopInstructors(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopInstructorsCsv(params: any): Promise<any>;
    getInstructorCourses(coursesList: InstructorCoursesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    hasCourses(instructorId: any): Promise<any>;
    removeUser(userIdDto: UserIdDto): Promise<any>;
    removeInstructorFromCourses(instructor: UserIdDto): Promise<any>;
    getUserNotifications(params: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getHash(password: string | undefined): Promise<string>;
    compareHash(password: string | undefined, hash: string | undefined): Promise<boolean>;
    pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
}
