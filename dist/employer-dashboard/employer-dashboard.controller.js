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
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const ResponseHandler_1 = require("../common/ResponseHandler");
const employerDashboardPagination_dto_1 = require("./dto/employerDashboardPagination.dto");
const getEmployerDashboard_dto_1 = require("./dto/getEmployerDashboard.dto");
const employer_dashboard_service_1 = require("./employer-dashboard.service");
let EmployerDashboardController = class EmployerDashboardController {
    constructor(employerDashboardService) {
        this.employerDashboardService = employerDashboardService;
    }
    async getCompleteDashboardData(getEmployerDashboardDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        getEmployerDashboardDto.employerAdminId = user._id;
        getEmployerDashboardDto.employerId = user.employerId ? user.employerId : getEmployerDashboardDto.employerId;
        return await this.employerDashboardService.getCompleteDashboardData(getEmployerDashboardDto);
    }
    async getDashboardMetrics(getEmployerDashboardDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        getEmployerDashboardDto.employerId = user.employerId ? user.employerId : getEmployerDashboardDto.employerId;
        return await this.employerDashboardService.getDashboardMetrics(getEmployerDashboardDto);
    }
    async getContactCollegeActivity(employerDashboardPaginationDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        employerDashboardPaginationDto.employerAdminId = user._id;
        return await this.employerDashboardService.getContactCollegeActivity(employerDashboardPaginationDto);
    }
    async getSourceTalentActivity(employerDashboardPaginationDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        employerDashboardPaginationDto.employerAdminId = user._id;
        return await this.employerDashboardService.getSourceTalentActivity(employerDashboardPaginationDto);
    }
    async getEmployerForumActivity(employerDashboardPaginationDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        employerDashboardPaginationDto.employerAdminId = user._id;
        return await this.employerDashboardService.getEmployerForumActivity(employerDashboardPaginationDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'recruiter'),
    swagger_1.ApiOperation({ summary: 'Get employer dashboard data.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEmployerDashboard_dto_1.GetEmployerDashboardDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerDashboardController.prototype, "getCompleteDashboardData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'recruiter'),
    swagger_1.ApiOperation({ summary: 'Get employer metrics for dashboard.' }),
    common_1.Get('metrics'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEmployerDashboard_dto_1.GetEmployerDashboardDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerDashboardController.prototype, "getDashboardMetrics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'recruiter'),
    swagger_1.ApiOperation({ summary: 'Get employer contact college activity for dashboard.' }),
    common_1.Get('contact-college-activity'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerDashboardPagination_dto_1.EmployerDashboardPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerDashboardController.prototype, "getContactCollegeActivity", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'recruiter'),
    swagger_1.ApiOperation({ summary: 'Get employer source talent activity for dashboard.' }),
    common_1.Get('source-talent-activity'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerDashboardPagination_dto_1.EmployerDashboardPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerDashboardController.prototype, "getSourceTalentActivity", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'recruiter'),
    swagger_1.ApiOperation({ summary: 'Get employer forum activity for dashboard.' }),
    common_1.Get('employer-forum-activity'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerDashboardPagination_dto_1.EmployerDashboardPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerDashboardController.prototype, "getEmployerForumActivity", null);
EmployerDashboardController = __decorate([
    swagger_1.ApiTags('Employer Dashboard'),
    common_1.Controller('employer-dashboard'),
    __metadata("design:paramtypes", [employer_dashboard_service_1.EmployerDashboardService])
], EmployerDashboardController);
exports.EmployerDashboardController = EmployerDashboardController;
//# sourceMappingURL=employer-dashboard.controller.js.map