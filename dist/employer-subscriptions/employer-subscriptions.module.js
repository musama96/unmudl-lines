"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const colleges_module_1 = require("../colleges/colleges.module");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
const employer_subscription_promo_model_1 = require("../employer-subscription-promos/employer-subscription-promo.model");
const stripe_module_1 = require("../stripe/stripe.module");
const employer_subscription_plan_model_1 = require("./employer-subscription-plan.model");
const employer_subscription_model_1 = require("./employer-subscription.model");
const employer_subscriptions_webhooks_controller_1 = require("./employer-subscriptions-webhooks.controller");
const employer_subscriptions_controller_1 = require("./employer-subscriptions.controller");
const employer_subscriptions_service_1 = require("./employer-subscriptions.service");
const employer_admins_module_1 = require("../employer-admins/employer-admins.module");
let EmployerSubscriptionsModule = class EmployerSubscriptionsModule {
};
EmployerSubscriptionsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
                { name: 'employer-subscriptions', schema: employer_subscription_model_1.EmployerSubscriptionSchema },
                { name: 'employer-subscription-plans', schema: employer_subscription_plan_model_1.EmployerSubscriptionPlanSchema },
                { name: 'employer-subscription-promos', schema: employer_subscription_promo_model_1.EmployerSubscriptionPromoSchema },
            ]),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => employer_admins_module_1.EmployerAdminsModule),
        ],
        controllers: [employer_subscriptions_controller_1.EmployerSubscriptionsController, employer_subscriptions_webhooks_controller_1.EmployerSubscriptionsWebhooksController],
        providers: [employer_subscriptions_service_1.EmployerSubscriptionsService],
        exports: [employer_subscriptions_service_1.EmployerSubscriptionsService],
    })
], EmployerSubscriptionsModule);
exports.EmployerSubscriptionsModule = EmployerSubscriptionsModule;
//# sourceMappingURL=employer-subscriptions.module.js.map