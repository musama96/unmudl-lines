"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const learners_admin_controller_1 = require("./learners-admin.controller");
const learners_service_1 = require("./learners.service");
const mongoose_1 = require("@nestjs/mongoose");
const learner_model_1 = require("./learner.model");
const learnerToken_model_1 = require("./learnerToken.model");
const learnerTokens_service_1 = require("./learnerTokens.service");
const reported_learners_module_1 = require("../reported-learners/reported-learners.module");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const learners_controller_1 = require("./learners.controller");
const stripe_module_1 = require("../stripe/stripe.module");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../auth/constants");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const courses_model_1 = require("../courses/courses.model");
const learnersNotification_model_1 = require("../notifications/learnersNotification.model");
const courses_module_1 = require("../courses/courses.module");
const external_module_1 = require("../external/external.module");
const enquiries_module_1 = require("../enquiries/enquiries.module");
const source_talent_module_1 = require("../source-talent/source-talent.module");
const email_logs_module_1 = require("../email-logs/email-logs.module");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const chat_model_1 = require("../chat/chat.model");
let LearnersModule = class LearnersModule {
};
LearnersModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'learners', schema: learner_model_1.LearnerSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'learner-notifications', schema: learnersNotification_model_1.LearnersNotificationSchema },
                { name: 'email-logs', schema: email_logs_model_1.EmailLogSchema },
                { name: 'chats', schema: chat_model_1.ChatSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'LearnerToken', schema: learnerToken_model_1.LearnerTokenSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema }]),
            reported_learners_module_1.ReportedLearnersModule,
            external_module_1.ExternalModule,
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => enrollments_module_1.EnrollmentsModule),
            common_1.forwardRef(() => courses_module_1.CoursesModule),
            common_1.forwardRef(() => enquiries_module_1.EnquiriesModule),
            common_1.forwardRef(() => source_talent_module_1.SourceTalentModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            jwt_1.JwtModule.register({
                secret: constants_1.jwtConstants.secret,
                signOptions: { expiresIn: '31536000s' },
            }),
        ],
        controllers: [learners_admin_controller_1.LearnersAdminController, learners_controller_1.LearnersController],
        providers: [learners_service_1.LearnersService, learnerTokens_service_1.LearnerTokensService],
        exports: [learners_service_1.LearnersService, learnerTokens_service_1.LearnerTokensService],
    })
], LearnersModule);
exports.LearnersModule = LearnersModule;
//# sourceMappingURL=learners.module.js.map