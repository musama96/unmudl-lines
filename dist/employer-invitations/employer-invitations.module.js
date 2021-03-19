"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_invitations_controller_1 = require("./employer-invitations.controller");
const employer_invitations_service_1 = require("./employer-invitations.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_invitation_model_1 = require("./employer-invitation.model");
const employer_admins_module_1 = require("../employer-admins/employer-admins.module");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
const employer_admin_token_model_1 = require("../employer-admins/employer-admin-token.model");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const enrollment_company_token_model_1 = require("../employer-companies/enrollment-company-token.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const employer_subscriptions_module_1 = require("../employer-subscriptions/employer-subscriptions.module");
const stripe_module_1 = require("../stripe/stripe.module");
const chat_module_1 = require("../chat/chat.module");
let EmployerInvitationsModule = class EmployerInvitationsModule {
};
EmployerInvitationsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-invitations', schema: employer_invitation_model_1.EmployerInvitationSchema },
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
                { name: 'employer-admin-tokens', schema: employer_admin_token_model_1.EmployerAdminTokenSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'employer-company-tokens', schema: enrollment_company_token_model_1.EnrollmentCompanyTokenSchema },
            ]),
            common_1.forwardRef(() => employer_admins_module_1.EmployerAdminsModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            common_1.forwardRef(() => employer_subscriptions_module_1.EmployerSubscriptionsModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => chat_module_1.ChatModule),
        ],
        controllers: [employer_invitations_controller_1.EmployerInvitationsController],
        providers: [employer_invitations_service_1.EmployerInvitationsService],
        exports: [employer_invitations_service_1.EmployerInvitationsService],
    })
], EmployerInvitationsModule);
exports.EmployerInvitationsModule = EmployerInvitationsModule;
//# sourceMappingURL=employer-invitations.module.js.map