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
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const reported_learners_service_1 = require("./reported-learners.service");
const addLearnerReport_dto_1 = require("./dto/addLearnerReport.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const updateReport_dto_1 = require("./dto/updateReport.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
let ReportedLearnersController = class ReportedLearnersController {
    constructor(reportedLearnersService) {
        this.reportedLearnersService = reportedLearnersService;
    }
    async GetLearnerReports(paginationDto, user) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
        return await this.reportedLearnersService.getReports(paginationDto);
    }
    async AddLearnerReport(addLearnerReport, user) {
        if (!user.collegeId) {
            return ResponseHandler_1.default.fail('Only for college users.');
        }
        addLearnerReport.userId = user._id;
        addLearnerReport.collegeId = user.collegeId;
        return await this.reportedLearnersService.addReport(addLearnerReport);
    }
    async UpdateLearnerReportStatus(updateLearnerReport, user) {
        return await this.reportedLearnersService.updateReport(updateLearnerReport);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (college).' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], ReportedLearnersController.prototype, "GetLearnerReports", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (college).' }),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addLearnerReport_dto_1.AddLearnerReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportedLearnersController.prototype, "AddLearnerReport", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (college).' }),
    common_1.Post('updateStatus'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateReport_dto_1.UpdateLearnerReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportedLearnersController.prototype, "UpdateLearnerReportStatus", null);
ReportedLearnersController = __decorate([
    swagger_1.ApiTags('Reported Learners'),
    common_1.Controller('reported-learners'),
    __metadata("design:paramtypes", [reported_learners_service_1.ReportedLearnersService])
], ReportedLearnersController);
exports.ReportedLearnersController = ReportedLearnersController;
//# sourceMappingURL=reported-learners.controller.js.map