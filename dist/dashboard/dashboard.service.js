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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const ResponseHandler_1 = require("../common/ResponseHandler");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const courses_service_1 = require("../courses/courses.service");
const learners_service_1 = require("../learners/learners.service");
const colleges_service_1 = require("../colleges/colleges.service");
const users_service_1 = require("../users/users.service");
const moment = require("moment");
let DashboardService = class DashboardService {
    constructor(enrollmentsService, coursesService, learnersService, collegesService, usersService) {
        this.enrollmentsService = enrollmentsService;
        this.coursesService = coursesService;
        this.learnersService = learnersService;
        this.collegesService = collegesService;
        this.usersService = usersService;
    }
    async getDashboardData(params) {
        const revenueResponse = await this.enrollmentsService.getRevenueAnalytics(params);
        const dropResponse = await this.enrollmentsService.getCourseDropAnalytics(params);
        let totalLearners = { data: null };
        let newLearners = { data: null };
        let newColleges = { data: null };
        let totalColleges = { data: null };
        let topColleges = { data: null };
        let topInstructors = { data: null };
        const newCourses = await this.coursesService.getCoursesCount(params);
        const totalCourses = await this.coursesService.getCoursesCount({ collegeId: params.collegeId });
        if (params.type === 'college') {
            newLearners = await this.learnersService.getAnalyticsCount(params);
            totalLearners = await this.learnersService.getAnalyticsCount({ collegeId: params.collegeId });
        }
        else {
            newLearners = await this.learnersService.getAnalyticsCountForAdmin(params);
            totalLearners = await this.learnersService.getAnalyticsCountForAdmin();
            newColleges = await this.collegesService.getCollegesCount(params);
            totalColleges = await this.collegesService.getCollegesCount({});
        }
        if (params.isUnmudlAdmin) {
            topColleges = await this.collegesService.getTopColleges(params);
            topInstructors = await this.usersService.getTopInstructors(params);
        }
        params.start = params.start
            ? params.start
            : new Date(moment()
                .subtract(30, 'day')
                .toISOString());
        params.end = params.end ? params.end : new Date(moment().toISOString());
        const topCourses = await this.coursesService.getTopCourses(params);
        const courseRefundList = await this.coursesService.getRefundStatistics(params);
        const enrollmentStats = await this.coursesService.getEnrollmentStatistics(params);
        const rejectionRates = await this.coursesService.getHighRejectionCourses(params);
        params.start = params.graphStart;
        params.end = params.graphEnd;
        const graphResponse = await this.enrollmentsService.getRevenueAnalyticsForGraph(params);
        revenueResponse.data.createdAt = moment(revenueResponse.data.createdAt).format('MMMM DD, YYYY');
        return ResponseHandler_1.default.success({
            revenue: Object.assign({ createdAt: revenueResponse.data.createdAt }, revenueResponse.data),
            dropRate: dropResponse.data,
            revenueGraph: graphResponse.data,
            performanceIndicators: {
                newCourses: newCourses.data,
                totalCourses: totalCourses.data,
                newLearners: newLearners.data,
                totalLearners: totalLearners.data,
                newColleges: newColleges ? newColleges.data : null,
                totalColleges: totalColleges ? totalColleges.data : null,
            },
            topCourses: topCourses.data,
            courseRefundList: courseRefundList.data,
            enrollmentStats: enrollmentStats.data,
            rejectionRatesList: rejectionRates.data,
            topColleges: topColleges.data,
            topInstructors: topInstructors.data,
        });
    }
    async getEarningsData(params) {
        const revenueResponse = await this.enrollmentsService.getRevenueAnalytics(params);
        const dropResponse = await this.enrollmentsService.getCourseDropAnalytics(params);
        params.start = params.graphStart;
        params.end = params.graphEnd;
        const graphResponse = await this.enrollmentsService.getRevenueAnalyticsForGraph(params);
        revenueResponse.data.createdAt = moment(revenueResponse.data.createdAt).format('MMMM DD, YYYY');
        return ResponseHandler_1.default.success({
            revenue: Object.assign({ createdAt: revenueResponse.data.createdAt }, revenueResponse.data),
            dropRate: dropResponse.data,
            revenueGraph: graphResponse.data,
        });
    }
    async getPerformanceIndicators(params) {
        let newLearners;
        let totalLearners;
        params.start = params.learnersStart;
        params.end = params.learnersEnd;
        if (params.collegeId) {
            const newEnrolledCount = await this.learnersService.getAnalyticsCount(params);
            const totalEnrolledCount = await this.learnersService.getAnalyticsCount({ collegeId: params.collegeId });
            newLearners = newEnrolledCount.data;
            totalLearners = totalEnrolledCount.data;
        }
        else {
            const newCount = await this.learnersService.getAnalyticsCountForAdmin(params);
            const totalCount = await this.learnersService.getAnalyticsCountForAdmin();
            newLearners = newCount.data;
            totalLearners = totalCount.data;
        }
        params.start = params.coursesStart;
        params.end = params.coursesEnd;
        const newCourses = await this.coursesService.getCoursesCount(params);
        const totalCourses = await this.coursesService.getCoursesCount({ collegeId: params.collegeId });
        let newColleges = null;
        let totalColleges = null;
        if (!params.collegeId) {
            params.start = params.collegesStart;
            params.end = params.collegesEnd;
            newColleges = await this.collegesService.getCollegesCount(params);
            totalColleges = await this.collegesService.getCollegesCount({ collegeId: params.collegeId });
        }
        return ResponseHandler_1.default.success({
            newLearners,
            totalLearners,
            newCourses: newCourses.data,
            totalCourses: totalCourses.data,
            newColleges: newColleges ? newColleges.data : null,
            totalColleges: totalColleges ? totalColleges.data : null,
        });
    }
    async getTopCourses(params) {
        return this.coursesService.getTopCourses(params);
    }
    async getTopCoursesCsv(params) {
        return this.coursesService.getTopCoursesCsv(params);
    }
    async getTopPerformingColleges(params) {
        return this.collegesService.getTopColleges(params);
    }
    async getTopPerformingCollegesCsv(params) {
        return this.collegesService.getTopCollegesCsv(params);
    }
    async getTopPerformingInstructors(params) {
        return await this.usersService.getTopInstructors(params);
    }
    async getTopPerformingInstructorsCsv(params) {
        return await this.usersService.getTopInstructorsCsv(params);
    }
    async getCourseRefundList(params) {
        return this.coursesService.getRefundStatistics(params);
    }
    async getCourseEnrollmentStatistics(params) {
        return this.coursesService.getEnrollmentStatistics(params);
    }
    async getCourseRejectionRateList(params) {
        return this.coursesService.getHighRejectionCourses(params);
    }
};
DashboardService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService,
        courses_service_1.CoursesService,
        learners_service_1.LearnersService,
        colleges_service_1.CollegesService,
        users_service_1.UsersService])
], DashboardService);
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map