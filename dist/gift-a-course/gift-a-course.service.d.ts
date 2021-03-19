import { GiftCourseDto } from './dto/giftCourse.dto';
import { MailerService } from '@nest-modules/mailer';
import { CoursesService } from '../courses/courses.service';
import { StripeService } from '../stripe/stripe.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { PromosService } from '../promos/promos.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class GiftACourseService {
    private readonly giftCourseModel;
    private readonly enrollmentModel;
    private readonly courseModel;
    private readonly learnerModel;
    private readonly userModel;
    private readonly promoModel;
    private readonly enrollmentsService;
    private readonly mailerService;
    private readonly coursesService;
    private readonly stripeService;
    private readonly promosService;
    private readonly emailLogsService;
    constructor(giftCourseModel: any, enrollmentModel: any, courseModel: any, learnerModel: any, userModel: any, promoModel: any, enrollmentsService: EnrollmentsService, mailerService: MailerService, coursesService: CoursesService, stripeService: StripeService, promosService: PromosService, emailLogsService: EmailLogsService);
    giftCourse(gift: GiftCourseDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEnrollmentIdInGift(giftId: any, enrollmentId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateGiftStatus(giftId: any, status: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getGiftById(id: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getGiftByCode(giftCode: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getValidGiftByCode(giftCode: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendRecepientMail(giftObj: any, course: any, courseUrl: any, senderId: any): Promise<boolean>;
}
