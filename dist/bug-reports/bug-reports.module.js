"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const bug_reports_controller_1 = require("./bug-reports.controller");
const bug_reports_service_1 = require("./bug-reports.service");
const mongoose_1 = require("@nestjs/mongoose");
const bug_report_model_1 = require("./bug-report.model");
const learner_bug_reports_controller_1 = require("./learner-bug-reports.controller");
let BugReportsModule = class BugReportsModule {
};
BugReportsModule = __decorate([
    common_1.Module({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'bug-reports', schema: bug_report_model_1.BugReportSchema }])],
        controllers: [bug_reports_controller_1.BugReportsController, learner_bug_reports_controller_1.LearnerBugReportsController],
        providers: [bug_reports_service_1.BugReportsService],
        exports: [bug_reports_service_1.BugReportsService],
    })
], BugReportsModule);
exports.BugReportsModule = BugReportsModule;
//# sourceMappingURL=bug-reports.module.js.map