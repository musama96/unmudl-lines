"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const courses_controller_1 = require("./courses.controller");
const courses_learner_controller_1 = require("./courses-learner.controller");
const courses_service_1 = require("./courses.service");
const mongoose_1 = require("@nestjs/mongoose");
const courses_model_1 = require("./courses.model");
const courses_model_2 = require("./courses.model");
const learner_model_1 = require("../learners/learner.model");
const activities_module_1 = require("../activities/activities.module");
const promo_model_1 = require("../promos/promo.model");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const review_model_1 = require("./review.model");
const performanceOutcomes_model_1 = require("./performanceOutcomes.model");
const employers_module_1 = require("../employers/employers.module");
const notifications_module_1 = require("../notifications/notifications.module");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const learners_module_1 = require("../learners/learners.module");
const user_model_1 = require("../users/user.model");
const promos_module_1 = require("../promos/promos.module");
const cip_certificates_model_1 = require("./cip-certificates.model");
const college_model_1 = require("../colleges/college.model");
const level_anchors_model_1 = require("./level-anchors.model");
const course_draft_model_1 = require("./course-draft.model");
const landing_page_model_1 = require("../landing-page/landing-page.model");
const enquiries_module_1 = require("../enquiries/enquiries.module");
const tax_rates_module_1 = require("../tax-rates/tax-rates.module");
const blog_model_1 = require("../blogs/blog.model");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const users_module_1 = require("../users/users.module");
const colleges_module_1 = require("../colleges/colleges.module");
const course_categories_model_1 = require("./course-categories.model");
const redis_cache_module_1 = require("../redis-cache/redis-cache.module");
const employer_model_1 = require("../employers/employer.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let CoursesModule = class CoursesModule {
};
CoursesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'trashed-courses', schema: courses_model_1.TrashedCourseSchema },
                { name: 'promos', schema: promo_model_1.PromoSchema },
                { name: 'reviews', schema: review_model_1.ReviewSchema },
                { name: 'performance-outcomes', schema: performanceOutcomes_model_1.PerformanceOutcomesSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'cip-certificates', schema: cip_certificates_model_1.CipCertificatesSchema },
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'level-anchors', schema: level_anchors_model_1.LevelAnchorsSchema },
                { name: 'course-drafts', schema: course_draft_model_1.CourseDraftSchema },
                { name: 'landing-page', schema: landing_page_model_1.LandingPageSchema },
                { name: 'blogs', schema: blog_model_1.BlogSchema },
                { name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema },
                { name: 'learners', schema: learner_model_1.LearnerSchema },
                { name: 'ratingCategories', schema: courses_model_2.RatingCategoriesSchema },
                { name: 'course-categories', schema: course_categories_model_1.CourseCategorySchema },
                { name: 'employers', schema: employer_model_1.EmployerSchema },
            ]),
            activities_module_1.ActivitiesModule,
            employers_module_1.EmployersModule,
            notifications_module_1.NotificationsModule,
            learners_module_1.LearnersModule,
            promos_module_1.PromosModule,
            activities_module_1.ActivitiesModule,
            enquiries_module_1.EnquiriesModule,
            redis_cache_module_1.RedisCacheModule,
            common_1.forwardRef(() => enrollments_module_1.EnrollmentsModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => common_1.HttpModule),
            common_1.forwardRef(() => tax_rates_module_1.TaxRatesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
        ],
        providers: [courses_service_1.CoursesService],
        controllers: [courses_controller_1.CoursesController, courses_learner_controller_1.CoursesLearnerController],
        exports: [courses_service_1.CoursesService],
    })
], CoursesModule);
exports.CoursesModule = CoursesModule;
//# sourceMappingURL=courses.module.js.map