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
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const stripe_service_1 = require("../stripe/stripe.service");
let EmployerSubscriptionPromosService = class EmployerSubscriptionPromosService {
    constructor(employerSubscriptionPromoModel, stripeService) {
        this.employerSubscriptionPromoModel = employerSubscriptionPromoModel;
        this.stripeService = stripeService;
    }
    async createEmployerSubscriptionPromo(promo) {
        const newPromo = await this.employerSubscriptionPromoModel.create(promo);
        const { data: stripeCoupon } = await this.stripeService.createSubscriptionPromo(promo);
        return ResponseHandler_1.default.success({ newPromo, stripeCoupon });
    }
    async verifyPromo({ title, plan }) {
        const promos = await this.employerSubscriptionPromoModel.find({ title }).lean();
        let failureMessage = 'Promo not found.';
        if (promos && promos.length > 0) {
            for (let i = 0; i < promos.length; i++) {
                const promo = promos[i];
                if ((promo.maxUses && promo.maxUses === promo.used) ||
                    (promo.date.start && new Date(promo.date.start) > new Date()) ||
                    (promo.applyToPlans === 'selected' && !promo.plans.find(planId => planId.toString() === plan.toString())) ||
                    promo.status === 'suspended') {
                    failureMessage = 'Promo cannot be applied.';
                    continue;
                }
                if (promo.date.end && new Date(promo.date.end) < new Date()) {
                    failureMessage = 'Promo has expired.';
                    continue;
                }
                return ResponseHandler_1.default.success({
                    _id: promo._id,
                    title: promo.title,
                    percentage: promo.percentage,
                    duration: promo.duration,
                });
            }
        }
        return ResponseHandler_1.default.fail(failureMessage);
    }
};
EmployerSubscriptionPromosService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-subscription-promos')),
    __metadata("design:paramtypes", [Object, stripe_service_1.StripeService])
], EmployerSubscriptionPromosService);
exports.EmployerSubscriptionPromosService = EmployerSubscriptionPromosService;
//# sourceMappingURL=employer-subscription-promos.service.js.map