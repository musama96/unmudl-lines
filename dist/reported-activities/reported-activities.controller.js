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
const reported_activities_service_1 = require("./reported-activities.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const reportedActivitiesList_dto_1 = require("./dto/reportedActivitiesList.dto");
const addReport_dto_1 = require("./dto/addReport.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const courses_service_1 = require("../courses/courses.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const reportedActivityId_dto_1 = require("../common/dto/reportedActivityId.dto");
const resolveReportedActivity_dto_1 = require("./dto/resolveReportedActivity.dto");
const learners_service_1 = require("../learners/learners.service");
let ReportedActivitiesController = class ReportedActivitiesController {
    constructor(reportedActivitiesService, learnersService, coursesService) {
        this.reportedActivitiesService = reportedActivitiesService;
        this.learnersService = learnersService;
        this.coursesService = coursesService;
    }
    async GetReportedActivities(reportedActivitiesListDto) {
        reportedActivitiesListDto.sortOrder = reportedActivitiesListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.reportedActivitiesService.getReportedActivities(reportedActivitiesListDto);
    }
    async GetReportedActivityDetails(reportedActivityIdDto) {
        return await this.reportedActivitiesService.getReportedActivityDetails(reportedActivityIdDto.reportedActivityId);
    }
    async AddReportedActivityByCollege(addReportDto, user) {
        const reviewResp = await this.coursesService.getReviewById(addReportDto.reviewId);
        if (reviewResp.data) {
            const review = reviewResp.data;
            addReportDto.reportedLearnerId = review.learner;
            addReportDto.reportingCollegeId = user.collegeId;
            addReportDto.reportingUserId = user._id;
            addReportDto.reportDate = new Date();
            addReportDto.reviewDate = review.dateAdded;
            addReportDto.status = 'pending';
            addReportDto.comment = review.review;
            return await this.reportedActivitiesService.addReport(addReportDto);
        }
        else {
            return ResponseHandler_1.default.fail('Review not found.');
        }
    }
    async ResolveReportedActivity(resolveReportedActivityDto, user) {
        const report = await this.reportedActivitiesService.updateReportStatus(resolveReportedActivityDto);
        if (resolveReportedActivityDto.status === resolveReportedActivity_dto_1.ResolveReportedActivityStatusEnum.SUSPENDED) {
            await this.learnersService.blacklistLearner(report.data.learnerId);
        }
        return ResponseHandler_1.default.success({
            report: report.data,
        });
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a list of reported activities with pagination.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reportedActivitiesList_dto_1.ReportedActivitiesListDto]),
    __metadata("design:returntype", Promise)
], ReportedActivitiesController.prototype, "GetReportedActivities", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get details of a reported activity.' }),
    common_1.Get('/details/:reportedActivityId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reportedActivityId_dto_1.ReportedActivityIdDto]),
    __metadata("design:returntype", Promise)
], ReportedActivitiesController.prototype, "GetReportedActivityDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (college).' }),
    common_1.Post('college'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addReport_dto_1.AddReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportedActivitiesController.prototype, "AddReportedActivityByCollege", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (college).' }),
    common_1.Post('resolve'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolveReportedActivity_dto_1.ResolveReportedActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ReportedActivitiesController.prototype, "ResolveReportedActivity", null);
ReportedActivitiesController = __decorate([
    swagger_1.ApiTags('Reported Activities (Admin Panel)'),
    common_1.Controller('reported-activities'),
    __metadata("design:paramtypes", [reported_activities_service_1.ReportedActivitiesService,
        learners_service_1.LearnersService,
        courses_service_1.CoursesService])
], ReportedActivitiesController);
exports.ReportedActivitiesController = ReportedActivitiesController;
//# sourceMappingURL=reported-activities.controller.js.map