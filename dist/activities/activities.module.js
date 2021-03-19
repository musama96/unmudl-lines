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
const activities_controller_1 = require("./activities.controller");
const activities_service_1 = require("./activities.service");
const activity_model_1 = require("./activity.model");
const userActivityCategory_model_1 = require("./userActivityCategory.model");
const transactionActivityCategory_model_1 = require("./transactionActivityCategory.model");
const user_model_1 = require("../users/user.model");
const courses_model_1 = require("../courses/courses.model");
let ActivitiesModule = class ActivitiesModule {
};
ActivitiesModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'activities', schema: activity_model_1.ActivitySchema },
                { name: 'users', schema: user_model_1.UserSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'useractivitycategories', schema: userActivityCategory_model_1.UserActivityCategorySchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'transactionactivitycategories', schema: transactionActivityCategory_model_1.TransactionActivityCategorySchema }]),
        ],
        controllers: [activities_controller_1.ActivitiesController],
        providers: [activities_service_1.ActivitiesService],
        exports: [activities_service_1.ActivitiesService],
    })
], ActivitiesModule);
exports.ActivitiesModule = ActivitiesModule;
//# sourceMappingURL=activities.module.js.map