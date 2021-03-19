import { College } from './college.model';
import { SuccessInterface } from '../common/ResponseHandler';
import { ListDto } from '../common/dto/list.dto';
import { UpdateCollegeDto } from './dto/updateCollege.dto';
import { TransactionActivityCsvDto } from '../activities/dto/transactionActivityCsv.dto';
import { IntervalDto } from '../common/dto/interval.dto';
import { RecentActivityDto } from '../users/dto/recentActivity.dto';
import { LocationDto } from './dto/location.dto';
import { JwtService } from '@nestjs/jwt';
import { UnmudlAccessLogsService } from '../unmudl-access-logs/unmudl-access-logs.service';
import { CollegesListDto } from './dto/collegesList.dto';
export declare class CollegesService {
    private readonly collegeModel;
    private readonly collegeTokenModel;
    private readonly enrollmentModel;
    private readonly courseModel;
    private readonly userModel;
    private readonly landingPageModel;
    private readonly counterModel;
    private readonly employerModel;
    private readonly jwtService;
    private readonly unmudlAccessLogsService;
    constructor(collegeModel: any, collegeTokenModel: any, enrollmentModel: any, courseModel: any, userModel: any, landingPageModel: any, counterModel: any, employerModel: any, jwtService: JwtService, unmudlAccessLogsService: UnmudlAccessLogsService);
    create(college: College): Promise<SuccessInterface>;
    getCollegesDropdown(keyword: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesList(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeStats(collegeId?: any): Promise<{
        collegesCount: any;
        coursesCount: any;
        employersCount: any;
    }>;
    getCollegesRevenue(params: any): Promise<{
        sharedRevenue: any;
        collegeRevenue: any;
        totalRevenue: any;
    }>;
    getCollegeBasicDetailsByNumId(collegeNumId: any): Promise<any>;
    getColleges(params: CollegesListDto): Promise<SuccessInterface>;
    getCollegeNamesList(params: ListDto): Promise<SuccessInterface>;
    getCollegeNamesListForEmployerPortal(params: ListDto, user: any): Promise<SuccessInterface>;
    getCollegeDetails({ collegeId }: {
        collegeId: any;
    }): Promise<SuccessInterface>;
    getCollegesByStateShortName(state: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesByStateShortNameForEmployerSubscriptions(state?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesAsCsv(params: ListDto): Promise<SuccessInterface>;
    getTopColleges(params: any): Promise<SuccessInterface>;
    getTopCollegesCsv(params: any): Promise<SuccessInterface>;
    getTopCollegesRows(params: any): Promise<SuccessInterface>;
    verifyToken(token: string, remove?: boolean): Promise<any>;
    updateCollege(college: UpdateCollegeDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePartnerCommission(collegeId: any, commission: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePartnerGroup(collegeId: any, partnerGroupId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeById(collegeId: any): Promise<SuccessInterface>;
    getCollegeByNumId(collegeId: any): Promise<SuccessInterface>;
    updateStripeId(collegeId: string, stripeId: string): Promise<void>;
    checkDomain(emailAddress: any, collegeId: any): Promise<never>;
    getFinanceSummary(collegeId?: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeGrowth(params: any, csv?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllColleges(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeInstructors(collegeNumId: any, params: any): Promise<{
        instructors: any;
        instructorsCount: any;
    }>;
    getCollegeCourses(collegeNumId: any, params: any): Promise<{
        courses: any;
        coursesCount: any;
    }>;
    getInstructorDetails(instructorId: any): Promise<any>;
    getCollegeRevenueGraph(params: IntervalDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeRevenueGraphAsCsv(params: IntervalDto): Promise<any>;
    getTransactionActivities(params: RecentActivityDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegeAdminsForEmail(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTransactionActivitiesCsv(params: TransactionActivityCsvDto): Promise<any>;
    getCollegeByOrgId(orgId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    suspendUnsupendCollege(collegeId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateCollegeTimeZone(collegeId: any, timeZone: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesByLocation({ lat, lng }: LocationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesForEmployerPortal(keyword: string, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCollegesByLocationForEmployerPortal({ lat, lng }: LocationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllCollegesIds(): Promise<any>;
    updateCollegeOutstandingBalance(id: any, balance: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getUnmudlAdminCollegePortalAccessToken(collegeId: any, user: any): Promise<{
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
