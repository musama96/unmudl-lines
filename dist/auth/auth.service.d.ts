import { UsersService } from '../users/users.service';
import { LearnersService } from '../learners/learners.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/authCredentialsDto';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
export declare class AuthService {
    private readonly usersService;
    private readonly employerAdminsService;
    private readonly learnersService;
    private readonly jwtService;
    private readonly employerSubscriptionsService;
    private readonly collegeModel;
    constructor(usersService: UsersService, employerAdminsService: EmployerAdminsService, learnersService: LearnersService, jwtService: JwtService, employerSubscriptionsService: EmployerSubscriptionsService, collegeModel: any);
    userLogin(authCredentialsDto: AuthCredentialsDto, isCollegeUser: boolean): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: any;
            profilePhotoThumbnail: any;
            collegeId: any;
            college: any;
            collegeDomain: any;
            orgId: any;
            role: any;
        };
    }>;
    employerLogin(authCredentialsDto: AuthCredentialsDto): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: any;
            profilePhotoThumbnail: any;
            employerId: any;
            employer: any;
            employerAddress: any;
            employerDomain: any;
            employerLogo: any;
            employerBanner: any;
            employerLogoThumbnail: any;
            zip: any;
            role: any;
            activeSubscription: any;
        };
    }>;
    login(authCredentialsDto: AuthCredentialsDto): Promise<{
        accessToken: string;
        user: {
            _id: any;
            fullname: any;
            username: any;
            emailAddress: any;
            profilePhoto: any;
            profilePhotoThumbnail: any;
            collegeId: any;
            college: any;
            collegeDomain: any;
            role: any;
        };
    }>;
    learnerLogin(authCredentialsDto: AuthCredentialsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
