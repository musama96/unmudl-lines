import { JwtService } from '@nestjs/jwt';
import { LearnersService } from './learners.service';
import { LearnerTokensService } from './learnerTokens.service';
import { ChangePasswordDto } from '../common/dto/changePassword.dto';
import { CreatePasswordDto } from './dto/createPassword.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { CreateLearnerDto } from './dto/createLearner.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyLearnerDto } from './dto/verifyLearner.dto';
import { SocialSignupTokenDto } from './dto/socialSignupToken.dto';
import { EditPersonalInformationDto } from './dto/editPersonalInformation.dto';
import { EditLocationInformationDto } from './dto/editLocationInformation.dto';
import { StripeService } from '../stripe/stripe.service';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { CardIdDto } from '../common/dto/cardId.dto';
import { CourseIdsDto } from '../courses/dto/courseIds.dto';
import { UpdateProfilePhotoDto } from './dto/updateProfilePhoto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { EmailPhoneDto } from './dto/email-phone.dto';
import { EmailDto } from '../common/dto/email.dto';
import { PhoneNumberDto } from '../common/dto/phoneNumber.dto';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { SourceTalentService } from '../source-talent/source-talent.service';
import { GetHelpAndSupportChatsDto } from './dto/getHelpAndSupportChats.dto';
export declare class LearnersController {
    private readonly learnersService;
    private readonly learnerTokenService;
    private readonly stripeService;
    private readonly jwtService;
    private readonly enquiriesService;
    private readonly sourceTalentService;
    constructor(learnersService: LearnersService, learnerTokenService: LearnerTokensService, stripeService: StripeService, jwtService: JwtService, enquiriesService: EnquiriesService, sourceTalentService: SourceTalentService);
    GetEmailValidation(emailDto: EmailDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPhoneNumberValidation(phoneNumberDto: PhoneNumberDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    CreatePaymentMethod(stripeTokenDto: StripeTokenDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetCart(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RemoveFromCart(courseIds: CourseIdsDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    RemoveFromWishList(courseIds: CourseIdsDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetWishList(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetNotifications(paginationDto: PaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetHelpAndSupport(getHelpAndSupportChatsDto: GetHelpAndSupportChatsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEnrollments(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPaymentMethods(user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeletePaymentMethod(cardIdDto: CardIdDto, user: any): Promise<any>;
    CreateLearner(createLearnerDto: CreateLearnerDto): Promise<SuccessInterface>;
    ResendVerificationCode(emailDto: EmailPhoneDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SignInUsingGoogle(googleTokenDto: SocialSignupTokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SignInUsingLinkedin(socialSignupTokenDto: SocialSignupTokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SignInUsingFacebook(socialSignupTokenDto: SocialSignupTokenDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    VerifyLearner(verifyLearnerDto: VerifyLearnerDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    sendPasswordResetLink(emailDto: EmailPhoneDto): Promise<SuccessInterface>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface>;
    UpdateProfilePhoto(updateProfilePhotoDto: UpdateProfilePhotoDto, learner: any, files: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdatePersonalInformation(editPersonalInformationDto: EditPersonalInformationDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateLocation(editLocationInformationDto: EditLocationInformationDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdatePassword(changePasswordDto: ChangePasswordDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    CreatePassword(createPasswordDto: CreatePasswordDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    TestMailLog(): Promise<any>;
}
