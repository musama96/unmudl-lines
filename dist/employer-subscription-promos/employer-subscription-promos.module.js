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
const employer_subscription_promos_controller_1 = require("./employer-subscription-promos.controller");
const employer_subscription_promos_service_1 = require("./employer-subscription-promos.service");
const employer_subscription_promo_model_1 = require("./employer-subscription-promo.model");
const stripe_module_1 = require("../stripe/stripe.module");
let EmployerSubscriptionPromosModule = class EmployerSubscriptionPromosModule {
};
EmployerSubscriptionPromosModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'employer-subscription-promos', schema: employer_subscription_promo_model_1.EmployerSubscriptionPromoSchema }]),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
        ],
        controllers: [employer_subscription_promos_controller_1.EmployerSubscriptionPromosController],
        providers: [employer_subscription_promos_service_1.EmployerSubscriptionPromosService],
        exports: [employer_subscription_promos_service_1.EmployerSubscriptionPromosService],
    })
], EmployerSubscriptionPromosModule);
exports.EmployerSubscriptionPromosModule = EmployerSubscriptionPromosModule;
//# sourceMappingURL=employer-subscription-promos.module.js.map