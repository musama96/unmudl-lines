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
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const learners_service_1 = require("../learners/learners.service");
const giftCourse_dto_1 = require("./dto/giftCourse.dto");
const redeemGift_dto_1 = require("./dto/redeemGift.dto");
const verifyGiftCode_dto_1 = require("./dto/verifyGiftCode.dto");
const gift_a_course_service_1 = require("./gift-a-course.service");
const courseId_dto_1 = require("../common/dto/courseId.dto");
const config_1 = require("../config/config");
let GiftACourseController = class GiftACourseController {
    constructor(giftACourseService, learnersService, enrollmentsService) {
        this.giftACourseService = giftACourseService;
        this.learnersService = learnersService;
        this.enrollmentsService = enrollmentsService;
    }
    async giftCourse(giftCourseDto, user) {
        giftCourseDto.senderId = user._id;
        giftCourseDto.senderName = user.fullname;
        giftCourseDto.senderEmail = user.emailAddress;
        const learner = await this.learnersService.getLearnerByEmail(giftCourseDto.recipientEmail);
        if (learner) {
            giftCourseDto.recipientId = learner._id;
            giftCourseDto.stripeCustomerId = user.stripeCustomerId;
            return await this.giftACourseService.giftCourse(giftCourseDto, user);
        }
        else {
            return ResponseHandler_1.default.fail('Recipient not found.');
        }
    }
    async redeemGift(redeemGiftDto, user) {
        const { data: gift } = await this.giftACourseService.getValidGiftByCode(redeemGiftDto.giftCode);
        if (!gift || gift.recipientId.toString() !== user._id.toString()) {
            return ResponseHandler_1.default.fail('Invalid gift code.');
        }
        const { data: enrollment, message } = await this.enrollmentsService.createEnrollmentForGift(gift, redeemGiftDto.learnerData);
        await this.giftACourseService.updateEnrollmentIdInGift(gift._id, enrollment._id);
        return ResponseHandler_1.default.success(enrollment, message);
    }
    async verifyGiftCode(verifyGiftCodeDto, user) {
        const { data: gift } = await this.giftACourseService.getValidGiftByCode(verifyGiftCodeDto.giftCode);
        if (gift && gift.courseId.toString() === verifyGiftCodeDto.courseId && user._id.toString() === gift.recipientId.toString()) {
            return ResponseHandler_1.default.success(gift);
        }
        else {
            return ResponseHandler_1.default.fail('Invalid gift code.');
        }
    }
    async sendMail(courseIdDto) {
        config_1.pusher.trigger('notification-5e87130f722c5a0f1c4928bf', 'source-talent-request', {});
        return true;
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post(),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [giftCourse_dto_1.GiftCourseDto, Object]),
    __metadata("design:returntype", Promise)
], GiftACourseController.prototype, "giftCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post('redeem'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redeemGift_dto_1.RedeemGiftDto, Object]),
    __metadata("design:returntype", Promise)
], GiftACourseController.prototype, "redeemGift", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('verify-code'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyGiftCode_dto_1.VerifyGiftCodeDto, Object]),
    __metadata("design:returntype", Promise)
], GiftACourseController.prototype, "verifyGiftCode", null);
__decorate([
    common_1.Get('mail'),
    openapi.ApiResponse({ status: 200, type: Boolean }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto]),
    __metadata("design:returntype", Promise)
], GiftACourseController.prototype, "sendMail", null);
GiftACourseController = __decorate([
    swagger_1.ApiTags('Gift a Course (User Portal)'),
    common_1.Controller('gift-course'),
    __metadata("design:paramtypes", [gift_a_course_service_1.GiftACourseService,
        learners_service_1.LearnersService,
        enrollments_service_1.EnrollmentsService])
], GiftACourseController);
exports.GiftACourseController = GiftACourseController;
//# sourceMappingURL=gift-a-course.controller.js.map