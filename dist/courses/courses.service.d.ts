import { SuccessInterface } from '../common/ResponseHandler';
import { CreateCourseDto } from './dto/createCourse.dto';
import { EditCourseDto } from './dto/editCourse.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { LearnersCoursesListDto } from './dto/learnersCoursesList.dto';
import { CreateDraftDto } from './dto/createDraft.dto';
import { EditDraftDto } from './dto/editDraft.dto';
import { CoursesCsvDto } from './dto/coursesCsv.dto';
import { CopyDraftDto } from './dto/copyDraft.dto';
import { CoursesListDto } from './dto/coursesList.dto';
import { CoursesSectionDataDto } from './dto/coursesSectionData.dto';
import { AddToCartDto } from './dto/addToCart.dto';
import { GetPriceAfterCommissionDto } from './dto/getPriceAfterCommission.dto';
import { UpdateDraftExternalDto } from './dto/updateDraftExternal.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { CollegesService } from '../colleges/colleges.service';
export declare class CoursesService {
    private readonly promoModel;
    private readonly courseModel;
    private readonly trashedCourseModel;
    private readonly courseDraftModel;
    private readonly collegeModel;
    private readonly learnerModel;
    private readonly userModel;
    private readonly counterModel;
    private readonly ratingCategoriesModel;
    private readonly performanceOutcomesModel;
    private readonly cipCertificatesModel;
    private readonly levelAnchorsModel;
    private readonly landingPageModel;
    private readonly blogModel;
    private readonly enrollmentModel;
    private readonly courseCategoryModel;
    private readonly employerModel;
    private readonly notificationsService;
    private readonly redisCacheService;
    private readonly collegesService;
    constructor(promoModel: any, courseModel: any, trashedCourseModel: any, courseDraftModel: any, collegeModel: any, learnerModel: any, userModel: any, counterModel: any, ratingCategoriesModel: any, performanceOutcomesModel: any, cipCertificatesModel: any, levelAnchorsModel: any, landingPageModel: any, blogModel: any, enrollmentModel: any, courseCategoryModel: any, employerModel: any, notificationsService: NotificationsService, redisCacheService: RedisCacheService, collegesService: CollegesService);
    getRatingCategoryIdbyIdentifier(identifier: any): Promise<any>;
    getCourseData(courseId: any): Promise<any>;
    getPerformanceOutcomes(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createPerformanceOutcomeTag(title: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkIfCourseBelongsToCollege(courseId: any, collegeId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorsCourses(instructorId: any): Promise<any>;
    getInstructorReviews(instructorNumId: any, pagination: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getInstructorCourses(instructorNumId: any, pagination: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourse(courseId: any, college: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseDraft(draftId: any, college: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseDetails(courseId: any): Promise<any>;
    getCourseDetailsForEnrollments(courseId: any): Promise<any>;
    getCourseDetailsByMongoId(courseId: any): Promise<any>;
    getDraftDetails(draftId: any): Promise<any>;
    getCourseById(courseId: any): Promise<any>;
    getCourseWithCollegeById(courseId: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCourseInstructors(courseId: any, userId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourses(params: CoursesListDto | CoursesSectionDataDto, isAdmin?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesDropdown(params: CoursesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesDropdownForEmployerPortal(params: CoursesListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCoursesCsv(params: CoursesCsvDto): Promise<any>;
    getDraftCourses(params: CoursesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftCoursesCsv(params: CoursesCsvDto): Promise<any>;
    getCoursesRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftCoursesRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getFollowUpCourses(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopCourses(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTopCoursesCsv(params: any): Promise<any>;
    getCoursesAnalyticsCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesAnalyticsById(courseId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRevenue(courseId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReviews(courseId: any, userId: any, pagination: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReviewsCount(courseId: any): Promise<any>;
    getRatings(courseId: any): Promise<{
        ratings: any;
        satisfiedRating: any;
    }>;
    getRatingsById(courseId: any, isNumId: any): Promise<any>;
    getInstructorRatings(instructorId: any): Promise<any>;
    createCourse(course: CreateCourseDto, user: any): Promise<any>;
    createCourseDraft(courseDraft: CreateDraftDto): Promise<any>;
    updateCourseDraft(courseDraft: UpdateDraftExternalDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createDraftFromCourse(copyDraftDto: CopyDraftDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    cancelCourse(id: any, reasons: string[], user: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCourse(course: EditCourseDto): Promise<any>;
    updateDraft(draft: EditDraftDto): Promise<any>;
    updateCourseRevenue(revenueDetails: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getValidCoursesForPromo(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getValidPromoCoursesCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    setEnrollmentCancelledStatus(courseId: any, status: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesCount(params?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnrollmentStatistics(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCourseTimeZone(courseId: any, timeZone: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRefundStatistics(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getHighRejectionCourses(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEnrollmentStatisticsRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getRefundStatisticsRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getHighRejectionCoursesRows(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursesforLearners(params: LearnersCoursesListDto, learner: any, queryParams?: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerCourseSearchFilters(pipeline: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addToCart(cartData: AddToCartDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCoursePublishedStatus(course: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addToWishList(courseIds: any, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addToCheckoutList(courses: any, courseIds: any, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPromosForCourse(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReviewById(id: any): Promise<SuccessInterface>;
    getRatingCategories(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLevelAnchors(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCipCertificates(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCip(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    mergeArrays(...arrays: any[]): {
        knowledge: any[];
        skills: any[];
        experience: any[];
    };
    getOccupationsForFilter(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSkillsForFilter(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getKnowledgeOutcomesForFilter(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getExperiencesForFilter(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkPromo(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    removePromo(courseId: string, learnerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getHighestPriceAndEnrollmentSize(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTaxForLearner(course: any, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    resizeThumbnails(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteCourse(courseId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursePriceAfterCommission({ collegeId, price, isDisplayPrice }: GetPriceAfterCommissionDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftExist(draftId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseCategories(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
