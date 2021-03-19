"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const enquiries_controller_1 = require("./enquiries.controller");
const enquiries_service_1 = require("./enquiries.service");
const mongoose_1 = require("@nestjs/mongoose");
const enquiry_message_model_1 = require("./enquiry-message.model");
const courses_model_1 = require("../courses/courses.model");
const learner_model_1 = require("../learners/learner.model");
const enquiry_model_1 = require("./enquiry.model");
const learner_enquiries_controller_1 = require("./learner-enquiries.controller");
const notifications_module_1 = require("../notifications/notifications.module");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const chat_model_1 = require("../chat/chat.model");
const message_model_1 = require("../chat/message.model");
let EnquiriesModule = class EnquiriesModule {
};
EnquiriesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'enquiries', schema: enquiry_model_1.EnquirySchema },
                { name: 'enquiry-messages', schema: enquiry_message_model_1.EnquiryMessageSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'learners', schema: learner_model_1.LearnerSchema },
                { name: 'chats', schema: chat_model_1.ChatSchema },
                { name: 'messages', schema: message_model_1.MessageSchema },
            ]),
            notifications_module_1.NotificationsModule,
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
        ],
        controllers: [enquiries_controller_1.EnquiriesController, learner_enquiries_controller_1.LearnerEnquiriesController],
        providers: [enquiries_service_1.EnquiriesService],
        exports: [enquiries_service_1.EnquiriesService],
    })
], EnquiriesModule);
exports.EnquiriesModule = EnquiriesModule;
//# sourceMappingURL=enquiries.module.js.map