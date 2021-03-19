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
var RefundRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const refund_requests_service_1 = require("./refund-requests.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const refundRequestId_dto_1 = require("../common/dto/refundRequestId.dto");
const stripe_service_1 = require("../stripe/stripe.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const refundRequestList_dto_1 = require("./dto/refundRequestList.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const mailer_1 = require("@nest-modules/mailer");
const courses_service_1 = require("../courses/courses.service");
const learners_service_1 = require("../learners/learners.service");
const external_service_1 = require("../external/external.service");
const colleges_service_1 = require("../colleges/colleges.service");
const mongoose_1 = require("@nestjs/mongoose");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
let RefundRequestsController = RefundRequestsController_1 = class RefundRequestsController {
    constructor(giftCourseModel, refundRequestsService, enrollmentsService, stripeService, mailerService, coursesService, collegesService, learnersService, externalService, emailLogsService) {
        this.giftCourseModel = giftCourseModel;
        this.refundRequestsService = refundRequestsService;
        this.enrollmentsService = enrollmentsService;
        this.stripeService = stripeService;
        this.mailerService = mailerService;
        this.coursesService = coursesService;
        this.collegesService = collegesService;
        this.learnersService = learnersService;
        this.externalService = externalService;
        this.emailLogsService = emailLogsService;
        this.logger = new common_1.Logger(RefundRequestsController_1.name);
    }
    async GetRefundRequests(refundRequestListDto, user) {
        refundRequestListDto.collegeId = user.collegeId ? user.collegeId : refundRequestListDto.collegeId;
        refundRequestListDto.sortOrder = refundRequestListDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.refundRequestsService.getRefundRequests(refundRequestListDto);
    }
    async GetRefundRequestDetails(refundRequestIdDto) {
        return await this.refundRequestsService.getRefundRequestDetails(refundRequestIdDto.refundRequestId);
    }
    async RejectRefundRequest(refundRequestIdDto) {
        const resp = await this.refundRequestsService.rejectRefundRequest(refundRequestIdDto.refundRequestId);
        const { data: request } = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);
        if (request.status === 'rejected' && request.requestedBy && request.courseId && request.courseId.collegeId) {
            const mailData = {
                to: request.requestedBy.emailAddress,
                from: process.env.LEARNER_NOTIFICATION_FROM,
                subject: 'UNMUDL Notification',
                template: 'learnerRefundRequestRejection',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    course: request.courseId.title,
                    college: request.courseId.collegeId.title,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
        }
        return resp;
    }
    async ApproveRefund(refundRequestIdDto) {
        const refundRequestRes = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);
        if (refundRequestRes.data) {
            const request = refundRequestRes.data;
            const { data: { enrollmentId: enrollment }, } = refundRequestRes;
            this.logger.warn('Refund Request Approval');
            this.logger.log(`Enrollment Id: ${enrollment._id.toString()}`);
            this.logger.log(`Enrollment status: ${enrollment.status}`);
            if (!(enrollment.status === 'refunded')) {
                let outstandingBalance = 0;
                if (enrollment.status === 'transferred' && enrollment.transactionId) {
                    try {
                        await this.stripeService.reverseTransfer(enrollment.transferId);
                        if (enrollment.sentToCollege !== enrollment.collegeShare || enrollment.sentToCollege < enrollment.collegeShare) {
                            outstandingBalance = enrollment.collegeShare - enrollment.sentToCollege;
                        }
                    }
                    catch (e) {
                        return ResponseHandler_1.default.fail(e.raw.message, null, 402);
                    }
                }
                let stripeResponse = null;
                try {
                    const amount = Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100);
                    stripeResponse = request.transactionId
                        ? await this.stripeService.refundPaymentToCustomer(request.transactionId, amount)
                        : { data: '' };
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.response.message);
                }
                const enrollmentResponse = await this.enrollmentsService.refundEnrollment(request.enrollmentId, 'refunded', enrollment.transferId);
                const refundRequestResponse = await this.refundRequestsService.approveRefundRequest(refundRequestIdDto.refundRequestId, stripeResponse.data);
                if (enrollment.giftId) {
                    await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
                }
                this.logger.log(`College outstanding balance: ${outstandingBalance}`);
                this.logger.log(`Refunded amount: ${Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100)}`);
                this.logger.log(`Stripe Transaction Id: ${request.transactionId}`);
                if (outstandingBalance > 0) {
                    await this.collegesService.updateCollegeOutstandingBalance(request.courseId.collegeId._id, outstandingBalance);
                }
                const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
                this.logger.log(`External Course Id: ${course.externalCourseId}`);
                this.logger.log(`College Org Id: ${course.collegeId.orgId}`);
                if (course.externalCourseId && course.collegeId.orgId) {
                    const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
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
                        this.logger.log(`Pragya Call Successful.`);
                    }
                    catch (e) {
                        this.logger.error(`Pragya Call Failed.`);
                        return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
                    }
                }
                else {
                    this.logger.warn('No pragya call.');
                }
                try {
                    const mailData = {
                        to: request.requestedBy.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: 'UNMUDL Notification',
                        template: 'learnerRefundRequestApproval',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            course: request.courseId.title,
                            college: request.courseId.collegeId.title,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
                }
                return ResponseHandler_1.default.success({
                    stripe: stripeResponse.data,
                    enrollment: enrollmentResponse.data,
                    refund: refundRequestResponse.data,
                }, 'Payment refunded successfully.');
            }
            else {
                await Promise.all([
                    this.enrollmentsService.refundEnrollment(refundRequestRes.data.enrollmentId, 'refunded'),
                    this.refundRequestsService.setRefundRequestStatus(refundRequestIdDto.refundRequestId, 'refunded'),
                ]);
                if (enrollment.giftId) {
                    await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
                }
                return ResponseHandler_1.default.fail('Enrollment has already been refunded.');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Enrollment not found.');
        }
    }
    async ApproveNegativeRefundRefund(refundRequestIdDto) {
        const refundRequestRes = await this.refundRequestsService.getRequestDetails(refundRequestIdDto.refundRequestId);
        if (refundRequestRes.data) {
            const request = refundRequestRes.data;
            const { data: { enrollmentId: enrollment }, } = refundRequestRes;
            if (!(enrollment.status === 'refunded')) {
                let outstandingBalance = enrollment.keptByUnmudl ? enrollment.keptByUnmudl : 0;
                if (enrollment.status === 'transferred' && enrollment.transactionId && enrollment.transferId) {
                    try {
                        await this.stripeService.reverseTransfer(enrollment.transferId);
                    }
                    catch (e) {
                        outstandingBalance += enrollment.sentToCollege;
                    }
                    let stripeResponse = null;
                    try {
                        const amount = Math.floor((enrollment.totalPaid - enrollment.stripeFee) * 100);
                        stripeResponse = request.transactionId
                            ? await this.stripeService.refundPaymentToCustomer(request.transactionId, amount)
                            : { data: '' };
                    }
                    catch (e) {
                        return ResponseHandler_1.default.fail(e.response.message);
                    }
                    const enrollmentResponse = await this.enrollmentsService.refundEnrollment(request.enrollmentId, 'refunded', enrollment.transferId);
                    const refundRequestResponse = await this.refundRequestsService.approveRefundRequest(refundRequestIdDto.refundRequestId, stripeResponse.data);
                    if (outstandingBalance > 0) {
                        await this.collegesService.updateCollegeOutstandingBalance(enrollment.courseId.collegeId, outstandingBalance);
                    }
                    if (enrollment.giftId) {
                        await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
                    }
                    const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
                    if (course.externalCourseId && course.collegeId.orgId) {
                        const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
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
                    const mailData = {
                        to: request.requestedBy.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: 'UNMUDL Notification',
                        template: 'learnerRefundRequestApproval',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            course: request.courseId.title,
                            college: request.courseId.collegeId.title,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
                    return ResponseHandler_1.default.success({
                        stripe: stripeResponse.data,
                        enrollment: enrollmentResponse.data,
                        refund: refundRequestResponse.data,
                    }, 'Payment refunded successfully.');
                }
                else {
                    return ResponseHandler_1.default.fail('Transfer id does not exist.');
                }
            }
            else {
                await Promise.all([
                    this.enrollmentsService.refundEnrollment(refundRequestRes.data.enrollmentId, 'refunded'),
                    this.refundRequestsService.setRefundRequestStatus(refundRequestIdDto.refundRequestId, 'refunded'),
                ]);
                if (enrollment.giftId) {
                    await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'refunded' } });
                }
                return ResponseHandler_1.default.fail('Enrollment has already been refunded.');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Enrollment not found.');
        }
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a list of refund requests.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refundRequestList_dto_1.RefundRequestListDto, Object]),
    __metadata("design:returntype", Promise)
], RefundRequestsController.prototype, "GetRefundRequests", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get refund request details.' }),
    common_1.Get('/details/:refundRequestId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refundRequestId_dto_1.RefundRequestIdDto]),
    __metadata("design:returntype", Promise)
], RefundRequestsController.prototype, "GetRefundRequestDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Reject a refund request.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('reject'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refundRequestId_dto_1.RefundRequestIdDto]),
    __metadata("design:returntype", Promise)
], RefundRequestsController.prototype, "RejectRefundRequest", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Approve a refund request.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('approve'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refundRequestId_dto_1.RefundRequestIdDto]),
    __metadata("design:returntype", Promise)
], RefundRequestsController.prototype, "ApproveRefund", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Approve a refund request with negative balance.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('approve-negative'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refundRequestId_dto_1.RefundRequestIdDto]),
    __metadata("design:returntype", Promise)
], RefundRequestsController.prototype, "ApproveNegativeRefundRefund", null);
RefundRequestsController = RefundRequestsController_1 = __decorate([
    swagger_1.ApiTags('Refund Requests (Admin Panel)'),
    common_1.Controller('refund-requests'),
    __param(0, mongoose_1.InjectModel('gift-course')),
    __metadata("design:paramtypes", [Object, refund_requests_service_1.RefundRequestsService,
        enrollments_service_1.EnrollmentsService,
        stripe_service_1.StripeService,
        mailer_1.MailerService,
        courses_service_1.CoursesService,
        colleges_service_1.CollegesService,
        learners_service_1.LearnersService,
        external_service_1.ExternalService,
        email_logs_service_1.EmailLogsService])
], RefundRequestsController);
exports.RefundRequestsController = RefundRequestsController;
//# sourceMappingURL=refund-requests.controller.js.map