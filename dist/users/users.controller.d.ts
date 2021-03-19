import { UsersService } from './users.service';
import { UserTokensService } from './userTokens.service';
import { CreateUserDto } from './dto/createUser.dto';
import { TokenDto } from './dto/token.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { InstructorCoursesListDto } from './dto/instructorCoursesList.dto';
import { EmailDto } from '../common/dto/email.dto';
import { UpdateUserRoleDto } from '../common/dto/updateUserRole.dto';
import { ListDto } from '../common/dto/list.dto';
import { UpdateBasicDetailsDto } from './dto/updateBasicDetails.dto';
import { UpdatePreferencesDto } from './dto/updatePreferences.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { StripeService } from '../stripe/stripe.service';
import { InvitationsService } from '../invitations/invitations.service';
import { ActivitiesService } from '../activities/activities.service';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { OptionalDurationDto } from '../common/dto/optionalDuration.dto';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { CollegesService } from '../colleges/colleges.service';
import { PayoutsService } from '../payouts/payouts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { InstructorSectionDataDto } from './dto/instructorSectionData.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { InvitationIdDto } from '../common/dto/invitationId.dto';
import { UpdateOtherDto } from './dto/updateOther.dto';
import { DurationDto } from '../common/dto/duration.dto';
import { RecentActivityDto } from './dto/recentActivity.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class UsersController {
    private readonly usersService;
    private readonly collegesService;
    private readonly stripeService;
    private readonly userTokensService;
    private readonly invitationsService;
    private readonly activitiesService;
    private readonly payoutsService;
    private readonly transactionsService;
    private readonly notificationsService;
    constructor(usersService: UsersService, collegesService: CollegesService, stripeService: StripeService, userTokensService: UserTokensService, invitationsService: InvitationsService, activitiesService: ActivitiesService, payoutsService: PayoutsService, transactionsService: TransactionsService, notificationsService: NotificationsService);
    GetAllUsers(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetAllUsersList(keywordDto: KeywordDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetUserByToken(tokenDto: TokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetProfileData(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetUserRecentActivities(durationDto: DurationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetUserDetails(userIdDto: UserIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateUserDetails(updateUserDto: UpdateUserDto, user: any, files: any): Promise<SuccessInterface>;
    UpdateOtherUserDetails(updateOtherDto: UpdateOtherDto, files: any): Promise<SuccessInterface>;
    UpdateUserBasicDetails(updateBasicDetailsDto: UpdateBasicDetailsDto, user: any, files: any): Promise<SuccessInterface>;
    UpdateUserPreferences(updatePreferencesDto: UpdatePreferencesDto, user: any): Promise<SuccessInterface>;
    UpdateUserPassword(updatePasswordDto: UpdatePasswordDto, user: any): Promise<SuccessInterface>;
    GetInstructors(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetInstructorNames(keywordDto: KeywordDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetUsersNames(keywordDto: KeywordDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetInvitedInstructors(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCompleteInstructorsSectionData(instructorSectionDataDto: InstructorSectionDataDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetInstructorsCsv(listDto: ListDto, user: any): Promise<any>;
    GetInvitedInstructorsCsv(listDto: ListDto, user: any): Promise<any>;
    GetAdmins(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetAdminsCsv(listDto: ListDto, user: any): Promise<any>;
    getAdminDetails(userIdDto: UserIdDto): Promise<SuccessInterface>;
    getAdminProfileSectionDetails(userIdDto: UserIdDto): Promise<SuccessInterface>;
    getAdminRecentActivity(recentActivityDto: RecentActivityDto): Promise<SuccessInterface>;
    GetInvitedAdmins(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateUserRole(userIdDto: UserIdDto, role: string, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCompleteAdminSectionData(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetInvitedAdminsCsv(listDto: ListDto, user: any): Promise<any>;
    addOtherUser(createUserDto: CreateUserDto, user: any, files: any): Promise<SuccessInterface>;
    getAdminProfileData(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendPasswordResetLink(emailDto: EmailDto): Promise<SuccessInterface>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface>;
    checkIfEmailExists(emailDto: EmailDto): Promise<SuccessInterface>;
    addCard(stripeTokenDto: StripeTokenDto, user: any): Promise<SuccessInterface>;
    getCards(user: any): Promise<any[] | {
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    connectStripeAccount(authToken: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createPayoutForCollege(amount: number, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getStripeAccountBalance(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    } | {
        data: {};
    }>;
    getInstructorDetails(userIdDto: UserIdDto): Promise<SuccessInterface>;
    getInstructorProfileSectionDetails(userIdDto: UserIdDto): Promise<SuccessInterface>;
    getInstructorRecentActivity(recentActivityDto: RecentActivityDto): Promise<SuccessInterface>;
    GetTopInstructors(durationDto: OptionalDurationPaginationDto): Promise<SuccessInterface>;
    getInstructorCourses(instructorCoursesListDto: InstructorCoursesListDto): Promise<SuccessInterface>;
    GetCollegeAccountCounts(durationDto: OptionalDurationDto, user: any): Promise<SuccessInterface>;
    DeleteInvitation(invitationIdDto: InvitationIdDto): Promise<SuccessInterface>;
    RemoveUser(userIdDto: UserIdDto, user: any): Promise<SuccessInterface>;
    SuspendUser(userIdDto: UserIdDto, user: any): Promise<SuccessInterface>;
    updateUserRoles(updateUserRoleDto: UpdateUserRoleDto, user: any): Promise<{
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
}
