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
const createEmployerSubscription_dto_1 = require("./dto/createEmployerSubscription.dto");
const verifyPromo_dto_1 = require("./dto/verifyPromo.dto");
const employer_subscription_promos_service_1 = require("./employer-subscription-promos.service");
let EmployerSubscriptionPromosController = class EmployerSubscriptionPromosController {
    constructor(employerSubscriptionPromosService) {
        this.employerSubscriptionPromosService = employerSubscriptionPromosService;
    }
    async createEmployerSubscriptionPromo(createEmployerSubscriptionPromoDto, user) {
        if (user.employerId || user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        createEmployerSubscriptionPromoDto.addedBy = user._id;
        createEmployerSubscriptionPromoDto.stripeTitle = createEmployerSubscriptionPromoDto.title + '-' + Date.now();
        createEmployerSubscriptionPromoDto.status = 'active';
        return await this.employerSubscriptionPromosService.createEmployerSubscriptionPromo(createEmployerSubscriptionPromoDto);
    }
    async verifyPromo(verifyEmployerSubscriptionPromoDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.employerSubscriptionPromosService.verifyPromo(verifyEmployerSubscriptionPromoDto);
    }
};
__decorate([
    common_1.Post(),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Create new employer subscription promo.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createEmployerSubscription_dto_1.CreateEmployerSubscriptionPromoDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionPromosController.prototype, "createEmployerSubscriptionPromo", null);
__decorate([
    common_1.Post('verify-promo'),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Verify if a promo can be applied.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyPromo_dto_1.VerifyEmployerSubscriptionPromoDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionPromosController.prototype, "verifyPromo", null);
EmployerSubscriptionPromosController = __decorate([
    swagger_1.ApiTags('Employer Subscription Promos - Admin Portal'),
    common_1.Controller('employer-subscription-promos'),
    __metadata("design:paramtypes", [employer_subscription_promos_service_1.EmployerSubscriptionPromosService])
], EmployerSubscriptionPromosController);
exports.EmployerSubscriptionPromosController = EmployerSubscriptionPromosController;
//# sourceMappingURL=employer-subscription-promos.controller.js.map