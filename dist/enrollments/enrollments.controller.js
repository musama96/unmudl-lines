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
var EnrollmentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const ResponseHandler_1 = require("../common/ResponseHandler");
const enrollments_service_1 = require("./enrollments.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const getCSV_dto_1 = require("../common/dto/getCSV.dto");
const getCount_dto_1 = require("../common/dto/getCount.dto");
const suspendLearner_dto_1 = require("./dto/suspendLearner.dto");
const courseId_dto_1 = require("../common/dto/courseId.dto");
const changeEnrollmentStatus_dto_1 = require("./dto/changeEnrollmentStatus.dto");
const enrollmentId_dto_1 = require("../common/dto/enrollmentId.dto");
const rejectEnrollment_dto_1 = require("./dto/rejectEnrollment.dto");
const learners_service_1 = require("../learners/learners.service");
const updateLearnerEnrollmentActivity_dto_1 = require("./dto/updateLearnerEnrollmentActivity.dto");
let EnrollmentsController = EnrollmentsController_1 = class EnrollmentsController {
    constructor(enrollmentsService, learnersService) {
        this.enrollmentsService = enrollmentsService;
        this.learnersService = learnersService;
        this.logger = new common_1.Logger(EnrollmentsController_1.name);
    }
    async rejectEnrollment(rejectEnrollmentDto, enrollmentIdDto, user) {
        return await this.enrollmentsService.rejectEnrollment(rejectEnrollmentDto, enrollmentIdDto.enrollmentId, user);
    }
    async rejectEnrollmentByExternalUser(rejectEnrollmentDto, enrollmentIdDto, user) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        try {
            this.logger.log(`Pragya call for reject learner enrollment. Enrollment Id: ${enrollmentIdDto.enrollmentId}`);
            const { data, message } = await this.enrollmentsService.rejectEnrollment(rejectEnrollmentDto, enrollmentIdDto.enrollmentId, user);
            this.logger.log('Enrollment rejected successfully.');
            return ResponseHandler_1.default.success(data, message);
        }
        catch (e) {
            this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
        }
    }
    async ChangeLearnerEnrollmentStatus(changeEnrollmentStatusDto, user) {
        return await this.enrollmentsService.changeEnrollmentStatus(changeEnrollmentStatusDto);
    }
    async ChangeLearnerEnrollmentStatusByExternalUser(changeEnrollmentStatusDto, user) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        try {
            this.logger.log(`Pragya call for changing learner enrollment status. Enrollment Id: ${changeEnrollmentStatusDto.enrollmentId}`);
            const { data, message } = await this.enrollmentsService.changeEnrollmentStatus(changeEnrollmentStatusDto);
            this.logger.log('Enrollment status changed successfully.');
            return ResponseHandler_1.default.success(data, message);
        }
        catch (e) {
            this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
            return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
        }
    }
    async updateLearnerEnrollmentActivityByExternalUser(updateLearnerEnrollmentActivityDto, enrollmentIdDto, user) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        try {
            this.logger.log(`Pragya call for updating learner course activity. Enrollment Id: ${enrollmentIdDto.enrollmentId}`);
            const { data, message } = await this.enrollmentsService.updateLearnerEnrollmentActivityByExternalUser(enrollmentIdDto.enrollmentId, updateLearnerEnrollmentActivityDto);
            this.logger.log('Learner course activity updated successfully.');
            return ResponseHandler_1.default.success(data, message);
        }
        catch (e) {
            this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
        }
    }
    async SuspendLearnerEnrollment(suspendLearnerDto, user) {
        return await this.enrollmentsService.suspendLearnerEnrollments(suspendLearnerDto.learnerId, user.collegeId);
    }
    async getEnrolledLearnerDetails(enrollmentIdDto) {
        const details = await this.enrollmentsService.getEnrolledLearnerDetails(enrollmentIdDto.enrollmentId);
        return ResponseHandler_1.default.success(details[0]);
    }
    async getLearnersCount(getCountDto, user) {
        getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId ? getCountDto.collegeId : null;
        const newLearners = await this.learnersService.getAnalyticsCount(getCountDto);
        getCountDto.start = null;
        getCountDto.end = null;
        const totalLearners = await this.learnersService.getAnalyticsCount(getCountDto);
        return ResponseHandler_1.default.success({
            new: newLearners.data,
            total: totalLearners.data,
        });
    }
    async getLearnersGrowth(getCountDto, user) {
        getCountDto.collegeId = user.collegeId ? user.collegeId : getCountDto.collegeId ? getCountDto.collegeId : null;
        getCountDto.interval = Number(getCountDto.interval) ? Number(getCountDto.interval) : 1;
        return await this.enrollmentsService.getLearnersGrowth(getCountDto);
    }
    async GetTotalEnrollmentsAllowed(courseIdDto) {
        return await this.enrollmentsService.getTotalEnrollmentsAndEnrollmentsAllowed(courseIdDto.courseId);
    }
    async getLearnersInCSV(getCsvDto, user) {
        getCsvDto.collegeId = user.collegeId ? user.collegeId : getCsvDto.collegeId;
        getCsvDto.keyword = getCsvDto.keyword ? getCsvDto.keyword : '';
        return await this.enrollmentsService.getLearnersInCSV(getCsvDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Change learner enrollment status.' }),
    common_1.Post('/learners/reject-enrollment/:enrollmentId'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.Param()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rejectEnrollment_dto_1.RejectEnrollmentDto, enrollmentId_dto_1.EnrollmentIdDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "rejectEnrollment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'pragya: Change learner enrollment status.' }),
    common_1.Post('/learners/reject-enrollment/:enrollmentId/external'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __param(1, common_1.Param()),
    __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rejectEnrollment_dto_1.RejectEnrollmentDto,
        enrollmentId_dto_1.EnrollmentIdDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "rejectEnrollmentByExternalUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Change learner enrollment status.' }),
    common_1.Post('/learners/change-status'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [changeEnrollmentStatus_dto_1.ChangeEnrollmentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "ChangeLearnerEnrollmentStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'pragya: Change learner enrollment status.' }),
    common_1.Post('/learners/change-status/external'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [changeEnrollmentStatus_dto_1.ChangeEnrollmentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "ChangeLearnerEnrollmentStatusByExternalUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'pragya: Update learner enrollment activity.' }),
    common_1.Post('/learners/update-activity/:enrollmentId/external'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __param(1, common_1.Param()),
    __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLearnerEnrollmentActivity_dto_1.UpdateLearnerEnrollmentActivityDto,
        enrollmentId_dto_1.EnrollmentIdDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "updateLearnerEnrollmentActivityByExternalUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Change learner enrollment status.' }),
    common_1.Post('/learners/suspend-all'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [suspendLearner_dto_1.SuspendLearnerDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "SuspendLearnerEnrollment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get count of all enrollments between a start and end date optionally by college.' }),
    common_1.Get('/learner-details/:enrollmentId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollmentId_dto_1.EnrollmentIdDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "getEnrolledLearnerDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get count of all enrollments between a start and end date optionally by college.' }),
    common_1.Get('/learners/count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "getLearnersCount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get growth of all enrollments between a start and end date defined by intervals, optionally by college.' }),
    common_1.Get('/learners/growth'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "getLearnersGrowth", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get total enrollments allowed and total enrollments in the course with enrollment deadline and course dates.' }),
    common_1.Get('/count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "GetTotalEnrollmentsAllowed", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get list of all learners enrolled in a college in a csv file.' }),
    common_1.Get('/learners/csv'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=learners.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCSV_dto_1.GetCSVDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "getLearnersInCSV", null);
EnrollmentsController = EnrollmentsController_1 = __decorate([
    swagger_1.ApiTags('Enrollments'),
    common_1.Controller('enrollments'),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService, learners_service_1.LearnersService])
], EnrollmentsController);
exports.EnrollmentsController = EnrollmentsController;
//# sourceMappingURL=enrollments.controller.js.map