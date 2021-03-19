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
const reported_activities_service_1 = require("./reported-activities.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const addReport_dto_1 = require("./dto/addReport.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const courses_service_1 = require("../courses/courses.service");
let LearnerReportedActivitiesController = class LearnerReportedActivitiesController {
    constructor(reportedActivitiesService, coursesService) {
        this.reportedActivitiesService = reportedActivitiesService;
        this.coursesService = coursesService;
    }
    async AddReportedActivityByLearner(addReportDto, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('You are not authorized.', null, 401);
        }
        else {
            const reviewResp = await this.coursesService.getReviewById(addReportDto.reviewId);
            if (reviewResp.data) {
                const review = reviewResp.data;
                addReportDto.reportedLearnerId = review.learner;
                addReportDto.reportingLearnerId = user._id;
                addReportDto.reportDate = new Date();
                addReportDto.reviewDate = review.dateAdded;
                addReportDto.status = 'pending';
                addReportDto.comment = review.review;
                return await this.reportedActivitiesService.addReport(addReportDto);
            }
            else {
                return ResponseHandler_1.default.fail('Review not found.');
            }
        }
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Add a reported activity (learner).' }),
    common_1.Post('/learner'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addReport_dto_1.AddReportDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerReportedActivitiesController.prototype, "AddReportedActivityByLearner", null);
LearnerReportedActivitiesController = __decorate([
    swagger_1.ApiTags('Reported Activities (User Portal)'),
    common_1.Controller('reported-activities'),
    __metadata("design:paramtypes", [reported_activities_service_1.ReportedActivitiesService,
        courses_service_1.CoursesService])
], LearnerReportedActivitiesController);
exports.LearnerReportedActivitiesController = LearnerReportedActivitiesController;
//# sourceMappingURL=learner-reported-activities.controller.js.map