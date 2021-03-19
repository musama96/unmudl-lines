"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const refund_requests_service_1 = require("./refund-requests.service");
const refund_requests_controller_1 = require("./refund-requests.controller");
const mongoose_1 = require("@nestjs/mongoose");
const refund_request_model_1 = require("./refund-request.model");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const learners_refund_requests_controller_1 = require("./learners-refund-requests.controller");
const stripe_module_1 = require("../stripe/stripe.module");
const notifications_module_1 = require("../notifications/notifications.module");
const activities_module_1 = require("../activities/activities.module");
const user_model_1 = require("../users/user.model");
const learner_model_1 = require("../learners/learner.model");
const courses_model_1 = require("../courses/courses.model");
const courses_module_1 = require("../courses/courses.module");
const external_module_1 = require("../external/external.module");
const learners_module_1 = require("../learners/learners.module");
const colleges_module_1 = require("../colleges/colleges.module");
const gift_a_course_model_1 = require("../gift-a-course/gift-a-course.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let RefundRequestsModule = class RefundRequestsModule {
};
RefundRequestsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'refund-requests', schema: refund_request_model_1.RefundRequestSchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'learners', schema: learner_model_1.LearnerSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'gift-course', schema: gift_a_course_model_1.GiftCourseSchema },
            ]),
            enrollments_module_1.EnrollmentsModule,
            common_1.forwardRef(() => courses_module_1.CoursesModule),
            common_1.forwardRef(() => external_module_1.ExternalModule),
            common_1.forwardRef(() => learners_module_1.LearnersModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            stripe_module_1.StripeModule,
            notifications_module_1.NotificationsModule,
            activities_module_1.ActivitiesModule,
        ],
        controllers: [refund_requests_controller_1.RefundRequestsController, learners_refund_requests_controller_1.LearnersRefundRequestsController],
        providers: [refund_requests_service_1.RefundRequestsService],
        exports: [refund_requests_service_1.RefundRequestsService],
    })
], RefundRequestsModule);
exports.RefundRequestsModule = RefundRequestsModule;
//# sourceMappingURL=refund-requests.module.js.map