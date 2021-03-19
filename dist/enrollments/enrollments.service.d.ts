import { StripeService } from '../stripe/stripe.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nest-modules/mailer';
import { LearnersSectionAdminDto } from '../learners/dto/LearnersSectionAdmin.dto';
import { GetCountDto } from '../common/dto/getCount.dto';
import { RejectEnrollmentDto } from './dto/rejectEnrollment.dto';
import { CoursesService } from '../courses/courses.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateEnrollmentDto } from './dto/createEnrollment.dto';
import { CoursePaginationDto } from '../courses/dto/coursePagination.dto';
import { LearnerDataDto } from './dto/learnerData.dto';
import { ExternalService } from '../external/external.service';
import { ChangeEnrollmentStatusDto } from './dto/changeEnrollmentStatus.dto';
import { UpdateLearnerEnrollmentActivityDto } from './dto/updateLearnerEnrollmentActivity.dto';
import { CourseNumIdDto } from '../common/dto/courseNumId.dto';
import { LearnersService } from '../learners/learners.service';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { CollegesService } from '../colleges/colleges.service';
import { TransferPaymentDto } from './dto/transferPayment.dto';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class EnrollmentsService {
    private readonly enrollmentModel;
    private readonly learnerModel;
    private readonly promoModel;
    private readonly courseModel;
    private readonly userModel;
    private readonly collegeModel;
    private readonly giftCourseModel;
    private readonly stripeService;
    private readonly notificationsService;
    private readonly mailerService;
    private readonly coursesService;
    private readonly collegesService;
    private readonly activitiesService;
    private readonly externalService;
    private readonly learnersService;
    private readonly enquiriesService;
    private readonly emailLogsService;
    private readonly stripe;
    constructor(enrollmentModel: any, learnerModel: any, promoModel: any, courseModel: any, userModel: any, collegeModel: any, giftCourseModel: any, stripeService: StripeService, notificationsService: NotificationsService, mailerService: MailerService, coursesService: CoursesService, collegesService: CollegesService, activitiesService: ActivitiesService, externalService: ExternalService, learnersService: LearnersService, enquiriesService: EnquiriesService, emailLogsService: EmailLogsService);
    private readonly logger;
    getApprovedLearnersForCourse(params: CoursePaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getApprovedLearnersForCourseCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseEnrollmentRequests(params: any): Promise<{
        enrollmentRequests: any;
        enrollmentRequestsCount: any;
    }>;
    createEnrollment(enrollment: CreateEnrollmentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createEnrollmentForGift(gift: any, learnerData: LearnerDataDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendMailToCollegeAndLearner(learnerName: any, course: any, learner: any, learnerData: any, enrollment: any, isGift?: boolean, sender?: any): Promise<boolean>;
    createTransaction(amount: any, cardId: any, customerId: any, description: any, descriptor: any, capture?: boolean): Promise<any>;
    rejectEnrollment(rejectionInfo: RejectEnrollmentDto, enrollmentId: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateLearnerEnrollmentActivityByExternalUser(enrollmentId: string, activity: UpdateLearnerEnrollmentActivityDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    changeEnrollmentStatus(params: ChangeEnrollmentStatusDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    suspendLearnerEnrollments(learnerId: any, collegeId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTotalEnrollmentsAndEnrollmentsAllowed(courseId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    cancelAllEnrollmentsForCourse(courseId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRevenueAnalytics(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseDropAnalytics(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRevenueAnalyticsForGraph(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersGrowth(params: LearnersSectionAdminDto | GetCountDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersGrowthCsv(params: any): Promise<any>;
    getLearnersGrowthCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersCourseEnrollment(learnerId: any, courseId: any): Promise<any>;
    getLearnersInCSV(params: any): Promise<any>;
    getEnrollmentById(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    refundEnrollment(id: any, status: any, transferId?: any, courseCanceled?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEnrollmentStatus(id: any, status: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateTransferStatus(id: any, status: any, transferId: any, destPaymentId: any, sentToCollege?: number): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    setTransferStatus(id: any, status: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    incrementChargeAttempt(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateRevenueInfo({ totalRevenue, unmudlShare, collegeShare, courseId, learnerId }: {
        totalRevenue: any;
        unmudlShare: any;
        collegeShare: any;
        courseId: any;
        learnerId: any;
    }): Promise<{
        course: any;
        learner: any;
        college: any;
        instructors: [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
    }>;
    CaptureChargedAmountFromCustomer(): Promise<void>;
    TransferPaymentsToCollege(): Promise<void>;
    CaptureChargedAmountFromCustomerManually(): Promise<{
        nonStripeColleges: any[];
        enrollments: any;
    }>;
    getCourseEnrollmentsCount(courseId: any): Promise<any>;
    getEnrolledLearnerDetails(enrollmentId: any): Promise<any>;
    checkEnrollmentDeadline(cart: any): Promise<any>;
    getRecentEnrollmentData(collegeId: string, learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateLearner(learnerData: LearnerDataDto, learner: any): Promise<any>;
    getCourseDetails(courseIdDto: CourseNumIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    transferPaymentToCollegeAgainstEnrollment(transferPaymentDto: TransferPaymentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
