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
const dashboard_service_1 = require("./dashboard.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const getDashboardData_dto_1 = require("./dto/getDashboardData.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const revenueAnalyticsCount_dto_1 = require("../enrollments/dto/revenueAnalyticsCount.dto");
const performanceIndicators_dto_1 = require("./dto/performanceIndicators.dto");
const optionalDurationPagination_dto_1 = require("../common/dto/optionalDurationPagination.dto");
const optionalDuration_dto_1 = require("../common/dto/optionalDuration.dto");
const getRefundStatistics_dto_1 = require("../courses/dto/getRefundStatistics.dto");
const getEnrollmentStatistics_dto_1 = require("../courses/dto/getEnrollmentStatistics.dto");
const getHighRejectionCourses_dto_1 = require("../courses/dto/getHighRejectionCourses.dto");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async GetDashboardData(getDashboardDataDto, user) {
        getDashboardDataDto.collegeId = user.collegeId ? user.collegeId : getDashboardDataDto.collegeId;
        getDashboardDataDto.interval = getDashboardDataDto.interval ? Number(getDashboardDataDto.interval) : 1;
        getDashboardDataDto.refundRate = getDashboardDataDto.refundRate ? getDashboardDataDto.refundRate : 20;
        getDashboardDataDto.rejectionRate = getDashboardDataDto.rejectionRate ? getDashboardDataDto.rejectionRate : 20;
        getDashboardDataDto.isUnmudlAdmin = !user.collegeId;
        getDashboardDataDto.userCollegeId = user.collegeId ? user.collegeId : null;
        return await this.dashboardService.getDashboardData(getDashboardDataDto);
    }
    async GetRevenueAnalytics(revenueAnalyticsCountDto, user) {
        revenueAnalyticsCountDto.collegeId = user.collegeId
            ? user.collegeId
            : revenueAnalyticsCountDto.collegeId
                ? revenueAnalyticsCountDto.collegeId
                : null;
        return this.dashboardService.getEarningsData(revenueAnalyticsCountDto);
    }
    async GetPerformanceIndicators(performanceIndicatorsDto, user) {
        performanceIndicatorsDto.collegeId = performanceIndicatorsDto.type === revenueAnalyticsCount_dto_1.UserType.UNMUDL ? null : user.collegeId;
        return this.dashboardService.getPerformanceIndicators(performanceIndicatorsDto);
    }
    async GetTopCourses(optionalDurationPaginationDto, user) {
        optionalDurationPaginationDto.collegeId = user.collegeId;
        return this.dashboardService.getTopCourses(optionalDurationPaginationDto);
    }
    async GetTopPerformingColleges(optionalDurationPaginationDto) {
        optionalDurationPaginationDto.page = optionalDurationPaginationDto.page ? optionalDurationPaginationDto.page : 1;
        optionalDurationPaginationDto.perPage = optionalDurationPaginationDto.perPage ? optionalDurationPaginationDto.perPage : 10;
        return this.dashboardService.getTopPerformingColleges(optionalDurationPaginationDto);
    }
    async GetTopPerformingInstructors(optionalDurationPaginationDto) {
        optionalDurationPaginationDto.page = optionalDurationPaginationDto.page ? optionalDurationPaginationDto.page : 1;
        optionalDurationPaginationDto.perPage = optionalDurationPaginationDto.perPage ? optionalDurationPaginationDto.perPage : 10;
        return this.dashboardService.getTopPerformingInstructors(optionalDurationPaginationDto);
    }
    async GetCourseRefundList(getRefundStatisticsDto, user) {
        getRefundStatisticsDto.collegeId = user.collegeId;
        return this.dashboardService.getCourseRefundList(getRefundStatisticsDto);
    }
    async GetCourseEnrollmentStatistics(getEnrollmentStatisticsDto, user) {
        getEnrollmentStatisticsDto.collegeId = user.collegeId;
        return this.dashboardService.getCourseEnrollmentStatistics(getEnrollmentStatisticsDto);
    }
    async GetCourseRejectionRateList(getHighRejectionCoursesDto, user) {
        getHighRejectionCoursesDto.collegeId = user.collegeId;
        return this.dashboardService.getCourseRejectionRateList(getHighRejectionCoursesDto);
    }
    async GetTopCoursesCsv(optionalDurationDto, user) {
        optionalDurationDto.collegeId = user.collegeId;
        return await this.dashboardService.getTopCoursesCsv(optionalDurationDto);
    }
    async GetTopInstructorsCsv(optionalDurationPaginationDto, user) {
        optionalDurationPaginationDto.collegeId = user.collegeId;
        return await this.dashboardService.getTopPerformingInstructorsCsv(optionalDurationPaginationDto);
    }
    async GetTopCollegesCsv(optionalDurationPaginationDto, user) {
        optionalDurationPaginationDto.collegeId = user.collegeId;
        return await this.dashboardService.getTopPerformingCollegesCsv(optionalDurationPaginationDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get complete dashboard data.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getDashboardData_dto_1.GetDashboardDataDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetDashboardData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get earnings card data for dashboard.' }),
    common_1.Get('/earnings'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revenueAnalyticsCount_dto_1.RevenueAnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetRevenueAnalytics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get earnings card data for dashboard.' }),
    common_1.Get('/performance-indicators'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performanceIndicators_dto_1.PerformanceIndicatorsDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetPerformanceIndicators", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of top courses.' }),
    common_1.Get('/top-courses'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of top performing colleges.' }),
    common_1.Get('/top-colleges'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopPerformingColleges", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of top performing instructors.' }),
    common_1.Get('/top-instructors'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopPerformingInstructors", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of course refund information.' }),
    common_1.Get('/course-refund-list'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getRefundStatistics_dto_1.GetRefundStatisticsDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetCourseRefundList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of course enrollment status.' }),
    common_1.Get('/course-enrollment-stats'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEnrollmentStatistics_dto_1.GetEnrollmentStatisticsDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetCourseEnrollmentStatistics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of course rejection rates.' }),
    common_1.Get('/rejection-rates-list'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getHighRejectionCourses_dto_1.GetHighRejectionCoursesDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetCourseRejectionRateList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get top courses in a csv.' }),
    common_1.Get('/top-courses/csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=courses.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDuration_dto_1.OptionalDurationDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopCoursesCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get top instructors in a csv.' }),
    common_1.Get('/top-instructors/csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=instructors.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopInstructorsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get top colleges in a csv.' }),
    common_1.Get('/top-colleges/csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=colleges.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "GetTopCollegesCsv", null);
DashboardController = __decorate([
    swagger_1.ApiTags('Dashboard'),
    common_1.Controller('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map