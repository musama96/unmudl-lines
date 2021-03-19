import { UpdateEmployerCompanyDto } from './dto/update-employer-company.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { ListDto } from '../common/dto/list.dto';
import { JwtService } from '@nestjs/jwt';
import { CollegesService } from '../colleges/colleges.service';
import { EmployersService } from '../employers/employers.service';
import { UnmudlAccessLogsService } from '../unmudl-access-logs/unmudl-access-logs.service';
export declare class EmployerCompaniesService {
    private readonly employerCompanyModel;
    private readonly employerCompanyTokenModel;
    private readonly employerInvitationModel;
    private readonly employerAdminModel;
    private readonly jwtService;
    private readonly collegesService;
    private readonly employersService;
    private readonly unmudlAccessLogsService;
    constructor(employerCompanyModel: any, employerCompanyTokenModel: any, employerInvitationModel: any, employerAdminModel: any, jwtService: JwtService, collegesService: CollegesService, employersService: EmployersService, unmudlAccessLogsService: UnmudlAccessLogsService);
    getEmployerById(employerId: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateEmployer(employerCompany: UpdateEmployerCompanyDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    toggleSuspendEmployer(employerId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    verifyToken(token: string, remove?: boolean): Promise<any>;
    getEmployersList(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployersCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployerGrowth(params: any, csv?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getEmployers(params: ListDto): Promise<SuccessInterface>;
    getEmployersAsCsv(params: ListDto): Promise<SuccessInterface>;
    returnUnmudlAdminEmployerPortalAccess(employerId: any, user: any): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: string;
            profilePhotoThumbnail: string;
            employerId: any;
            employer: any;
            employerDomain: any;
            employerLogo: any;
            employerLogoThumbnail: any;
            role: any;
            admin: {
                fullname: any;
                profilePhoto: any;
                profilePhotoThumbnail: any;
            };
            activeSubscription: any;
        };
    }>;
}
