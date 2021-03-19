"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const reported_activities_controller_1 = require("./reported-activities.controller");
const reported_activities_service_1 = require("./reported-activities.service");
const mongoose_1 = require("@nestjs/mongoose");
const reported_activity_model_1 = require("./reported-activity.model");
const learner_reported_activities_controller_1 = require("./learner-reported-activities.controller");
const courses_module_1 = require("../courses/courses.module");
const learners_module_1 = require("../learners/learners.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ReportedActivitiesModule = class ReportedActivitiesModule {
};
ReportedActivitiesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'reported-activities', schema: reported_activity_model_1.ReportedActivitySchema }]),
            courses_module_1.CoursesModule, learners_module_1.LearnersModule, notifications_module_1.NotificationsModule,
        ],
        controllers: [reported_activities_controller_1.ReportedActivitiesController, learner_reported_activities_controller_1.LearnerReportedActivitiesController],
        providers: [reported_activities_service_1.ReportedActivitiesService],
    })
], ReportedActivitiesModule);
exports.ReportedActivitiesModule = ReportedActivitiesModule;
//# sourceMappingURL=reported-activities.module.js.map