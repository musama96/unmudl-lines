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
const learners_service_1 = require("./learners.service");
const learnerTokens_service_1 = require("./learnerTokens.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const getCount_dto_1 = require("../common/dto/getCount.dto");
const reported_learners_service_1 = require("../reported-learners/reported-learners.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const analyticsCount_dto_1 = require("../common/dto/analyticsCount.dto");
const learnerAnalyticsCount_dto_1 = require("./dto/learnerAnalyticsCount.dto");
const swagger_1 = require("@nestjs/swagger");
const learnerDetails_dto_1 = require("../enrollments/dto/learnerDetails.dto");
const learnersList_dto_1 = require("../common/dto/learnersList.dto");
const enrollmentLearnersList_dto_1 = require("./dto/enrollmentLearnersList.dto");
const LearnersSectionAdmin_dto_1 = require("./dto/LearnersSectionAdmin.dto");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const updateSuspend_dto_1 = require("./dto/updateSuspend.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
let LearnersAdminController = class LearnersAdminController {
    constructor(learnersService, learnerTokenService, reportedLearnersService, enrollmentsService) {
        this.learnersService = learnersService;
        this.learnerTokenService = learnerTokenService;
        this.reportedLearnersService = reportedLearnersService;
        this.enrollmentsService = enrollmentsService;
    }
    async GetLearnersEnrolledCountAnalytics(analyticsCountDto, user) {
        if (analyticsCountDto.type === 'college') {
            analyticsCountDto.collegeId = user.collegeId ? user.collegeId : analyticsCountDto.collegeId;
        }
        else {
            analyticsCountDto.collegeId = null;
        }
        if (analyticsCountDto.collegeId) {
            const newEnrolledCount = await this.learnersService.getAnalyticsCount(analyticsCountDto);
            const totalEnrolledCount = await this.learnersService.getAnalyticsCount({ collegeId: analyticsCountDto.collegeId });
            return ResponseHandler_1.default.success({
                newLearners: newEnrolledCount.data,
                totalLearners: totalEnrolledCount.data,
            });
        }
        else {
            const newCount = await this.learnersService.getAnalyticsCountForAdmin(analyticsCountDto);
            const totalCount = await this.learnersService.getAnalyticsCountForAdmin();
            return ResponseHandler_1.default.success({
                newLearners: newCount.data,
                totalLearners: totalCount.data,
            });
        }
    }
    async GetLearnersSectionForAdminPanel(learnersSectionAdminDto, user) {
        learnersSectionAdminDto.collegeId = user.collegeId;
        learnersSectionAdminDto.start = learnersSectionAdminDto.graphStart;
        learnersSectionAdminDto.end = learnersSectionAdminDto.graphEnd;
        const growth = await this.enrollmentsService.getLearnersGrowth(learnersSectionAdminDto);
        learnersSectionAdminDto.start = learnersSectionAdminDto.learnersStart;
        learnersSectionAdminDto.end = learnersSectionAdminDto.learnersEnd;
        const newLearners = await this.learnersService.getAnalyticsCount(learnersSectionAdminDto);
        learnersSectionAdminDto.start = null;
        learnersSectionAdminDto.end = null;
        const totalLearners = await this.learnersService.getAnalyticsCount(learnersSectionAdminDto);
        learnersSectionAdminDto.keyword = learnersSectionAdminDto.keyword ? learnersSectionAdminDto.keyword : '';
        learnersSectionAdminDto.sortOrder = learnersSectionAdminDto.sortOrder === 'asc' ? '1' : '-1';
        learnersSectionAdminDto.sortBy = learnersSectionAdminDto.sortBy ? learnersSectionAdminDto.sortBy : 'createdAt';
        const learners = learnersSectionAdminDto.collegeId
            ? await this.learnersService.getLearnersByCollege(learnersSectionAdminDto)
            : await this.learnersService.getLearnersForAdmin(learnersSectionAdminDto);
        return ResponseHandler_1.default.success({
            growth: growth.data,
            enrollments: {
                new: newLearners.data,
                total: totalLearners.data,
            },
            learners: learners.data,
        });
    }
    async GetLearnersEnrolledCountAnalyticsForAdmin(learnerAnalyticsCountDto, user) {
        if (learnerAnalyticsCountDto.type === 'college') {
            learnerAnalyticsCountDto.collegeId = user.collegeId ? user.collegeId : learnerAnalyticsCountDto.collegeId;
        }
        else {
            learnerAnalyticsCountDto.collegeId = null;
        }
        if (learnerAnalyticsCountDto.enrolled) {
            const newCount = await this.learnersService.getAnalyticsCount(learnerAnalyticsCountDto);
            const totalCount = await this.learnersService.getAnalyticsCount({ collegeId: learnerAnalyticsCountDto.collegeId });
            return ResponseHandler_1.default.success({
                newCount: newCount.data,
                totalCount: totalCount.data,
            });
        }
        else {
            const newCount = await this.learnersService.getAnalyticsCountForAdmin(learnerAnalyticsCountDto);
            const totalCount = await this.learnersService.getAnalyticsCountForAdmin();
            return ResponseHandler_1.default.success({
                newCount: newCount.data,
                totalCount: totalCount.data,
            });
        }
    }
    async GetLearnersEnrolledCount(getCountDto, user) {
        getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
        return await this.learnersService.getCount(getCountDto);
    }
    async GetUserGrowthStats(getCountDto, user) {
        getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
        return await this.enrollmentsService.getLearnersGrowth(getCountDto);
    }
    async GetUserGrowthStatsCsv(getCountDto, user) {
        getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId;
        return await this.enrollmentsService.getLearnersGrowthCsv(getCountDto);
    }
    async getLearnersByCollege(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword && listDto.keyword !== 'undefined' ? listDto.keyword : '';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        if (listDto.courseId) {
            return await this.learnersService.getLearnersByCourse(listDto);
        }
        else {
            return listDto.collegeId
                ? await this.learnersService.getLearnersByCollege(listDto)
                : await this.learnersService.getLearnersForAdmin(listDto);
        }
    }
    async GetLearnerDetails(learnerDetailsDto, user) {
        learnerDetailsDto.collegeId = user.collegeId ? user.collegeId : learnerDetailsDto.collegeId;
        return await this.learnersService.getLearnerDetails(learnerDetailsDto);
    }
    async getApprovedLearnersByCollege(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        if (listDto.courseId) {
            return await this.learnersService.getLearnersByCourse(listDto, 'true');
        }
        else {
            return await this.learnersService.getLearnersByCollege(listDto, 'true');
        }
    }
    async getLearnersByCollegeCsv(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword && listDto.keyword !== 'undefined' ? listDto.keyword : '';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        if (listDto.courseId) {
            return await this.learnersService.getLearnersByCourseCsv(listDto);
        }
        else {
            if (listDto.collegeId) {
                return await this.learnersService.getLearnersByCollegeCsv(listDto);
            }
            else {
                return await this.learnersService.getLearnersForUnmudlAdminCsv(listDto);
            }
        }
    }
    async SuspendLearner(suspendLearnerDto, user) {
        return await this.learnersService.updateSuspend(suspendLearnerDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a count of learners enrolled for learners dashboard.' }),
    common_1.Get('/dashboard/count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyticsCount_dto_1.AnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetLearnersEnrolledCountAnalytics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LearnersSectionAdmin_dto_1.LearnersSectionAdminDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetLearnersSectionForAdminPanel", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a count of learners enrolled/sign ups for analytics.' }),
    common_1.Get('/analytics/count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnerAnalyticsCount_dto_1.LearnerAnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetLearnersEnrolledCountAnalyticsForAdmin", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a count of learners enrolled between a start date and end date.' }),
    common_1.Get('count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetLearnersEnrolledCount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get the growth of learners between start date and end date in day, month or year intervals.' }),
    common_1.Get('growth'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetUserGrowthStats", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get the growth of learners between start date and end date in day, month or year intervals.' }),
    common_1.Get('/growth/csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetUserGrowthStatsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of un approved learners enrolled in a college or a course.' }),
    common_1.Get(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnersList_dto_1.LearnersListDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "getLearnersByCollege", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get learner details for learner profile view.' }),
    common_1.Get('details'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnerDetails_dto_1.LearnerDetailsDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "GetLearnerDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of all approved learners enrolled in a college or a course.' }),
    common_1.Get('approved'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollmentLearnersList_dto_1.EnrollmentLearnersListDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "getApprovedLearnersByCollege", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get a csv file with a list of learners enrolled in a college or a course.' }),
    common_1.Get('csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=courses.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnersList_dto_1.LearnersListDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "getLearnersByCollegeCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Suspend/unsuspend learner.' }),
    common_1.Post('suspend'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateSuspend_dto_1.UpdateSuspendLearnerDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersAdminController.prototype, "SuspendLearner", null);
LearnersAdminController = __decorate([
    swagger_1.ApiTags('Learners (Admin Portal)'),
    common_1.Controller('/admins/learners'),
    __metadata("design:paramtypes", [learners_service_1.LearnersService,
        learnerTokens_service_1.LearnerTokensService,
        reported_learners_service_1.ReportedLearnersService,
        enrollments_service_1.EnrollmentsService])
], LearnersAdminController);
exports.LearnersAdminController = LearnersAdminController;
//# sourceMappingURL=learners-admin.controller.js.map