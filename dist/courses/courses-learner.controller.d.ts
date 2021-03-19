import { CoursesService } from './courses.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { LearnersCoursesListDto } from './dto/learnersCoursesList.dto';
import { CourseIdsDto } from './dto/courseIds.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { PostReviewDto } from './dto/postReview.dto';
import { ActivitiesService } from '../activities/activities.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { ReviewIdDto } from '../common/dto/reviewId.dto';
import { CourseNumIdDto } from '../common/dto/courseNumId.dto';
import { LearnersService } from '../learners/learners.service';
import { KeywordDto } from '../common/dto/keyword.dto';
import { CheckPromoDto } from './dto/checkPromo.dto';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { AddToCartDto } from './dto/addToCart.dto';
import { GetCourseTaxLearnerDto } from './dto/getCourseTaxLearner.dto';
import { CollegesService } from '../colleges/colleges.service';
export declare class CoursesLearnerController {
    private readonly coursesService;
    private readonly activitiesService;
    private readonly enrollmentsService;
    private readonly learnersService;
    private readonly enquiriesService;
    private readonly collegesService;
    constructor(coursesService: CoursesService, activitiesService: ActivitiesService, enrollmentsService: EnrollmentsService, learnersService: LearnersService, enquiriesService: EnquiriesService, collegesService: CollegesService);
    CheckPromoValidity(checkPromoDto: CheckPromoDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RemovePromoFromCart(courseIdDto: CourseIdDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetOccupations(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetSkills(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetKnowledgeOutcomes(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetExperiences(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRatingCategories(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCoursesList(learnersCoursesListDto: LearnersCoursesListDto, req: any): Promise<SuccessInterface>;
    GetHighestPriceAndEnrollment(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddCoursesToCart(addToCartDto: AddToCartDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddCoursesToWishList(courseIdsDto: CourseIdsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddCoursesToCheckoutList(courseIdsDto: CourseIdsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddCourseReview(postReviewDto: PostReviewDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetReviewById(reviewIdDto: ReviewIdDto): Promise<SuccessInterface>;
    getCourseTax(getCourseTaxLearnerDto: GetCourseTaxLearnerDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCourseDetails(courseIdDto: CourseNumIdDto, req: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
