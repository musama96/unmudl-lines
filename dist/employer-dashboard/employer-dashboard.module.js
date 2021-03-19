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
const employer_subscriptions_module_1 = require("../employer-subscriptions/employer-subscriptions.module");
const blogs_module_1 = require("../blogs/blogs.module");
const contact_colleges_module_1 = require("../contact-colleges/contact-colleges.module");
const employer_companies_module_1 = require("../employer-companies/employer-companies.module");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
const employer_forums_module_1 = require("../employer-forums/employer-forums.module");
const notifications_module_1 = require("../notifications/notifications.module");
const source_talent_module_1 = require("../source-talent/source-talent.module");
const employer_dashboard_controller_1 = require("./employer-dashboard.controller");
const employer_dashboard_service_1 = require("./employer-dashboard.service");
const colleges_module_1 = require("../colleges/colleges.module");
let EmployerDashboardModule = class EmployerDashboardModule {
};
EmployerDashboardModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema }]),
            employer_companies_module_1.EmployerCompaniesModule,
            source_talent_module_1.SourceTalentModule,
            contact_colleges_module_1.ContactCollegesModule,
            blogs_module_1.BlogsModule,
            employer_forums_module_1.EmployerForumsModule,
            notifications_module_1.NotificationsModule,
            employer_subscriptions_module_1.EmployerSubscriptionsModule,
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
        ],
        controllers: [employer_dashboard_controller_1.EmployerDashboardController],
        providers: [employer_dashboard_service_1.EmployerDashboardService],
        exports: [employer_dashboard_service_1.EmployerDashboardService],
    })
], EmployerDashboardModule);
exports.EmployerDashboardModule = EmployerDashboardModule;
//# sourceMappingURL=employer-dashboard.module.js.map