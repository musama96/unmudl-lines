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
const enquiries_service_1 = require("./enquiries.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const getEnquiryMessages_dto_1 = require("./dto/getEnquiryMessages.dto");
const AddLearnerEnquiry_dto_1 = require("./dto/AddLearnerEnquiry.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
let LearnerEnquiriesController = class LearnerEnquiriesController {
    constructor(enquiriesService) {
        this.enquiriesService = enquiriesService;
    }
    async GetEnquiries(learner) {
        if (learner.type !== 'learner') {
            return ResponseHandler_1.default.fail('Only learners allowed.');
        }
        return await this.enquiriesService.getLearnerEnquiries(learner);
    }
    async GetEnquiryMessages(getEnquiryMessagesDto, learner) {
        if (learner.type !== 'learner') {
            return ResponseHandler_1.default.fail('Only learners allowed.');
        }
        getEnquiryMessagesDto.page = getEnquiryMessagesDto.page ? Number(getEnquiryMessagesDto.page) : 1;
        getEnquiryMessagesDto.perPage = getEnquiryMessagesDto.perPage ? Number(getEnquiryMessagesDto.perPage) : 8;
        getEnquiryMessagesDto.learnerId = learner._id;
        getEnquiryMessagesDto.isAdmin = false;
        return await this.enquiriesService.getEnquiryMessages(getEnquiryMessagesDto);
    }
    async AddEnquiryMessage(addLearnerEnquiryDto, learner) {
        if (learner.type !== 'learner') {
            return ResponseHandler_1.default.fail('Only learners allowed.');
        }
        addLearnerEnquiryDto.learner = learner._id;
        return await this.enquiriesService.addLearnerEnquiryMessage(addLearnerEnquiryDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enquiries.' }),
    common_1.Get(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearnerEnquiriesController.prototype, "GetEnquiries", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enquiries.' }),
    common_1.Get('messages'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEnquiryMessages_dto_1.GetEnquiryMessagesDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerEnquiriesController.prototype, "GetEnquiryMessages", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enquiries.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AddLearnerEnquiry_dto_1.AddLearnerEnquiryDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerEnquiriesController.prototype, "AddEnquiryMessage", null);
LearnerEnquiriesController = __decorate([
    swagger_1.ApiTags('Learner Enquiries'),
    common_1.Controller('learner/enquiries'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService])
], LearnerEnquiriesController);
exports.LearnerEnquiriesController = LearnerEnquiriesController;
//# sourceMappingURL=learner-enquiries.controller.js.map