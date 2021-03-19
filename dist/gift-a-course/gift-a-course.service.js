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
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const enrollmentStatus_enum_1 = require("../common/enums/enrollmentStatus.enum");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const mongoose = require("mongoose");
const mailer_1 = require("@nest-modules/mailer");
const moment = require("moment");
const courses_service_1 = require("../courses/courses.service");
const stripe_service_1 = require("../stripe/stripe.service");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const functions_1 = require("../common/functions");
const promos_service_1 = require("../promos/promos.service");
const createPromo_enum_1 = require("../common/enums/createPromo.enum");
const courses_model_1 = require("../courses/courses.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
let GiftACourseService = class GiftACourseService {
    constructor(giftCourseModel, enrollmentModel, courseModel, learnerModel, userModel, promoModel, enrollmentsService, mailerService, coursesService, stripeService, promosService, emailLogsService) {
        this.giftCourseModel = giftCourseModel;
        this.enrollmentModel = enrollmentModel;
        this.courseModel = courseModel;
        this.learnerModel = learnerModel;
        this.userModel = userModel;
        this.promoModel = promoModel;
        this.enrollmentsService = enrollmentsService;
        this.mailerService = mailerService;
        this.coursesService = coursesService;
        this.stripeService = stripeService;
        this.promosService = promosService;
        this.emailLogsService = emailLogsService;
    }
    async giftCourse(gift, user) {
        const giftCheck = await this.giftCourseModel
            .findOne({
            recipientId: gift.recipientId,
            courseId: gift.courseId,
            status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
        })
            .exec();
        if (giftCheck) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.giftCourse.alreadyGifted);
        }
        const enrollmentCheck = await this.enrollmentModel
            .findOne({
            learnerId: gift.recipientId,
            courseId: gift.courseId,
            status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
        })
            .exec();
        if (enrollmentCheck) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.createEnrollment.alreadyEnrolled);
        }
        const course = await this.courseModel
            .findById(gift.courseId)
            .populate('collegeId', '+payableToUnmudl')
            .populate('instructorIds', 'fullname emailAddress')
            .lean();
        const learner = await this.learnerModel.findById(gift.recipientId).exec();
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
            if (gift.deleteCard && gift.cardId) {
                await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
            }
            return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
        }
        gift.unmudlSharePercentage = course.collegeId.unmudlShare;
        gift.unmudlShare = (course.price * course.collegeId.unmudlShare) / 100;
        gift.keptByUnmudl = 0;
        const unmudlShareBeforeDiscount = (course.price * course.collegeId.unmudlShare) / 100;
        let stripeFee = 0;
        if (gift.promoId) {
            const promo = await this.promoModel.findById(gift.promoId).exec();
            gift.discountPercentage = promo.discountMetric === 'percentage' ? promo.discount : null;
            gift.discountType = promo.type;
            gift.discountTotal =
                promo.discountMetric === 'percentage' ? (promo.discount * (course.price + gift.unmudlShare)) / 100 : promo.discount;
            gift.salesTax = ((course.price + unmudlShareBeforeDiscount - gift.discountTotal) * taxRate) / 100;
            gift.taxPercentage = taxRate;
            gift.totalPaid = course.price + unmudlShareBeforeDiscount + gift.salesTax - gift.discountTotal;
            stripeFee = gift.totalPaid * 0.029 + 0.3;
            gift.discountTotal = ((course.price + unmudlShareBeforeDiscount) * promo.discount) / 100;
            const collegeDiscount = (course.price * promo.discount) / 100;
            const unmudlDiscount = (unmudlShareBeforeDiscount * promo.discount) / 100;
            if (promo.type === 'unmudl') {
                gift.collegeShare = course.price - stripeFee;
                gift.unmudlShare = unmudlShareBeforeDiscount - gift.discountTotal;
            }
            else {
                gift.collegeShare = course.price - collegeDiscount - stripeFee;
                gift.unmudlShare = unmudlShareBeforeDiscount - unmudlDiscount;
            }
            gift.totalRevenue = gift.collegeShare + gift.unmudlShare;
            if (promo.learners && promo.learners.length > 0) {
                promo.learners.push(gift.recipientId);
            }
            else {
                promo.learners = [gift.recipientId];
            }
            await promo.save();
        }
        else {
            gift.salesTax = ((course.price + unmudlShareBeforeDiscount) * taxRate) / 100;
            gift.taxPercentage = taxRate;
            gift.totalPaid = course.price + unmudlShareBeforeDiscount + gift.salesTax;
            stripeFee = gift.totalPaid * 0.029 + 0.3;
            gift.discountPercentage = null;
            gift.discountTotal = 0;
            gift.collegeShare = course.price - stripeFee;
            gift.unmudlShare = unmudlShareBeforeDiscount;
            gift.totalRevenue = gift.collegeShare + gift.unmudlShare;
            gift.totalPaid = course.price + unmudlShareBeforeDiscount + gift.salesTax;
        }
        const chargeDescription = `Unmudl Purchase: ${course.title}`;
        const chargeDescriptor = `Unmudl Purchase`;
        try {
            if (gift.promoId && gift.discountPercentage === 100) {
                gift.stripeFee = 0;
                gift.collegeShare = 0;
                gift.unmudlShare = 0;
                gift.totalRevenue = 0;
                gift.transactionId = '';
                gift.courseFee = course.price;
                gift.status = enrollmentStatus_enum_1.EnrollmentStatus.PENDING;
                gift.sentToCollege = 0;
            }
            else if (gift.cardId) {
                const transaction = await this.enrollmentsService.createTransaction(gift.totalPaid, gift.cardId, gift.stripeCustomerId, chargeDescription, chargeDescriptor, false);
                gift.sentToCollege = gift.collegeShare;
                if (gift.deleteCard && gift.cardId) {
                    await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
                }
                gift.stripeFee = stripeFee;
                gift.courseFee = course.price;
                gift.transactionId = transaction.id;
                gift.status = enrollmentStatus_enum_1.EnrollmentStatus.PENDING;
            }
            else {
                return ResponseHandler_1.default.fail('You will need to add your card information for this transaction.');
            }
            gift.giftCode =
                functions_1.default.getInitialsOfWords(course.collegeId.title) +
                    functions_1.default.getInitialsOfWords(course.title) +
                    Math.floor(Math.random() * 10000).toString();
            const promo = {
                title: gift.giftCode,
                discount: 100,
                discountMetric: createPromo_enum_1.DiscountMetric.PERCENTAGE,
                date: {
                    start: new Date().toISOString(),
                },
                applyTo: createPromo_enum_1.ApplyTo.SELECTED,
                type: createPromo_enum_1.DiscountCut.GIFT,
                status: 'active',
                addedByLearner: user._id,
                courses: [course._id],
                collegeId: course.collegeId._id,
            };
            await this.promosService.createPromo(promo, false);
            let newGift = new this.giftCourseModel(gift);
            newGift = await newGift.save();
            newGift = newGift.toObject();
            const courseUrl = `${process.env.LEARNER_PORTAL_URL}/colleges/${functions_1.default.toSlug(course.collegeId.title, course.collegeId.numId)}/courses/${functions_1.default.toSlug(course.title, course.numId)}?giftCode=${gift.giftCode}`;
            await this.sendRecepientMail(newGift, course, courseUrl, gift.senderId);
            return ResponseHandler_1.default.success(newGift, responseMessages_1.default.success.giftedCourse);
        }
        catch (e) {
            if (gift.deleteCard && gift.cardId) {
                await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
            }
            return ResponseHandler_1.default.fail(e.message);
        }
    }
    async updateEnrollmentIdInGift(giftId, enrollmentId) {
        const gift = await this.giftCourseModel.findByIdAndUpdate(giftId, { $set: { enrollmentId } }, { new: true });
        return ResponseHandler_1.default.success(gift, 'Enrollment id added to gift successfully.');
    }
    async updateGiftStatus(giftId, status) {
        const gift = await this.giftCourseModel.findByIdAndUpdate(giftId, { $set: { status } }, { new: true });
        return ResponseHandler_1.default.success(gift, 'Gift status updated successfully.');
    }
    async getGiftById(id, lean = true) {
        let gift = this.giftCourseModel.findById(id);
        if (lean) {
            gift = await gift.lean();
        }
        else {
            gift = await gift.exec();
        }
        return ResponseHandler_1.default.success(gift);
    }
    async getGiftByCode(giftCode, lean = true) {
        let gift = this.giftCourseModel.findOne({ giftCode });
        if (lean) {
            gift = await gift.lean();
        }
        else {
            gift = await gift.exec();
        }
        return ResponseHandler_1.default.success(gift);
    }
    async getValidGiftByCode(giftCode, lean = true) {
        let gift = this.giftCourseModel.findOne({ giftCode, status: { $in: ['pending', 'approved', 'processed', 'transferred'] } });
        if (lean) {
            gift = await gift.lean();
        }
        else {
            gift = await gift.exec();
        }
        return ResponseHandler_1.default.success(gift);
    }
    async sendRecepientMail(giftObj, course, courseUrl, senderId) {
        const sender = await this.learnerModel.findById(senderId);
        let courseVenue = '';
        switch (course.venue) {
            case courses_model_1.Venue.INPERSON:
                courseVenue = 'In Person Course';
                break;
            case courses_model_1.Venue.BLENDED:
                courseVenue = 'Blended Course';
                break;
            case courses_model_1.Venue.ONLINE:
                courseVenue = 'Online - On Demand Course';
                break;
            case courses_model_1.Venue.ONLINE_SCHEDULED:
                courseVenue = 'Online - Scheduled Course';
                break;
        }
        const courseDate = course.date.end
            ? moment(course.date.start).format('MMMM DD, YYYY') + ' - ' + moment(course.date.end).format('MMMM DD, YYYY')
            : moment(course.date.start).format('MMMM DD, YYYY');
        const mailData = {
            to: giftObj.recipientEmail,
            from: process.env.LEARNER_NOTIFICATION_FROM,
            subject: `${sender.fullname} sent you a gift from Unmudl`,
            template: 'giftCourse',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                sender,
                message: giftObj.message,
                courseCover: process.env.BASE_URL + course.coverPhoto,
                coursePrice: Number((course.price + course.price * (course.collegeId.unmudlShare / 100)).toFixed(2)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                }),
                courseTitle: course.title,
                courseDate: course.date.start ? courseDate : null,
                courseVenue,
                collegeLogo: process.env.BASE_URL + course.collegeId.collegeLogoThumbnail,
                collegeTitle: course.collegeId.title,
                courseUrl,
                giftCode: giftObj.giftCode,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
        return true;
    }
};
GiftACourseService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('gift-course')),
    __param(1, mongoose_1.InjectModel('enrollments')),
    __param(2, mongoose_1.InjectModel('courses')),
    __param(3, mongoose_1.InjectModel('learners')),
    __param(4, mongoose_1.InjectModel('users')),
    __param(5, mongoose_1.InjectModel('promos')),
    __param(6, common_1.Inject(enrollments_service_1.EnrollmentsService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, enrollments_service_1.EnrollmentsService,
        mailer_1.MailerService,
        courses_service_1.CoursesService,
        stripe_service_1.StripeService,
        promos_service_1.PromosService,
        email_logs_service_1.EmailLogsService])
], GiftACourseService);
exports.GiftACourseService = GiftACourseService;
//# sourceMappingURL=gift-a-course.service.js.map