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
var EnrollmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const enrollmentStatus_enum_1 = require("../common/enums/enrollmentStatus.enum");
const mongoose = require("mongoose");
const json2csv = require("json2csv");
const flatted_1 = require("flatted");
const config_1 = require("../config/config");
const stripe_service_1 = require("../stripe/stripe.service");
const notifications_service_1 = require("../notifications/notifications.service");
const mailer_1 = require("@nest-modules/mailer");
const courses_service_1 = require("../courses/courses.service");
const moment = require("moment");
const activity_model_1 = require("../activities/activity.model");
const transactionActivityCategory_model_1 = require("../activities/transactionActivityCategory.model");
const activities_service_1 = require("../activities/activities.service");
const user_model_1 = require("../users/user.model");
const external_service_1 = require("../external/external.service");
const learners_service_1 = require("../learners/learners.service");
const enquiries_service_1 = require("../enquiries/enquiries.service");
const colleges_service_1 = require("../colleges/colleges.service");
const dotenv = require("dotenv");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
dotenv.config();
let EnrollmentsService = EnrollmentsService_1 = class EnrollmentsService {
    constructor(enrollmentModel, learnerModel, promoModel, courseModel, userModel, collegeModel, giftCourseModel, stripeService, notificationsService, mailerService, coursesService, collegesService, activitiesService, externalService, learnersService, enquiriesService, emailLogsService) {
        this.enrollmentModel = enrollmentModel;
        this.learnerModel = learnerModel;
        this.promoModel = promoModel;
        this.courseModel = courseModel;
        this.userModel = userModel;
        this.collegeModel = collegeModel;
        this.giftCourseModel = giftCourseModel;
        this.stripeService = stripeService;
        this.notificationsService = notificationsService;
        this.mailerService = mailerService;
        this.coursesService = coursesService;
        this.collegesService = collegesService;
        this.activitiesService = activitiesService;
        this.externalService = externalService;
        this.learnersService = learnersService;
        this.enquiriesService = enquiriesService;
        this.emailLogsService = emailLogsService;
        this.stripe = require('stripe')(config_1.STRIPE_SECRET_KEY);
        this.logger = new common_1.Logger(EnrollmentsService_1.name);
    }
    async getApprovedLearnersForCourse(params) {
        const { courseId, page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [
            {
                $match: {
                    courseId: mongoose.Types.ObjectId(courseId),
                    status: {
                        $in: ['approved', 'processed', 'transferred'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'learners',
                    foreignField: '_id',
                    localField: 'learnerId',
                    as: 'learners',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    foreignField: '_id',
                    localField: 'courseId',
                    as: 'courses',
                },
            },
            {
                $project: {
                    learners: {
                        $arrayElemAt: ['$learners', 0],
                    },
                    courses: {
                        $arrayElemAt: ['$courses', 0],
                    },
                    createdAt: 1,
                },
            },
            {
                $project: {
                    fullname: '$learners.fullname',
                    learnerId: '$learners._id',
                    profilePhoto: '$learners.profilePhoto',
                    profilePhotoThumbnail: '$learners.profilePhotoThumbnail',
                    emailAddress: '$learners.emailAddress',
                    createdAt: 1,
                    location: {
                        $concat: ['$courses.city', ' ', { $ifNull: ['$courses.country', ''] }],
                    },
                },
            },
            {
                $sort: sort,
            },
        ];
        const learners = await this.enrollmentModel
            .aggregate(pipeline)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getApprovedLearnersForCourseCount(params);
        return ResponseHandler_1.default.success({
            learners,
            rows: rows.data,
        });
    }
    async getApprovedLearnersForCourseCount(params) {
        const { courseId } = params;
        const rows = await this.enrollmentModel
            .countDocuments({
            courseId: mongoose.Types.ObjectId(courseId),
            status: {
                $in: ['approved', 'processed', 'transferred'],
            },
        })
            .exec();
        return ResponseHandler_1.default.success(rows);
    }
    async getCourseEnrollmentRequests(params) {
        const { courseId, page, perPage } = params;
        const [enrollmentRequests, enrollmentRequestsCount] = await Promise.all([
            this.enrollmentModel
                .aggregate([
                {
                    $match: {
                        courseId: mongoose.Types.ObjectId(courseId),
                        status: 'pending',
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
                {
                    $lookup: {
                        from: 'learners',
                        foreignField: '_id',
                        localField: 'learnerId',
                        as: 'learner',
                    },
                },
                { $unwind: '$learner' },
                {
                    $lookup: {
                        from: 'promos',
                        foreignField: '_id',
                        localField: 'promoId',
                        as: 'promoId',
                    },
                },
                { $unwind: { path: '$promoId', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        learnerId: '$learner._id',
                        fullname: '$learner.fullname',
                        profilePhoto: '$learner.profilePhoto',
                        profilePhotoThumbnail: '$learner.profilePhotoThumbnail',
                        emailAddress: '$learner.emailAddress',
                        promo: '$promoId.title',
                        totalPaid: 1,
                        createdAt: 1,
                    },
                },
            ])
                .exec(),
            this.enrollmentModel.countDocuments({ courseId: mongoose.Types.ObjectId(courseId), status: 'pending' }),
        ]);
        return { enrollmentRequests, enrollmentRequestsCount };
    }
    async createEnrollment(enrollment) {
        const check = await this.enrollmentModel
            .findOne({
            learnerId: enrollment.learnerId,
            courseId: enrollment.courseId,
            status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
        })
            .exec();
        if (check) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.createEnrollment.alreadyEnrolled);
        }
        const course = await this.courseModel
            .findById(enrollment.courseId)
            .populate('collegeId', '+payableToUnmudl')
            .populate('instructorIds', 'fullname emailAddress')
            .lean();
        const learner = await this.learnerModel.findById(enrollment.learnerId).exec();
        course.collegeId.payableToUnmudl = course.collegeId.payableToUnmudl ? course.collegeId.payableToUnmudl : 0;
        if (!course.collegeId.stripeId) {
            const collegeAdmin = await this.userModel
                .find({
                collegeId: mongoose.Types.ObjectId(course.collegeId._id),
                role: { $in: ['superadmin', 'admin'] },
                'notifications.email': { $ne: false },
            }, 'fullname emailAddress')
                .lean()
                .exec();
            if (collegeAdmin && collegeAdmin.length > 0) {
                for (let i = 0; i < collegeAdmin.length; i++) {
                    (async () => {
                        const mailData = {
                            to: collegeAdmin[i].emailAddress,
                            from: process.env.PARTNER_NOTIFICATION_FROM,
                            subject: 'UNMUDL Notification',
                            template: 'autoEnrollStripeMissing',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                learner: learner.toObject(),
                                course,
                            },
                        };
                        const mail = await this.mailerService.sendMail(mailData);
                        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                    })();
                }
            }
            return ResponseHandler_1.default.fail('There is some problem with college payment method setup. We have informed the college about this issue. Feel free to contact the college regarding this issue.');
        }
        let taxRate = 0;
        try {
            const { data } = await this.coursesService.getTaxForLearner(course, learner);
            taxRate = data;
        }
        catch (e) {
            if (enrollment.deleteCard && enrollment.cardId) {
                await this.stripeService.removeCustomerCard(enrollment.stripeCustomerId, enrollment.cardId);
            }
            return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
        }
        enrollment.unmudlSharePercentage = course.collegeId.unmudlShare;
        enrollment.unmudlShare = (course.price * course.collegeId.unmudlShare) / 100;
        enrollment.keptByUnmudl = 0;
        const unmudlShareBeforeDiscount = (course.price * course.collegeId.unmudlShare) / 100;
        let stripeFee = 0;
        if (enrollment.promoId) {
            const promo = await this.promoModel.findById(enrollment.promoId).exec();
            enrollment.discountPercentage = promo.discountMetric === 'percentage' ? promo.discount : null;
            enrollment.discountType = promo.type;
            enrollment.discountTotal =
                promo.discountMetric === 'percentage' ? (promo.discount * (course.price + enrollment.unmudlShare)) / 100 : promo.discount;
            enrollment.salesTax = ((course.price + unmudlShareBeforeDiscount - enrollment.discountTotal) * taxRate) / 100;
            enrollment.taxPercentage = taxRate;
            enrollment.totalPaid = course.price + unmudlShareBeforeDiscount + enrollment.salesTax - enrollment.discountTotal;
            stripeFee = enrollment.totalPaid * 0.029 + 0.3;
            enrollment.discountTotal = ((course.price + unmudlShareBeforeDiscount) * promo.discount) / 100;
            const collegeDiscount = (course.price * promo.discount) / 100;
            const unmudlDiscount = (unmudlShareBeforeDiscount * promo.discount) / 100;
            if (promo.type === 'unmudl') {
                enrollment.collegeShare = course.price - stripeFee;
                enrollment.unmudlShare = unmudlShareBeforeDiscount - enrollment.discountTotal;
            }
            else if (promo.type === 'both') {
                enrollment.collegeShare = course.price - collegeDiscount - stripeFee;
                enrollment.unmudlShare = unmudlShareBeforeDiscount - unmudlDiscount;
            }
            enrollment.totalRevenue = enrollment.collegeShare + enrollment.unmudlShare;
            if (promo.learners && promo.learners.length > 0) {
                promo.learners.push(enrollment.learnerId);
            }
            else {
                promo.learners = [enrollment.learnerId];
            }
            await promo.save();
        }
        else {
            enrollment.salesTax = ((course.price + unmudlShareBeforeDiscount) * taxRate) / 100;
            enrollment.taxPercentage = taxRate;
            enrollment.totalPaid = course.price + unmudlShareBeforeDiscount + enrollment.salesTax;
            stripeFee = enrollment.totalPaid * 0.029 + 0.3;
            enrollment.discountPercentage = null;
            enrollment.discountTotal = 0;
            enrollment.collegeShare = course.price - stripeFee;
            enrollment.unmudlShare = unmudlShareBeforeDiscount;
            enrollment.totalRevenue = enrollment.collegeShare + enrollment.unmudlShare;
            enrollment.totalPaid = course.price + unmudlShareBeforeDiscount + enrollment.salesTax;
        }
        const transferDescription = `Unmudl Transfer: ${course.title}`;
        const chargeDescription = `Unmudl Purchase: ${course.title}`;
        const chargeDescriptor = `Unmudl Purchase`;
        try {
            if (enrollment.promoId && enrollment.discountPercentage === 100) {
                enrollment.stripeFee = 0;
                enrollment.collegeShare = 0;
                enrollment.unmudlShare = 0;
                enrollment.totalRevenue = 0;
                enrollment.transactionId = '';
                enrollment.courseFee = course.price;
                enrollment.status = course.autoEnroll ? enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED : enrollmentStatus_enum_1.EnrollmentStatus.PENDING;
                enrollment.sentToCollege = 0;
            }
            else if (enrollment.cardId) {
                const transaction = await this.createTransaction(enrollment.totalPaid, enrollment.cardId, enrollment.stripeCustomerId, chargeDescription, chargeDescriptor, course.autoEnroll);
                enrollment.sentToCollege = enrollment.collegeShare;
                if (enrollment.deleteCard && enrollment.cardId) {
                    await this.stripeService.removeCustomerCard(enrollment.stripeCustomerId, enrollment.cardId);
                }
                if (course.autoEnroll) {
                    const sendingToCollege = enrollment.collegeShare > course.collegeId.payableToUnmudl ? enrollment.collegeShare - course.collegeId.payableToUnmudl : 1;
                    enrollment.sentToCollege = sendingToCollege;
                    const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(course.collegeId.stripeId, Math.floor(sendingToCollege * 100), transaction.id, transferDescription);
                    if (course.collegeId.payableToUnmudl > 0) {
                        await this.collegesService.updateCollegeOutstandingBalance(course.collegeId._id, -1 * (enrollment.collegeShare - sendingToCollege));
                        enrollment.keptByUnmudl = enrollment.collegeShare - sendingToCollege;
                    }
                    enrollment.transferId = transfer.id;
                    enrollment.destPaymentId = transfer.destination_payment;
                    await this.updateRevenueInfo({
                        totalRevenue: enrollment.totalRevenue,
                        unmudlShare: enrollment.unmudlShare,
                        collegeShare: enrollment.collegeShare,
                        courseId: enrollment.courseId,
                        learnerId: enrollment.learnerId,
                    });
                }
                enrollment.stripeFee = stripeFee;
                enrollment.courseFee = course.price;
                enrollment.transactionId = transaction.id;
                enrollment.status = course.autoEnroll ? enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED : enrollmentStatus_enum_1.EnrollmentStatus.PENDING;
            }
            else {
                return ResponseHandler_1.default.fail('You will need to add your card information for this transaction.');
            }
            let newEnrollment = new this.enrollmentModel(enrollment);
            newEnrollment = await newEnrollment.save();
            newEnrollment = newEnrollment.toObject();
            if (course.externalCourseId && course.collegeId.orgId) {
                this.logger.log(`Pragya Call for enrollment. External Course ID: (${course.externalCourseId}), OrgId: ${course.collegeId.orgId}.`);
                try {
                    const { data: { accessToken }, } = await this.externalService.getLmsToken();
                    this.logger.log(`Pragya accessToken: (${accessToken}).`);
                    const createUserResponse = await this.externalService.createLmsUser({
                        userId: learner._id,
                        firstName: learner.firstname,
                        lastName: learner.lastname,
                        email: learner.emailAddress,
                        phone: learner.phoneNumber,
                        dob: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM/DD/YYYY') : '',
                        city: learner.city ? learner.city : '',
                        state: learner.state ? learner.state.shortName : '',
                        zip: learner.zip ? learner.zip : '',
                        country: learner.country ? learner.country : '',
                        gender: learner.gender ? learner.gender : '',
                        street: learner.address ? learner.address : '',
                        accessToken,
                    });
                    this.logger.log('Create User:');
                    this.logger.log(flatted_1.stringify(createUserResponse.data));
                    const createEnrollmentResponse = await this.externalService.createLmsEnrollment({
                        userId: learner._id,
                        orgId: course.collegeId.orgId,
                        courseId: course.externalCourseId,
                        courseTitle: course.title,
                        enrollmentId: newEnrollment._id,
                        type: 'buy',
                        accessToken,
                        accountId: enrollment.learnerData && enrollment.learnerData.studentId ? enrollment.learnerData.studentId : null,
                        haveAccount: !!(enrollment.learnerData && enrollment.learnerData.studentId),
                    });
                    this.logger.log('Create Enrollment:');
                    this.logger.log(flatted_1.stringify(createEnrollmentResponse.data));
                }
                catch (e) {
                    this.logger.log('Error Response:');
                    this.logger.log(flatted_1.stringify(e.response ? e.response : e));
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
                }
            }
            await this.learnerModel
                .findOneAndUpdate({
                _id: mongoose.Types.ObjectId(enrollment.learnerId),
            }, {
                $pull: {
                    cart: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                    wishList: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                    checkoutList: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                },
            }, {
                new: true,
            })
                .lean();
            this.sendMailToCollegeAndLearner(enrollment.learnerName, course, learner, enrollment.learnerData, enrollment)
                .then()
                .catch(e => {
                return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
            });
            this.notificationsService.enrollmentStatusChanged(newEnrollment, course);
            return ResponseHandler_1.default.success(newEnrollment, responseMessages_1.default.success.enrollmentAdded);
        }
        catch (e) {
            if (enrollment.deleteCard && enrollment.cardId) {
                await this.stripeService.removeCustomerCard(enrollment.stripeCustomerId, enrollment.cardId);
            }
            return ResponseHandler_1.default.fail(e.message);
        }
    }
    async createEnrollmentForGift(gift, learnerData) {
        const enrollment = {
            courseId: gift.courseId ? gift.courseId : '',
            giftId: gift._id,
            promoId: '',
            learnerId: gift.recipientId,
            learnerName: gift.recipientName,
            learnerData,
        };
        const check = await this.enrollmentModel
            .findOne({
            learnerId: gift.recipientId,
            courseId: gift.courseId,
            status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
        })
            .exec();
        const promo = await this.promoModel.findOne({ title: gift.giftCode }).exec();
        enrollment.promoId = promo._id;
        if (check) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.createEnrollment.alreadyEnrolled);
        }
        const course = await this.courseModel
            .findById(gift.courseId)
            .populate('collegeId', '+payableToUnmudl')
            .populate('instructorIds', 'fullname emailAddress')
            .lean();
        const learner = await this.learnerModel.findById(gift.recipientId).exec();
        enrollment.learnerId = gift.recipientId;
        enrollment.learnerName = learner.fullname;
        if (!course.collegeId.stripeId) {
            const collegeAdmin = await this.userModel
                .find({
                collegeId: mongoose.Types.ObjectId(course.collegeId._id),
                role: { $in: ['superadmin', 'admin'] },
                'notifications.email': { $ne: false },
            }, 'fullname emailAddress')
                .lean()
                .exec();
            if (collegeAdmin && collegeAdmin.length > 0) {
                for (let i = 0; i < collegeAdmin.length; i++) {
                    (async () => {
                        const mailData = {
                            to: collegeAdmin[i].emailAddress,
                            from: process.env.PARTNER_NOTIFICATION_FROM,
                            subject: 'UNMUDL Notification',
                            template: 'autoEnrollStripeMissing',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                learner: learner.toObject(),
                                course,
                            },
                        };
                        const mail = await this.mailerService.sendMail(mailData);
                        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                    })();
                }
            }
            return ResponseHandler_1.default.fail('There is some problem with college payment method setup. We have informed the college about this issue. Feel free to contact the college regarding this issue.');
        }
        enrollment.unmudlSharePercentage = gift.unmudlSharePercentage;
        enrollment.unmudlShare = gift.unmudlShare;
        enrollment.keptByUnmudl = gift.keptByUnmudl;
        let stripeFee = 0;
        enrollment.salesTax = gift.salesTax;
        enrollment.taxPercentage = gift.taxPercentage;
        enrollment.totalPaid = gift.totalPaid;
        stripeFee = gift.stripeFee;
        enrollment.discountPercentage = 100;
        enrollment.discountTotal = gift.totalPaid;
        enrollment.collegeShare = gift.collegeShare;
        enrollment.unmudlShare = gift.unmudlShare;
        enrollment.totalRevenue = gift.totalRevenue;
        enrollment.totalPaid = gift.totalPaid;
        const transferDescription = `Unmudl Transfer: ${course.title}`;
        if (gift.discountPercentage !== 100) {
            try {
                await this.stripeService.capturePaymentFromCustomer(gift.transactionId);
            }
            catch (e) {
                if (!e.response || e.response.message !== `Charge ${gift.transactionId} has already been captured.`) {
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
                }
            }
        }
        try {
            enrollment.sentToCollege = enrollment.collegeShare;
            if (course.autoEnroll) {
                const sendingToCollege = enrollment.collegeShare > course.collegeId.payableToUnmudl ? enrollment.collegeShare - course.collegeId.payableToUnmudl : 1;
                enrollment.sentToCollege = sendingToCollege;
                const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(course.collegeId.stripeId, Math.floor(sendingToCollege * 100), gift.transactionId, transferDescription);
                if (course.collegeId.payableToUnmudl > 0) {
                    await this.collegesService.updateCollegeOutstandingBalance(course.collegeId._id, -1 * (enrollment.collegeShare - sendingToCollege));
                    enrollment.keptByUnmudl = enrollment.collegeShare - sendingToCollege;
                }
                enrollment.transferId = transfer.id;
                enrollment.destPaymentId = transfer.destination_payment;
                await this.updateRevenueInfo({
                    totalRevenue: enrollment.totalRevenue,
                    unmudlShare: enrollment.unmudlShare,
                    collegeShare: enrollment.collegeShare,
                    courseId: enrollment.courseId,
                    learnerId: enrollment.learnerId,
                });
            }
            enrollment.stripeFee = stripeFee;
            enrollment.courseFee = course.price;
            enrollment.transactionId = gift.transactionId;
            enrollment.status = course.autoEnroll ? enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED : enrollmentStatus_enum_1.EnrollmentStatus.PENDING;
            let newEnrollment = new this.enrollmentModel(enrollment);
            newEnrollment = await newEnrollment.save();
            newEnrollment = newEnrollment.toObject();
            promo.learners = [gift.recipientId];
            await promo.save();
            const mailData = {
                to: gift.senderEmail,
                from: process.env.LEARNER_NOTIFICATION_FROM,
                subject: 'Your Unmudl gift was just accepted!',
                template: 'learnerGiftReceived',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    date: moment(new Date()).format('LL'),
                    gift: Object.assign(Object.assign({}, gift), { totalPaid: gift.totalPaid.toFixed(2) }),
                    course,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
            if (course.externalCourseId && course.collegeId.orgId) {
                this.logger.log(`Pragya Call for gift enrollment. External Course ID: (${course.externalCourseId}), OrgId: ${course.collegeId.orgId}.`);
                try {
                    const { data: { accessToken }, } = await this.externalService.getLmsToken();
                    this.logger.log(`Pragya accessToken: (${accessToken}).`);
                    const createUserResponse = await this.externalService.createLmsUser({
                        userId: learner._id,
                        firstName: learner.firstname,
                        lastName: learner.lastname,
                        email: learner.emailAddress,
                        phone: learner.phoneNumber,
                        dob: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM/DD/YYYY') : '',
                        city: learner.city ? learner.city : '',
                        state: learner.state ? learner.state.shortName : '',
                        zip: learner.zip ? learner.zip : '',
                        country: learner.country ? learner.country : '',
                        gender: learner.gender ? learner.gender : '',
                        street: learner.address ? learner.address : '',
                        accessToken,
                    });
                    this.logger.log('Create User:');
                    this.logger.log(flatted_1.stringify(createUserResponse.data));
                    const createEnrollmentResponse = await this.externalService.createLmsEnrollment({
                        userId: learner._id,
                        orgId: course.collegeId.orgId,
                        courseId: course.externalCourseId,
                        courseTitle: course.title,
                        enrollmentId: newEnrollment._id,
                        type: 'buy',
                        accessToken,
                        accountId: enrollment.learnerData && enrollment.learnerData.studentId ? enrollment.learnerData.studentId : null,
                        haveAccount: !!(enrollment.learnerData && enrollment.learnerData.studentId),
                    });
                    this.logger.log('Create Gift Enrollment:');
                    this.logger.log(flatted_1.stringify(createEnrollmentResponse.data));
                }
                catch (e) {
                    this.logger.log('Error Response:');
                    this.logger.log(flatted_1.stringify(e.response ? e.response : e));
                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
                }
            }
            await this.learnerModel
                .findOneAndUpdate({
                _id: mongoose.Types.ObjectId(enrollment.learnerId),
            }, {
                $pull: {
                    cart: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                    wishList: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                    checkoutList: { course: mongoose.Types.ObjectId(enrollment.courseId) },
                },
            }, {
                new: true,
            })
                .lean();
            this.sendMailToCollegeAndLearner(enrollment.learnerName, course, learner, enrollment.learnerData, enrollment, true, {
                fullname: gift.senderName,
            })
                .then()
                .catch(e => {
                return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
            });
            this.notificationsService.enrollmentStatusChanged(newEnrollment, course);
            return ResponseHandler_1.default.success(newEnrollment, responseMessages_1.default.success.enrollmentAdded);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.message);
        }
    }
    async sendMailToCollegeAndLearner(learnerName, course, learner, learnerData, enrollment, isGift = false, sender = null) {
        const college = await this.collegeModel
            .findById(course.collegeId, 'title')
            .lean()
            .exec();
        const text = `You have enrolled for '${course.title}'. A hold has been placed on your credit card while awaiting admission, and that the college will get back to them soon with a request for additional information or a decision on admission, typically within 2 working days.`;
        if (learnerData.emailAddress) {
            if (isGift) {
                const mailData = {
                    to: learnerData.emailAddress,
                    from: process.env.LEARNER_NOTIFICATION_FROM,
                    subject: `You've just accepted your Unmudl gift!`,
                    template: 'learnerRecipientAfterAcceptGift',
                    context: {
                        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                        date: moment(new Date()).format('LL'),
                        recipient: { fullname: learnerName },
                        course,
                        sender,
                        college,
                        supportMail: process.env.SUPPORT_MAIL,
                    },
                };
                const mail = await this.mailerService.sendMail(mailData);
                mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
            }
            else {
                if ([enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED].includes(enrollment.status)) {
                    enrollment.totalPaid = Number(enrollment.totalPaid.toFixed(2)).toLocaleString();
                    const mailData = {
                        to: learnerData.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: `You've just been accepted into your Unmudl course!`,
                        template: 'learnerAcceptanceMail',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner: { fullname: learnerName },
                            course,
                            college,
                            enrollment,
                            supportMail: process.env.SUPPORT_MAIL,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.COLLEGE) : null;
                }
                else {
                    enrollment.totalPaid = Number(enrollment.totalPaid.toFixed(2)).toLocaleString();
                    const mailData = {
                        to: learnerData.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: 'Thank you for your Unmudl purchase!',
                        template: 'learnerMailAfterPurchase',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner: { fullname: learnerName },
                            course,
                            college,
                            enrollment,
                            supportMail: process.env.SUPPORT_MAIL,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                }
            }
        }
        else if (learnerData.phoneNumber) {
            await config_1.twilioClient.messages.create({
                to: learnerData.phoneNumber,
                from: process.env.TWILIO_NUMBER,
                body: text,
            });
        }
        if (course.instructorIds &&
            course.instructorIds[0] &&
            course.instructorIds[0].notifications &&
            course.instructorIds[0].notifications.email) {
            const mailData = {
                to: course.instructorIds[0].emailAddress,
                from: process.env.PARTNER_NOTIFICATION_FROM,
                subject: 'New Unmudl learner waiting for course admission',
                template: 'collegeMailWhenLearnerApply',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    date: moment(new Date()).format('LL'),
                    learner,
                    course,
                    college,
                    hasEmail: !!learner.emailAddress,
                    learnerPortalDashboard: process.env.LEARNER_PORTAL_DASHBOARD,
                    supportMail: process.env.SUPPORT_MAIL,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
        }
        const collegeAdmin = await this.userModel
            .find({
            collegeId: mongoose.Types.ObjectId(course.collegeId._id),
            role: { $in: ['superadmin', 'admin'] },
            'notifications.email': { $ne: false },
        }, 'fullname emailAddress')
            .lean()
            .exec();
        if (collegeAdmin && collegeAdmin.length > 0) {
            for (let i = 0; i < collegeAdmin.length; i++) {
                setTimeout(async () => {
                    const mailData = {
                        to: collegeAdmin[i].emailAddress,
                        from: process.env.PARTNER_NOTIFICATION_FROM,
                        subject: course.autoEnroll ? 'New Unmudl learner applying via autoenroll' : 'New Unmudl learner waiting for course admission',
                        template: course.autoEnroll ? 'collegeMailWhenLearnerAutoEnroll' : 'collegeMailWhenLearnerApply',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner,
                            course,
                            college,
                            hasEmail: !!learner.emailAddress,
                            learnerPortalDashboard: process.env.LEARNER_PORTAL_DASHBOARD,
                            supportMail: process.env.SUPPORT_MAIL,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                }, 1000);
            }
        }
        const mailData = {
            to: process.env.SUPPORT_MAIL,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            subject: course.autoEnroll ? 'New Unmudl learner applying via autoenroll' : 'New Unmudl learner waiting for course admission',
            template: course.autoEnroll ? 'collegeMailWhenLearnerAutoEnroll' : 'collegeMailWhenLearnerApply',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                learner,
                course,
                college,
                hasEmail: !!learner.emailAddress,
                learnerPortalDashboard: process.env.LEARNER_PORTAL_DASHBOARD,
                supportMail: process.env.SUPPORT_MAIL,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
        return true;
    }
    async createTransaction(amount, cardId, customerId, description, descriptor, capture = false) {
        return await this.stripe.charges.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            source: cardId,
            customer: customerId,
            description,
            statement_descriptor: descriptor,
            capture,
        });
    }
    async rejectEnrollment(rejectionInfo, enrollmentId, user) {
        const enrollment = await this.enrollmentModel
            .findByIdAndUpdate(enrollmentId, {
            $set: {
                status: 'declined',
                rejectionInfo,
            },
        }, {
            new: true,
        })
            .lean();
        if (enrollment.transactionId) {
            await this.stripeService.refundPaymentToCustomer(enrollment.transactionId);
        }
        if (enrollment.giftId) {
            await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: 'declined' } });
        }
        const [course, learner] = await Promise.all([
            this.courseModel
                .findById(enrollment.courseId)
                .populate('collegeId')
                .lean(),
            this.learnerModel.findById(enrollment.learnerId).lean(),
        ]);
        const superadmin = await this.userModel
            .findOne({ collegeId: course.collegeId._id, role: user_model_1.UserRoles.SUPERADMIN }, 'emailAddress')
            .lean()
            .exec();
        this.notificationsService.enrollmentStatusChanged(enrollment, course);
        if (learner.emailAddress) {
            let reason = '<ul>';
            reason = rejectionInfo.courseCancelled ? reason + '<li>Course has been cancelled or no longer available</li>' : reason;
            reason = rejectionInfo.courseFull ? reason + '<li>Course is now full</li>' : reason;
            reason = rejectionInfo.minRequirements
                ? reason + `<li>You do not meet minimum requirement (${rejectionInfo.explanation})</li>`
                : reason;
            reason = rejectionInfo.furtherInfo ? reason + '<li>Further information available on request</li>' : reason;
            reason = reason + '</ul>';
            const mailData = {
                to: learner.emailAddress,
                from: process.env.LEARNER_NOTIFICATION_FROM,
                subject: `We're sorry - there's a problem with your Unmudl course admission`,
                template: 'learnerRejectionMail',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    date: moment(new Date()).format('LL'),
                    learner,
                    course,
                    college: course.collegeId,
                    reason,
                    superadmin,
                    supportMail: process.env.SUPPORT_MAIL,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
        }
        else if (learner.phoneNumber) {
            let reason = `This is to let you know that
      ${course.collegeId.title} will not be able to offer your ${course.title}.  The reasons this
      happened is because,\n`;
            reason = rejectionInfo.courseCancelled ? reason + '-Course has been cancelled or no longer available\n' : reason;
            reason = rejectionInfo.courseFull ? reason + '-Course is now full\n' : reason;
            reason = rejectionInfo.minRequirements ? reason + `-You do not meet minimum requirement (${rejectionInfo.explanation})\n` : reason;
            reason = rejectionInfo.furtherInfo ? reason + '-Further information available on request\n' : reason;
            await config_1.twilioClient.messages.create({
                to: learner.phoneNumber,
                from: process.env.TWILIO_NUMBER,
                body: reason,
            });
        }
        const activities = [
            {
                type: activity_model_1.ActivityTypes.Transaction,
                learner: enrollment.learnerId,
                user: user._id,
                course: enrollment.courseId,
                enrollment: enrollment._id,
                transactionActivity: mongoose.Types.ObjectId(await this.activitiesService.getTransactionActivityId(transactionActivityCategory_model_1.TransactionActivities.EnrollmentRefunded)),
            },
        ];
        await this.activitiesService.createActivities(activities);
        return ResponseHandler_1.default.success(enrollment, 'Enrollment rejected successfully.');
    }
    async updateLearnerEnrollmentActivityByExternalUser(enrollmentId, activity) {
        const enrollment = await this.enrollmentModel
            .findByIdAndUpdate(enrollmentId, {
            $set: {
                courseActivity: activity,
            },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(enrollment.courseActivity);
    }
    async changeEnrollmentStatus(params) {
        const enrollment = await this.enrollmentModel
            .findById(params.enrollmentId)
            .populate('promoId')
            .exec();
        const prevStatus = enrollment.status;
        enrollment.status = params.status;
        const Is100Promo = enrollment.promoId && enrollment.promoId.discount === 100 && enrollment.promoId.discountMetric === 'percentage';
        if (params.sisUserId) {
            if (!enrollment.learnerData) {
                enrollment.learnerData = {};
            }
            enrollment['learnerData.studentId'] = params.sisUserId;
            enrollment['learnerData.hasStudentId'] = true;
        }
        if (params.status === 'approved') {
            if (prevStatus === 'pending') {
                if (enrollment.courseFee > 0) {
                    try {
                        const learner = await this.learnerModel.findById(enrollment.learnerId).lean();
                        if (learner.stripeCustomerId || enrollment.giftId || Is100Promo) {
                            const course = await this.courseModel
                                .findById(enrollment.courseId)
                                .populate('collegeId', '+payableToUnmudl')
                                .populate('instructorIds', 'fullname emailAddress')
                                .lean();
                            const transferDescription = `Unmudl Transfer: ${course.title}`;
                            enrollment.sentToCollege = enrollment.collegeShare;
                            course.collegeId.payableToUnmudl = course.collegeId.payableToUnmudl ? course.collegeId.payableToUnmudl : 0;
                            const sendingToCollege = enrollment.collegeShare > course.collegeId.payableToUnmudl ? enrollment.collegeShare - course.collegeId.payableToUnmudl : 1;
                            enrollment.sentToCollege = sendingToCollege;
                            if (!Is100Promo) {
                                try {
                                    await this.stripeService.capturePaymentFromCustomer(enrollment.transactionId);
                                }
                                catch (e) {
                                    if (!e.response || e.response.message !== `Charge ${enrollment.transactionId} has already been captured.`) {
                                        return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
                                    }
                                }
                                try {
                                    if (course.collegeId.stripeId) {
                                        const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(course.collegeId.stripeId, Math.floor(sendingToCollege * 100), enrollment.transactionId, transferDescription);
                                        enrollment.transferId = transfer.id;
                                        enrollment.destPaymentId = transfer.destination_payment;
                                    }
                                    else {
                                        return ResponseHandler_1.default.fail(`Your college isn't connected to stripe. Please do so, so that we can transfer your payments to your account.`);
                                    }
                                }
                                catch (e) {
                                    return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
                                }
                                if (course.collegeId.payableToUnmudl > 0) {
                                    await this.collegesService.updateCollegeOutstandingBalance(course.collegeId._id, -1 * (enrollment.collegeShare - sendingToCollege));
                                    enrollment.keptByUnmudl = enrollment.collegeShare - sendingToCollege;
                                }
                            }
                            await this.updateRevenueInfo({
                                totalRevenue: enrollment.totalRevenue,
                                unmudlShare: enrollment.unmudlShare,
                                collegeShare: enrollment.collegeShare,
                                courseId: enrollment.courseId,
                                learnerId: enrollment.learnerId,
                            });
                            enrollment.status = enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED;
                        }
                        else {
                            return ResponseHandler_1.default.fail('Card information for this transaction.');
                        }
                    }
                    catch (e) {
                        return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
                    }
                }
                else {
                    enrollment.status = enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED;
                }
            }
            else {
                enrollment.status = prevStatus;
            }
        }
        await enrollment.save();
        if (enrollment.giftId) {
            await this.giftCourseModel.findByIdAndUpdate(enrollment.giftId, { $set: { status: enrollment.status } });
        }
        const [course, learner] = await Promise.all([
            this.courseModel
                .findById(enrollment.courseId)
                .populate('collegeId')
                .lean(),
            this.learnerModel
                .findById(enrollment.learnerId)
                .lean()
                .exec(),
        ]);
        if (enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.APPROVED || enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.DECLINED) {
            const course = await this.courseModel.findById(enrollment.courseId, 'title');
            this.notificationsService
                .enrollmentStatusChanged(enrollment, course)
                .then()
                .catch(e => {
                return ResponseHandler_1.default.fail(e.message);
            });
        }
        if (learner.emailAddress) {
            const enrollmentData = { totalPaid: Number(enrollment.totalPaid.toFixed(2)).toLocaleString() };
            const mailData = {
                to: learner.emailAddress,
                from: process.env.LEARNER_NOTIFICATION_FROM,
                subject: `You've just been accepted into your Unmudl course!`,
                template: 'learnerAcceptanceMail',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    date: moment(new Date()).format('LL'),
                    learner,
                    course,
                    enrollment: enrollmentData,
                    college: course.collegeId,
                    supportMail: process.env.SUPPORT_MAIL,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.COLLEGE) : null;
        }
        else if (learner.phoneNumber) {
            await config_1.twilioClient.messages.create({
                to: learner.phoneNumber,
                from: process.env.TWILIO_NUMBER,
                body: `This short note is just to let you
        know that ${course.collegeId.title} just accepted you into ${course.title}.  They should be
        reaching out very soon with details on how to connect to the course –
        where and how to show up (if the course is in person) or where and
        how to log in (if the course is online).  Please monitor the email
        address you use for your Unmudl account, so you don’t miss critical
        information.`,
            });
        }
        const collegeAdmin = enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.APPROVED
            ? await this.notificationsService.getUserMails(course.collegeId._id, [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN])
            : [];
        if (collegeAdmin && collegeAdmin.length > 0) {
            for (let i = 0; i < collegeAdmin.length; i++) {
                setTimeout(async () => {
                    const mailData = {
                        to: collegeAdmin[i].emailAddress,
                        from: process.env.PARTNER_NOTIFICATION_FROM,
                        subject: `You've just accepted a new Unmudl learner`,
                        template: 'collegeMailWhenLearnerEnrollmentAccepted',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner,
                            course,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.COLLEGE) : null;
                }, 1000);
            }
        }
        if (enrollment) {
            return ResponseHandler_1.default.success(null, responseMessages_1.default.success.changeEnrollmentStatus(params.status));
        }
        else {
            return ResponseHandler_1.default.fail('Enrollment not found.');
        }
    }
    async suspendLearnerEnrollments(learnerId, collegeId) {
        const pipeline = [];
        pipeline.push(...[
            {
                $match: {
                    learnerId: mongoose.Types.ObjectId(learnerId),
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $addFields: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                },
            },
        ]);
        if (collegeId) {
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        pipeline.push(...[
            {
                $group: {
                    _id: null,
                    ids: { $push: '$_id' },
                },
            },
        ]);
        const response = await this.enrollmentModel.aggregate(pipeline).exec();
        const ids = response.length > 0 ? response[0].ids : [];
        const enrollments = await this.enrollmentModel
            .updateMany({
            _id: {
                $in: ids,
            },
        }, {
            $set: {
                status: 'declined',
            },
        }, { multi: true })
            .exec();
        return ResponseHandler_1.default.success(enrollments, 'Learner enrollments suspended successfully.');
    }
    async getTotalEnrollmentsAndEnrollmentsAllowed(courseId) {
        const course = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    courseId: mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: '$courseId',
                    totalEnrollments: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    totalEnrollments: 1,
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                },
            },
            {
                $project: {
                    totalEnrollments: 1,
                    enrollmentsAllowed: '$course.enrollmentsAllowed',
                    enrollmentDeadline: '$course.enrollmentDeadline',
                    time: '$course.time',
                    date: '$course.date',
                },
            },
        ])
            .exec();
        return ResponseHandler_1.default.success(course);
    }
    async cancelAllEnrollmentsForCourse(courseId) {
        const enrollments = await this.enrollmentModel
            .find({
            courseId,
            status: ['pending', 'approved', 'processed', 'transferred'],
        })
            .populate('learnerId')
            .populate({
            path: 'courseId',
            populate: {
                path: 'collegeId',
            },
        })
            .lean()
            .exec();
        await Promise.all(enrollments.map(async (enrollment) => {
            this.logger.log(`Canceling enrollment: ${enrollment._id}`);
            let outstandingBalance = enrollment.keptByUnmudl ? enrollment.keptByUnmudl + enrollment.stripeFee : enrollment.stripeFee;
            this.logger.log(`Initial outstanding balance: ${outstandingBalance}`);
            this.logger.log(`Enrollment status: ${enrollment.status}`);
            if (enrollment.status === 'transferred' && enrollment.transferId) {
                try {
                    await this.stripeService.reverseTransfer(enrollment.transferId);
                    this.logger.log(`Transfer reversed`);
                }
                catch (e) {
                    outstandingBalance += enrollment.sentToCollege;
                    this.logger.error(`Transfer reverse failed.`);
                    this.logger.error(`Updated outstanding balance: ${outstandingBalance}`);
                }
            }
            let stripeResponse = null;
            try {
                stripeResponse = enrollment.transactionId
                    ? await this.stripeService.refundPaymentToCustomer(enrollment.transactionId)
                    : { data: '' };
                this.logger.log('Payment refunded to learner.');
            }
            catch (e) {
                this.logger.error('Payment refund to learner failed.');
                return ResponseHandler_1.default.fail(e.response.message);
            }
            await this.refundEnrollment(enrollment._id, 'refunded', enrollment.transferId, true);
            if (outstandingBalance > 0 && ['processed', 'transferred'].includes(enrollment.status)) {
                this.logger.log(`Updating college outstanding balance: ${outstandingBalance}, College Id: ${enrollment.courseId.collegeId._id}`);
                await this.collegesService.updateCollegeOutstandingBalance(enrollment.courseId.collegeId._id, outstandingBalance);
            }
            const { data: course } = await this.coursesService.getCourseWithCollegeById(enrollment.courseId);
            if (course.externalCourseId && course.collegeId.orgId) {
                this.logger.log('Updating enrollment on pragya.');
                const learner = await this.learnersService.getLearnerById(enrollment.learnerId);
                try {
                    const { data: { accessToken }, } = await this.externalService.getLmsToken();
                    await this.externalService.cancelLmsEnrollment({
                        userId: learner._id,
                        orgId: course.collegeId.orgId,
                        courseId: course.externalCourseId,
                        courseTitle: course.title,
                        enrollmentId: enrollment._id,
                        type: 'cancel',
                        accessToken,
                    });
                }
                catch (e) { }
            }
            this.logger.log('Enrollment refund complete.');
            return enrollment;
        }));
        return ResponseHandler_1.default.success({ canceledEnrollments: enrollments });
    }
    async getLearnersCount(params) {
        const { collegeId, start, end } = params;
        const match = {};
        if (collegeId) {
            match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
        }
        let count = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(start),
                        $lt: end ? new Date(end) : new Date(),
                    },
                },
            },
            {
                $group: {
                    _id: '$learnerId',
                    course: {
                        $first: '$courseId',
                    },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                },
            },
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ])
            .exec();
        if (count && count.length > 0) {
            count = count[0].count;
        }
        else {
            count = 0;
        }
        return ResponseHandler_1.default.success(count);
    }
    async getRevenueAnalytics(params) {
        let { sort } = params;
        const { collegeId, start, end } = params;
        sort = sort ? -1 : 1;
        const match = {
            status: { $in: ['processed', 'transferred'] },
        };
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(start);
            }
            if (end) {
                match.createdAt.$lte = new Date(end);
            }
        }
        const pipeline = [];
        pipeline.push({
            $match: match,
        });
        pipeline.push({
            $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
            },
        });
        if (collegeId) {
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        pipeline.push({
            $addFields: {
                day: {
                    $dayOfYear: '$createdAt',
                },
                year: {
                    $year: '$createdAt',
                },
            },
        });
        pipeline.push({
            $group: {
                _id: {
                    day: '$day',
                    year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                totalRevenue: { $sum: '$totalRevenue' },
                collegeRevenue: { $sum: '$collegeShare' },
                unmudlShare: { $sum: '$unmudlShare' },
            },
        });
        pipeline.push(...[
            {
                $sort: {
                    revenue: sort,
                },
            },
            {
                $group: {
                    _id: null,
                    createdAt: { $first: '$createdAt' },
                    highestRevenue: { $first: '$collegeRevenue' },
                    highestTotalRevenue: { $first: '$totalRevenue' },
                    highestSharedRevenue: { $first: '$unmudlShare' },
                    totalRevenue: { $sum: '$totalRevenue' },
                    collegeRevenue: { $sum: '$collegeRevenue' },
                    unmudlShare: { $sum: '$unmudlShare' },
                },
            },
        ]);
        const revenue = await this.enrollmentModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(revenue.length > 0 ? revenue[0] : {});
    }
    async getCourseDropAnalytics(params) {
        const { collegeId, start, end } = params;
        const match = {};
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(start);
            }
            if (end) {
                match.createdAt.$lte = new Date(end);
            }
        }
        const pipeline = [];
        pipeline.push({
            $match: match,
        });
        if (collegeId) {
            pipeline.push({
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            });
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        pipeline.push({
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        });
        const revenue = await this.enrollmentModel.aggregate(pipeline).exec();
        let totalEnrollments = 0;
        let droppedEnrollments = 0;
        for (let i = 0; i < revenue.length; i++) {
            totalEnrollments += revenue[i].count;
            if (['canceled', 'refunded'].includes(revenue[i]._id)) {
                droppedEnrollments += revenue[i].count;
            }
        }
        return ResponseHandler_1.default.success(totalEnrollments > 0 ? (droppedEnrollments / totalEnrollments) * 100 : 0);
    }
    async getRevenueAnalyticsForGraph(params) {
        const { collegeId, start, end, interval } = params;
        const match = {};
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(moment(start)
                    .startOf('d')
                    .toISOString());
            }
            if (end) {
                match.createdAt.$lte = new Date(moment(end)
                    .endOf('d')
                    .toISOString());
            }
        }
        const pipeline = [];
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
        ]);
        if (collegeId) {
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        switch (interval) {
            case 1:
                pipeline.push({
                    $addFields: {
                        day: {
                            $dayOfYear: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            day: '$day',
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        revenue: { $sum: '$totalRevenue' },
                    },
                });
                break;
            case 30:
                pipeline.push({
                    $addFields: {
                        month: {
                            $month: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            month: '$month',
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        revenue: { $sum: '$totalRevenue' },
                    },
                });
                break;
            case 365:
                pipeline.push({
                    $addFields: {
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        revenue: { $sum: '$totalRevenue' },
                    },
                });
                break;
        }
        pipeline.push({
            $sort: {
                revenue: -1,
            },
        });
        const revenue = await this.enrollmentModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(revenue);
    }
    async getLearnersGrowth(params) {
        const { collegeId, start, end, interval } = params;
        const match = {};
        if (collegeId) {
            match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
        }
        const pipeline = [];
        const createdAt = {};
        if (start || end) {
            if (start) {
                createdAt.$gte = new Date(moment(start)
                    .startOf('d')
                    .toISOString());
            }
            if (end) {
                createdAt.$lt = new Date(moment(end)
                    .endOf('d')
                    .toISOString());
            }
        }
        pipeline.push(...[
            {
                $group: {
                    _id: '$learnerId',
                    course: {
                        $first: '$courseId',
                    },
                    createdAt: {
                        $first: '$createdAt',
                    },
                },
            },
            {
                $match: {
                    createdAt,
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                    createdAt: 1,
                },
            },
            {
                $match: match,
            },
        ]);
        switch (interval) {
            case 1:
                pipeline.push({
                    $addFields: {
                        day: {
                            $dayOfYear: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            day: '$day',
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                break;
            case 30:
                pipeline.push({
                    $addFields: {
                        month: {
                            $month: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            month: '$month',
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                break;
            case 365:
                pipeline.push({
                    $addFields: {
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                break;
        }
        pipeline.push({
            $sort: {
                createdAt: 1,
            },
        });
        const growth = await this.enrollmentModel.aggregate(pipeline).exec();
        const rows = await this.getLearnersGrowthCount(params);
        return ResponseHandler_1.default.success({
            growth,
            rows: rows.data,
        });
    }
    async getLearnersGrowthCsv(params) {
        const { collegeId, start, end, interval } = params;
        const match = {};
        if (collegeId) {
            match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
        }
        const pipeline = [];
        const createdAt = {};
        if (start || end) {
            if (start) {
                createdAt.$gte = new Date(start);
            }
            if (end) {
                createdAt.$lt = new Date(end);
            }
        }
        pipeline.push(...[
            {
                $match: {
                    createdAt,
                },
            },
            {
                $group: {
                    _id: '$learnerId',
                    course: {
                        $first: '$courseId',
                    },
                    createdAt: {
                        $first: '$createdAt',
                    },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                    createdAt: 1,
                },
            },
            {
                $match: match,
            },
        ]);
        const fields = [];
        switch (interval) {
            case 1:
                pipeline.push({
                    $addFields: {
                        day: { $dayOfYear: '$createdAt' },
                        year: { $year: '$createdAt' },
                        dateStr: { $dateToString: { format: '%m-%d-%Y', date: '$createdAt' } },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            day: '$day',
                            year: '$year',
                        },
                        Date: { $first: '$dateStr' },
                        'No of Learners': { $sum: 1 },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                fields.push('Date');
                break;
            case 30:
                pipeline.push({
                    $addFields: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            month: '$month',
                            year: '$year',
                        },
                        Month: { $first: { $concat: ['$month', ' - ', '$year'] } },
                        'No of Learners': { $sum: 1 },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                fields.push('Month');
                break;
            case 365:
                pipeline.push({
                    $addFields: {
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: { year: '$year' },
                        Year: { $first: '$year' },
                        'No of Learners': { $sum: 1 },
                        createdAt: { $first: '$createdAt' },
                    },
                });
                fields.push('Year');
                break;
        }
        pipeline.push({
            $sort: {
                createdAt: 1,
            },
        });
        fields.push('No of Learners');
        const growth = await this.enrollmentModel.aggregate(pipeline).exec();
        return json2csv.parse(growth, { fields });
    }
    async getLearnersGrowthCount(params) {
        const { collegeId, start, end, interval } = params;
        const match = {};
        if (collegeId) {
            match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
        }
        const pipeline = [];
        const createdAt = {};
        if (start || end) {
            if (start) {
                createdAt.$gte = new Date(start);
            }
            if (end) {
                createdAt.$lt = new Date(end);
            }
        }
        pipeline.push(...[
            {
                $match: {
                    createdAt,
                },
            },
            {
                $group: {
                    _id: '$learnerId',
                    course: {
                        $first: '$courseId',
                    },
                    createdAt: {
                        $first: '$createdAt',
                    },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                    createdAt: 1,
                },
            },
            {
                $match: match,
            },
        ]);
        switch (interval) {
            case 1:
                pipeline.push({
                    $addFields: {
                        day: {
                            $dayOfYear: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            day: '$day',
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                });
                break;
            case 30:
                pipeline.push({
                    $addFields: {
                        month: {
                            $month: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            month: '$month',
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                });
                break;
            case 365:
                pipeline.push({
                    $addFields: {
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            year: '$year',
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                });
                break;
        }
        pipeline.push({
            $group: {
                _id: null,
                rows: { $sum: 1 },
            },
        });
        const rows = await this.enrollmentModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(rows.length > 0 ? rows[0].rows : 0);
    }
    async getLearnersCourseEnrollment(learnerId, courseId) {
        const enrollments = await this.enrollmentModel
            .find({
            courseId,
            learnerId,
            status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return enrollments[0] ? enrollments[0] : null;
    }
    async getLearnersInCSV(params) {
        const match = {
            Name: {
                $regex: params.keyword,
                $options: 'i',
            },
        };
        if (params.collegeId) {
            match.collegeId = params.collegeId;
        }
        const learners = await this.enrollmentModel
            .aggregate([
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $group: {
                    _id: '$learnerId',
                    course: {
                        $first: '$courseId',
                    },
                    createdAt: {
                        $first: '$createdAt',
                    },
                },
            },
            {
                $lookup: {
                    from: 'learners',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $project: {
                    course: {
                        $arrayElemAt: ['$course', 0],
                    },
                    learner: {
                        $arrayElemAt: ['$learner', 0],
                    },
                    createdAt: 1,
                },
            },
            {
                $project: {
                    Course: '$course.title',
                    collegeId: '$course.collegeId',
                    Name: '$learner.fullname',
                    Email: '$learner.email',
                    Location: '$learner.location',
                    createdAt: 1,
                },
            },
            {
                $match: match,
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $addFields: {
                    'Application Date': {
                        $dateToString: { format: '%m-%d-%Y', date: '$createdAt' },
                    },
                },
            },
        ])
            .exec();
        const fields = ['Course', 'Name', 'Email', 'Location', 'Application Date'];
        return json2csv.parse(learners, { fields });
    }
    async getEnrollmentById(id) {
        const enrollment = await this.enrollmentModel.findById(id).lean();
        return ResponseHandler_1.default.success(enrollment);
    }
    async refundEnrollment(id, status, transferId = null, courseCanceled = false) {
        let enrollment = await this.enrollmentModel.findById(id).exec();
        const totalRevenue = enrollment.totalRevenue;
        const unmudlShare = enrollment.unmudlShare;
        const collegeShare = enrollment.collegeShare;
        const prevStatus = enrollment.status;
        const stripeFee = enrollment.stripeFee;
        enrollment.totalRevenue = courseCanceled && ['processed', 'transferred'].includes(prevStatus) ? -1 * stripeFee : 0;
        enrollment.unmudlShare = 0;
        enrollment.collegeShare = courseCanceled && ['processed', 'transferred'].includes(prevStatus) ? -1 * stripeFee : 0;
        enrollment.discountTotal = 0;
        enrollment.salesTax = 0;
        enrollment.totalPaid = 0;
        enrollment.stripeFee = 0;
        enrollment.status = status;
        enrollment = await enrollment.save();
        if (enrollment.status === 'refunded' && ['processed', 'transferred'].includes(prevStatus)) {
            await this.updateRevenueInfo({
                totalRevenue: -1 * (totalRevenue + (courseCanceled ? stripeFee : 0)),
                unmudlShare: -1 * unmudlShare,
                collegeShare: -1 * (collegeShare + (courseCanceled ? stripeFee : 0)),
                courseId: enrollment.courseId,
                learnerId: enrollment.learnerId,
            });
        }
        return ResponseHandler_1.default.success(enrollment);
    }
    async updateEnrollmentStatus(id, status) {
        const enrollment = await this.enrollmentModel
            .findByIdAndUpdate(id, {
            $set: { status },
        }, { new: true })
            .lean();
        return ResponseHandler_1.default.success(enrollment);
    }
    async updateTransferStatus(id, status, transferId, destPaymentId, sentToCollege = 0) {
        const enrollment = await this.enrollmentModel
            .findByIdAndUpdate(id, {
            $set: { status, transferId, destPaymentId, sentToCollege },
        }, { new: true })
            .lean();
        return ResponseHandler_1.default.success(enrollment);
    }
    async setTransferStatus(id, status) {
        const enrollment = await this.enrollmentModel
            .findByIdAndUpdate(id, {
            $set: { status },
        }, { new: true })
            .lean();
        return ResponseHandler_1.default.success(enrollment);
    }
    async incrementChargeAttempt(id) {
        const enrollment = await this.enrollmentModel.findByIdAndUpdate(id, { $inc: { chargeAttempts: 1 } }, { new: true }).lean();
        return ResponseHandler_1.default.success(enrollment);
    }
    async updateRevenueInfo({ totalRevenue, unmudlShare, collegeShare, courseId, learnerId }) {
        const course = await this.courseModel
            .findByIdAndUpdate(courseId, {
            $inc: {
                unmudlRevenue: unmudlShare,
                collegeRevenue: collegeShare,
                totalRevenue,
            },
        }, { new: true })
            .lean();
        const learner = await this.learnerModel
            .findByIdAndUpdate(learnerId, {
            $inc: {
                unmudlRevenue: unmudlShare,
                collegeRevenue: collegeShare,
                totalRevenue,
            },
        }, { new: true })
            .lean();
        const college = await this.collegeModel
            .findByIdAndUpdate(course.collegeId, {
            $inc: {
                unmudlRevenue: unmudlShare,
                collegeRevenue: collegeShare,
                totalRevenue,
            },
        }, { new: true })
            .lean();
        const instructors = await Promise.all(course.instructorIds.map(id => {
            return this.userModel
                .findByIdAndUpdate(id, {
                $inc: {
                    unmudlRevenue: unmudlShare,
                    collegeRevenue: collegeShare,
                    totalRevenue,
                },
            }, { new: true })
                .lean();
        }));
        return {
            course,
            learner,
            college,
            instructors,
        };
    }
    async CaptureChargedAmountFromCustomer() {
        const captureDelay = Number(config_1.CAPTURE_DELAY);
        let enrollments = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    status: {
                        $in: ['pending', 'approved'],
                    },
                },
            },
            {
                $project: {
                    status: 1,
                    chargeAttempts: 1,
                    createdAt: 1,
                    transactionId: 1,
                    hour: { $hour: '$createdAt' },
                    day: { $dayOfWeek: '$createdAt' },
                },
            },
            {
                $addFields: {
                    checkDate: {
                        $add: [
                            '$createdAt',
                            {
                                $multiply: [
                                    1000 * 60 * 60,
                                    {
                                        $add: [
                                            captureDelay,
                                            {
                                                $switch: {
                                                    branches: [
                                                        { case: { $eq: ['$day', 1] }, then: { $subtract: [24, '$hour'] } },
                                                        {
                                                            case: { $eq: ['$day', 2] },
                                                            then: {
                                                                $cond: {
                                                                    if: { $gt: [{ $subtract: [captureDelay, { $subtract: [24, '$hour'] }] }, 24 * 4] },
                                                                    then: 48,
                                                                    else: 0,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            case: { $eq: ['$day', 3] },
                                                            then: {
                                                                $cond: {
                                                                    if: { $gt: [{ $subtract: [captureDelay, { $subtract: [24, '$hour'] }] }, 24 * 3] },
                                                                    then: 48,
                                                                    else: 0,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            case: { $eq: ['$day', 4] },
                                                            then: {
                                                                $cond: {
                                                                    if: { $gt: [{ $subtract: [captureDelay, { $subtract: [24, '$hour'] }] }, 24 * 2] },
                                                                    then: 48,
                                                                    else: 0,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            case: { $eq: ['$day', 5] },
                                                            then: {
                                                                $cond: {
                                                                    if: { $gt: [{ $subtract: [captureDelay, { $subtract: [24, '$hour'] }] }, 24] },
                                                                    then: 48,
                                                                    else: 0,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            case: { $eq: ['$day', 6] },
                                                            then: {
                                                                $cond: {
                                                                    if: { $gt: [{ $subtract: [captureDelay, { $subtract: [24, '$hour'] }] }, 0] },
                                                                    then: 48,
                                                                    else: 0,
                                                                },
                                                            },
                                                        },
                                                        { case: { $eq: ['$day', 7] }, then: { $add: [24, { $subtract: [24, '$hour'] }] } },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $match: {
                    checkDate: {
                        $lte: new Date(),
                    },
                },
            },
        ])
            .exec();
        await Promise.all(enrollments.map(async (enrollment) => {
            if (enrollment.transactionId) {
                try {
                    const enrollmentDb = await this.enrollmentModel
                        .findById(enrollment._id)
                        .populate('learnerId')
                        .populate({
                        path: 'courseId',
                        populate: {
                            path: 'collegeId',
                        },
                    })
                        .lean();
                    const charge = await this.stripeService.capturePaymentFromCustomer(enrollment.transactionId);
                    const updatedEnrollment = await this.updateEnrollmentStatus(enrollment._id, 'processed');
                    await this.updateRevenueInfo(updatedEnrollment.data);
                    this.logger.log(`Captured enrollment (${enrollment._id}) payment with transaction Id ${enrollment.transactionId}.`);
                    if (enrollment.status === 'pending') {
                        const enrollmentData = { totalPaid: Number(enrollment.totalPaid.toFixed(2)).toLocaleString() };
                        const mailData = {
                            to: enrollmentDb.learnerId.emailAddress,
                            from: process.env.LEARNER_NOTIFICATION_FROM,
                            subject: `You've just been accepted into your Unmudl course!`,
                            template: 'learnerAcceptanceMail',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                learner: enrollmentDb.learnerId,
                                course: enrollmentDb.courseId,
                                enrollment: enrollmentData,
                                college: enrollmentDb.courseId.collegeId,
                                supportMail: process.env.SUPPORT_MAIL,
                            },
                        };
                        const mail = await this.mailerService.sendMail(mailData);
                        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.COLLEGE) : null;
                    }
                    const mailData = {
                        to: enrollmentDb.learnerId.emailAddress,
                        from: process.env.LEARNER_NOTIFICATION_FROM,
                        subject: 'UNMUDL Notification',
                        template: 'learnerMailOnCardCharge',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner: enrollmentDb.learnerId,
                            enrollment: Number(enrollmentDb.totalPaid.toFixed(2)).toLocaleString(),
                            course: enrollmentDb.courseId,
                            college: enrollmentDb.courseId.collegeId,
                            supportMail: process.env.SUPPORT_MAIL,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
                    return {
                        charge: charge.data,
                        enrollment: updatedEnrollment.data,
                    };
                }
                catch (e) {
                    this.logger.error(e.response && e.response.message ? e.response.message : e.message);
                    if (e.response && e.response.status === 403) {
                        if (enrollment.chargeAttempts >= 3) {
                            await this.updateEnrollmentStatus(enrollment._id, 'canceled');
                        }
                        else {
                            await this.incrementChargeAttempt(enrollment._id);
                        }
                    }
                }
            }
            else {
            }
        }));
        enrollments = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    status: 'processed',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'course.collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $project: {
                    status: 1,
                    createdAt: 1,
                    transactionId: 1,
                    transferId: 1,
                    destPaymentId: 1,
                    collegeShare: 1,
                    learnerId: 1,
                    college: { $arrayElemAt: ['$college', 0] },
                    course: { $arrayElemAt: ['$course', 0] },
                    hour: { $hour: '$createdAt' },
                    day: { $dayOfWeek: '$createdAt' },
                },
            },
            {
                $addFields: {
                    checkDate: {
                        $add: ['$createdAt', 1000 * 60 * 60 * captureDelay],
                    },
                },
            },
            {
                $match: {
                    checkDate: {
                        $lte: new Date(),
                    },
                },
            },
        ])
            .exec();
        await Promise.all(enrollments.map(async (enrollment) => {
            try {
                if (enrollment.college && enrollment.college.stripeId) {
                    if (!enrollment.transferId && !enrollment.destPaymentId) {
                        const transferDescription = `Unmudl Transfer: ${enrollment.course.title}`;
                        enrollment.college.payableToUnmudl = enrollment.college.payableToUnmudl ? enrollment.college.payableToUnmudl : 0;
                        const sendingToCollege = enrollment.collegeShare > enrollment.college.payableToUnmudl
                            ? enrollment.collegeShare - enrollment.college.payableToUnmudl
                            : 1;
                        const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(enrollment.college.stripeId, Math.floor(sendingToCollege * 100), enrollment.transactionId, transferDescription);
                        await this.updateTransferStatus(enrollment._id, 'transferred', transfer.id, transfer.destination_payment, sendingToCollege);
                        if (enrollment.college.payableToUnmudl > 0) {
                            await this.collegesService.updateCollegeOutstandingBalance(enrollment.college._id, -1 * (enrollment.collegeShare - sendingToCollege));
                            await this.enrollmentModel.findByIdAndUpdate(enrollment._id, {
                                $set: {
                                    keptByUnmudl: enrollment.collegeShare - sendingToCollege,
                                    sentToCollege: sendingToCollege,
                                },
                            });
                        }
                        return transfer;
                    }
                    else {
                        await this.setTransferStatus(enrollment._id, 'transferred');
                        return null;
                    }
                }
                else {
                }
            }
            catch (e) {
                this.logger.error(e.response && e.response.message ? e.response.message : e.message);
            }
        }));
    }
    async TransferPaymentsToCollege() {
        const transferDelay = Number(config_1.TRANSFER_DELAY);
        const enrollments = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    status: 'processed',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'course.collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $project: {
                    status: 1,
                    createdAt: 1,
                    transactionId: 1,
                    transferId: 1,
                    destPaymentId: 1,
                    collegeShare: 1,
                    college: { $arrayElemAt: ['$college', 0] },
                    course: { $arrayElemAt: ['$course', 0] },
                    hour: { $hour: '$createdAt' },
                    day: { $dayOfWeek: '$createdAt' },
                },
            },
            {
                $addFields: {
                    checkDate: {
                        $add: ['$createdAt', 1000 * 60 * 60 * transferDelay],
                    },
                },
            },
            {
                $match: {
                    checkDate: {
                        $lte: new Date(),
                    },
                },
            },
        ])
            .exec();
        await Promise.all(enrollments.map(async (enrollment) => {
            try {
                if (enrollment.college && enrollment.college.stripeId) {
                    if (!enrollment.transferId && !enrollment.destPaymentId) {
                        const transferDescription = `Unmudl Transfer: ${enrollment.course.title}`;
                        const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(enrollment.college.stripeId, Math.floor(enrollment.collegeShare * 100), enrollment.transactionId, transferDescription);
                        await this.updateTransferStatus(enrollment._id, 'transferred', transfer.id, transfer.destination_payment);
                        return transfer;
                    }
                    else {
                        await this.setTransferStatus(enrollment._id, 'transferred');
                        return null;
                    }
                }
            }
            catch (e) {
                this.logger.error(e.response && e.response.message ? e.response.message : e.message);
            }
        }));
    }
    async CaptureChargedAmountFromCustomerManually() {
        const enrollments = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    status: {
                        $in: ['pending', 'approved'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'course.collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $project: {
                    status: 1,
                    chargeAttempts: 1,
                    createdAt: 1,
                    transactionId: 1,
                    collegeShare: 1,
                    hour: { $hour: '$createdAt' },
                    day: { $dayOfWeek: '$createdAt' },
                    course: { $arrayElemAt: ['$course', 0] },
                    college: { $arrayElemAt: ['$college', 0] },
                },
            },
        ])
            .exec();
        const nonStripeColleges = [];
        await Promise.all(enrollments.map(async (enrollment) => {
            try {
                const charge = await this.stripeService.capturePaymentFromCustomer(enrollment.transactionId);
                let updatedEnrollment = await this.updateEnrollmentStatus(enrollment._id, 'processed');
                await this.updateRevenueInfo(updatedEnrollment.data);
                this.logger.log(`Captured enrollment (${enrollment._id}) payment with transaction Id ${enrollment.transactionId}.`);
                const transferDescription = `Unmudl Transfer: ${enrollment.course.title}`;
                if (enrollment.college.stripeId) {
                    const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(enrollment.college.stripeId, Math.floor(enrollment.collegeShare * 100), enrollment.transactionId, transferDescription);
                    this.logger.log(`Transferred $${enrollment.collegeShare.toFixed(2)} to college ${enrollment.college._id} for enrollment
              (${enrollment._id}) with transaction id ${enrollment.transactionId}.`);
                    updatedEnrollment = await this.updateTransferStatus(enrollment._id, 'transferred', transfer.id, transfer.destination_payment);
                    return {
                        charge: charge.data,
                        enrollment: updatedEnrollment.data,
                    };
                }
                else {
                    nonStripeColleges.push(enrollment.college);
                }
            }
            catch (e) {
                this.logger.error(e.response && e.response.message ? e.response.message : e.message);
                if (e.response.status === 403) {
                    if (enrollment.chargeAttempts >= 3) {
                        await this.updateEnrollmentStatus(enrollment._id, 'canceled');
                    }
                    else {
                        await this.incrementChargeAttempt(enrollment._id);
                    }
                }
            }
        }));
        return {
            nonStripeColleges,
            enrollments: enrollments.length,
        };
    }
    async getCourseEnrollmentsCount(courseId) {
        const status = [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED];
        return await this.enrollmentModel.countDocuments({ numId: courseId, status: { $in: status } });
    }
    async getEnrolledLearnerDetails(enrollmentId) {
        return await this.enrollmentModel.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(enrollmentId) },
            },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'learnerId',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: '$learner' },
            {
                $lookup: {
                    from: 'enrollments',
                    let: { learnerId: '$learner._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$learnerId', '$$learnerId'] },
                                        { $in: ['$status', [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED]] },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                        { $project: { courseId: 1 } },
                        {
                            $lookup: {
                                from: 'courses',
                                localField: 'courseId',
                                foreignField: '_id',
                                as: 'course',
                            },
                        },
                        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
                    ],
                    as: 'prevEnrollment',
                },
            },
            { $unwind: { path: '$prevEnrollment', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
            {
                $lookup: {
                    from: 'enrollments',
                    let: { courseId: '$course._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$courseId', '$$courseId'] },
                                        { $in: ['$status', [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED]] },
                                    ],
                                },
                            },
                        },
                        { $project: { courseId: 1 } },
                    ],
                    as: 'courseEnrollment',
                },
            },
            {
                $project: {
                    'learner.profilePhoto': 1,
                    'learner.profilePhotoThumbnail': 1,
                    'learner.fullname': 1,
                    promoApplied: { $cond: { if: { $ne: ['$promoId', null] }, then: true, else: false } },
                    transactionAmount: '$totalPaid',
                    'learner.emailAddress': 1,
                    'learner.phoneNumber': 1,
                    'learner.location': { $concat: ['$learner.city', ', ', '$learner.country'] },
                    'learner.veteranBenefits': 1,
                    'leraner.militaryStatus': 1,
                    'leraner.isSpouseActive': 1,
                    'leraner.militaryBenefit': 1,
                    'learner.wioaBenefits': 1,
                    previousCourseBought: '$prevEnrollment.course.title',
                    learnerData: 1,
                    'course._id': 1,
                    'course.title': 1,
                    'course.enrollmentsAllowed': 1,
                    'course.enrollmentDeadline': 1,
                    'course.eligibilityRestriction': 1,
                    'course.remainingSeats': { $subtract: ['$course.enrollmentsAllowed', { $size: '$courseEnrollment' }] },
                },
            },
        ]);
    }
    async checkEnrollmentDeadline(cart) {
        const courseIds = cart.map(course => mongoose.Types.ObjectId(course.course));
        return await this.courseModel
            .find({ _id: { $in: courseIds }, enrollmentDeadline: { $lte: new Date() } }, 'title')
            .lean()
            .exec();
    }
    async getRecentEnrollmentData(collegeId, learnerId) {
        const enrollments = await this.enrollmentModel
            .aggregate([
            { $match: { learnerId: mongoose.Types.ObjectId(learnerId) } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $match: { 'course.collegeId': mongoose.Types.ObjectId(collegeId) } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'learnerId',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: '$learner' },
            {
                $addFields: {
                    'learner.studentId': '$learnerData.studentId',
                    'learner.hasStudentId': '$learnerData.hasStudentId',
                    'learner.name': '$learner.fullname',
                },
            },
            {
                $project: {
                    'learner.name': 1,
                    'learner.firstname': 1,
                    'learner.lastname': 1,
                    'learner.emailAddress': 1,
                    'learner.phoneNumber': 1,
                    'learner.streetAddress': 1,
                    'learner.dateOfBirth': { $dateToString: { format: '%m-%d-%Y', date: '$learner.dateOfBirth' } },
                    'learner.hasStudentId': 1,
                    'learner.studentId': 1,
                    'learner.address': 1,
                    'learner.coordinates': 1,
                    'learner.city': 1,
                    'learner.state': 1,
                    'learner.country': 1,
                    'learner.zip': 1,
                    'learner.veteranBenefits': 1,
                    'learner.militaryStatus': 1,
                    'learner.isSpouseActive': 1,
                    'learner.militaryBenefit': 1,
                    'learner.wioaBenefits': 1,
                },
            },
        ])
            .exec();
        if (!enrollments || (enrollments && enrollments.length < 1)) {
            const learner = await this.learnerModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(learnerId) } },
                {
                    $project: {
                        name: '$fullname',
                        firstname: 1,
                        lastname: 1,
                        emailAddress: 1,
                        phoneNumber: 1,
                        streetAddress: 1,
                        dateOfBirth: { $dateToString: { format: '%m-%d-%Y', date: '$dateOfBirth' } },
                        address: 1,
                        coordinates: 1,
                        city: 1,
                        state: 1,
                        country: 1,
                        zip: 1,
                    },
                },
            ]);
            learner[0].studentId = null;
            learner[0].hasStudentId = false;
            return ResponseHandler_1.default.success(learner[0]);
        }
        const enrollment = enrollments[0];
        return ResponseHandler_1.default.success(enrollment.learner);
    }
    async updateLearner(learnerData, learner) {
        if (learnerData.emailAddress) {
            const existingLearner = await this.learnerModel
                .findOne({ emailAddress: learnerData.emailAddress, _id: { $ne: learner._id } }, '_id')
                .lean()
                .exec();
            if (existingLearner) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.emailRegistered);
            }
        }
        if (learnerData.phoneNumber) {
            const existingLearner = await this.learnerModel
                .findOne({ phoneNumber: learnerData.phoneNumber, _id: { $ne: learner._id } }, '_id')
                .lean()
                .exec();
            if (existingLearner) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.phoneNumberRegistered);
            }
        }
        const update = {};
        learnerData.phoneNumber && learner.primarySignup !== 'phoneNumber'
            ? (update.phoneNumber = learnerData.phoneNumber)
            : (learnerData.phoneNumber = learnerData.phoneNumber);
        learnerData.emailAddress && learner.primarySignup !== 'emailAddress'
            ? (update.emailAddress = learnerData.emailAddress)
            : (learnerData.emailAddress = learnerData.emailAddress);
        learnerData.firstname ? (update.firstname = learnerData.firstname) : (learnerData.firstname = learnerData.firstname);
        learnerData.lastname ? (update.lastname = learnerData.lastname) : (learnerData.lastname = learnerData.lastname);
        learnerData.fullname
            ? (update.fullname = learnerData.firstname + ' ' + learnerData.lastname)
            : (learnerData.firstname = learnerData.firstname);
        learnerData.dateOfBirth ? (update.dateOfBirth = learnerData.dateOfBirth) : (learnerData.dateOfBirth = learnerData.dateOfBirth);
        learnerData.address ? (update.address = learnerData.address) : (learnerData.address = learnerData.address);
        learnerData.gender ? (update.gender = learnerData.gender) : (learnerData.gender = learnerData.gender);
        learnerData.city ? (update.city = learnerData.city) : (learnerData.city = learnerData.city);
        learnerData.state ? (update.state = learnerData.state) : (learnerData.state = learnerData.state);
        learnerData.zip ? (update.zip = learnerData.zip) : (learnerData.zip = learnerData.zip);
        learnerData.country ? (update.country = learnerData.country) : (learnerData.country = learnerData.country);
        learnerData.coordinates ? (update.coordinates = learnerData.coordinates) : (learnerData.coordinates = learnerData.coordinates);
        learnerData.veteranBenefits !== undefined
            ? (update.veteranBenefits = learnerData.veteranBenefits)
            : (learnerData.veteranBenefits = learnerData.veteranBenefits);
        learnerData.militaryStatus
            ? (update.militaryStatus = learnerData.militaryStatus)
            : (learnerData.militaryStatus = learnerData.militaryStatus);
        learnerData.isSpouseActive !== undefined
            ? (update.isSpouseActive = learnerData.isSpouseActive)
            : (learnerData.isSpouseActive = learnerData.isSpouseActive);
        learnerData.militaryBenefit
            ? (update.militaryBenefit = learnerData.militaryBenefit)
            : (learnerData.militaryBenefit = learnerData.militaryBenefit);
        learnerData.wioaBenefits !== undefined
            ? (update.wioaBenefits = learnerData.wioaBenefits)
            : (learnerData.wioaBenefits = learnerData.wioaBenefits);
        return await this.learnerModel.findOneAndUpdate({
            _id: learner._id,
        }, update, {
            new: true,
        });
    }
    async getCourseDetails(courseIdDto, user) {
        const [course, enrollmentsCount, ratings] = await Promise.all([
            this.coursesService.getCourseDetailsForEnrollments(courseIdDto.courseId),
            this.getCourseEnrollmentsCount(courseIdDto.courseId),
            this.coursesService.getRatingsById(courseIdDto.courseId, true),
        ]);
        course.isReviewed = false;
        if (user && course.reviews && course.reviews.length > 0) {
            if (course.reviews.find(elem => elem.learner._id.toString() === user._id.toString())) {
                course.isReviewed = true;
            }
        }
        course.reviewsCount = course.reviews.length;
        course.reviews.splice(2);
        if (course.time && course.time[0]) {
            course.time[0].hours = moment(course.time[0].end).diff(moment(course.time[0].start), 'hours');
        }
        let prevRatings = null;
        if (course && course.reviews.length < 1 && course.followUpCourseId && course.followUpCourseId._id) {
            prevRatings = await this.coursesService.getRatingsById(course.followUpCourseId.numId, true);
            course.followUpCourseId.reviewsCount = course.followUpCourseId.reviews.length;
            course.followUpCourseId.reviews.splice(2);
        }
        let enrollmentStatus = null;
        let enrollmentId = null;
        course.availableSlots = course.enrollmentsAllowed - enrollmentsCount;
        course.coursePrice = course.price + (course.collegeId.unmudlShare / 100) * course.price;
        course.totalPrice = course.coursePrice;
        delete course.price;
        const instructorRating = course.instructorIds[0] ? await this.coursesService.getInstructorRatings(course.instructorIds[0]._id) : null;
        course.instructor = course.instructorIds[0];
        delete course.instructorIds;
        if (course.instructor) {
            course.instructor.rating = instructorRating ? instructorRating.rating : null;
            course.instructor.reviewsCount = instructorRating ? instructorRating.reviewsCount : 0;
        }
        if (user) {
            const [learnersEnrollments, learner, enquiry] = await Promise.all([
                this.getLearnersCourseEnrollment(user._id, course._id),
                this.learnersService.getLearnerByEmail(user.emailAddress),
                this.enquiriesService.getLearnersEnquiry(user._id, course._id),
            ]);
            enrollmentStatus = learnersEnrollments ? learnersEnrollments.status : null;
            enrollmentId = learnersEnrollments ? learnersEnrollments._id : null;
            course.isInCart = learner.cart.some(cart => cart.course.toString() === course._id.toString());
            course.isInWishList = learner.wishList.some(wishList => wishList.course.toString() === course._id.toString());
            course.enquiry = enquiry ? enquiry._id : null;
        }
        course.enrollmentStatus = enrollmentStatus;
        course.enrollmentId = enrollmentId;
        course.ratingDetails = prevRatings ? prevRatings : ratings;
        course.college = course.collegeId;
        delete course.collegeId;
        if (user) {
            try {
                const learner = await this.learnersService.getLearnerById(user._id);
                const response = await this.coursesService.getTaxForLearner(course, learner);
                const salesTax = response.data ? response.data : 0;
                course.salesTax = salesTax.toFixed(2);
                course.totalPriceWithTax = course.coursePrice + (salesTax / 100) * course.coursePrice;
            }
            catch (e) {
                course.salesTax = 0;
                course.totalPriceWithTax = course.coursePrice;
                return ResponseHandler_1.default.success({
                    course,
                }, e.response.message);
            }
        }
        return course
            ? ResponseHandler_1.default.success({
                course,
            })
            : ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidCourseId);
    }
    async transferPaymentToCollegeAgainstEnrollment(transferPaymentDto) {
        const enrollment = await this.enrollmentModel
            .findById(transferPaymentDto.enrollmentId)
            .populate({
            path: 'courseId',
            populate: {
                path: 'collegeId',
            },
        })
            .exec();
        if (!enrollment) {
            return ResponseHandler_1.default.fail('Enrollment not found.');
        }
        if (!enrollment.courseId.collegeId.stripeId) {
            return ResponseHandler_1.default.fail('College stripe id missing.');
        }
        if (enrollment.sentToCollege === 1 && !enrollment.courseId.collegeId.payableToUnmudl) {
            try {
                const transferDescription = `Unmudl Transfer: ${enrollment.courseId.title}`;
                const { data: transfer } = await this.stripeService.createTransferOnConnectAccount(enrollment.courseId.collegeId.stripeId, Math.floor(transferPaymentDto.amount * 100), enrollment.transactionId, transferDescription);
                enrollment.transferId = transfer.id;
                enrollment.destPaymentId = transfer.destination_payment;
                enrollment.sentToCollege += transferPaymentDto.amount;
                enrollment.keptByUnmudl =
                    enrollment.keptByUnmudl - transferPaymentDto.amount > 0 ? enrollment.keptByUnmudl - transferPaymentDto.amount : 0;
                await enrollment.save();
                return ResponseHandler_1.default.success(enrollment);
            }
            catch (e) {
                return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message ? e.message : e);
            }
        }
        else {
            return ResponseHandler_1.default.fail('This enrollment went fine. You cannot modify this enrollment.');
        }
    }
};
EnrollmentsService = EnrollmentsService_1 = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('enrollments')),
    __param(1, mongoose_1.InjectModel('learners')),
    __param(2, mongoose_1.InjectModel('promos')),
    __param(3, mongoose_1.InjectModel('courses')),
    __param(4, mongoose_1.InjectModel('users')),
    __param(5, mongoose_1.InjectModel('colleges')),
    __param(6, mongoose_1.InjectModel('gift-course')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, stripe_service_1.StripeService,
        notifications_service_1.NotificationsService,
        mailer_1.MailerService,
        courses_service_1.CoursesService,
        colleges_service_1.CollegesService,
        activities_service_1.ActivitiesService,
        external_service_1.ExternalService,
        learners_service_1.LearnersService,
        enquiries_service_1.EnquiriesService,
        email_logs_service_1.EmailLogsService])
], EnrollmentsService);
exports.EnrollmentsService = EnrollmentsService;
//# sourceMappingURL=enrollments.service.js.map