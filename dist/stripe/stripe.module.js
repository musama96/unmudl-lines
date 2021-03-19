"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const users_module_1 = require("../users/users.module");
const colleges_module_1 = require("../colleges/colleges.module");
const learners_module_1 = require("../learners/learners.module");
const employer_admins_module_1 = require("../employer-admins/employer-admins.module");
const employer_companies_module_1 = require("../employer-companies/employer-companies.module");
let StripeModule = class StripeModule {
};
StripeModule = __decorate([
    common_1.Module({
        imports: [
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => learners_module_1.LearnersModule),
            common_1.forwardRef(() => employer_admins_module_1.EmployerAdminsModule),
            common_1.forwardRef(() => employer_companies_module_1.EmployerCompaniesModule),
        ],
        providers: [stripe_service_1.StripeService],
        exports: [stripe_service_1.StripeService],
    })
], StripeModule);
exports.StripeModule = StripeModule;
//# sourceMappingURL=stripe.module.js.map