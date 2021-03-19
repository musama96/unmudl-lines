"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const colleges_controller_1 = require("./colleges.controller");
const learners_colleges_controller_1 = require("./learners-colleges.controller");
const colleges_service_1 = require("./colleges.service");
const users_module_1 = require("../users/users.module");
const college_model_1 = require("./college.model");
const mongoose_1 = require("@nestjs/mongoose");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const courses_model_1 = require("../courses/courses.model");
const user_model_1 = require("../users/user.model");
const stripe_module_1 = require("../stripe/stripe.module");
const payouts_module_1 = require("../payouts/payouts.module");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const courses_module_1 = require("../courses/courses.module");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const college_invitation_model_1 = require("../college-invitations/college-invitation.model");
const collegeToken_model_1 = require("../college-invitations/collegeToken.model");
const college_invitations_module_1 = require("../college-invitations/college-invitations.module");
const activities_module_1 = require("../activities/activities.module");
const notifications_module_1 = require("../notifications/notifications.module");
const landing_page_model_1 = require("../landing-page/landing-page.model");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
const employer_model_1 = require("../employers/employer.model");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../auth/constants");
const unmudl_access_logs_module_1 = require("../unmudl-access-logs/unmudl-access-logs.module");
let CollegesModule = class CollegesModule {
};
CollegesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'college-invitations', schema: college_invitation_model_1.CollegeInvitationSchema },
                { name: 'collegetokens', schema: collegeToken_model_1.CollegeTokenSchema },
                { name: 'landing-pages', schema: landing_page_model_1.LandingPageSchema },
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
                { name: 'employers', schema: employer_model_1.EmployerSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'courses', schema: courses_model_1.CourseSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'users', schema: user_model_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'id-counters', schema: id_counter_model_1.CounterSchema }]),
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            payouts_module_1.PayoutsModule,
            jwt_1.JwtModule.register({
                secret: constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '3600s' },
            }),
            common_1.forwardRef(() => college_invitations_module_1.CollegeInvitationsModule),
            activities_module_1.ActivitiesModule,
            notifications_module_1.NotificationsModule,
            unmudl_access_logs_module_1.UnmudlAccessLogsModule,
            common_1.forwardRef(() => enrollments_module_1.EnrollmentsModule),
            common_1.forwardRef(() => courses_module_1.CoursesModule),
        ],
        controllers: [colleges_controller_1.CollegesController, learners_colleges_controller_1.LearnersCollegesController],
        providers: [colleges_service_1.CollegesService],
        exports: [colleges_service_1.CollegesService],
    })
], CollegesModule);
exports.CollegesModule = CollegesModule;
//# sourceMappingURL=colleges.module.js.map