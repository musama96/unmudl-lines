"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const invitations_controller_1 = require("./invitations.controller");
const invitations_service_1 = require("./invitations.service");
const mongoose_1 = require("@nestjs/mongoose");
const invitation_model_1 = require("./invitation.model");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const colleges_module_1 = require("../colleges/colleges.module");
const activities_module_1 = require("../activities/activities.module");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let InvitationsModule = class InvitationsModule {
};
InvitationsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'invitations', schema: invitation_model_1.InvitationSchema }]),
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => courses_module_1.CoursesModule),
            common_1.forwardRef(() => colleges_module_1.CollegesModule),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
            activities_module_1.ActivitiesModule,
        ],
        controllers: [invitations_controller_1.InvitationsController],
        providers: [invitations_service_1.InvitationsService],
        exports: [invitations_service_1.InvitationsService],
    })
], InvitationsModule);
exports.InvitationsModule = InvitationsModule;
//# sourceMappingURL=invitations.module.js.map