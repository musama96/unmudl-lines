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
var CoursesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const courses_service_1 = require("./courses.service");
const employers_service_1 = require("../employers/employers.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const createCourse_dto_1 = require("./dto/createCourse.dto");
const editCourse_dto_1 = require("./dto/editCourse.dto");
const coursesList_dto_1 = require("./dto/coursesList.dto");
const courseId_dto_1 = require("../common/dto/courseId.dto");
const setEnrollmentCancelledStatus_dto_1 = require("./dto/setEnrollmentCancelledStatus.dto");
const responseMessages_1 = require("../config/responseMessages");
const validPromo_dto_1 = require("./dto/validPromo.dto");
const analyticsCount_dto_1 = require("../common/dto/analyticsCount.dto");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const title_dto_1 = require("../common/dto/title.dto");
const optionalDurationPagination_dto_1 = require("../common/dto/optionalDurationPagination.dto");
const getEnrollmentStatistics_dto_1 = require("./dto/getEnrollmentStatistics.dto");
const getRefundStatistics_dto_1 = require("./dto/getRefundStatistics.dto");
const getHighRejectionCourses_dto_1 = require("./dto/getHighRejectionCourses.dto");
const activities_service_1 = require("../activities/activities.service");
const activity_model_1 = require("../activities/activity.model");
const userActivityCategory_model_1 = require("../activities/userActivityCategory.model");
const mongoose = require("mongoose");
const updatePublishedStatus_dto_1 = require("./dto/updatePublishedStatus.dto");
const config_1 = require("../config/config");
const moment = require("moment");
const getCoursePromos_dto_1 = require("./dto/getCoursePromos.dto");
const getFollowupCourses_dto_1 = require("./dto/getFollowupCourses.dto");
const coursesSectionData_dto_1 = require("./dto/coursesSectionData.dto");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const promos_service_1 = require("../promos/promos.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const coursePagination_dto_1 = require("./dto/coursePagination.dto");
const occupationCodes_dto_1 = require("./dto/occupationCodes.dto");
const coursePromoData_dto_1 = require("./dto/coursePromoData.dto");
const getAnchors_dto_1 = require("./dto/getAnchors.dto");
const createDraft_dto_1 = require("./dto/createDraft.dto");
const draftId_dto_1 = require("./dto/draftId.dto");
const editDraft_dto_1 = require("./dto/editDraft.dto");
const draftNumId_dto_1 = require("./dto/draftNumId.dto");
const coursesCsv_dto_1 = require("./dto/coursesCsv.dto");
const copyDraft_dto_1 = require("./dto/copyDraft.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const createDraftExternal_dto_1 = require("./dto/createDraftExternal.dto");
const updateDraftExternal_dto_1 = require("./dto/updateDraftExternal.dto");
const getPriceAfterCommission_dto_1 = require("./dto/getPriceAfterCommission.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
const cancelCourse_dto_1 = require("./dto/cancelCourse.dto");
const users_service_1 = require("../users/users.service");
const colleges_service_1 = require("../colleges/colleges.service");
const mailer_1 = require("@nest-modules/mailer");
const courses_model_1 = require("./courses.model");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const s3_1 = require("../s3upload/s3");
const axios = require('axios');
const sharp = require('sharp');
const fs = require("fs");
let CoursesController = CoursesController_1 = class CoursesController {
    constructor(mailerService, coursesService, collegesService, enrollmentsService, activitiesService, employersService, promosService, notificationsService, usersService, emailLogsService) {
        this.mailerService = mailerService;
        this.coursesService = coursesService;
        this.collegesService = collegesService;
        this.enrollmentsService = enrollmentsService;
        this.activitiesService = activitiesService;
        this.employersService = employersService;
        this.promosService = promosService;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
        this.emailLogsService = emailLogsService;
        this.logger = new common_1.Logger(CoursesController_1.name);
    }
    async GetCoursesList(coursesListDto, user) {
        coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
        coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
        coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
        coursesListDto.daysLeft = Number(coursesListDto.daysLeft) ? Number(coursesListDto.daysLeft) : null;
        coursesListDto.minPrice = Number(coursesListDto.minPrice) ? Number(coursesListDto.minPrice) : null;
        coursesListDto.maxPrice = Number(coursesListDto.maxPrice) ? Number(coursesListDto.maxPrice) : null;
        coursesListDto.open = Number(coursesListDto.open) ? Number(coursesListDto.open) : 0;
        coursesListDto.openApplied = coursesListDto.openApplied ? coursesListDto.openApplied : false;
        coursesListDto.rating = coursesListDto.rating ? Number(coursesListDto.rating) : null;
        coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
        coursesListDto.sortOrder = coursesListDto.sortOrder === 'asc' ? '1' : '-1';
        coursesListDto.instructorId = user.role === 'instructor' ? user._id : null;
        coursesListDto.status =
            !coursesListDto.status || coursesListDto.status === coursesList_dto_1.CourseListStatus.ALL ? coursesList_dto_1.CourseListStatus.PUBLISHED : coursesListDto.status;
        return await this.coursesService.getCourses(coursesListDto, true);
    }
    async GetCoursesDropdown(coursesListDto, user) {
        coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
        coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
        coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
        coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
        return await this.coursesService.getCoursesDropdown(coursesListDto);
    }
    async getCoursesDropdownForEmployerPortal(coursesListDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
        coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
        coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
        coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
        return await this.coursesService.getCoursesDropdownForEmployerPortal(coursesListDto, user);
    }
    async GetCoursesListCsv(coursesCsvDto, user) {
        coursesCsvDto.keyword = coursesCsvDto.keyword ? coursesCsvDto.keyword : '';
        coursesCsvDto.daysLeft = Number(coursesCsvDto.daysLeft) ? Number(coursesCsvDto.daysLeft) : null;
        coursesCsvDto.minPrice = Number(coursesCsvDto.minPrice) ? Number(coursesCsvDto.minPrice) : null;
        coursesCsvDto.maxPrice = Number(coursesCsvDto.maxPrice) ? Number(coursesCsvDto.maxPrice) : null;
        coursesCsvDto.open = Number(coursesCsvDto.open) ? Number(coursesCsvDto.open) : 0;
        coursesCsvDto.openApplied = coursesCsvDto.openApplied ? coursesCsvDto.openApplied : false;
        coursesCsvDto.rating = coursesCsvDto.rating ? Number(coursesCsvDto.rating) : null;
        coursesCsvDto.collegeId = user.collegeId ? user.collegeId : coursesCsvDto.collegeId;
        coursesCsvDto.sortOrder = coursesCsvDto.sortOrder === 'asc' ? '1' : '-1';
        coursesCsvDto.instructorId = user.role === 'instructor' ? user._id : null;
        coursesCsvDto.status = !coursesCsvDto.status || coursesCsvDto.status === 'all' ? '' : coursesCsvDto.status;
        return await this.coursesService.GetCoursesCsv(coursesCsvDto);
    }
    async GetDraftCoursesList(coursesListDto, user) {
        coursesListDto.keyword = coursesListDto.keyword ? coursesListDto.keyword : '';
        coursesListDto.page = Number(coursesListDto.page) ? Number(coursesListDto.page) : 1;
        coursesListDto.perPage = Number(coursesListDto.perPage) ? Number(coursesListDto.perPage) : 10;
        coursesListDto.daysLeft = Number(coursesListDto.daysLeft) ? Number(coursesListDto.daysLeft) : null;
        coursesListDto.minPrice = Number(coursesListDto.minPrice) ? Number(coursesListDto.minPrice) : null;
        coursesListDto.maxPrice = Number(coursesListDto.maxPrice) ? Number(coursesListDto.maxPrice) : null;
        coursesListDto.open = Number(coursesListDto.open) ? Number(coursesListDto.open) : 0;
        coursesListDto.openApplied = coursesListDto.openApplied ? coursesListDto.openApplied : false;
        coursesListDto.rating = coursesListDto.rating ? Number(coursesListDto.rating) : null;
        coursesListDto.collegeId = user.collegeId ? user.collegeId : coursesListDto.collegeId;
        coursesListDto.sortOrder = coursesListDto.sortOrder === 'asc' ? '1' : '-1';
        coursesListDto.instructorId = user.role === 'instructor' ? user._id : null;
        return await this.coursesService.getDraftCourses(coursesListDto);
    }
    async GetDraftCourseForExterbal(draftIdDto, user) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        return await this.coursesService.getDraftExist(draftIdDto.draftId);
    }
    async GetDraftCoursesListCsv(coursesCsvDto, user) {
        coursesCsvDto.keyword = coursesCsvDto.keyword ? coursesCsvDto.keyword : '';
        coursesCsvDto.daysLeft = Number(coursesCsvDto.daysLeft) ? Number(coursesCsvDto.daysLeft) : null;
        coursesCsvDto.minPrice = Number(coursesCsvDto.minPrice) ? Number(coursesCsvDto.minPrice) : null;
        coursesCsvDto.maxPrice = Number(coursesCsvDto.maxPrice) ? Number(coursesCsvDto.maxPrice) : null;
        coursesCsvDto.open = Number(coursesCsvDto.open) ? Number(coursesCsvDto.open) : 0;
        coursesCsvDto.openApplied = coursesCsvDto.openApplied ? coursesCsvDto.openApplied : false;
        coursesCsvDto.rating = coursesCsvDto.rating ? Number(coursesCsvDto.rating) : null;
        coursesCsvDto.collegeId = user.collegeId ? user.collegeId : coursesCsvDto.collegeId;
        coursesCsvDto.sortOrder = coursesCsvDto.sortOrder === 'asc' ? '1' : '-1';
        coursesCsvDto.instructorId = user.role === 'instructor' ? user._id : null;
        return await this.coursesService.getDraftCoursesCsv(coursesCsvDto);
    }
    async GetCompleteCoursesSectionData(coursesSectionDataDto, user) {
        coursesSectionDataDto.keyword = coursesSectionDataDto.keyword ? coursesSectionDataDto.keyword : '';
        coursesSectionDataDto.page = Number(coursesSectionDataDto.page) ? Number(coursesSectionDataDto.page) : 1;
        coursesSectionDataDto.perPage = Number(coursesSectionDataDto.perPage) ? Number(coursesSectionDataDto.perPage) : 10;
        coursesSectionDataDto.daysLeft = Number(coursesSectionDataDto.daysLeft) ? Number(coursesSectionDataDto.daysLeft) : null;
        coursesSectionDataDto.minPrice = Number(coursesSectionDataDto.minPrice) ? Number(coursesSectionDataDto.minPrice) : null;
        coursesSectionDataDto.maxPrice = Number(coursesSectionDataDto.maxPrice) ? Number(coursesSectionDataDto.maxPrice) : null;
        coursesSectionDataDto.open = Number(coursesSectionDataDto.open) ? Number(coursesSectionDataDto.open) : 0;
        coursesSectionDataDto.openApplied = coursesSectionDataDto.openApplied ? coursesSectionDataDto.openApplied : false;
        coursesSectionDataDto.rating = coursesSectionDataDto.rating ? coursesSectionDataDto.rating : null;
        coursesSectionDataDto.collegeId = user.collegeId ? user.collegeId : coursesSectionDataDto.collegeId;
        coursesSectionDataDto.sortOrder = coursesSectionDataDto.sortOrder === 'asc' ? '1' : '-1';
        coursesSectionDataDto.instructorId = user.role === 'instructor' ? user._id : null;
        coursesSectionDataDto.status =
            !coursesSectionDataDto.status || coursesSectionDataDto.status === 'all' ? '' : coursesSectionDataDto.status;
        const coursesResponse = await this.coursesService.getCourses(coursesSectionDataDto, true);
        return ResponseHandler_1.default.success({
            courses: coursesResponse.data,
        });
    }
    async GetCompleteViewCourseSectionData(courseIdDto, user) {
        const [enrolledLearnersResponse, enrollmentRequestsData, courseData, courseRating, courseReviews, transactionHistory,] = await Promise.all([
            this.enrollmentsService.getApprovedLearnersForCourse({
                courseId: courseIdDto.courseId,
                page: 1,
                perPage: 10,
                sortBy: 'fullname',
                sortOrder: '1',
            }),
            this.enrollmentsService.getCourseEnrollmentRequests({
                courseId: courseIdDto.courseId,
                page: 1,
                perPage: 10,
            }),
            this.coursesService.getCourseData(courseIdDto.courseId),
            this.coursesService.getRatings(courseIdDto.courseId),
            this.coursesService.getReviews(courseIdDto.courseId, user._id, { page: 1, perPage: 10 }),
            this.collegesService.getTransactionActivities({
                courseId: courseIdDto.courseId,
                keyword: '',
                start: new Date(moment()
                    .subtract(30, 'd')
                    .toISOString()).toISOString(),
                end: new Date().toISOString(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        const { data: { promos, rows }, } = await this.promosService.getAppliedPromos({
            courseId: courseIdDto.courseId,
            page: 1,
            perPage: 10,
            sortBy: 'title',
            sortOrder: '1',
        }, courseData.totalPrice);
        return ResponseHandler_1.default.success({
            courseData: {
                title: courseData.title,
                autoEnroll: courseData.autoEnroll,
            },
            enrolledLearners: {
                learners: enrolledLearnersResponse.data.learners,
                rows: enrolledLearnersResponse.data.rows,
                ratings: courseRating.ratings,
                overallExperience: {
                    value: courseRating.satisfiedRating,
                },
                reviewsCount: courseData.reviews.length,
                revenue: {
                    total: courseData.totalRevenue,
                    college: courseData.collegeRevenue,
                    shared: courseData.unmudlRevenue,
                },
            },
            enrollmentRequests: {
                requests: enrollmentRequestsData.enrollmentRequests,
                rows: enrollmentRequestsData.enrollmentRequestsCount,
                enrollmentsAllowed: courseData.enrollmentsAllowed,
                totalEnrollments: enrolledLearnersResponse.data.rows,
                enrollmentDeadline: courseData.enrollmentDeadline,
                courseDates: courseData.date,
            },
            reviewsData: {
                reviews: courseReviews.data,
                rows: courseData.reviews.length,
            },
            promosApplied: {
                promos,
                rows,
                transactionHistory: transactionHistory.data,
            },
        });
    }
    async GetViewCourseStatisticsData(coursePaginationDto) {
        coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
        coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;
        coursePaginationDto.sortOrder = coursePaginationDto.sortOrder === 'asc' ? '1' : '-1';
        const [enrolledLearnersResponse, courseData, courseRating] = await Promise.all([
            this.enrollmentsService.getApprovedLearnersForCourse(coursePaginationDto),
            this.coursesService.getCourseData(coursePaginationDto.courseId),
            this.coursesService.getRatings(coursePaginationDto.courseId),
        ]);
        return ResponseHandler_1.default.success({
            learners: enrolledLearnersResponse.data.learners,
            rows: enrolledLearnersResponse.data.rows,
            ratings: courseRating.ratings,
            overallExperience: {
                value: courseRating.satisfiedRating,
            },
            reviewsCount: courseData.reviews.length,
            revenue: {
                total: courseData.totalRevenue,
                college: courseData.collegeRevenue,
                shared: courseData.unmudlRevenue,
            },
        });
    }
    async GetViewCourseEnrollmentsData(coursePaginationDto) {
        coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
        coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;
        const [enrollmentRequestsData, courseData, totalEnrollments] = await Promise.all([
            this.enrollmentsService.getCourseEnrollmentRequests({
                courseId: coursePaginationDto.courseId,
                page: coursePaginationDto.page,
                perPage: coursePaginationDto.perPage,
            }),
            this.coursesService.getCourseData(coursePaginationDto.courseId),
            this.enrollmentsService.getApprovedLearnersForCourseCount(coursePaginationDto),
        ]);
        return ResponseHandler_1.default.success({
            requests: enrollmentRequestsData.enrollmentRequests,
            rows: enrollmentRequestsData.enrollmentRequestsCount,
            enrollmentsAllowed: courseData.enrollmentsAllowed,
            totalEnrollments,
            enrollmentDeadline: courseData.enrollmentDeadline,
            courseDates: courseData.date,
        });
    }
    async GetViewCourseReviewsData(coursePaginationDto, user) {
        coursePaginationDto.page = coursePaginationDto.page ? Number(coursePaginationDto.page) : 1;
        coursePaginationDto.perPage = coursePaginationDto.perPage ? Number(coursePaginationDto.perPage) : 10;
        const [courseReviews, rows] = await Promise.all([
            this.coursesService.getReviews(coursePaginationDto.courseId, user._id, {
                page: coursePaginationDto.page,
                perPage: coursePaginationDto.perPage,
            }),
            this.coursesService.getReviewsCount(coursePaginationDto.courseId),
        ]);
        return ResponseHandler_1.default.success({
            reviews: courseReviews.data,
            rows,
        });
    }
    async GetViewCoursePromosData(coursePromoDataDto) {
        coursePromoDataDto.page = coursePromoDataDto.page ? Number(coursePromoDataDto.page) : 1;
        coursePromoDataDto.perPage = coursePromoDataDto.perPage ? Number(coursePromoDataDto.perPage) : 10;
        coursePromoDataDto.sortOrder = coursePromoDataDto.sortOrder === 'asc' ? '1' : '-1';
        const [courseData, transactionHistory] = await Promise.all([
            this.coursesService.getCourseData(coursePromoDataDto.courseId),
            this.collegesService.getTransactionActivities({
                courseId: coursePromoDataDto.courseId,
                keyword: '',
                start: coursePromoDataDto.start
                    ? coursePromoDataDto.start
                    : new Date(moment()
                        .subtract(1, 'd')
                        .toISOString()).toISOString(),
                end: coursePromoDataDto.end ? coursePromoDataDto.end : new Date().toISOString(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        const { data: { promos, rows }, } = await this.promosService.getAppliedPromos(coursePromoDataDto, courseData.totalPrice);
        return ResponseHandler_1.default.success({
            promos,
            rows,
            transactionHistory: transactionHistory.data,
        });
    }
    async GetPerformance(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        return await this.coursesService.getPerformanceOutcomes(keywordDto.keyword);
    }
    async GetCoursesAnalytics(durationDto, user) {
        durationDto.page = durationDto.page ? Number(durationDto.page) : 1;
        durationDto.perPage = durationDto.perPage ? Number(durationDto.perPage) : 10;
        return await this.coursesService.getTopCoursesCsv(Object.assign(Object.assign({}, durationDto), { collegeId: user.collegeId }));
    }
    async GetCoursesCount(analyticsCountDto, user) {
        if (analyticsCountDto.type === 'college') {
            analyticsCountDto.collegeId = user.collegeId ? user.collegeId : analyticsCountDto.collegeId;
        }
        else {
            analyticsCountDto.collegeId = null;
        }
        const newCourses = await this.coursesService.getCoursesCount(analyticsCountDto);
        const totalCourses = await this.coursesService.getCoursesCount({ collegeId: analyticsCountDto.collegeId });
        return ResponseHandler_1.default.success({
            newCourses: newCourses.data,
            totalCourses: totalCourses.data,
        });
    }
    async GetCoursesAnalyticsByCourse(courseIdDto) {
        return await this.coursesService.getCoursesAnalyticsById(courseIdDto.courseId);
    }
    async GetCourseDetails(courseIdDto, user) {
        return await this.coursesService.getCourse(courseIdDto.courseId, user.collegeId);
    }
    async GetCourseDraftDetails(draftIdDto, user) {
        return await this.coursesService.getCourseDraft(draftIdDto.draftId, user.collegeId);
    }
    async GetCourseRevenue(courseIdDto) {
        return await this.coursesService.getRevenue(courseIdDto.courseId);
    }
    async GetCourseReviews(courseIdDto, user) {
        return await this.coursesService.getReviews(courseIdDto.courseId, user._id, { page: 1, perPage: 10 });
    }
    async GetValidPromoCourses(validPromoDto, user) {
        validPromoDto.keyword = validPromoDto.keyword ? validPromoDto.keyword : '';
        validPromoDto.promoTitle = validPromoDto.promoTitle ? validPromoDto.promoTitle : '';
        validPromoDto.page = validPromoDto.page ? Number(validPromoDto.page) : 1;
        validPromoDto.perPage = validPromoDto.perPage ? Number(validPromoDto.perPage) : 10;
        validPromoDto.collegeId = user.collegeId ? user.collegeId : validPromoDto.collegeId;
        return await this.coursesService.getValidCoursesForPromo(validPromoDto);
    }
    async GetPromosForCourse(getCoursePromosDto) {
        const course = await this.coursesService.getCourseDetailsByMongoId(getCoursePromosDto.courseId);
        if (course && course.collegeId) {
            getCoursePromosDto.collegeId = course.collegeId._id;
            getCoursePromosDto.keyword = getCoursePromosDto.keyword ? getCoursePromosDto.keyword : '';
            getCoursePromosDto.page = getCoursePromosDto.page ? getCoursePromosDto.page : 1;
            getCoursePromosDto.perPage = getCoursePromosDto.perPage ? getCoursePromosDto.perPage : 10;
            return await this.coursesService.getPromosForCourse(getCoursePromosDto);
        }
        else {
            return ResponseHandler_1.default.fail('Course information incomplete.');
        }
    }
    async GetCourseRatings(courseIdDto) {
        const ratings = await this.coursesService.getRatings(courseIdDto.courseId);
        return ResponseHandler_1.default.success(ratings);
    }
    async CreatePerformanceOutcome(titleDto) {
        return await this.coursesService.createPerformanceOutcomeTag(titleDto.title);
    }
    async SetEnrollmentCancelledStatus(setEnrollmentCancelledStatusDto, user) {
        const status = Boolean(setEnrollmentCancelledStatusDto.status);
        const courseId = setEnrollmentCancelledStatusDto.courseId;
        const collegeId = user.collegeId;
        if (collegeId) {
            await this.coursesService.checkIfCourseBelongsToCollege(courseId, collegeId);
        }
        return await this.coursesService.setEnrollmentCancelledStatus(courseId, status);
    }
    async CreateCourse(createCourseDto, user, files) {
        if (createCourseDto.newEmployers && createCourseDto.newEmployers.length > 0) {
            if (files && files.employersLogos) {
                files.employersLogos.forEach((logo, index) => {
                    createCourseDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                });
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                    await Promise.all(files.employersLogos.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                }
            }
            const employers = await this.employersService.createEmployers(createCourseDto.newEmployers);
            createCourseDto.employers = createCourseDto.employers && createCourseDto.employers.length > 0 ? createCourseDto.employers : [];
            employers.forEach(employer => {
                createCourseDto.employers.push(employer._id);
            });
        }
        if (!user.collegeId && !createCourseDto.collegeId) {
            return ResponseHandler_1.default.fail('collegeId is required.');
        }
        createCourseDto.collegeId = user.collegeId ? user.collegeId : createCourseDto.collegeId;
        createCourseDto.coverPhoto =
            files && files.coverPhoto ? config_1.COURSES_IMG_PATH + files.coverPhoto[0].filename : createCourseDto.coverPhotoPath;
        if (files && files.coverPhoto) {
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);
                s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
            }
        }
        createCourseDto.coverPhotoThumbnail =
            files && files.coverPhotoThumbnail
                ? config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
                : createCourseDto.coverPhotoThumbnailPath;
        if (files && files.coverPhotoThumbnail) {
            await sharp(files.coverPhotoThumbnail[0].path)
                .resize(config_1.COURSE_THUMBNAIL_SIZE)
                .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
            createCourseDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                files.coverPhotoThumbnail = [
                    Object.assign(Object.assign({}, files.coverPhotoThumbnail[0]), { buffer: await sharp(files.coverPhotoThumbnail[0].path)
                            .resize(config_1.COURSE_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
            }
        }
        createCourseDto.attachments = createCourseDto.attachmentPaths ? createCourseDto.attachmentPaths : [];
        if (files && files.attachments) {
            files.attachments.forEach(attachment => {
                createCourseDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
            });
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
            }
        }
        if (createCourseDto.time && createCourseDto.time.length > 0) {
            createCourseDto.time.forEach(time => {
                time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
            });
        }
        const course = await this.coursesService.createCourse(createCourseDto, user);
        const activities = [
            {
                type: activity_model_1.ActivityTypes.User,
                user: mongoose.Types.ObjectId(user._id),
                course: mongoose.Types.ObjectId(course._id),
                userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(userActivityCategory_model_1.UserActivities.UploadCourse)),
            },
        ];
        await Promise.all([
            this.activitiesService.createActivities(activities),
            this.notificationsService.adminEnrollmentDeadlineNotifications(course._id),
        ]);
        return ResponseHandler_1.default.success({
            course,
        });
    }
    async CreateCourseDraft(createDraftDto, user, files) {
        if (createDraftDto.newEmployers && createDraftDto.newEmployers.length > 0) {
            if (files && files.employersLogos) {
                files.employersLogos.forEach((logo, index) => {
                    createDraftDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                });
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                    await Promise.all(files.employersLogos.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                }
            }
            const employers = await this.employersService.createEmployers(createDraftDto.newEmployers);
            createDraftDto.employers = createDraftDto.employers && createDraftDto.employers.length > 0 ? createDraftDto.employers : [];
            employers.forEach(employer => {
                createDraftDto.employers.push(employer._id);
            });
        }
        if (!user.collegeId && !createDraftDto.collegeId) {
            return ResponseHandler_1.default.fail('collegeId is required.');
        }
        createDraftDto.collegeId = user.collegeId ? user.collegeId : createDraftDto.collegeId;
        createDraftDto.coverPhoto = files && files.coverPhoto ? config_1.COURSES_IMG_PATH + files.coverPhoto[0].filename : createDraftDto.coverPhotoPath;
        if (files && files.coverPhoto) {
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);
                s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
            }
        }
        createDraftDto.coverPhotoThumbnail =
            files && files.coverPhotoThumbnail
                ? config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
                : createDraftDto.coverPhotoThumbnailPath;
        if (files && files.coverPhotoThumbnail) {
            await sharp(files.coverPhotoThumbnail[0].path)
                .resize(config_1.COURSE_THUMBNAIL_SIZE)
                .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
            createDraftDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                files.coverPhotoThumbnail = [
                    Object.assign(Object.assign({}, files.coverPhotoThumbnail[0]), { buffer: await sharp(files.coverPhotoThumbnail[0].path)
                            .resize(config_1.COURSE_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
            }
        }
        createDraftDto.attachments = [];
        if (files && files.attachments) {
            files.attachments.forEach(attachment => {
                createDraftDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
            });
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
            }
        }
        if (createDraftDto.time && createDraftDto.time.length > 0) {
            createDraftDto.time.forEach(time => {
                time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
            });
        }
        const courseDraft = await this.coursesService.createCourseDraft(createDraftDto);
        return ResponseHandler_1.default.success({
            courseDraft,
        });
    }
    async createCourseDraftExternal(createDraftDto, user, files) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        this.logger.log(`Pragya call for adding course draft. Course Title: ${createDraftDto.title}`);
        const { data: college } = await this.collegesService.getCollegeByOrgId(createDraftDto.orgId);
        if (college) {
            try {
                if (createDraftDto.newEmployers && createDraftDto.newEmployers.length > 0) {
                    if (files && files.employersLogos) {
                        files.employersLogos.forEach((logo, index) => {
                            createDraftDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                        });
                        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                            files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                            await Promise.all(files.employersLogos.map(async (attachment) => {
                                attachment.buffer = fs.readFileSync(attachment.path);
                                return null;
                            }));
                            s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                        }
                    }
                    const employers = await this.employersService.createEmployers(createDraftDto.newEmployers);
                    createDraftDto.employers = createDraftDto.employers && createDraftDto.employers.length > 0 ? createDraftDto.employers : [];
                    employers.forEach(employer => {
                        createDraftDto.employers.push(employer._id);
                    });
                }
                createDraftDto.coverPhoto =
                    files && files.coverPhoto ? config_1.COURSES_IMG_PATH + files.coverPhoto[0].filename : createDraftDto.coverPhotoPath;
                createDraftDto.collegeId = college._id;
                if (files && files.coverPhoto) {
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                        files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);
                        s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                    }
                }
                createDraftDto.coverPhotoThumbnail =
                    files && files.coverPhotoThumbnail
                        ? config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename
                        : createDraftDto.coverPhotoThumbnailPath;
                if (files && files.coverPhotoThumbnail) {
                    await sharp(files.coverPhotoThumbnail[0].path)
                        .resize(config_1.COURSE_THUMBNAIL_SIZE)
                        .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
                    createDraftDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                        files.coverPhotoThumbnail = [
                            Object.assign(Object.assign({}, files.coverPhotoThumbnail[0]), { buffer: await sharp(files.coverPhotoThumbnail[0].path)
                                    .resize(config_1.COURSE_THUMBNAIL_SIZE)
                                    .toBuffer(), filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                        ];
                        s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                    }
                }
                createDraftDto.attachments = [];
                if (files && files.attachments) {
                    files.attachments.forEach(attachment => {
                        createDraftDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
                    });
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                        await Promise.all(files.attachments.map(async (attachment) => {
                            attachment.buffer = fs.readFileSync(attachment.path);
                            return null;
                        }));
                        s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
                    }
                }
                if (createDraftDto.time && createDraftDto.time.length > 0) {
                    createDraftDto.time.forEach(time => {
                        time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                        time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
                    });
                }
                const courseDraft = (await this.coursesService.createCourseDraft(createDraftDto)).toObject();
                this.logger.log(`Course draft created. Course Title: ${courseDraft.title} CourseId: ${courseDraft._id}`);
                return ResponseHandler_1.default.success({
                    courseDraft,
                });
            }
            catch (e) {
                this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
                return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
            }
        }
        else {
            this.logger.error(`College with orgId: ${createDraftDto.orgId} could not be found.`);
            return ResponseHandler_1.default.fail('College not found.');
        }
    }
    async updateCourseDraftExternal(updateDraftExternalDto, user, files) {
        if (user.role !== 'api') {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        this.logger.log(`Pragya call for updating course draft. Course Title: ${updateDraftExternalDto.title}`);
        const { data: college } = await this.collegesService.getCollegeByOrgId(updateDraftExternalDto.orgId);
        if (college) {
            try {
                if (updateDraftExternalDto.newEmployers && updateDraftExternalDto.newEmployers.length > 0) {
                    if (files && files.employersLogos) {
                        files.employersLogos.forEach((logo, index) => {
                            updateDraftExternalDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                        });
                        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                            files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                            await Promise.all(files.employersLogos.map(async (attachment) => {
                                attachment.buffer = fs.readFileSync(attachment.path);
                                return null;
                            }));
                            s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                        }
                    }
                    const employers = await this.employersService.createEmployers(updateDraftExternalDto.newEmployers);
                    updateDraftExternalDto.employers =
                        updateDraftExternalDto.employers && updateDraftExternalDto.employers.length > 0 ? updateDraftExternalDto.employers : [];
                    employers.forEach(employer => {
                        updateDraftExternalDto.employers.push(employer._id);
                    });
                }
                if (files && files.coverPhoto) {
                    updateDraftExternalDto.coverPhoto = config_1.COURSES_IMG_PATH + files.coverPhoto[0].filename;
                    if (files && files.coverPhoto) {
                        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                            files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                            files.coverPhoto[0].buffer = fs.readFileSync(files.coverPhoto[0].path);
                            s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                        }
                    }
                }
                else {
                    delete updateDraftExternalDto.coverPhoto;
                }
                updateDraftExternalDto.collegeId = college._id;
                if (files && files.coverPhotoThumbnail) {
                    updateDraftExternalDto.coverPhotoThumbnail = config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename;
                }
                else {
                    delete updateDraftExternalDto.coverPhotoThumbnail;
                }
                if (files && files.coverPhotoThumbnail) {
                    await sharp(files.coverPhotoThumbnail[0].path)
                        .resize(config_1.COURSE_THUMBNAIL_SIZE)
                        .toFile(files.coverPhotoThumbnail[0].path.replace('.', '_t.'));
                    updateDraftExternalDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.coverPhotoThumbnail[0].filename).replace('.', '_t.');
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                        files.coverPhotoThumbnail = [
                            Object.assign(Object.assign({}, files.coverPhotoThumbnail[0]), { buffer: await sharp(files.coverPhotoThumbnail[0].path)
                                    .resize(config_1.COURSE_THUMBNAIL_SIZE)
                                    .toBuffer(), filename: files.coverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                        ];
                        s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                    }
                }
                else {
                    delete updateDraftExternalDto.coverPhotoThumbnail;
                }
                updateDraftExternalDto.attachments = [];
                if (files && files.attachments) {
                    files.attachments.forEach(attachment => {
                        updateDraftExternalDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
                    });
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                        await Promise.all(files.attachments.map(async (attachment) => {
                            attachment.buffer = fs.readFileSync(attachment.path);
                            return null;
                        }));
                        s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
                    }
                }
                else {
                    delete updateDraftExternalDto.attachments;
                }
                if (updateDraftExternalDto.time && updateDraftExternalDto.time.length > 0) {
                    updateDraftExternalDto.time.forEach(time => {
                        time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                        time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
                    });
                }
                const { data, message } = await this.coursesService.updateCourseDraft(updateDraftExternalDto);
                const courseDraft = data.toObject();
                this.logger.log(`Course draft updated. Course Title: ${courseDraft.title} CourseId: ${courseDraft._id}`);
                return ResponseHandler_1.default.success(courseDraft, message);
            }
            catch (e) {
                this.logger.error(e.response ? e.response.message : e.message ? e.message : e.toString());
                return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e.toString());
            }
        }
        else {
            this.logger.error(`College with orgId: ${updateDraftExternalDto.orgId} could not be found.`);
            return ResponseHandler_1.default.fail('College not found.');
        }
    }
    async CreateDraftFromCourse(copyDraftDto, user) {
        return await this.coursesService.createDraftFromCourse(copyDraftDto, user);
    }
    async UpdateCourse(editCourseDto, user, files) {
        if (user.collegeId && editCourseDto.collegeId !== user.collegeId.toString()) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.editCourse.wrongCollege);
        }
        else {
            if (user.role === 'instructor' && !editCourseDto.instructorIds.includes(user._id.toString())) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.editCourse.wrongCourse);
            }
            if (editCourseDto.newEmployers && editCourseDto.newEmployers.length > 0) {
                if (files && files.employersLogos) {
                    files.employersLogos.forEach((logo, index) => {
                        editCourseDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                    });
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                        await Promise.all(files.employersLogos.map(async (attachment) => {
                            attachment.buffer = fs.readFileSync(attachment.path);
                            return null;
                        }));
                        s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                    }
                }
                const employers = await this.employersService.createEmployers(editCourseDto.newEmployers);
                editCourseDto.employers = editCourseDto.employers && editCourseDto.employers.length > 0 ? editCourseDto.employers : [];
                employers.forEach(employer => {
                    editCourseDto.employers.push(employer._id);
                });
            }
            editCourseDto.coverPhotoThumbnail =
                files && files.updatedCoverPhotoThumbnail
                    ? config_1.COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename
                    : editCourseDto.coverPhotoThumbnail;
            if (files && files.updatedCoverPhotoThumbnail) {
                await sharp(files.updatedCoverPhotoThumbnail[0].path)
                    .resize(config_1.COURSE_THUMBNAIL_SIZE)
                    .toFile(files.updatedCoverPhotoThumbnail[0].path.replace('.', '_t.'));
                editCourseDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename).replace('.', '_t.');
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                    files.updatedCoverPhotoThumbnail = [
                        Object.assign(Object.assign({}, files.updatedCoverPhotoThumbnail[0]), { buffer: await sharp(files.updatedCoverPhotoThumbnail[0].path)
                                .resize(config_1.COURSE_THUMBNAIL_SIZE)
                                .toBuffer(), filename: files.updatedCoverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                    ];
                    s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                }
            }
            editCourseDto.coverPhoto =
                files && files.updatedCoverPhoto ? config_1.COURSES_IMG_PATH + files.updatedCoverPhoto[0].filename : editCourseDto.coverPhoto;
            if (files && files.updatedCoverPhoto) {
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                    files.updatedCoverPhoto[0].buffer = fs.readFileSync(files.updatedCoverPhoto[0].path);
                    s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                }
            }
            if (files && files.uploadedAttachments) {
                editCourseDto.attachments = editCourseDto.attachments ? editCourseDto.attachments : [];
                files.uploadedAttachments.forEach(attachment => {
                    editCourseDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
                });
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                    await Promise.all(files.uploadedAttachments.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
                }
            }
            if (editCourseDto.time && editCourseDto.time.length > 0) {
                editCourseDto.time.forEach(time => {
                    time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                    time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
                });
            }
            editCourseDto.altTag = editCourseDto.altTag ? editCourseDto.altTag : '';
            editCourseDto.url = editCourseDto.url ? editCourseDto.url : '';
            editCourseDto.instructorDisplayName = editCourseDto.instructorDisplayName ? editCourseDto.instructorDisplayName : '';
            editCourseDto.outline = editCourseDto.outline ? editCourseDto.outline : '';
            editCourseDto.eligibilityRestrictions = editCourseDto.eligibilityRestrictions ? editCourseDto.eligibilityRestrictions : '';
            editCourseDto.attendanceInformation = editCourseDto.attendanceInformation ? editCourseDto.attendanceInformation : '';
            editCourseDto.address = editCourseDto.address ? editCourseDto.address : '';
            editCourseDto.city = editCourseDto.city ? editCourseDto.city : '';
            editCourseDto.zip = editCourseDto.zip ? editCourseDto.zip : '';
            editCourseDto.externalCourseId = editCourseDto.externalCourseId ? editCourseDto.externalCourseId : '';
            editCourseDto.customSchedule = editCourseDto.customSchedule ? editCourseDto.customSchedule : {};
            editCourseDto.date = editCourseDto.date ? editCourseDto.date : { start: null, end: null };
            editCourseDto.isCollegeRequest = user.collegeId ? true : false;
            const course = await this.coursesService.updateCourse(editCourseDto);
            if (course) {
                const activities = [
                    {
                        type: activity_model_1.ActivityTypes.User,
                        user: mongoose.Types.ObjectId(user._id),
                        course: mongoose.Types.ObjectId(course._id),
                        userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(userActivityCategory_model_1.UserActivities.UpdateCourse)),
                    },
                ];
                await Promise.all([
                    this.activitiesService.createActivities(activities),
                    this.notificationsService.courseEdited(course, user),
                    this.notificationsService.adminEnrollmentDeadlineNotifications(course._id),
                ]);
                return ResponseHandler_1.default.success({
                    course,
                });
            }
            else {
                return ResponseHandler_1.default.fail('Cannot edit course 24 hours before deadline');
            }
        }
    }
    async UpdateCourseDraft(editDraftDto, user, files) {
        if (user.collegeId && editDraftDto.collegeId !== user.collegeId.toString()) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.editCourse.wrongCollege);
        }
        else {
            if (user.role === 'instructor' && !editDraftDto.instructorIds.includes(user._id.toString())) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.editCourse.wrongCourse);
            }
            if (editDraftDto.newEmployers && editDraftDto.newEmployers.length > 0) {
                if (files && files.employersLogos) {
                    files.employersLogos.forEach((logo, index) => {
                        editDraftDto.newEmployers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
                    });
                    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                        files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                        await Promise.all(files.employersLogos.map(async (attachment) => {
                            attachment.buffer = fs.readFileSync(attachment.path);
                            return null;
                        }));
                        s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
                    }
                }
                const employers = await this.employersService.createEmployers(editDraftDto.newEmployers);
                editDraftDto.employers = editDraftDto.employers && editDraftDto.employers.length > 0 ? editDraftDto.employers : [];
                employers.forEach(employer => {
                    editDraftDto.employers.push(employer._id);
                });
            }
            editDraftDto.coverPhotoThumbnail =
                files && files.updatedCoverPhotoThumbnail
                    ? config_1.COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename
                    : editDraftDto.coverPhotoThumbnail;
            if (files && files.updatedCoverPhotoThumbnail) {
                await sharp(files.updatedCoverPhotoThumbnail[0].path)
                    .resize(config_1.COURSE_THUMBNAIL_SIZE)
                    .toFile(files.updatedCoverPhotoThumbnail[0].path.replace('.', '_t.'));
                editDraftDto.coverPhotoThumbnail = (config_1.COURSES_IMG_PATH + files.updatedCoverPhotoThumbnail[0].filename).replace('.', '_t.');
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                    files.updatedCoverPhotoThumbnail = [
                        Object.assign(Object.assign({}, files.updatedCoverPhotoThumbnail[0]), { buffer: await sharp(files.updatedCoverPhotoThumbnail[0].path)
                                .resize(config_1.COURSE_THUMBNAIL_SIZE)
                                .toBuffer(), filename: files.updatedCoverPhotoThumbnail[0].filename.replace('.', '_t.') }),
                    ];
                    s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                }
            }
            editDraftDto.coverPhoto =
                files && files.updatedCoverPhoto ? config_1.COURSES_IMG_PATH + files.updatedCoverPhoto[0].filename : editDraftDto.coverPhoto;
            if (files && files.updatedCoverPhoto) {
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_IMG_PATH, files);
                    files.updatedCoverPhoto[0].buffer = fs.readFileSync(files.updatedCoverPhoto[0].path);
                    s3_1.moveFilesToS3(config_1.COURSES_IMG_PATH, files);
                }
            }
            if (files && files.uploadedAttachments) {
                editDraftDto.attachments = editDraftDto.attachments ? editDraftDto.attachments : [];
                files.uploadedAttachments.forEach(attachment => {
                    editDraftDto.attachments.push(config_1.COURSES_ATTACHMENTS_PATH + attachment.filename);
                });
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COURSES_ATTACHMENTS_PATH, files);
                    await Promise.all(files.uploadedAttachments.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.COURSES_ATTACHMENTS_PATH, files);
                }
            }
            if (editDraftDto.time && editDraftDto.time.length > 0) {
                editDraftDto.time.forEach(time => {
                    time.start = time.start ? moment(time.start, 'HH:mm A').toISOString() : null;
                    time.end = time.end ? moment(time.end, 'HH:mm A').toISOString() : null;
                });
            }
            editDraftDto.altTag = editDraftDto.altTag ? editDraftDto.altTag : '';
            editDraftDto.url = editDraftDto.url ? editDraftDto.url : '';
            editDraftDto.instructorDisplayName = editDraftDto.instructorDisplayName ? editDraftDto.instructorDisplayName : '';
            editDraftDto.outline = editDraftDto.outline ? editDraftDto.outline : '';
            editDraftDto.eligibilityRestrictions = editDraftDto.eligibilityRestrictions ? editDraftDto.eligibilityRestrictions : '';
            editDraftDto.attendanceInformation = editDraftDto.attendanceInformation ? editDraftDto.attendanceInformation : '';
            editDraftDto.address = editDraftDto.address ? editDraftDto.address : '';
            editDraftDto.city = editDraftDto.city ? editDraftDto.city : '';
            editDraftDto.zip = editDraftDto.zip ? editDraftDto.zip : '';
            editDraftDto.externalCourseId = editDraftDto.externalCourseId ? editDraftDto.externalCourseId : '';
            editDraftDto.customSchedule = editDraftDto.customSchedule ? editDraftDto.customSchedule : {};
            editDraftDto.date = editDraftDto.date ? editDraftDto.date : { start: null, end: null };
            const draft = await this.coursesService.updateDraft(editDraftDto);
            if (draft) {
                return ResponseHandler_1.default.success({
                    draft,
                });
            }
            else {
                return ResponseHandler_1.default.fail('Cannot edit draft 24 hours before deadline');
            }
        }
    }
    async cancelCourse(courseIdDto, cancelCourseDto, user) {
        try {
            const authorized = await this.usersService.validateUserForLogin({
                emailAddress: user.emailAddress,
                password: cancelCourseDto.password,
            });
            if (authorized) {
                this.logger.log(`Canceling course: ${courseIdDto.courseId}`);
                this.logger.log(`Calling cancel all enrollments method.`);
                const { data: { canceledEnrollments }, } = await this.enrollmentsService.cancelAllEnrollmentsForCourse(courseIdDto.courseId);
                this.logger.log(`Calling cancel course.`);
                const { data: course } = await this.coursesService.cancelCourse(courseIdDto.courseId, cancelCourseDto.reasons, user._id);
                this.logger.log('Sending mails to admins and learners.');
                const { data: admins } = await this.collegesService.getCollegeAdminsForEmail(user.collegeId);
                const learners = canceledEnrollments.map(async (enrollment) => {
                    enrollment.refundAmount = Number(enrollment.totalPaid.toFixed(2)).toLocaleString();
                    try {
                        const mailData = {
                            to: enrollment.learnerId.emailAddress,
                            from: process.env.LEARNER_NOTIFICATION_FROM,
                            subject: `We're sorry - your Unmudl course has been cancelled`,
                            template: 'cancelCourseLearner',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                enrollment,
                                cancelReasons: cancelCourseDto.reasons,
                            },
                        };
                        const mail = await this.mailerService.sendMail(mailData);
                        mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
                    }
                    catch (e) { }
                    return Object.assign(Object.assign({}, enrollment.learnerId), { refundAmount: Number(enrollment.totalPaid.toFixed(2)).toLocaleString(), collegeId: user.collegeId.toString() });
                });
                try {
                    admins.forEach(async (admin) => {
                        const mailData = {
                            to: admin.emailAddress,
                            from: process.env.PARTNER_NOTIFICATION_FROM,
                            subject: 'Unmudl course cancellation successful',
                            template: 'cancelCourseAdmin',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                learners,
                                admin,
                                course,
                            },
                        };
                        const mail = await this.mailerService.sendMail(mailData);
                        mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
                    });
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.response ? (e.response.message ? e.response.message : e.response) : e.message);
                }
                return ResponseHandler_1.default.success({ canceledEnrollments, course }, 'Course canceled and all enrollments refunded successfully.');
            }
            else {
                return ResponseHandler_1.default.fail('Invalid password.');
            }
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
        }
    }
    async GetEnrollmentStatistics(getEnrollmentStatisticsDto, user) {
        getEnrollmentStatisticsDto.collegeId = user.collegeId;
        return await this.coursesService.getEnrollmentStatistics(getEnrollmentStatisticsDto);
    }
    async GetFollowupCourses(followUpCoursesDto, user) {
        followUpCoursesDto.keyword = followUpCoursesDto.keyword ? followUpCoursesDto.keyword : '';
        followUpCoursesDto.perPage = Number(followUpCoursesDto.perPage) ? Number(followUpCoursesDto.perPage) : 10;
        followUpCoursesDto.collegeId = user.collegeId ? user.collegeId : '';
        return await this.coursesService.getFollowUpCourses(followUpCoursesDto);
    }
    async GetRefundStatistics(getRefundStatisticsDto, user) {
        getRefundStatisticsDto.collegeId = user.collegeId;
        return await this.coursesService.getRefundStatistics(getRefundStatisticsDto);
    }
    async GetHighRejectionCourses(getHighRejectionCoursesDto, user) {
        getHighRejectionCoursesDto.collegeId = user.collegeId;
        return await this.coursesService.getHighRejectionCourses(getHighRejectionCoursesDto);
    }
    async UpdateCoursePublishedStatus(updatePublishedStatusDto, user) {
        updatePublishedStatusDto.unpublishedBy = updatePublishedStatusDto.status === courses_model_1.CourseStatus.UNPUBLISH ? user._id : null;
        updatePublishedStatusDto.unpublishedDate = updatePublishedStatusDto.status === courses_model_1.CourseStatus.UNPUBLISH ? new Date().toISOString() : null;
        return await this.coursesService.updateCoursePublishedStatus(updatePublishedStatusDto);
    }
    async GetOccupations(paginationDto) {
        if (!paginationDto.keyword) {
            return ResponseHandler_1.default.fail('keyword is required');
        }
        const response = await axios.get('https://services.onetcenter.org/ws/mnm/search', {
            auth: {
                username: process.env.ONET_API_USER,
                password: process.env.ONET_API_PASSWORD,
            },
            params: {
                keyword: paginationDto.keyword,
                end: paginationDto.perPage ? Number(paginationDto.perPage) : 20,
            },
        });
        return ResponseHandler_1.default.success(response.data.career);
    }
    async GetCertifications(paginationDto) {
        try {
            if (!paginationDto.keyword) {
                return ResponseHandler_1.default.fail('keyword is required');
            }
            const response = await axios.get(`https://api.careeronestop.org/v1/certificationfinder/${process.env.CAREER_ONE_STOP_USER_ID}/${paginationDto.keyword}/0/0/0/0/0/0/Name/0/0/${paginationDto.perPage ? Number(paginationDto.perPage) : 20}`, {
                headers: {
                    Authorization: `Bearer ${process.env.CAREER_ONE_STOP_TOKEN}`,
                },
            });
            const list = response.data.CertList.map(certificate => {
                return {
                    Id: certificate.Id,
                    Name: certificate.Name,
                    Organization: certificate.Organization,
                    Description: certificate.Description,
                };
            });
            return ResponseHandler_1.default.success(list, 'Successfull request');
        }
        catch (err) {
            return ResponseHandler_1.default.fail('', err);
        }
    }
    async GetLicenses(paginationDto) {
        try {
            if (!paginationDto.keyword) {
                return ResponseHandler_1.default.fail('keyword is required');
            }
            const response = await axios.get(`https://api.careeronestop.org/v1/license/${process.env.CAREER_ONE_STOP_USER_ID}/${paginationDto.keyword}/US/0/0/0/${paginationDto.perPage ? Number(paginationDto.perPage) : 20}/?searchMode=literal`, {
                headers: {
                    Authorization: `Bearer ${process.env.CAREER_ONE_STOP_TOKEN}`,
                },
            });
            return ResponseHandler_1.default.success(response.data.LicenseList, 'Successfull request');
        }
        catch (err) {
            return ResponseHandler_1.default.fail('', err);
        }
    }
    async GetOccupationDetails(occupationCodesDto) {
        try {
            const promises = occupationCodesDto.occupationCodes.map(code => {
                return axios.get(`https://services.onetcenter.org/ws/online/occupations/${code}/details/`, {
                    auth: {
                        username: process.env.ONET_API_USER,
                        password: process.env.ONET_API_PASSWORD,
                    },
                });
            });
            const data = await Promise.all(promises);
            const { knowledge, skills, experience } = this.coursesService.mergeArrays(...data);
            const prefillKnowledge = knowledge
                .filter(item => item.score.value > 50)
                .sort((a, b) => b.score.value - a.score.value)
                .slice(0, 7);
            const prefillSkills = skills
                .filter(item => item.score.value > 50)
                .sort((a, b) => b.score.value - a.score.value)
                .slice(0, 7);
            const prefillExperience = experience.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 7);
            return ResponseHandler_1.default.success({ prefillKnowledge, knowledge, prefillSkills, skills, prefillExperience, experience });
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.message);
        }
    }
    async GetOccupationTests(paginationDto) {
        const response = await axios.get('https://services.onetcenter.org/ws/online/occupations/17-2051.00/details/', {
            auth: {
                username: process.env.ONET_API_USER,
                password: process.env.ONET_API_PASSWORD,
            },
            params: {},
        });
        return ResponseHandler_1.default.success(response.data);
    }
    async GetLevelAnchors(getAnchorsDto) {
        getAnchorsDto.limit = getAnchorsDto.limit ? Number(getAnchorsDto.limit) : 3;
        return await this.coursesService.getLevelAnchors(getAnchorsDto);
    }
    async GetCipCertificates(paginationDto) {
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 8;
        return this.coursesService.getCipCertificates(paginationDto);
    }
    async GetDraftPeview(draftIdDto) {
        const [course] = await Promise.all([
            this.coursesService.getDraftDetails(draftIdDto.draftId),
        ]);
        course.reviewsCount = 0;
        if (course.time && course.time[0]) {
            course.time[0].hours = moment(course.time[0].end).diff(moment(course.time[0].start), 'hours');
        }
        let prevRatings = null;
        if (course && course.followUpCourseId && course.followUpCourseId._id) {
            prevRatings = await this.coursesService.getRatingsById(course.followUpCourseId.numId, true);
            course.followUpCourseId.reviewsCount = course.followUpCourseId.reviews ? course.followUpCourseId.reviews.length : 0;
            course.followUpCourseId.reviews.splice(2);
        }
        let enrollmentStatus = null;
        let enrollmentId = null;
        course.coursePrice = course.price + (course.collegeId.unmudlShare / 100) * course.price;
        course.salesTax = course.collegeId.salesTax;
        course.totalPrice = course.coursePrice;
        course.totalPriceWithTax = course.coursePrice + (course.collegeId.salesTax / 100) * course.coursePrice;
        delete course.price;
        const instructorRating = course.instructorIds[0] ? await this.coursesService.getInstructorRatings(course.instructorIds[0]._id) : null;
        course.instructor = course.instructorIds[0];
        delete course.instructorIds;
        if (course.instructor) {
            course.instructor.rating = instructorRating ? instructorRating.rating : null;
            course.instructor.reviewsCount = instructorRating ? instructorRating.reviewsCount : 0;
        }
        course.enrollmentStatus = enrollmentStatus;
        course.enrollmentId = enrollmentId;
        course.ratingDetails = prevRatings ? prevRatings : null;
        course.college = course.collegeId;
        delete course.collegeId;
        return course
            ? ResponseHandler_1.default.success({
                course,
            })
            : ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidCourseId);
    }
    async DeleteCourse(courseIdDto, user) {
        return await this.coursesService.deleteCourse(courseIdDto.courseId);
    }
    async getCoursePriceWithCommission(getPriceAfterCommissionDto, user) {
        getPriceAfterCommissionDto.collegeId = user.collegeId ? user.collegeId : getPriceAfterCommissionDto.collegeId;
        return await this.coursesService.getCoursePriceAfterCommission(getPriceAfterCommissionDto);
    }
    async getCourseCategories(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        return await this.coursesService.getCourseCategories(keywordDto.keyword);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesList_dto_1.CoursesListDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('dropdown'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesList_dto_1.CoursesListDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesDropdown", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor', 'recruiter'),
    common_1.Get('/employer-portal/dropdown'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesList_dto_1.CoursesListDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesDropdownForEmployerPortal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=courses.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesCsv_dto_1.CoursesCsvDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesListCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('draft'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesList_dto_1.CoursesListDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetDraftCoursesList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Check if draft exists.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('draft/external/:draftId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [draftId_dto_1.DraftIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetDraftCourseForExterbal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('/draft/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=courses.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesCsv_dto_1.CoursesCsvDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetDraftCoursesListCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get complete data for courses section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursesSectionData_dto_1.CoursesSectionDataDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCompleteCoursesSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get complete data for view course section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCompleteViewCourseSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get statistics data for view course section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/admin-home/statistics'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursePagination_dto_1.CoursePaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetViewCourseStatisticsData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enrollments data for view course section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/admin-home/enrollments'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursePagination_dto_1.CoursePaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetViewCourseEnrollmentsData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get reviews data for view course section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/admin-home/reviews'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursePagination_dto_1.CoursePaginationDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetViewCourseReviewsData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get promos data for view course section on admin panel.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Get('/details/admin-home/promos'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coursePromoData_dto_1.CoursePromoDataDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetViewCoursePromosData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get available performance outcomes for courses.' }),
    common_1.Get('/performace-outcomes'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetPerformance", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get analytics for courses.' }),
    common_1.Get('/analytics'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesAnalytics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get new and total courses count.' }),
    common_1.Get('/analytics/count'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyticsCount_dto_1.AnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesCount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get analytics for course.' }),
    common_1.Get('/analytics/:courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCoursesAnalyticsByCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course details.' }),
    common_1.Get('details'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCourseDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course details.' }),
    common_1.Get('draft/details'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [draftId_dto_1.DraftIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCourseDraftDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course revenue.' }),
    common_1.Get('/revenue/:courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCourseRevenue", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course revenue.' }),
    common_1.Get('/reviews/:courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCourseReviews", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get valid courses for promo dropdown.' }),
    common_1.Get('/promos/valid'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validPromo_dto_1.ValidPromoDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetValidPromoCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get promos for a course.' }),
    common_1.Get('/promos/:courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCoursePromos_dto_1.GetCoursePromosDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetPromosForCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course revenue.' }),
    common_1.Get('/ratings/:courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCourseRatings", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a new performance outcome Tag.' }),
    common_1.Post('createPerformaceOutcomeTag'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [title_dto_1.TitleDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "CreatePerformanceOutcome", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Set course active status.' }),
    common_1.Post('setEnrollmentCancelled'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setEnrollmentCancelledStatus_dto_1.SetEnrollmentCancelledStatusDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "SetEnrollmentCancelledStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a course' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Post('create'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'attachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createCourse_dto_1.CreateCourseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "CreateCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a course' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Post('create-draft'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'attachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createDraft_dto_1.CreateDraftDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "CreateCourseDraft", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'pragya: External api for pragya to create a course draft.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post('/create-draft/external'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'attachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createDraftExternal_dto_1.CreateDraftExternalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourseDraftExternal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'pragya: External api for pragya to update a course draft.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post('/update-draft/external'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'coverPhoto', maxCount: 1 },
        { name: 'coverPhotoThumbnail', maxCount: 1 },
        { name: 'attachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'coverPhoto' || file.fieldname === 'coverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'attachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateDraftExternal_dto_1.UpdateDraftExternalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourseDraftExternal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Craete draft from existing course.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Post('copy-draft'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [copyDraft_dto_1.CopyDraftDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "CreateDraftFromCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update a course' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Post('edit'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'updatedCoverPhoto', maxCount: 1 },
        { name: 'updatedCoverPhotoThumbnail', maxCount: 1 },
        { name: 'uploadedAttachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'updatedCoverPhoto' || file.fieldname === 'updatedCoverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'uploadedAttachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editCourse_dto_1.EditCourseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "UpdateCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update a course' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Post('edit-draft'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'updatedCoverPhoto', maxCount: 1 },
        { name: 'updatedCoverPhotoThumbnail', maxCount: 1 },
        { name: 'uploadedAttachments' },
        { name: 'employersLogos' },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'updatedCoverPhoto' || file.fieldname === 'updatedCoverPhotoThumbnail') {
                    cb(null, './public/uploads/courses-images/');
                }
                else if (file.fieldname === 'uploadedAttachments') {
                    cb(null, './public/uploads/courses-attachments/');
                }
                else if (file.fieldname === 'employersLogos') {
                    cb(null, './public/uploads/employers-logos/');
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editDraft_dto_1.EditDraftDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "UpdateCourseDraft", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Cancel a course and cancel all enrollments with full refund.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Post('/cancel/:courseId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, cancelCourse_dto_1.CancelCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "cancelCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course enrollment statistics.' }),
    common_1.Get('/enrollment-statistics'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEnrollmentStatistics_dto_1.GetEnrollmentStatisticsDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetEnrollmentStatistics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get courses to set followupCourse.' }),
    common_1.Get('followup'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getFollowupCourses_dto_1.FollowUpCoursesDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetFollowupCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course refund statistics.' }),
    common_1.Get('/refund-statistics'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getRefundStatistics_dto_1.GetRefundStatisticsDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetRefundStatistics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get course rejection rate statistics.' }),
    common_1.Get('/rejection-statistics'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getHighRejectionCourses_dto_1.GetHighRejectionCoursesDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetHighRejectionCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update course published status.' }),
    common_1.Post('update-published'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePublishedStatus_dto_1.UpdatePublishedStatusDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "UpdateCoursePublishedStatus", null);
__decorate([
    common_1.Get('occupations'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetOccupations", null);
__decorate([
    common_1.Get('certifications'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCertifications", null);
__decorate([
    common_1.Get('licenses'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetLicenses", null);
__decorate([
    common_1.Get('occupations/details'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [occupationCodes_dto_1.OccupationCodesDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetOccupationDetails", null);
__decorate([
    common_1.Get('occupations/test'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetOccupationTests", null);
__decorate([
    common_1.Get('level-anchors'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getAnchors_dto_1.GetAnchorsDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetLevelAnchors", null);
__decorate([
    common_1.Get('cip-certificates'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetCipCertificates", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get course details.' }),
    common_1.Get('draft/preview/:draftId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [draftNumId_dto_1.DraftNumIdDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "GetDraftPeview", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete unpublished course with no enrollment.' }),
    common_1.Delete(':courseId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseId_dto_1.CourseIdDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "DeleteCourse", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of courses.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    common_1.Get('price-with-commission'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getPriceAfterCommission_dto_1.GetPriceAfterCommissionDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursePriceWithCommission", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get course categories.' }),
    common_1.Get('categories'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseCategories", null);
CoursesController = CoursesController_1 = __decorate([
    swagger_1.ApiTags('Courses'),
    common_1.Controller('courses'),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        courses_service_1.CoursesService,
        colleges_service_1.CollegesService,
        enrollments_service_1.EnrollmentsService,
        activities_service_1.ActivitiesService,
        employers_service_1.EmployersService,
        promos_service_1.PromosService,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService,
        email_logs_service_1.EmailLogsService])
], CoursesController);
exports.CoursesController = CoursesController;
//# sourceMappingURL=courses.controller.js.map