"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const bug_reports_service_1 = require("./bug-reports.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const createBugReport_dto_1 = require("./dto/createBugReport.dto");
let LearnerBugReportsController = class LearnerBugReportsController {
    constructor(bugReportsService) {
        this.bugReportsService = bugReportsService;
    }
    async UpdateBlogPublishedStatus(createBugReportDto, user) {
        createBugReportDto.reportedBy = user._id;
        return await this.bugReportsService.createBugReport(createBugReportDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Create a bug report.' }),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createBugReport_dto_1.CreateBugReportDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerBugReportsController.prototype, "UpdateBlogPublishedStatus", null);
LearnerBugReportsController = __decorate([
    common_1.Controller('bug-reports'),
    swagger_1.ApiTags('Bug Reports (User Portal)'),
    __metadata("design:paramtypes", [bug_reports_service_1.BugReportsService])
], LearnerBugReportsController);
exports.LearnerBugReportsController = LearnerBugReportsController;
//# sourceMappingURL=learner-bug-reports.controller.js.map