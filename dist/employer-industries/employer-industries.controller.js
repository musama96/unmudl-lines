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
const employer_industries_service_1 = require("./employer-industries.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const list_dto_1 = require("../common/dto/list.dto");
const create_employer_industry_dto_1 = require("./dto/create-employer-industry.dto");
const employerIndustryId_dto_1 = require("../common/dto/employerIndustryId.dto");
const get_all_industries_dto_1 = require("./dto/get-all-industries.dto");
let EmployerIndustriesController = class EmployerIndustriesController {
    constructor(employerIndustriesService) {
        this.employerIndustriesService = employerIndustriesService;
    }
    async createIndustry(createEmployerIndustryDto) {
        return await this.employerIndustriesService.createIndustry(createEmployerIndustryDto);
    }
    async getIndustries(listDto) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'title';
        return await this.employerIndustriesService.getIndustries(listDto);
    }
    async getAllIndustries(listDto) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.employerIndustriesService.getAllIndustries(listDto);
    }
    async disableIndustry(employerIndustryIdDto) {
        return await this.employerIndustriesService.disableIndustry(employerIndustryIdDto.id);
    }
    async enableIndustry(employerIndustryIdDto) {
        return await this.employerIndustriesService.enableIndustry(employerIndustryIdDto.id);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create new employer industry.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employer_industry_dto_1.CreateEmployerIndustryDto]),
    __metadata("design:returntype", Promise)
], EmployerIndustriesController.prototype, "createIndustry", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted and paginated list of industries.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto]),
    __metadata("design:returntype", Promise)
], EmployerIndustriesController.prototype, "getIndustries", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted list of all industries.' }),
    common_1.Get('all'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_all_industries_dto_1.GetAllIndustriesDto]),
    __metadata("design:returntype", Promise)
], EmployerIndustriesController.prototype, "getAllIndustries", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Disable an industry.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Delete(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerIndustryId_dto_1.EmployerIndustryIdDto]),
    __metadata("design:returntype", Promise)
], EmployerIndustriesController.prototype, "disableIndustry", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Enable an industry.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('/enable/:id'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerIndustryId_dto_1.EmployerIndustryIdDto]),
    __metadata("design:returntype", Promise)
], EmployerIndustriesController.prototype, "enableIndustry", null);
EmployerIndustriesController = __decorate([
    swagger_1.ApiTags('Employer Industries'),
    common_1.Controller('employer-industries'),
    __metadata("design:paramtypes", [employer_industries_service_1.EmployerIndustriesService])
], EmployerIndustriesController);
exports.EmployerIndustriesController = EmployerIndustriesController;
//# sourceMappingURL=employer-industries.controller.js.map