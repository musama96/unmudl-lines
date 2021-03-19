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
const swagger_1 = require("@nestjs/swagger");
const partnerRequest_dto_1 = require("./dto/partnerRequest.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const partner_requests_service_1 = require("./partner-requests.service");
let LearnerPartnerRequestsController = class LearnerPartnerRequestsController {
    constructor(partnerRequestsService) {
        this.partnerRequestsService = partnerRequestsService;
    }
    async CreatePartnerRequest(collegeRequestDto) {
        const checkExisting = await this.partnerRequestsService.checkPartnerRequest(collegeRequestDto.collegeName);
        if (checkExisting) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.collegeRequest.alreadyPending);
        }
        else {
            collegeRequestDto.status = 'pending';
            return await this.partnerRequestsService.createPartnerRequest(collegeRequestDto);
        }
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Add a become a partner request.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('request'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partnerRequest_dto_1.PartnerRequestDto]),
    __metadata("design:returntype", Promise)
], LearnerPartnerRequestsController.prototype, "CreatePartnerRequest", null);
LearnerPartnerRequestsController = __decorate([
    swagger_1.ApiTags('Partner Requests (User Portal)'),
    common_1.Controller('partner-requests'),
    __metadata("design:paramtypes", [partner_requests_service_1.PartnerRequestsService])
], LearnerPartnerRequestsController);
exports.LearnerPartnerRequestsController = LearnerPartnerRequestsController;
//# sourceMappingURL=learner-partner-requests.controller.js.map