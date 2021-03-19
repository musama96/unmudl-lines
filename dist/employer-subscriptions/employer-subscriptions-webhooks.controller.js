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
const employer_subscriptions_service_1 = require("./employer-subscriptions.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
let EmployerSubscriptionsWebhooksController = class EmployerSubscriptionsWebhooksController {
    constructor(employerSubscriptionsService) {
        this.employerSubscriptionsService = employerSubscriptionsService;
    }
    async paymentSucceeded(body) {
        const invoice = await body.data.object;
        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
            const { data: subscription } = await this.employerSubscriptionsService.subscriptionInvoicePaymentSucceeded(invoice);
            return ResponseHandler_1.default.success(subscription, 'Invoice received successfully.');
        }
        else {
            return ResponseHandler_1.default.success(null);
        }
    }
    async paymentFailed(body) {
        const invoice = await body.data.object;
        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
            await this.employerSubscriptionsService.subscriptionInvoicePaymentFailed(invoice);
            return ResponseHandler_1.default.success(null, 'Subscription canceled and downgraded plan to local until payment');
        }
        else {
            return ResponseHandler_1.default.success(null);
        }
    }
};
__decorate([
    common_1.Post('payment-succeeded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsWebhooksController.prototype, "paymentSucceeded", null);
__decorate([
    common_1.Post('payment-failed'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsWebhooksController.prototype, "paymentFailed", null);
EmployerSubscriptionsWebhooksController = __decorate([
    swagger_1.ApiTags('Employer Subscriptions - Webhooks'),
    common_1.Controller('/employer-subscriptions/webhooks'),
    __metadata("design:paramtypes", [employer_subscriptions_service_1.EmployerSubscriptionsService])
], EmployerSubscriptionsWebhooksController);
exports.EmployerSubscriptionsWebhooksController = EmployerSubscriptionsWebhooksController;
//# sourceMappingURL=employer-subscriptions-webhooks.controller.js.map