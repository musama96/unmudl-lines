"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const contact_colleges_controller_1 = require("./contact-colleges.controller");
const contact_colleges_service_1 = require("./contact-colleges.service");
const mongoose_1 = require("@nestjs/mongoose");
const contact_college_model_1 = require("./contact-college.model");
const notifications_module_1 = require("../notifications/notifications.module");
const colleges_module_1 = require("../colleges/colleges.module");
const users_module_1 = require("../users/users.module");
const mailer_1 = require("@nest-modules/mailer");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
let ContactCollegesModule = class ContactCollegesModule {
};
ContactCollegesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
                { name: 'contact-college-proposals', schema: contact_college_model_1.ContactCollegeProposalsSchema },
                { name: 'contact-college-draft-proposals', schema: contact_college_model_1.ContactCollegeDraftProposalsSchema },
            ]),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => users_module_1.UsersModule),
            mailer_1.MailerModule,
        ],
        controllers: [contact_colleges_controller_1.ContactCollegesController],
        providers: [contact_colleges_service_1.ContactCollegesService],
        exports: [contact_colleges_service_1.ContactCollegesService],
    })
], ContactCollegesModule);
exports.ContactCollegesModule = ContactCollegesModule;
//# sourceMappingURL=contact-colleges.module.js.map