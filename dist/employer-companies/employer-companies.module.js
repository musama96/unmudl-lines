"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_companies_controller_1 = require("./employer-companies.controller");
const employer_companies_service_1 = require("./employer-companies.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_company_model_1 = require("./employer-company.model");
const employer_admins_module_1 = require("../employer-admins/employer-admins.module");
const employer_invitations_module_1 = require("../employer-invitations/employer-invitations.module");
const notifications_module_1 = require("../notifications/notifications.module");
const enrollment_company_token_model_1 = require("./enrollment-company-token.model");
const learners_employer_companies_controller_1 = require("./learners-employer-companies.controller");
const employer_invitation_model_1 = require("../employer-invitations/employer-invitation.model");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../auth/constants");
const colleges_module_1 = require("../colleges/colleges.module");
const employers_module_1 = require("../employers/employers.module");
const unmudl_access_logs_module_1 = require("../unmudl-access-logs/unmudl-access-logs.module");
const employer_admin_invitations_module_1 = require("../employer-admin-invitations/employer-admin-invitations.module");
const employer_subscriptions_module_1 = require("../employer-subscriptions/employer-subscriptions.module");
let EmployerCompaniesModule = class EmployerCompaniesModule {
};
EmployerCompaniesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
                { name: 'employer-company-tokens', schema: enrollment_company_token_model_1.EnrollmentCompanyTokenSchema },
                { name: 'employer-invitations', schema: employer_invitation_model_1.EmployerInvitationSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
            ]),
            common_1.forwardRef(() => employer_admins_module_1.EmployerAdminsModule),
            common_1.forwardRef(() => employer_invitations_module_1.EmployerInvitationsModule),
            common_1.forwardRef(() => employer_admin_invitations_module_1.EmployerAdminInvitationsModule),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => employers_module_1.EmployersModule),
            common_1.forwardRef(() => employer_subscriptions_module_1.EmployerSubscriptionsModule),
            jwt_1.JwtModule.register({
                secret: constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '3600s' },
            }),
            unmudl_access_logs_module_1.UnmudlAccessLogsModule,
        ],
        controllers: [employer_companies_controller_1.EmployerCompaniesController, learners_employer_companies_controller_1.LearnersEmployerCompaniesController],
        providers: [employer_companies_service_1.EmployerCompaniesService],
        exports: [employer_companies_service_1.EmployerCompaniesService],
    })
], EmployerCompaniesModule);
exports.EmployerCompaniesModule = EmployerCompaniesModule;
//# sourceMappingURL=employer-companies.module.js.map