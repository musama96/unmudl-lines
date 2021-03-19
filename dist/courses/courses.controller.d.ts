import { CoursesService } from './courses.service';
import { EmployersService } from '../employers/employers.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { CreateCourseDto } from './dto/createCourse.dto';
import { EditCourseDto } from './dto/editCourse.dto';
import { CoursesListDto } from './dto/coursesList.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { SetEnrollmentCancelledStatusDto } from './dto/setEnrollmentCancelledStatus.dto';
import { ValidPromoDto } from './dto/validPromo.dto';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { TitleDto } from '../common/dto/title.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { GetEnrollmentStatisticsDto } from './dto/getEnrollmentStatistics.dto';
import { GetRefundStatisticsDto } from './dto/getRefundStatistics.dto';
import { GetHighRejectionCoursesDto } from './dto/getHighRejectionCourses.dto';
import { ActivitiesService } from '../activities/activities.service';
import { UpdatePublishedStatusDto } from './dto/updatePublishedStatus.dto';
import { GetCoursePromosDto } from './dto/getCoursePromos.dto';
import { FollowUpCoursesDto } from './dto/getFollowupCourses.dto';
import { CoursesSectionDataDto } from './dto/coursesSectionData.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { PromosService } from '../promos/promos.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CoursePaginationDto } from './dto/coursePagination.dto';
import { OccupationCodesDto } from './dto/occupationCodes.dto';
import { CoursePromoDataDto } from './dto/coursePromoData.dto';
import { GetAnchorsDto } from './dto/getAnchors.dto';
import { CreateDraftDto } from './dto/createDraft.dto';
import { DraftIdDto } from './dto/draftId.dto';
import { EditDraftDto } from './dto/editDraft.dto';
import { DraftNumIdDto } from './dto/draftNumId.dto';
import { CoursesCsvDto } from './dto/coursesCsv.dto';
import { CopyDraftDto } from './dto/copyDraft.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDraftExternalDto } from './dto/createDraftExternal.dto';
import { UpdateDraftExternalDto } from './dto/updateDraftExternal.dto';
import { GetPriceAfterCommissionDto } from './dto/getPriceAfterCommission.dto';
import { CancelCourseDto } from './dto/cancelCourse.dto';
import { UsersService } from '../users/users.service';
import { CollegesService } from '../colleges/colleges.service';
import { MailerService } from '@nest-modules/mailer';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class CoursesController {
    private readonly mailerService;
    private readonly coursesService;
    private readonly collegesService;
    private readonly enrollmentsService;
    private readonly activitiesService;
    private readonly employersService;
    private readonly promosService;
    private readonly notificationsService;
    private readonly usersService;
    private readonly emailLogsService;
    constructor(mailerService: MailerService, coursesService: CoursesService, collegesService: CollegesService, enrollmentsService: EnrollmentsService, activitiesService: ActivitiesService, employersService: EmployersService, promosService: PromosService, notificationsService: NotificationsService, usersService: UsersService, emailLogsService: EmailLogsService);
    private readonly logger;
    GetCoursesList(coursesListDto: CoursesListDto, user: any): Promise<SuccessInterface>;
    GetCoursesDropdown(coursesListDto: CoursesListDto, user: any): Promise<SuccessInterface>;
    getCoursesDropdownForEmployerPortal(coursesListDto: CoursesListDto, user: any): Promise<SuccessInterface>;
    GetCoursesListCsv(coursesCsvDto: CoursesCsvDto, user: any): Promise<SuccessInterface>;
    GetDraftCoursesList(coursesListDto: CoursesListDto, user: any): Promise<SuccessInterface>;
    GetDraftCourseForExterbal(draftIdDto: DraftIdDto, user: any): Promise<SuccessInterface>;
    GetDraftCoursesListCsv(coursesCsvDto: CoursesCsvDto, user: any): Promise<SuccessInterface>;
    GetCompleteCoursesSectionData(coursesSectionDataDto: CoursesSectionDataDto, user: any): Promise<SuccessInterface>;
    GetCompleteViewCourseSectionData(courseIdDto: CourseIdDto, user: any): Promise<SuccessInterface>;
    GetViewCourseStatisticsData(coursePaginationDto: CoursePaginationDto): Promise<SuccessInterface>;
    GetViewCourseEnrollmentsData(coursePaginationDto: CoursePaginationDto): Promise<SuccessInterface>;
    GetViewCourseReviewsData(coursePaginationDto: CoursePaginationDto, user: any): Promise<SuccessInterface>;
    GetViewCoursePromosData(coursePromoDataDto: CoursePromoDataDto): Promise<SuccessInterface>;
    GetPerformance(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCoursesAnalytics(durationDto: OptionalDurationPaginationDto, user: any): Promise<any>;
    GetCoursesCount(analyticsCountDto: AnalyticsCountDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCoursesAnalyticsByCourse(courseIdDto: CourseIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCourseDetails(courseIdDto: CourseIdDto, user: any): Promise<SuccessInterface>;
    GetCourseDraftDetails(draftIdDto: DraftIdDto, user: any): Promise<SuccessInterface>;
    GetCourseRevenue(courseIdDto: CourseIdDto): Promise<SuccessInterface>;
    GetCourseReviews(courseIdDto: CourseIdDto, user: any): Promise<SuccessInterface>;
    GetValidPromoCourses(validPromoDto: ValidPromoDto, user: any): Promise<SuccessInterface>;
    GetPromosForCourse(getCoursePromosDto: GetCoursePromosDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCourseRatings(courseIdDto: CourseIdDto): Promise<SuccessInterface>;
    CreatePerformanceOutcome(titleDto: TitleDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SetEnrollmentCancelledStatus(setEnrollmentCancelledStatusDto: SetEnrollmentCancelledStatusDto, user: any): Promise<SuccessInterface>;
    CreateCourse(createCourseDto: CreateCourseDto, user: any, files: any): Promise<SuccessInterface>;
    CreateCourseDraft(createDraftDto: CreateDraftDto, user: any, files: any): Promise<SuccessInterface>;
    createCourseDraftExternal(createDraftDto: CreateDraftExternalDto, user: any, files: any): Promise<SuccessInterface>;
    updateCourseDraftExternal(updateDraftExternalDto: UpdateDraftExternalDto, user: any, files: any): Promise<SuccessInterface>;
    CreateDraftFromCourse(copyDraftDto: CopyDraftDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateCourse(editCourseDto: EditCourseDto, user: any, files: any): Promise<SuccessInterface>;
    UpdateCourseDraft(editDraftDto: EditDraftDto, user: any, files: any): Promise<SuccessInterface>;
    cancelCourse(courseIdDto: CourseIdDto, cancelCourseDto: CancelCourseDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEnrollmentStatistics(getEnrollmentStatisticsDto: GetEnrollmentStatisticsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetFollowupCourses(followUpCoursesDto: FollowUpCoursesDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRefundStatistics(getRefundStatisticsDto: GetRefundStatisticsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetHighRejectionCourses(getHighRejectionCoursesDto: GetHighRejectionCoursesDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateCoursePublishedStatus(updatePublishedStatusDto: UpdatePublishedStatusDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetOccupations(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCertifications(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetLicenses(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetOccupationDetails(occupationCodesDto: OccupationCodesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetOccupationTests(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetLevelAnchors(getAnchorsDto: GetAnchorsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCipCertificates(paginationDto: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetDraftPeview(draftIdDto: DraftNumIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteCourse(courseIdDto: CourseIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursePriceWithCommission(getPriceAfterCommissionDto: GetPriceAfterCommissionDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCourseCategories(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
