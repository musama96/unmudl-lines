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
const employer_requests_service_1 = require("./employer-requests.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const employerRequestList_dto_1 = require("./dto/employerRequestList.dto");
const employerRequestId_dto_1 = require("../common/dto/employerRequestId.dto");
const updateEmployerRequestStatus_dto_1 = require("./dto/updateEmployerRequestStatus.dto");
let EmployerRequestsController = class EmployerRequestsController {
    constructor(employerRequestsService) {
        this.employerRequestsService = employerRequestsService;
    }
    async GetEmployerRequests(employerRequestListDto) {
        employerRequestListDto.keyword = employerRequestListDto.keyword ? employerRequestListDto.keyword : '';
        employerRequestListDto.sortOrder = employerRequestListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.employerRequestsService.getEmployerRequests(employerRequestListDto);
    }
    async GetEmployerRequestsCsv(employerRequestListDto) {
        employerRequestListDto.keyword = employerRequestListDto.keyword ? employerRequestListDto.keyword : '';
        employerRequestListDto.sortOrder = employerRequestListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.employerRequestsService.getEmployerRequestsCsv(employerRequestListDto);
    }
    async GetEmployerRequestDetails(employerRequestIdDto) {
        return await this.employerRequestsService.getEmployerRequestDetails(employerRequestIdDto.employerRequestId);
    }
    async UpdatePartnerRequestStatus(updateEmployerRequestStatusDto) {
        return await this.employerRequestsService.updateEmployerRequestStatus(updateEmployerRequestStatusDto);
    }
    async DeletePartnerRequest(employerRequestIdDto) {
        return await this.employerRequestsService.deleteEmployerRequest(employerRequestIdDto.employerRequestId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of partner requests.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerRequestList_dto_1.EmployerRequestListDto]),
    __metadata("design:returntype", Promise)
], EmployerRequestsController.prototype, "GetEmployerRequests", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a list of partner requests as csv.' }),
    common_1.Get('csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=Partner Requests.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerRequestList_dto_1.EmployerRequestListDto]),
    __metadata("design:returntype", Promise)
], EmployerRequestsController.prototype, "GetEmployerRequestsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get partner request details.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/:employerRequestId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerRequestId_dto_1.EmployerRequestIdDto]),
    __metadata("design:returntype", Promise)
], EmployerRequestsController.prototype, "GetEmployerRequestDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update partner request status.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('update-status'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateEmployerRequestStatus_dto_1.UpdateEmployerRequestStatusDto]),
    __metadata("design:returntype", Promise)
], EmployerRequestsController.prototype, "UpdatePartnerRequestStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete partner request.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Delete(':employerRequestId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerRequestId_dto_1.EmployerRequestIdDto]),
    __metadata("design:returntype", Promise)
], EmployerRequestsController.prototype, "DeletePartnerRequest", null);
EmployerRequestsController = __decorate([
    swagger_1.ApiTags('Employer Partner Requests (Admin Portal)'),
    common_1.Controller('employer-requests'),
    __metadata("design:paramtypes", [employer_requests_service_1.EmployerRequestsService])
], EmployerRequestsController);
exports.EmployerRequestsController = EmployerRequestsController;
//# sourceMappingURL=employer-requests.controller.js.map