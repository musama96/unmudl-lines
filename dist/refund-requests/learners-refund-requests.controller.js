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
var LearnersRefundRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const refund_requests_service_1 = require("./refund-requests.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const createRefund_dto_1 = require("./dto/createRefund.dto");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const createRefund_enum_1 = require("../common/enums/createRefund.enum");
const responseMessages_1 = require("../config/responseMessages");
const stripe_service_1 = require("../stripe/stripe.service");
const activities_service_1 = require("../activities/activities.service");
const activity_model_1 = require("../activities/activity.model");
const mongoose = require("mongoose");
const transactionActivityCategory_model_1 = require("../activities/transactionActivityCategory.model");
const mailer_1 = require("@nest-modules/mailer");
const courses_service_1 = require("../courses/courses.service");
const external_service_1 = require("../external/external.service");
const learners_service_1 = require("../learners/learners.service");
const colleges_service_1 = require("../colleges/colleges.service");
const mongoose_1 = require("@nestjs/mongoose");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let LearnersRefundRequestsController = LearnersRefundRequestsController_1 = class LearnersRefundRequestsController {
    constructor(giftCourseModel, refundRequestsService, enrollmentsService, stripeService, activitiesService, mailerService, coursesService, externalService, learnersService, collegesService, emailLogsService) {
        this.giftCourseModel = giftCourseModel;
        this.refundRequestsService = refundRequestsService;
        this.enrollmentsService = enrollmentsService;
        this.stripeService = stripeService;
        this.activitiesService = activitiesService;
        this.mailerService = mailerService;
        this.coursesService = coursesService;
        this.externalService = externalService;
        this.learnersService = learnersService;
        this.collegesService = collegesService;
        this.emailLogsService = emailLogsService;
        this.logger = new common_1.Logger(LearnersRefundRequestsController_1.name);
    }
    async Create(createRefundDto, user) {
        const enrollmentResponse = await this.enrollmentsService.getEnrollmentById(createRefundDto.enrollmentId);
        if (enrollmentResponse.data) {
            const enrollment = enrollmentResponse.data;
            const { data: refundRequest } = await this.refundRequestsService.getRefundRequestByEnrollment(createRefundDto.enrollmentId);
            if (refundRequest) {
                return ResponseHandler_1.default.fail('You have already applied for refund.');
            }
            this.logger.warn('Refund Request');
            this.logger.log(enrollment._id.toString());
            this.logger.log(enrollment.status);
            if (['processed', 'transferred'].includes(enrollment.status)) {
                createRefundDto.courseId = enrollment.courseId;
                createRefundDto.requestedBy = enrollment.learnerId;
                createRefundDto.transactionId = enrollment.transactionId;
                createRefundDto.status = createRefund_enum_1.RefundStatus.PENDING;
                if (user._id.toString() !== enrollment.learnerId.toString()) {
                    return ResponseHandler_1.default.fail(`Enrollment doesn't belong to the user.`);
                }
                const requestResponse = await this.refundRequestsService.createRefundRequest(createRefundDto);
                return ResponseHandler_1.default.success({
                    requestType: 'refund',
                    request: requestResponse.data,
                    enrollment,
                }, 'Refund request created successfully.');
            }
            else if (['pending', 'approved'].includes(enrollment.status)) {
                let stripeResponse = null;
                let updatedEnrollmentResponse = null;
                try {
                    stripeResponse = enrollment.transactionId
                        ? await this.stripeService.refundPaymentToCustomer(enrollment.transactionId)
                        : { data: '' };
                    updatedEnrollmentResponse = await this.enrollmentsService.refundEnrollment(enrollment._id, 'canceled');
                    if (enrollment.giftId) {
                        await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'canceled' } });
                    }
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
                }
                const activities = [
                    {
                        type: activity_model_1.ActivityTypes.Transaction,
                        learner: enrollment.learnerId,
                        course: enrollment.courseId,
                        enrollment: enrollment._id,
                        transactionActivity: mongoose.Types.ObjectId(await this.activitiesService.getTransactionActivityId(transactionActivityCategory_model_1.TransactionActivities.EnrollmentCanceled)),
                    },
                ];
                const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
                const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
                if (course.externalCourseId && course.collegeId.orgId) {
                    try {
                        const { data: { accessToken }, } = await this.externalService.getLmsToken();
                        const { data: externalEnrollment } = await this.externalService.cancelLmsEnrollment({
                            userId: learner._id,
                            orgId: course.collegeId.orgId,
                            courseId: course.externalCourseId,
                            courseTitle: course.title,
                            enrollmentId: enrollment._id,
                            type: 'return',
                            accessToken,
                        });
                    }
                    catch (e) { }
                }
                const { data: collegeAdmins } = await this.collegesService.getCollegeAdminsForEmail(course.collegeId._id);
                try {
                    const mailData = {
                        to: user.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: 'Your Unmudl course was successfully canceled',
                        template: 'learnerCancelUnapprovedEnrollment',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            course: course.title,
                            college: course.collegeId.title,
                        },
                    };
                    const [activity, mail, collegeMails] = await Promise.all([
                        this.activitiesService.createActivities(activities),
                        this.mailerService.sendMail(mailData),
                        collegeAdmins.map(async (admin) => {
                            const mailData = {
                                to: admin.emailAddress,
                                from: process.env.PARTNER_NOTIFICATION_FROM,
                                subject: 'UNMUDL Notification',
                                template: 'learnerCancelUnapprovedEnrollmentMailForAdmin',
                                context: {
                                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                    course: course.title,
                                    learner: learner.fullname,
                                },
                            };
                            const mail = await this.mailerService.sendMail(mailData);
                            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                            return mail;
                        }),
                    ]);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.response.message ? e.message : 'Something went wrong. Please try again later');
                }
                return ResponseHandler_1.default.success({
                    requestType: 'cancel',
                    stripe: stripeResponse.data,
                    enrollment: updatedEnrollmentResponse.data,
                }, 'Enrollment canceled successfully.');
            }
            else {
                return ResponseHandler_1.default.fail(responseMessages_1.default.approveRefund.status(enrollment.status));
            }
        }
        else {
            return ResponseHandler_1.default.fail('Enrollment not found.');
        }
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Create a refund request.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createRefund_dto_1.CreateRefundDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersRefundRequestsController.prototype, "Create", null);
LearnersRefundRequestsController = LearnersRefundRequestsController_1 = __decorate([
    swagger_1.ApiTags('Refund Requests (User Portal)'),
    common_1.Controller('refund-requests'),
    __param(0, mongoose_1.InjectModel('gift-course')),
    __metadata("design:paramtypes", [Object, refund_requests_service_1.RefundRequestsService,
        enrollments_service_1.EnrollmentsService,
        stripe_service_1.StripeService,
        activities_service_1.ActivitiesService,
        mailer_1.MailerService,
        courses_service_1.CoursesService,
        external_service_1.ExternalService,
        learners_service_1.LearnersService,
        colleges_service_1.CollegesService,
        email_logs_service_1.EmailLogsService])
], LearnersRefundRequestsController);
exports.LearnersRefundRequestsController = LearnersRefundRequestsController;
//# sourceMappingURL=learners-refund-requests.controller.js.map