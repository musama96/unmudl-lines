"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_admins_controller_1 = require("./employer-admins.controller");
const employer_admins_service_1 = require("./employer-admins.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_admin_model_1 = require("./employer-admin.model");
const employer_admin_token_model_1 = require("./employer-admin-token.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const employer_admin_invitations_module_1 = require("../employer-admin-invitations/employer-admin-invitations.module");
const employer_admin_invitation_model_1 = require("../employer-admin-invitations/employer-admin-invitation.model");
const employerAdminsNotification_model_1 = require("../notifications/employerAdminsNotification.model");
const notifications_module_1 = require("../notifications/notifications.module");
const stripe_module_1 = require("../stripe/stripe.module");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const chat_module_1 = require("../chat/chat.module");
const employer_subscriptions_module_1 = require("../employer-subscriptions/employer-subscriptions.module");
let EmployerAdminsModule = class EmployerAdminsModule {
};
EmployerAdminsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
                { name: 'employer-admin-invitations', schema: employer_admin_invitation_model_1.EmployerAdminInvitationSchema },
                { name: 'trashed-employer-admins', schema: employer_admin_model_1.TrashedEmployerAdminSchema },
                { name: 'employer-admin-tokens', schema: employer_admin_token_model_1.EmployerAdminTokenSchema },
                { name: 'employer-admin-notifications', schema: employerAdminsNotification_model_1.EmployerAdminsNotificationSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
            ]),
            common_1.forwardRef(() => employer_admin_invitations_module_1.EmployerAdminInvitationsModule),
            common_1.forwardRef(() => employer_subscriptions_module_1.EmployerSubscriptionsModule),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            common_1.forwardRef(() => chat_module_1.ChatModule),
        ],
        controllers: [employer_admins_controller_1.EmployerAdminsController],
        providers: [employer_admins_service_1.EmployerAdminsService],
        exports: [employer_admins_service_1.EmployerAdminsService],
    })
], EmployerAdminsModule);
exports.EmployerAdminsModule = EmployerAdminsModule;
//# sourceMappingURL=employer-admins.module.js.map