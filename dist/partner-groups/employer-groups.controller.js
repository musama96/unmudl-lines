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
const partner_groups_service_1 = require("./partner-groups.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const addPartnerGroup_dto_1 = require("./dto/addPartnerGroup.dto");
const updatePartnerGroup_dto_1 = require("./dto/updatePartnerGroup.dto");
const groupIdDto_dto_1 = require("./dto/groupIdDto.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
let EmployerGroupsController = class EmployerGroupsController {
    constructor(partnerGroupsService) {
        this.partnerGroupsService = partnerGroupsService;
    }
    async AddPartnerGroup(addPartnerGroupDto) {
        return await this.partnerGroupsService.addEmployerGroup(addPartnerGroupDto);
    }
    async UpdatePartnerGroup(updatePartnerGroupDto) {
        return await this.partnerGroupsService.updateEmployerGroup(updatePartnerGroupDto);
    }
    async GetAllPartnerGroup() {
        return await this.partnerGroupsService.getAllEmployerGroup();
    }
    async DeletePartnerGroup(groupIdDto, user) {
        return await this.partnerGroupsService.deleteEmployerGroup(groupIdDto.groupId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add a partner group.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addPartnerGroup_dto_1.AddPartnerGroupDto]),
    __metadata("design:returntype", Promise)
], EmployerGroupsController.prototype, "AddPartnerGroup", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update a partner group.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Post('/update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePartnerGroup_dto_1.UpdatePartnerGroupDto]),
    __metadata("design:returntype", Promise)
], EmployerGroupsController.prototype, "UpdatePartnerGroup", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get all partner groups.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployerGroupsController.prototype, "GetAllPartnerGroup", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete partner groups.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Delete(':groupId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [groupIdDto_dto_1.GroupIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerGroupsController.prototype, "DeletePartnerGroup", null);
EmployerGroupsController = __decorate([
    common_1.Controller('employer-groups'),
    swagger_1.ApiTags('Employer Groups'),
    __metadata("design:paramtypes", [partner_groups_service_1.PartnerGroupsService])
], EmployerGroupsController);
exports.EmployerGroupsController = EmployerGroupsController;
//# sourceMappingURL=employer-groups.controller.js.map