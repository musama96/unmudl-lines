"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const contact_college_responses_controller_1 = require("./contact-college-responses.controller");
const contact_college_responses_service_1 = require("./contact-college-responses.service");
const mongoose_1 = require("@nestjs/mongoose");
const contact_college_response_model_1 = require("./contact-college-response.model");
const contact_colleges_module_1 = require("../contact-colleges/contact-colleges.module");
const chat_module_1 = require("../chat/chat.module");
const message_model_1 = require("../chat/message.model");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const user_model_1 = require("../users/user.model");
const learner_model_1 = require("../learners/learner.model");
const notifications_module_1 = require("../notifications/notifications.module");
let ContactCollegeResponsesModule = class ContactCollegeResponsesModule {
};
ContactCollegeResponsesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'contact-college-responses', schema: contact_college_response_model_1.ContactCollegeResponseSchema },
                { name: 'messages', schema: message_model_1.MessageSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'learners', schema: learner_model_1.LearnerSchema },
            ]),
            common_1.forwardRef(() => contact_colleges_module_1.ContactCollegesModule),
            common_1.forwardRef(() => chat_module_1.ChatModule),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [contact_college_responses_controller_1.ContactCollegeResponsesController],
        providers: [contact_college_responses_service_1.ContactCollegeResponsesService],
        exports: [contact_college_responses_service_1.ContactCollegeResponsesService],
    })
], ContactCollegeResponsesModule);
exports.ContactCollegeResponsesModule = ContactCollegeResponsesModule;
//# sourceMappingURL=contact-college-responses.module.js.map