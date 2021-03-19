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
const colleges_service_1 = require("./colleges.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const courses_service_1 = require("../courses/courses.service");
const learnerNumId_dto_1 = require("../common/dto/learnerNumId.dto");
const collegeNumId_dto_1 = require("../common/dto/collegeNumId.dto");
const instructorNumId_dto_1 = require("../common/dto/instructorNumId.dto");
let LearnersCollegesController = class LearnersCollegesController {
    constructor(collegesService, coursesService) {
        this.collegesService = collegesService;
        this.coursesService = coursesService;
    }
    async GetColleges(paginationDto) {
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.page = Number(paginationDto.page) ? Number(paginationDto.page) : 1;
        paginationDto.perPage = Number(paginationDto.perPage) ? Number(paginationDto.perPage) : 6;
        return await this.collegesService.getCollegesList(paginationDto);
    }
    async GetInstructorDetails(learnerNumIdDto) {
        const instructorDetails = await this.collegesService.getInstructorDetails(learnerNumIdDto.instructorId);
        return instructorDetails[0] ? ResponseHandler_1.default.success({ instructor: instructorDetails[0] }) : ResponseHandler_1.default.fail('Instructor not found', null, 404);
    }
    async GetInstructorReviews(learnerNumIdDto, pagination) {
        pagination.page = pagination.page ? Number(pagination.page) : 1;
        pagination.perPage = pagination.perPage ? Number(pagination.perPage) : 8;
        return await this.coursesService.getInstructorReviews(learnerNumIdDto.instructorId, pagination);
    }
    async GetInstructorCourses(instructorNumIdDto, pagination) {
        pagination.page = pagination.page ? Number(pagination.page) : 1;
        pagination.perPage = pagination.perPage ? Number(pagination.perPage) : 8;
        return await this.coursesService.getInstructorCourses(instructorNumIdDto.instructorId, pagination);
    }
    async GetCollegeDetails(collegeNumIdDto) {
        return await this.collegesService.getCollegeByNumId(collegeNumIdDto.collegeId);
    }
    async GetCollegeCourses(collegeNumIdDto, paginationDto) {
        const [college, coursesList] = await Promise.all([
            await this.collegesService.getCollegeBasicDetailsByNumId(collegeNumIdDto.collegeId),
            await this.collegesService.getCollegeCourses(collegeNumIdDto.collegeId, paginationDto),
        ]);
        return ResponseHandler_1.default.success({ college, coursesList });
    }
    async GetCollegeInstructors(collegeNumIdDto, paginationDto) {
        const [college, instructorsList] = await Promise.all([
            await this.collegesService.getCollegeBasicDetailsByNumId(collegeNumIdDto.collegeId),
            await this.collegesService.getCollegeInstructors(collegeNumIdDto.collegeId, paginationDto),
        ]);
        return college ? ResponseHandler_1.default.success({ college, instructorsList }) : ResponseHandler_1.default.fail('College not found');
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get list of colleges.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetColleges", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get instructor details.' }),
    common_1.Get('/instructor/details/:instructorId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnerNumId_dto_1.LearnerNumIdDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetInstructorDetails", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get instructor reviews.' }),
    common_1.Get('/instructor/reviews/:instructorId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnerNumId_dto_1.LearnerNumIdDto, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetInstructorReviews", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get instructor reviews.' }),
    common_1.Get('/instructor/courses/:instructorId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructorNumId_dto_1.InstructorNumIdDto,
        pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetInstructorCourses", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get college details by id.' }),
    common_1.Get('/details/:collegeId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeNumId_dto_1.CollegeNumIdDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetCollegeDetails", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get college courses.' }),
    common_1.Get('/courses/:collegeId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeNumId_dto_1.CollegeNumIdDto, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetCollegeCourses", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get college instructors.' }),
    common_1.Get('/instructors/:collegeId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeNumId_dto_1.CollegeNumIdDto, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersCollegesController.prototype, "GetCollegeInstructors", null);
LearnersCollegesController = __decorate([
    swagger_1.ApiTags('College(Learners)'),
    common_1.Controller('/learners/colleges'),
    __metadata("design:paramtypes", [colleges_service_1.CollegesService, courses_service_1.CoursesService])
], LearnersCollegesController);
exports.LearnersCollegesController = LearnersCollegesController;
//# sourceMappingURL=learners-colleges.controller.js.map