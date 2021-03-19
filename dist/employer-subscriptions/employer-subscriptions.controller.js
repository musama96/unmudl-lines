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
const employer_subscriptions_service_1 = require("./employer-subscriptions.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const updateEmployerSubscription_dto_1 = require("./dto/updateEmployerSubscription.dto");
const updateCollegeOrState_dto_1 = require("./dto/updateCollegeOrState.dto");
let EmployerSubscriptionsController = class EmployerSubscriptionsController {
    constructor(employerSubscriptionsService) {
        this.employerSubscriptionsService = employerSubscriptionsService;
    }
    async updateEmployerSubscription(createEmployerSubscriptionDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized');
        }
        createEmployerSubscriptionDto.stripeCustomerId = user.stripeCustomerId;
        createEmployerSubscriptionDto.employer = user.employerId;
        return await this.employerSubscriptionsService.updateEmployerSubscription(createEmployerSubscriptionDto);
    }
    async updateCollegeOrState(updateCollegeOrStateDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized');
        }
        return await this.employerSubscriptionsService.updateCollegeOrState(updateCollegeOrStateDto);
    }
    async initializeEmployerSubscriptionsIfDoesntExist(user) {
        if (user.employerId || user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized');
        }
        return await this.employerSubscriptionsService.initializeEmployerSubscriptionsIfDoesntExist();
    }
    async getEmployerSubscriptionPlans(user) {
        return await this.employerSubscriptionsService.getEmployerSubscriptionPlans(user);
    }
    async getEmployerInvoices(user) {
        return await this.employerSubscriptionsService.getEmployerInvoices(user);
    }
    async initializeDefaultSubscriptionPlans(user) {
        if (user.collegeId || user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.employerSubscriptionsService.initializeDefaultSubscriptionPlans();
    }
};
__decorate([
    common_1.Post(),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Subscribe to employer subscription plan.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateEmployerSubscription_dto_1.UpdateEmployerSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "updateEmployerSubscription", null);
__decorate([
    common_1.Post('update-college-state'),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update college or state in subscription.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateCollegeOrState_dto_1.UpdateCollegeOrStateDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "updateCollegeOrState", null);
__decorate([
    common_1.Post('init-subscriptions'),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('superadmin'),
    swagger_1.ApiOperation({ summary: `Subscribe to local plan if employer isn't subscribed to any.` }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "initializeEmployerSubscriptionsIfDoesntExist", null);
__decorate([
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiBearerAuth(),
    common_1.Get('plans'),
    swagger_1.ApiOperation({ summary: 'Get all subscription plans.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "getEmployerSubscriptionPlans", null);
__decorate([
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiBearerAuth(),
    common_1.Get('invoices'),
    swagger_1.ApiOperation({ summary: 'Get employer invoices.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "getEmployerInvoices", null);
__decorate([
    common_1.Post('/plans/init-all'),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('superadmin'),
    swagger_1.ApiOperation({ summary: 'Initialize default employer subscription plans.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsController.prototype, "initializeDefaultSubscriptionPlans", null);
EmployerSubscriptionsController = __decorate([
    swagger_1.ApiTags('Employer Subscriptions'),
    common_1.Controller('employer-subscriptions'),
    __metadata("design:paramtypes", [employer_subscriptions_service_1.EmployerSubscriptionsService])
], EmployerSubscriptionsController);
exports.EmployerSubscriptionsController = EmployerSubscriptionsController;
//# sourceMappingURL=employer-subscriptions.controller.js.map