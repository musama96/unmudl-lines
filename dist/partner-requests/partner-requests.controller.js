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
const partner_requests_service_1 = require("./partner-requests.service");
const partnerRequestList_dto_1 = require("./dto/partnerRequestList.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const partnerRequestId_dto_1 = require("../common/dto/partnerRequestId.dto");
const updatePartnerRequestStatus_dto_1 = require("./dto/updatePartnerRequestStatus.dto");
let PartnerRequestsController = class PartnerRequestsController {
    constructor(partnerRequestsService) {
        this.partnerRequestsService = partnerRequestsService;
    }
    async GetPartnerRequests(partnerRequestListDto) {
        partnerRequestListDto.keyword = partnerRequestListDto.keyword ? partnerRequestListDto.keyword : '';
        partnerRequestListDto.sortOrder = partnerRequestListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.partnerRequestsService.getPartnerRequests(partnerRequestListDto);
    }
    async GetPartnerRequestsCsv(partnerRequestListDto) {
        partnerRequestListDto.keyword = partnerRequestListDto.keyword ? partnerRequestListDto.keyword : '';
        partnerRequestListDto.sortOrder = partnerRequestListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.partnerRequestsService.getPartnerRequestsCsv(partnerRequestListDto);
    }
    async GetPartnerRequestDetails(partnerRequestIdDto) {
        return await this.partnerRequestsService.getPartnerRequestDetails(partnerRequestIdDto.partnerRequestId);
    }
    async UpdatePartnerRequestStatus(updatePartnerRequestStatusDto) {
        return await this.partnerRequestsService.updatePartnerRequestStatus(updatePartnerRequestStatusDto);
    }
    async DeletePartnerRequest(partnerRequestIdDto) {
        return await this.partnerRequestsService.deletePartnerRequest(partnerRequestIdDto.partnerRequestId);
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
    __metadata("design:paramtypes", [partnerRequestList_dto_1.PartnerRequestListDto]),
    __metadata("design:returntype", Promise)
], PartnerRequestsController.prototype, "GetPartnerRequests", null);
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
    __metadata("design:paramtypes", [partnerRequestList_dto_1.PartnerRequestListDto]),
    __metadata("design:returntype", Promise)
], PartnerRequestsController.prototype, "GetPartnerRequestsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get partner request details.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/:partnerRequestId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partnerRequestId_dto_1.PartnerRequestIdDto]),
    __metadata("design:returntype", Promise)
], PartnerRequestsController.prototype, "GetPartnerRequestDetails", null);
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
    __metadata("design:paramtypes", [updatePartnerRequestStatus_dto_1.UpdatePartnerRequestStatusDto]),
    __metadata("design:returntype", Promise)
], PartnerRequestsController.prototype, "UpdatePartnerRequestStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete partner request.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Delete(':partnerRequestId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partnerRequestId_dto_1.PartnerRequestIdDto]),
    __metadata("design:returntype", Promise)
], PartnerRequestsController.prototype, "DeletePartnerRequest", null);
PartnerRequestsController = __decorate([
    swagger_1.ApiTags('Partner Requests (Admin Panel)'),
    common_1.Controller('partner-requests'),
    __metadata("design:paramtypes", [partner_requests_service_1.PartnerRequestsService])
], PartnerRequestsController);
exports.PartnerRequestsController = PartnerRequestsController;
//# sourceMappingURL=partner-requests.controller.js.map