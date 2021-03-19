import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearnerToken } from './learnerToken.model';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyLearnerDto } from './dto/verifyLearner.dto';
import { LearnersService } from './learners.service';
import CommonFunctions from '../common/functions';

@Injectable()
export class LearnerTokensService {

    constructor(@InjectModel('LearnerToken') private readonly learnerTokenModel: Model<LearnerToken>,
                @Inject(forwardRef(() => LearnersService)) private readonly learnersService: LearnersService) { }

    async createLearnerToken(learnerId: string): Promise<string> {
        const token = await CommonFunctions.getHash(learnerId);
        const newLearnerToken = new this.learnerTokenModel({
          learnerId,
          token: encodeURIComponent(token),
        });
        const result = await newLearnerToken.save();
        return result.token;
    }

    async generateverificationCode() {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const check = await this.learnerTokenModel.countDocuments({verificationCode});
        if (check > 0) {
          const code = await this.generateverificationCode();
          return code;
        } else {
            return verificationCode;
        }
    }

    async createLearnerVerification(learnerId: string): Promise<number> {
        const verificationCode = await this.generateverificationCode();
        const newLearnerToken = new this.learnerTokenModel({
          learnerId,
          verificationCode,
        });
        const result = await newLearnerToken.save();
        return result.verificationCode;
    }

    // async verifyToken(learnerToken: ResetPasswordDto) {
    //     return await this.learnerTokenModel.findOne({token: learnerToken.token}).exec();
    // }

    async verifyCode(learnerToken: ResetPasswordDto) {
        return await this.learnerTokenModel.findOne({verificationCode: learnerToken.code}).exec();
    }

    async validateVerificationCode(verifyLearner: VerifyLearnerDto) {
        return await this.learnerTokenModel
        .findOne({verificationCode: verifyLearner.verificationCode, learnerId: verifyLearner.learnerId}).lean().exec();
    }
}
