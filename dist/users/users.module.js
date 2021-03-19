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
const user_model_1 = require("./user.model");
const courses_model_1 = require("../courses/courses.model");
const userToken_model_1 = require("./userToken.model");
const users_service_1 = require("./users.service");
const userTokens_service_1 = require("./userTokens.service");
const users_controller_1 = require("./users.controller");
const invitations_module_1 = require("../invitations/invitations.module");
const activities_module_1 = require("../activities/activities.module");
const stripe_module_1 = require("../stripe/stripe.module");
const colleges_module_1 = require("../colleges/colleges.module");
const payouts_module_1 = require("../payouts/payouts.module");
const transactions_module_1 = require("../transactions/transactions.module");
const invitation_model_1 = require("../invitations/invitation.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const usersNotification_model_1 = require("../notifications/usersNotification.model");
const notifications_module_1 = require("../notifications/notifications.module");
const activity_model_1 = require("../activities/activity.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'user-notifications', schema: usersNotification_model_1.UsersNotificationSchema },
                { name: 'activities', schema: activity_model_1.ActivitySchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'trashedUsers', schema: user_model_1.TrashedUserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'UserToken', schema: userToken_model_1.UserTokenSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'courses', schema: courses_model_1.CourseSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'invitations', schema: invitation_model_1.InvitationSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'id-counters', schema: id_counter_model_1.CounterSchema }]),
            common_1.forwardRef(() => invitations_module_1.InvitationsModule),
            common_1.forwardRef(() => stripe_module_1.StripeModule),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            activities_module_1.ActivitiesModule,
            payouts_module_1.PayoutsModule,
            transactions_module_1.TransactionsModule,
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, userTokens_service_1.UserTokensService],
        exports: [users_service_1.UsersService, userTokens_service_1.UserTokensService],
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map