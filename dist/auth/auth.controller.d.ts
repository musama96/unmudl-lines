import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/authCredentialsDto';
import { UserAuthCredentialsDto } from './dto/userAuthCredentila.dto';
import { EmployerAuthCredentialsDto } from './dto/employerAuthCredentialsDto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    userLogin(authCredentialsDto: AuthCredentialsDto): Promise<{
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
    collegeLogin(authCredentialsDto: AuthCredentialsDto): Promise<{
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
    employerLogin(authCredentialsDto: EmployerAuthCredentialsDto): Promise<{
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
    learnerLogin(authCredentialsDto: UserAuthCredentialsDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
