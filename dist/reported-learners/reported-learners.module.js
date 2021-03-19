"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const reported_learners_controller_1 = require("./reported-learners.controller");
const reported_learners_service_1 = require("./reported-learners.service");
const mongoose_1 = require("@nestjs/mongoose");
const reported_learner_model_1 = require("./reported-learner.model");
const learner_model_1 = require("../learners/learner.model");
let ReportedLearnersModule = class ReportedLearnersModule {
};
ReportedLearnersModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'reported-learners', schema: reported_learner_model_1.ReportedLearnerSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'learners', schema: learner_model_1.LearnerSchema }]),
        ],
        controllers: [reported_learners_controller_1.ReportedLearnersController],
        providers: [reported_learners_service_1.ReportedLearnersService],
        exports: [reported_learners_service_1.ReportedLearnersService],
    })
], ReportedLearnersModule);
exports.ReportedLearnersModule = ReportedLearnersModule;
//# sourceMappingURL=reported-learners.module.js.map