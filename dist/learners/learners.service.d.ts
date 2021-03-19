import { Learner } from './learner.model';
import { MailerService } from '@nest-modules/mailer';
import { LearnerTokensService } from './learnerTokens.service';
import { UserAuthCredentialsDto } from '../auth/dto/userAuthCredentila.dto';
import { CoursesService } from '../courses/courses.service';
import { EmailDto } from '../common/dto/email.dto';
import { PhoneNumberDto } from '../common/dto/phoneNumber.dto';
import { UpdateSuspendLearnerDto } from './dto/updateSuspend.dto';
import { ExternalService } from '../external/external.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { GetHelpAndSupportChatsDto } from './dto/getHelpAndSupportChats.dto';
export declare class LearnersService {
    private readonly learnerModel;
    private readonly enrollmentModel;
    private readonly courseModel;
    private readonly notificationsModel;
    private readonly emailLogModel;
    private readonly chatModel;
    private readonly mailerService;
    private readonly coursesService;
    private readonly externalService;
    private readonly learnerTokensService;
    private readonly emailLogsService;
    constructor(learnerModel: any, enrollmentModel: any, courseModel: any, notificationsModel: any, emailLogModel: any, chatModel: any, mailerService: MailerService, coursesService: CoursesService, externalService: ExternalService, learnerTokensService: LearnerTokensService, emailLogsService: EmailLogsService);
    private readonly logger;
    validateEmail(emailDto: EmailDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    validatePhoneNumber(phoneNumberDto: PhoneNumberDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    insertLearner(learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createLearnerForOtherSignups(learner: any): Promise<any>;
    validateLearnerForLogin(authCredentialsDto: UserAuthCredentialsDto): Promise<any>;
    updateLastLoggedIn(learnerId: any): Promise<void>;
    verifyLearner(learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerById(learnerId: string): Promise<any>;
    getLearnerByEmail(emailAddress: string): Promise<any>;
    getLearnerByPhoneNumber(phoneNumber: string): Promise<any>;
    getLearnerCourses(courseIds: string[], learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateLearner(update: any, learnerId: any): Promise<any>;
    changePassword(passwordDto: any, learnerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createPassword(passwordDto: any, learnerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendResetPasswordLink(learner: Learner): Promise<boolean>;
    updatePassword(password: string, learnerId: string): Promise<boolean>;
    sendVerificationLink(learner: Learner): Promise<boolean>;
    testMailLog(): Promise<any>;
    getAnalyticsCount(params?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAnalyticsCountForAdmin(params?: {
        start?: string;
        end?: string;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getGrowth(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void>;
    getLearnerDetails(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersByCollege(params: any, approved?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersForAdmin(params: any, approved?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnrollmentStatusesCount(): Promise<void>;
    getLearnersByCourse(params: any, approved?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersByCollegeCsv(params: any): Promise<any>;
    getLearnersForUnmudlAdminCsv(params: any): Promise<any>;
    getLearnersByCourseCsv(params: any): Promise<any>;
    getLearnersCountByCollege(params: any, approved?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersCountByCourse(params: any, approved?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    blacklistLearner(learnerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersEnrollments(learnerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    removeCoursesFromCart(courseIds: string[], learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    removeCoursesFromWishList(courseIds: string[], learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerNotifications(params: any, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnrollments(learnerId: any, status: string[]): Promise<any>;
    updateSuspend(suspendLearner: UpdateSuspendLearnerDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerChats(learner: any, params: GetHelpAndSupportChatsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
