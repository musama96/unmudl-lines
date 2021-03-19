"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const learners_service_1 = require("./learners.service");
const functions_1 = require("../common/functions");
let LearnerTokensService = class LearnerTokensService {
    constructor(learnerTokenModel, learnersService) {
        this.learnerTokenModel = learnerTokenModel;
        this.learnersService = learnersService;
    }
    async createLearnerToken(learnerId) {
        const token = await functions_1.default.getHash(learnerId);
        const newLearnerToken = new this.learnerTokenModel({
            learnerId,
            token: encodeURIComponent(token),
        });
        const result = await newLearnerToken.save();
        return result.token;
    }
    async generateverificationCode() {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const check = await this.learnerTokenModel.countDocuments({ verificationCode });
        if (check > 0) {
            const code = await this.generateverificationCode();
            return code;
        }
        else {
            return verificationCode;
        }
    }
    async createLearnerVerification(learnerId) {
        const verificationCode = await this.generateverificationCode();
        const newLearnerToken = new this.learnerTokenModel({
            learnerId,
            verificationCode,
        });
        const result = await newLearnerToken.save();
        return result.verificationCode;
    }
    async verifyCode(learnerToken) {
        return await this.learnerTokenModel.findOne({ verificationCode: learnerToken.code }).exec();
    }
    async validateVerificationCode(verifyLearner) {
        return await this.learnerTokenModel
            .findOne({ verificationCode: verifyLearner.verificationCode, learnerId: verifyLearner.learnerId }).lean().exec();
    }
};
LearnerTokensService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('LearnerToken')),
    __param(1, common_1.Inject(common_1.forwardRef(() => learners_service_1.LearnersService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        learners_service_1.LearnersService])
], LearnerTokensService);
exports.LearnerTokensService = LearnerTokensService;
//# sourceMappingURL=learnerTokens.service.js.map