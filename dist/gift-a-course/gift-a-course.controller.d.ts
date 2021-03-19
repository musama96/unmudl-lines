import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LearnersService } from '../learners/learners.service';
import { GiftCourseDto } from './dto/giftCourse.dto';
import { RedeemGiftDto } from './dto/redeemGift.dto';
import { VerifyGiftCodeDto } from './dto/verifyGiftCode.dto';
import { GiftACourseService } from './gift-a-course.service';
import { CourseIdDto } from '../common/dto/courseId.dto';
export declare class GiftACourseController {
    private readonly giftACourseService;
    private readonly learnersService;
    private enrollmentsService;
    constructor(giftACourseService: GiftACourseService, learnersService: LearnersService, enrollmentsService: EnrollmentsService);
    giftCourse(giftCourseDto: GiftCourseDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    redeemGift(redeemGiftDto: RedeemGiftDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    verifyGiftCode(verifyGiftCodeDto: VerifyGiftCodeDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendMail(courseIdDto: CourseIdDto): Promise<boolean>;
}
