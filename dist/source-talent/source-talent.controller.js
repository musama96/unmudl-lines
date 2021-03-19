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
const sourceTalentId_dto_1 = require("../common/dto/sourceTalentId.dto");
const createSourceTalent_dto_1 = require("./dto/createSourceTalent.dto");
const sourceTalentList_dto_1 = require("./dto/sourceTalentList.dto");
const source_talent_service_1 = require("./source-talent.service");
let SourceTalentController = class SourceTalentController {
    constructor(sourceTalentService) {
        this.sourceTalentService = sourceTalentService;
    }
    async createSourceTalent(createSourceTalentDto, user) {
        createSourceTalentDto.employer = user.employerId;
        createSourceTalentDto.createdBy = user._id;
        return await this.sourceTalentService.createSourceTalent(createSourceTalentDto, user);
    }
    async getSourceTalentsList(sourceTalentListDto, user) {
        sourceTalentListDto.employerId = user.employerId
            ? user.employerId
            : sourceTalentListDto.employerId
                ? sourceTalentListDto.employerId
                : null;
        sourceTalentListDto.keyword = sourceTalentListDto.keyword ? sourceTalentListDto.keyword : '';
        sourceTalentListDto.page = Number(sourceTalentListDto.page) ? sourceTalentListDto.page : 1;
        sourceTalentListDto.perPage = Number(sourceTalentListDto.perPage) ? sourceTalentListDto.perPage : 10;
        sourceTalentListDto.sortOrder = sourceTalentListDto.sortOrder === 'asc' ? '1' : '-1';
        sourceTalentListDto.sortBy = sourceTalentListDto.sortBy ? sourceTalentListDto.sortBy : 'createdAt';
        return await this.sourceTalentService.getSourceTalentsList(sourceTalentListDto);
    }
    async getSourceTalentDetails(sourceTalentIdDto) {
        return await this.sourceTalentService.getSourceTalentDetails(sourceTalentIdDto.id);
    }
    async resendSourceTalentMessages(sourceTalentIdDto, user) {
        return await this.sourceTalentService.resendSourceTalentMessages(sourceTalentIdDto.id, user);
    }
    async deleteSourceTalent(sourceTalentIdDto) {
        return await this.sourceTalentService.deleteSourceTalent(sourceTalentIdDto.id);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor', 'recruiter'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createSourceTalent_dto_1.CreateSourceTalentDto, Object]),
    __metadata("design:returntype", Promise)
], SourceTalentController.prototype, "createSourceTalent", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sourceTalentList_dto_1.SourceTalentListDto, Object]),
    __metadata("design:returntype", Promise)
], SourceTalentController.prototype, "getSourceTalentsList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('/details/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sourceTalentId_dto_1.SourceTalentIdDto]),
    __metadata("design:returntype", Promise)
], SourceTalentController.prototype, "getSourceTalentDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('/resend/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sourceTalentId_dto_1.SourceTalentIdDto, Object]),
    __metadata("design:returntype", Promise)
], SourceTalentController.prototype, "resendSourceTalentMessages", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Delete(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sourceTalentId_dto_1.SourceTalentIdDto]),
    __metadata("design:returntype", Promise)
], SourceTalentController.prototype, "deleteSourceTalent", null);
SourceTalentController = __decorate([
    swagger_1.ApiTags('Source Talent'),
    common_1.Controller('source-talent'),
    __metadata("design:paramtypes", [source_talent_service_1.SourceTalentService])
], SourceTalentController);
exports.SourceTalentController = SourceTalentController;
//# sourceMappingURL=source-talent.controller.js.map