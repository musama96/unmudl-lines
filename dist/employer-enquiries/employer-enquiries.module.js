"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_enquiries_controller_1 = require("./employer-enquiries.controller");
const employer_enquiries_service_1 = require("./employer-enquiries.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_enquiry_message_model_1 = require("./employer-enquiry-message.model");
const employer_enquiry_model_1 = require("./employer-enquiry.model");
const notifications_module_1 = require("../notifications/notifications.module");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const college_model_1 = require("../colleges/college.model");
const user_model_1 = require("../users/user.model");
const mailer_1 = require("@nest-modules/mailer");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let EmployerEnquiriesModule = class EmployerEnquiriesModule {
};
EmployerEnquiriesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-enquiries', schema: employer_enquiry_model_1.EmployerEnquirySchema },
                { name: 'employer-enquiry-messages', schema: employer_enquiry_message_model_1.EmployerEnquiryMessageSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'users', schema: user_model_1.UserSchema },
            ]),
            notifications_module_1.NotificationsModule,
            mailer_1.MailerModule,
            email_logs_module_1.EmailLogsModule,
        ],
        controllers: [employer_enquiries_controller_1.EmployerEnquiriesController],
        providers: [employer_enquiries_service_1.EmployerEnquiriesService],
        exports: [employer_enquiries_service_1.EmployerEnquiriesService],
    })
], EmployerEnquiriesModule);
exports.EmployerEnquiriesModule = EmployerEnquiriesModule;
//# sourceMappingURL=employer-enquiries.module.js.map