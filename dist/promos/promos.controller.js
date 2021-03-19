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
const promos_service_1 = require("./promos.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const createPromo_dto_1 = require("./dto/createPromo.dto");
const promoId_dto_1 = require("../common/dto/promoId.dto");
const updatePromo_dto_1 = require("./dto/updatePromo.dto");
const suspendPromo_dto_1 = require("./dto/suspendPromo.dto");
const promoList_dto_1 = require("./dto/promoList.dto");
const createPromo_enum_1 = require("../common/enums/createPromo.enum");
const responseMessages_1 = require("../config/responseMessages");
let PromosController = class PromosController {
    constructor(promosService) {
        this.promosService = promosService;
    }
    async GetPromos(promoListDto, user) {
        promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
        promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
        promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
        promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
        promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
        promoListDto.page = promoListDto.page ? Number(promoListDto.page) : 1;
        promoListDto.perPage = promoListDto.perPage ? Number(promoListDto.perPage) : 10;
        promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';
        promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;
        return await this.promosService.getPromos(promoListDto);
    }
    async GetPromosCsv(promoListDto, user) {
        promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
        promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
        promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
        promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
        promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
        promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';
        promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;
        return await this.promosService.getPromosCsv(promoListDto);
    }
    async GetCompletePromosSectionData(promoListDto, user) {
        promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
        promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;
        promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
        promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
        promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
        promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
        promoListDto.page = promoListDto.page ? Number(promoListDto.page) : 1;
        promoListDto.perPage = promoListDto.perPage ? Number(promoListDto.perPage) : 10;
        promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';
        const promosResponse = await this.promosService.getPromos(promoListDto);
        return ResponseHandler_1.default.success({
            promos: promosResponse.data,
        });
    }
    async CreatePromo(createPromoDto, user) {
        createPromoDto.type = user.collegeId
            ? createPromo_enum_1.DiscountCut.BOTH
            : createPromoDto.type === createPromo_enum_1.DiscountCut.BOTH
                ? createPromo_enum_1.DiscountCut.BOTH
                : createPromo_enum_1.DiscountCut.UNMUDL;
        createPromoDto.addedBy = user._id;
        createPromoDto.status = 'active';
        createPromoDto.collegeId = user.collegeId
            ? user.collegeId
            : createPromoDto.applyTo === createPromo_enum_1.ApplyTo.SELECTED
                ? createPromoDto.collegeId
                : null;
        if (createPromoDto.applyTo.toLowerCase() === 'all') {
            createPromoDto.courses = [];
        }
        else if (createPromoDto.applyTo === createPromo_enum_1.ApplyTo.SELECTED && createPromoDto.courses && createPromoDto.courses.length === 0) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.createPromo.coursesRequired);
        }
        return await this.promosService.createPromo(createPromoDto);
    }
    async UpdatePromo(updatePromoDto, user) {
        updatePromoDto.type = user.collegeId
            ? createPromo_enum_1.DiscountCut.BOTH
            : updatePromoDto.type === createPromo_enum_1.DiscountCut.BOTH
                ? createPromo_enum_1.DiscountCut.BOTH
                : createPromo_enum_1.DiscountCut.UNMUDL;
        updatePromoDto.addedBy = user._id;
        updatePromoDto.applyTo = user.collegeId ? createPromo_enum_1.ApplyTo.SELECTED : updatePromoDto.applyTo;
        updatePromoDto.collegeId = user.collegeId ? user.collegeId : updatePromoDto.collegeId;
        if (updatePromoDto.applyTo.toLowerCase() === 'all') {
            updatePromoDto.courses = [];
        }
        return await this.promosService.updatePromo(updatePromoDto);
    }
    async UpdateSuspendedStatus(suspendPromoDto, user) {
        return await this.promosService.updateSuspendedStatus(suspendPromoDto);
    }
    async DeletePromo(promoIdDto) {
        const promo = await this.promosService.getPromoById(promoIdDto.promoId);
        if (promo) {
            return await this.promosService.deletePromo(promoIdDto.promoId);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.deletePromo.notFound);
        }
    }
    async GetPromoDetails(promoIdDto, user) {
        return await this.promosService.getPromoDetails(promoIdDto.promoId);
    }
    async GetPromoHistory(promoIdDto, user) {
        return await this.promosService.getPromoHistory(promoIdDto.promoId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get list of promos.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoList_dto_1.PromoListDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "GetPromos", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get list of promos.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get('csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=promos.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoList_dto_1.PromoListDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "GetPromosCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get list of promos.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoList_dto_1.PromoListDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "GetCompletePromosSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a promo.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPromo_dto_1.CreatePromoDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "CreatePromo", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update promo details.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Post('update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePromo_dto_1.UpdatePromoDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "UpdatePromo", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update promo suspended status.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Post('update-suspended'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [suspendPromo_dto_1.SuspendPromoDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "UpdateSuspendedStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete a promo.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Delete(':promoId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoId_dto_1.PromoIdDto]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "DeletePromo", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get promo details.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get('/details/:promoId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoId_dto_1.PromoIdDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "GetPromoDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get promo transaction history.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Get('/history/:promoId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promoId_dto_1.PromoIdDto, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "GetPromoHistory", null);
PromosController = __decorate([
    swagger_1.ApiTags('Promos'),
    common_1.Controller('promos'),
    __metadata("design:paramtypes", [promos_service_1.PromosService])
], PromosController);
exports.PromosController = PromosController;
//# sourceMappingURL=promos.controller.js.map