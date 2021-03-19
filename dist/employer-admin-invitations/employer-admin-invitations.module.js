"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_admin_invitations_service_1 = require("./employer-admin-invitations.service");
const employer_admin_invitations_controller_1 = require("./employer-admin-invitations.controller");
const mongoose_1 = require("@nestjs/mongoose");
const employer_admin_invitation_model_1 = require("./employer-admin-invitation.model");
const employer_admins_module_1 = require("../employer-admins/employer-admins.module");
const employer_companies_module_1 = require("../employer-companies/employer-companies.module");
const activities_module_1 = require("../activities/activities.module");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const stripe_module_1 = require("../stripe/stripe.module");
const chat_module_1 = require("../chat/chat.module");
let EmployerAdminInvitationsModule = class EmployerAdminInvitationsModule {
};
EmployerAdminInvitationsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'employer-admin-invitations', schema: employer_admin_invitation_model_1.EmployerAdminInvitationSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema }]),
            common_1.forwardRef(() => employer_admins_module_1.EmployerAdminsModule),
            common_1.forwardRef(() => employer_companies_module_1.EmployerCompaniesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => chat_module_1.ChatModule),
            activities_module_1.ActivitiesModule,
        ],
        providers: [employer_admin_invitations_service_1.EmployerAdminInvitationsService],
        controllers: [employer_admin_invitations_controller_1.EmployerAdminInvitationsController],
        exports: [employer_admin_invitations_service_1.EmployerAdminInvitationsService],
    })
], EmployerAdminInvitationsModule);
exports.EmployerAdminInvitationsModule = EmployerAdminInvitationsModule;
//# sourceMappingURL=employer-admin-invitations.module.js.map