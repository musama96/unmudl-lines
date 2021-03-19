import { EnrollmentsService } from './enrollments.service';
import { CoursesService } from '../courses/courses.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateEnrollmentDto } from './dto/createEnrollment.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { CheckoutCartDto } from './dto/checkoutCart.dto';
export declare class LearnerEnrollmentsController {
    private readonly enrollmentsService;
    private readonly coursesService;
    private readonly activitiesService;
    constructor(enrollmentsService: EnrollmentsService, coursesService: CoursesService, activitiesService: ActivitiesService);
    GetRecentEnrollmentData(collegeIdDto: CollegeIdDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddEnrollment(createEnrollmentDto: CreateEnrollmentDto, user: any): Promise<SuccessInterface>;
    CheckoutCart(checkoutCartDto: CheckoutCartDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
