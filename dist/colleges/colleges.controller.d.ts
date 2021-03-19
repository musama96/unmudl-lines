import { SignUpCollegeDto } from './dto/signUpCollege.dto';
import { ListDto } from '../common/dto/list.dto';
import { CollegesService } from './colleges.service';
import { UsersService } from '../users/users.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { UpdateCollegeDto } from './dto/updateCollege.dto';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { StripeService } from '../stripe/stripe.service';
import { PayoutsService } from '../payouts/payouts.service';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { GetCountDto } from '../common/dto/getCount.dto';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { IntervalDto } from '../common/dto/interval.dto';
import { TokenDto } from '../users/dto/token.dto';
import { CollegeInvitationsService } from '../college-invitations/college-invitations.service';
import { FinanceSummaryDto } from './dto/financeSummary.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { ActivitiesService } from '../activities/activities.service';
import { RecentActivityDto } from '../users/dto/recentActivity.dto';
import { TransactionActivityCsvDto } from '../activities/dto/transactionActivityCsv.dto';
import { PartnerGroupIdDto } from '../common/dto/partnerGroupId.dto';
import { UpdatePartnerCommissionDto } from './dto/updatePartnerCommission.dto';
import { NotificationsService } from '../notifications/notifications.service';
import AdminHomeDto from './dto/adminHomeDto.dto';
import StatsDto from './dto/stats.dto';
import { LocationDto } from './dto/location.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { OptionalCollegeIdDto } from '../common/dto/optionalCollegeId.dto';
import { CollegesListDto } from './dto/collegesList.dto';
export declare class CollegesController {
    private readonly collegesService;
    private readonly collegeInvitationsService;
    private readonly usersService;
    private readonly stripeService;
    private readonly payoutService;
    private readonly activitiesService;
    private readonly notificationsService;
    private readonly enrollmentsService;
    constructor(collegesService: CollegesService, collegeInvitationsService: CollegeInvitationsService, usersService: UsersService, stripeService: StripeService, payoutService: PayoutsService, activitiesService: ActivitiesService, notificationsService: NotificationsService, enrollmentsService: EnrollmentsService);
    GetCollegeByToken(tokenDto: TokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    create(signUpCollegeDto: SignUpCollegeDto, files: any): Promise<SuccessInterface>;
    Update(collegeIdDto: CollegeIdDto, updateCollegeDto: UpdateCollegeDto, files: any): Promise<SuccessInterface>;
    updatePartnerCommission(updatePartnerCommissionDto: UpdatePartnerCommissionDto, collegeIdDto: CollegeIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePartnerGroup(collegeIdDto: CollegeIdDto, partnerGroupIdDto: PartnerGroupIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    checkIfEmailExists(emailAddress: string): Promise<SuccessInterface>;
    getCollegesByLocation(locationDto: LocationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesByLocationForEmployerPortal(locationDto: LocationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesForEmployerPortal(keywordDto: KeywordDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetUsersCollege(collegeIdDto: OptionalCollegeIdDto, user: any): Promise<SuccessInterface>;
    GetCollegeRecentActivity(user: any, recentActivityDto: RecentActivityDto): Promise<SuccessInterface>;
    UpdateCollegeProfile(updateCollegeDto: UpdateCollegeDto, user: any, files: any): Promise<SuccessInterface>;
    GetColleges(listDto: CollegesListDto, user: any): Promise<SuccessInterface>;
    GetCollegeNamesList(listDto: ListDto, user: any): Promise<SuccessInterface>;
    getCollegeNamesListForEmployerPortal(listDto: ListDto, user: any): Promise<SuccessInterface>;
    GetCollegesDropdown(keywordDto: KeywordDto, user: any): Promise<SuccessInterface>;
    GetCollegeDashboard(adminHomeDto: AdminHomeDto, user: any): Promise<SuccessInterface>;
    GetCollegesStatistics(statsDto: StatsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCollegeDetailsById(collegeIdDto: CollegeIdDto, user: any): Promise<SuccessInterface>;
    GetCollegeDetails(collegeIdDto: CollegeIdDto, user: any): Promise<SuccessInterface>;
    GetCollegesAsCsv(listDto: ListDto, user: any): Promise<SuccessInterface>;
    GetTopColleges(durationDto: OptionalDurationPaginationDto, user: any): Promise<SuccessInterface>;
    GetCollegesCount(getCountDto: GetCountDto): Promise<SuccessInterface>;
    connectStripeAccount(authToken: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCollegeGrowthGraph(analyticsCountDto: AnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetCollegeGrowthGraphAsCsv(analyticsCountDto: AnalyticsCountDto, user: any): Promise<SuccessInterface>;
    GetFinanceSummary(user: any, collegeId: string): Promise<SuccessInterface>;
    GetFinanceSummaryDashboard(financeSummaryDto: FinanceSummaryDto, user: any): Promise<SuccessInterface>;
    GetTransactionHistoryForFinanceSummarySection(user: any, recentActivityDto: RecentActivityDto): Promise<SuccessInterface>;
    GetTransactionHistoryAsCsvForFinanceSummarySection(user: any, transactionActivityCsvDto: TransactionActivityCsvDto): Promise<SuccessInterface>;
    GetFinanceRevenueGraph(user: any, params: IntervalDto): Promise<SuccessInterface>;
    GetFinanceRevenueGraphCsv(user: any, params: IntervalDto): Promise<SuccessInterface>;
    SuspendUnsuspendCollege(collegeIdDto: CollegeIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUnmudlAdminCollegePortalAccessToken(collegeIdDto: CollegeIdDto, user: any): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: string;
            profilePhotoThumbnail: string;
            collegeId: any;
            college: any;
            collegeDomain: any;
            collegeLogo: any;
            collegeLogoThumbnail: any;
            role: any;
            admin: {
                fullname: any;
                profilePhoto: any;
                profilePhotoThumbnail: any;
            };
        };
    }>;
}
