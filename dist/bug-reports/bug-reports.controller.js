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
const bug_reports_service_1 = require("./bug-reports.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const bugReportsList_dto_1 = require("./dto/bugReportsList.dto");
const bugReportId_dto_1 = require("../common/dto/bugReportId.dto");
const reviewBugReport_dto_1 = require("./dto/reviewBugReport.dto");
let BugReportsController = class BugReportsController {
    constructor(bugReportsService) {
        this.bugReportsService = bugReportsService;
    }
    async GetBugReports(bugReportsListDto, user) {
        bugReportsListDto.page = bugReportsListDto.page ? bugReportsListDto.page : 1;
        bugReportsListDto.perPage = bugReportsListDto.perPage ? bugReportsListDto.perPage : 10;
        bugReportsListDto.keyword = bugReportsListDto.keyword ? bugReportsListDto.keyword : '';
        return await this.bugReportsService.getBugReports(bugReportsListDto);
    }
    async GetBlogDetails(bugReportIdDto) {
        return await this.bugReportsService.getReportDetails(bugReportIdDto.bugReportId);
    }
    async ReviewBugReport(reviewBugReportDto, user) {
        reviewBugReportDto.resolvedBy = user._id;
        return await this.bugReportsService.reviewBugReport(reviewBugReportDto);
    }
    async DeleteBugReport(bugReportIdDto) {
        return await this.bugReportsService.deleteBugReport(bugReportIdDto.bugReportId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get bug reports list.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bugReportsList_dto_1.BugReportsListDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "GetBugReports", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get bug report details.' }),
    common_1.Get('/details/:bugReportId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bugReportId_dto_1.BugReportIdDto]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "GetBlogDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Set bug report status to reviewed.' }),
    common_1.Post('update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reviewBugReport_dto_1.ReviewBugReportDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "ReviewBugReport", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Set bug report status to deleted.' }),
    common_1.Delete(),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bugReportId_dto_1.BugReportIdDto]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "DeleteBugReport", null);
BugReportsController = __decorate([
    common_1.Controller('bug-reports'),
    swagger_1.ApiTags('Bug Reports (Admin Panel)'),
    __metadata("design:paramtypes", [bug_reports_service_1.BugReportsService])
], BugReportsController);
exports.BugReportsController = BugReportsController;
//# sourceMappingURL=bug-reports.controller.js.map