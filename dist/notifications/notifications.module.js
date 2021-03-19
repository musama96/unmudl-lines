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
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const usersNotification_model_1 = require("./usersNotification.model");
const learnersNotification_model_1 = require("./learnersNotification.model");
const courses_model_1 = require("../courses/courses.model");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const user_model_1 = require("../users/user.model");
const learner_model_1 = require("../learners/learner.model");
const employerAdminsNotification_model_1 = require("./employerAdminsNotification.model");
const employer_admin_model_1 = require("../employer-admins/employer-admin.model");
const landing_page_model_1 = require("../landing-page/landing-page.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const employer_replies_model_1 = require("../employer-forums/employer-replies.model");
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'user-notifications', schema: usersNotification_model_1.UsersNotificationSchema },
                { name: 'learner-notifications', schema: learnersNotification_model_1.LearnersNotificationSchema },
                { name: 'employer-admin-notifications', schema: employerAdminsNotification_model_1.EmployerAdminsNotificationSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'learners', schema: learner_model_1.LearnerSchema },
                { name: 'employer-admins', schema: employer_admin_model_1.EmployerAdminSchema },
                { name: 'landing-page', schema: landing_page_model_1.LandingPageSchema },
                { name: 'employer-replies', schema: employer_replies_model_1.EmployerReplySchema },
            ]),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService],
        exports: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);
exports.NotificationsModule = NotificationsModule;
//# sourceMappingURL=notifications.module.js.map