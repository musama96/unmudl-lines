import { Model } from 'mongoose';
import { LearnerToken } from './learnerToken.model';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyLearnerDto } from './dto/verifyLearner.dto';
import { LearnersService } from './learners.service';
export declare class LearnerTokensService {
    private readonly learnerTokenModel;
    private readonly learnersService;
    constructor(learnerTokenModel: Model<LearnerToken>, learnersService: LearnersService);
    createLearnerToken(learnerId: string): Promise<string>;
    generateverificationCode(): any;
    createLearnerVerification(learnerId: string): Promise<number>;
    verifyCode(learnerToken: ResetPasswordDto): Promise<LearnerToken>;
    validateVerificationCode(verifyLearner: VerifyLearnerDto): Promise<any>;
}
