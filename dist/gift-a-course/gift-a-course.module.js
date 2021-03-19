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
const courses_model_1 = require("../courses/courses.model");
const courses_module_1 = require("../courses/courses.module");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const learner_model_1 = require("../learners/learner.model");
const learners_module_1 = require("../learners/learners.module");
const promo_model_1 = require("../promos/promo.model");
const promos_module_1 = require("../promos/promos.module");
const stripe_module_1 = require("../stripe/stripe.module");
const user_model_1 = require("../users/user.model");
const gift_a_course_controller_1 = require("./gift-a-course.controller");
const gift_a_course_model_1 = require("./gift-a-course.model");
const gift_a_course_service_1 = require("./gift-a-course.service");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let GiftACourseModule = class GiftACourseModule {
};
GiftACourseModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { schema: gift_a_course_model_1.GiftCourseSchema, name: 'gift-course' },
                { schema: promo_model_1.PromoSchema, name: 'promos' },
                { schema: enrollment_model_1.EnrollmentSchema, name: 'enrollments' },
                { schema: courses_model_1.CourseSchema, name: 'courses' },
                { schema: learner_model_1.LearnerSchema, name: 'learners' },
                { schema: user_model_1.UserSchema, name: 'users' },
            ]),
            common_1.forwardRef(() => enrollments_module_1.EnrollmentsModule),
            common_1.forwardRef(() => learners_module_1.LearnersModule),
            common_1.forwardRef(() => courses_module_1.CoursesModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => promos_module_1.PromosModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
        ],
        controllers: [gift_a_course_controller_1.GiftACourseController],
        providers: [gift_a_course_service_1.GiftACourseService],
        exports: [gift_a_course_service_1.GiftACourseService],
    })
], GiftACourseModule);
exports.GiftACourseModule = GiftACourseModule;
//# sourceMappingURL=gift-a-course.module.js.map