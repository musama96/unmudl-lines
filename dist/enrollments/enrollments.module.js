"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const enrollments_controller_1 = require("./enrollments.controller");
const enrollments_service_1 = require("./enrollments.service");
const mongoose_1 = require("@nestjs/mongoose");
const enrollment_model_1 = require("./enrollment.model");
const courses_module_1 = require("../courses/courses.module");
const learner_model_1 = require("../learners/learner.model");
const promos_module_1 = require("../promos/promos.module");
const promo_model_1 = require("../promos/promo.model");
const courses_model_1 = require("../courses/courses.model");
const activities_module_1 = require("../activities/activities.module");
const stripe_module_1 = require("../stripe/stripe.module");
const learner_enrollments_controller_1 = require("./learner-enrollments.controller");
const user_model_1 = require("../users/user.model");
const college_model_1 = require("../colleges/college.model");
const notifications_module_1 = require("../notifications/notifications.module");
const learners_module_1 = require("../learners/learners.module");
const tax_rates_module_1 = require("../tax-rates/tax-rates.module");
const external_module_1 = require("../external/external.module");
const enquiries_module_1 = require("../enquiries/enquiries.module");
const colleges_module_1 = require("../colleges/colleges.module");
const gift_a_course_model_1 = require("../gift-a-course/gift-a-course.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let EnrollmentsModule = class EnrollmentsModule {
};
EnrollmentsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'learners', schema: learner_model_1.LearnerSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'promos', schema: promo_model_1.PromoSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'courses', schema: courses_model_1.CourseSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'users', schema: user_model_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'colleges', schema: college_model_1.CollegeSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'gift-course', schema: gift_a_course_model_1.GiftCourseSchema }]),
            common_1.forwardRef(() => courses_module_1.CoursesModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => learners_module_1.LearnersModule),
            common_1.forwardRef(() => enquiries_module_1.EnquiriesModule),
            common_1.forwardRef(() => tax_rates_module_1.TaxRatesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            external_module_1.ExternalModule,
            promos_module_1.PromosModule,
            activities_module_1.ActivitiesModule,
            stripe_module_1.StripeModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [enrollments_controller_1.EnrollmentsController, learner_enrollments_controller_1.LearnerEnrollmentsController],
        providers: [enrollments_service_1.EnrollmentsService],
        exports: [enrollments_service_1.EnrollmentsService],
    })
], EnrollmentsModule);
exports.EnrollmentsModule = EnrollmentsModule;
//# sourceMappingURL=enrollments.module.js.map