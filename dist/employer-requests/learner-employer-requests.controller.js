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
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const employer_requests_service_1 = require("./employer-requests.service");
const employerRequest_dto_1 = require("./dto/employerRequest.dto");
let LearnerEmployerRequestsController = class LearnerEmployerRequestsController {
    constructor(employerRequestsService) {
        this.employerRequestsService = employerRequestsService;
    }
    async CreateEmployerRequest(employerRequestDto) {
        const checkExisting = await this.employerRequestsService.checkEmployerRequest(employerRequestDto.employerName);
        if (checkExisting) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.collegeRequest.alreadyPending);
        }
        else {
            employerRequestDto.status = 'pending';
            return await this.employerRequestsService.createEmployerRequest(employerRequestDto);
        }
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Add a become a employer partner request.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('request'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerRequest_dto_1.EmployerRequestDto]),
    __metadata("design:returntype", Promise)
], LearnerEmployerRequestsController.prototype, "CreateEmployerRequest", null);
LearnerEmployerRequestsController = __decorate([
    swagger_1.ApiTags('Employer Partner Requests (User Portal)'),
    common_1.Controller('employer-requests'),
    __metadata("design:paramtypes", [employer_requests_service_1.EmployerRequestsService])
], LearnerEmployerRequestsController);
exports.LearnerEmployerRequestsController = LearnerEmployerRequestsController;
//# sourceMappingURL=learner-employer-requests.controller.js.map