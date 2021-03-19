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
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const enrollments_service_1 = require("./enrollments.service");
const courses_service_1 = require("../courses/courses.service");
const activities_service_1 = require("../activities/activities.service");
const passport_1 = require("@nestjs/passport");
const createEnrollment_dto_1 = require("./dto/createEnrollment.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const transactionActivityCategory_model_1 = require("../activities/transactionActivityCategory.model");
const activity_model_1 = require("../activities/activity.model");
const mongoose = require("mongoose");
const collegeId_dto_1 = require("../common/dto/collegeId.dto");
const checkoutCart_dto_1 = require("./dto/checkoutCart.dto");
const responseMessages_1 = require("../config/responseMessages");
let LearnerEnrollmentsController = class LearnerEnrollmentsController {
    constructor(enrollmentsService, coursesService, activitiesService) {
        this.enrollmentsService = enrollmentsService;
        this.coursesService = coursesService;
        this.activitiesService = activitiesService;
    }
    async GetRecentEnrollmentData(collegeIdDto, learner) {
        return await this.enrollmentsService.getRecentEnrollmentData(collegeIdDto.collegeId, learner._id);
    }
    async AddEnrollment(createEnrollmentDto, user) {
        createEnrollmentDto.learnerId = user._id;
        createEnrollmentDto.learnerName = user.fullname;
        createEnrollmentDto.stripeCustomerId = user.stripeCustomerId;
        const learner = await this.enrollmentsService.updateLearner(createEnrollmentDto.learnerData, user);
        const enrollment = await this.enrollmentsService.createEnrollment(createEnrollmentDto);
        const activityType = createEnrollmentDto.promoId ? transactionActivityCategory_model_1.TransactionActivities.CourseBoughtWithPromo : transactionActivityCategory_model_1.TransactionActivities.CourseBought;
        const activities = [
            {
                type: activity_model_1.ActivityTypes.Transaction,
                learner: enrollment.data.learnerId,
                course: enrollment.data.courseId,
                enrollment: enrollment.data._id,
                promo: enrollment.data.promoId,
                transactionActivity: mongoose.Types.ObjectId(await this.activitiesService.getTransactionActivityId(activityType)),
            },
        ];
        await this.activitiesService.createActivities(activities);
        const courseData = await this.enrollmentsService.getCourseDetails({ courseId: enrollment.data.courseId }, user);
        enrollment.data.course = courseData.data.course;
        return ResponseHandler_1.default.success(enrollment.data, responseMessages_1.default.success.enrollmentRequestAdded);
    }
    async CheckoutCart(checkoutCartDto, user) {
        if (!user.cart || user.cart.length < 1) {
            return ResponseHandler_1.default.fail('Cart is empty');
        }
        const courses = await this.enrollmentsService.checkEnrollmentDeadline(user.cart);
        if (courses && courses.length > 0) {
            const response = 'The enrollment deadline has passed for some courses, remove them and try again.';
            return ResponseHandler_1.default.fail(response, { courses });
        }
        const promises = user.cart.map(async (course) => {
            const enrollment = {
                courseId: course.course,
                promoId: course.promo ? course.promo : null,
                cardId: checkoutCartDto.cardId,
                deleteCard: checkoutCartDto.deleteCard,
                learnerId: user._id,
                learnerName: user.fullname,
                stripeCustomerId: user.stripeCustomerId,
                learnerData: {
                    firstname: course.firstname,
                    lastname: course.lastname,
                    emailAddress: course.emailAddress,
                    phoneNumber: course.phoneNumber,
                    address: course.address,
                    dateOfBirth: course.dateOfBirth,
                    hasStudentId: course.hasStudentId,
                    studentId: course.studentId,
                },
            };
            return await this.enrollmentsService.createEnrollment(enrollment);
        });
        const responses = await Promise.all(promises);
        const activities = [];
        const [transactionActivity, transactionActivityWithPromo] = await Promise.all([
            this.activitiesService.getTransactionActivityId(transactionActivityCategory_model_1.TransactionActivities.CourseBought),
            this.activitiesService.getTransactionActivityId(transactionActivityCategory_model_1.TransactionActivities.CourseBoughtWithPromo),
        ]);
        responses.forEach(object => {
            activities.push({
                type: activity_model_1.ActivityTypes.Transaction,
                learner: object.data.learnerId,
                course: object.data.courseId,
                enrollment: object.data._id,
                transactionActivity: object.data.promoId
                    ? mongoose.Types.ObjectId(transactionActivityWithPromo)
                    : mongoose.Types.ObjectId(transactionActivity),
            });
        });
        await this.activitiesService.createActivities(activities);
        return responses ? ResponseHandler_1.default.success({}, 'enrollments created successfully') : ResponseHandler_1.default.fail('Something went wrong');
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get previous enrollment data of similar college.' }),
    common_1.Get('recent-enrollment/data/:collegeId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerEnrollmentsController.prototype, "GetRecentEnrollmentData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add learner enrollment data.' }),
    common_1.Post('add-enrollment'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createEnrollment_dto_1.CreateEnrollmentDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerEnrollmentsController.prototype, "AddEnrollment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add learner enrollment data.' }),
    common_1.Post('checkout-cart'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkoutCart_dto_1.CheckoutCartDto, Object]),
    __metadata("design:returntype", Promise)
], LearnerEnrollmentsController.prototype, "CheckoutCart", null);
LearnerEnrollmentsController = __decorate([
    swagger_1.ApiTags('Enrollments (User Portal)'),
    common_1.Controller('learner-enrollments'),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService,
        courses_service_1.CoursesService,
        activities_service_1.ActivitiesService])
], LearnerEnrollmentsController);
exports.LearnerEnrollmentsController = LearnerEnrollmentsController;
//# sourceMappingURL=learner-enrollments.controller.js.map