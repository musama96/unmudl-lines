import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import { GiftCourseDto } from './dto/giftCourse.dto';
import * as mongoose from 'mongoose';
import { MailerService } from '@nest-modules/mailer';
import * as moment from 'moment';
import { CoursesService } from '../courses/courses.service';
import { StripeService } from '../stripe/stripe.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CollegesService } from '../colleges/colleges.service';
import functions from '../common/functions';
import { PromosService } from '../promos/promos.service';
import { CreatePromoDto } from '../promos/dto/createPromo.dto';
import { ApplyTo, DiscountCut, DiscountMetric } from '../common/enums/createPromo.enum';
import { CourseDraftSchema } from '../courses/course-draft.model';
import { Venue } from '../courses/courses.model';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

@Injectable()
export class GiftACourseService {
  constructor(
    @InjectModel('gift-course')
    private readonly giftCourseModel,
    @InjectModel('enrollments') private readonly enrollmentModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('learners') private readonly learnerModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('promos') private readonly promoModel,
    @Inject(EnrollmentsService) private readonly enrollmentsService: EnrollmentsService,
    private readonly mailerService: MailerService,
    private readonly coursesService: CoursesService,
    private readonly stripeService: StripeService,
    private readonly promosService: PromosService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async giftCourse(gift: GiftCourseDto, user) {
    const giftCheck = await this.giftCourseModel
      .findOne({
        recipientId: gift.recipientId,
        courseId: gift.courseId,
        status: { $in: [EnrollmentStatus.APPROVED, EnrollmentStatus.PENDING, EnrollmentStatus.PROCESSED, EnrollmentStatus.TRANSFERRED] },
      })
      .exec();

    if (giftCheck) {
      return ResponseHandler.fail(responseMessages.giftCourse.alreadyGifted);
    }

    const enrollmentCheck = await this.enrollmentModel
      .findOne({
        learnerId: gift.recipientId,
        courseId: gift.courseId,
        status: { $in: [EnrollmentStatus.APPROVED, EnrollmentStatus.PENDING, EnrollmentStatus.PROCESSED, EnrollmentStatus.TRANSFERRED] },
      })
      .exec();

    if (enrollmentCheck) {
      return ResponseHandler.fail(responseMessages.createEnrollment.alreadyEnrolled);
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
        .find(
          {
            collegeId: mongoose.Types.ObjectId(course.collegeId._id),
            role: { $in: ['superadmin', 'admin'] },
            'notifications.email': { $ne: false },
          },
          'fullname emailAddress',
        )
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

            mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
          })();
        }
      }
      return ResponseHandler.fail(
        'There is some problem with college payment method setup. We have informed the college about this issue. Feel free to contact the college regarding this issue.',
      );
    }

    let taxRate = 0;
    try {
      const { data } = await this.coursesService.getTaxForLearner(course, learner);
      taxRate = data;
    } catch (e) {
      if (gift.deleteCard && gift.cardId) {
        await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
      }
      return ResponseHandler.fail(e.response ? e.response.message : e.message);
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
      } else {
        gift.collegeShare = course.price - collegeDiscount - stripeFee;
        gift.unmudlShare = unmudlShareBeforeDiscount - unmudlDiscount;
      }

      gift.totalRevenue = gift.collegeShare + gift.unmudlShare;
      if (promo.learners && promo.learners.length > 0) {
        promo.learners.push(gift.recipientId);
      } else {
        promo.learners = [gift.recipientId];
      }
      await promo.save();
    } else {
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
        gift.status = EnrollmentStatus.PENDING;
        gift.sentToCollege = 0;
      } else if (gift.cardId) {
        const transaction = await this.enrollmentsService.createTransaction(
          gift.totalPaid,
          gift.cardId,
          gift.stripeCustomerId,
          chargeDescription,
          chargeDescriptor,
          false,
        );

        gift.sentToCollege = gift.collegeShare;

        if (gift.deleteCard && gift.cardId) {
          await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
        }

        gift.stripeFee = stripeFee;
        gift.courseFee = course.price;
        gift.transactionId = transaction.id;

        gift.status = EnrollmentStatus.PENDING;
      } else {
        return ResponseHandler.fail('You will need to add your card information for this transaction.');
      }

      gift.giftCode =
        functions.getInitialsOfWords(course.collegeId.title) +
        functions.getInitialsOfWords(course.title) +
        Math.floor(Math.random() * 10000).toString();

      const promo: CreatePromoDto = {
        title: gift.giftCode,
        discount: 100,
        discountMetric: DiscountMetric.PERCENTAGE,
        date: {
          start: new Date().toISOString(),
        },
        applyTo: ApplyTo.SELECTED,
        type: DiscountCut.GIFT,
        status: 'active',
        addedByLearner: user._id,
        courses: [course._id],
        collegeId: course.collegeId._id,
      };

      await this.promosService.createPromo(promo, false);

      let newGift = new this.giftCourseModel(gift);
      newGift = await newGift.save();
      newGift = newGift.toObject();

      const courseUrl = `${process.env.LEARNER_PORTAL_URL}/colleges/${functions.toSlug(
        course.collegeId.title,
        course.collegeId.numId,
      )}/courses/${functions.toSlug(course.title, course.numId)}?giftCode=${gift.giftCode}`;

      // const mail = await this.mailerService.sendMail({
      //   to: gift.recipientEmail,
      //   from: process.env.MAILER_FROM,
      //   subject: 'UNMUDL Notification',
      //   template: 'learnerRecipientMailWhenLearnerSendGift',
      //   context: {
      //     unmudlLogo: process.env.UNMUDL_LOGO_PATH,
      //     date: moment(new Date()).format('LL'),
      //     learner,
      //     course,
      //     college: course.collegeId,
      //     courseUrl,
      //     learnerPortalDashboard: process.env.LEARNER_PORTAL_DASHBOARD,
      //     supportMail: process.env.SUPPORT_MAIL,
      //   },
      // });
      await this.sendRecepientMail(newGift, course, courseUrl, gift.senderId);

      return ResponseHandler.success(newGift, responseMessages.success.giftedCourse);
    } catch (e) {
      if (gift.deleteCard && gift.cardId) {
        await this.stripeService.removeCustomerCard(gift.stripeCustomerId, gift.cardId);
      }
      return ResponseHandler.fail(e.message);
    }
  }

  async updateEnrollmentIdInGift(giftId, enrollmentId) {
    const gift = await this.giftCourseModel.findByIdAndUpdate(giftId, { $set: { enrollmentId } }, { new: true });

    return ResponseHandler.success(gift, 'Enrollment id added to gift successfully.');
  }

  async updateGiftStatus(giftId, status) {
    const gift = await this.giftCourseModel.findByIdAndUpdate(giftId, { $set: { status } }, { new: true });

    return ResponseHandler.success(gift, 'Gift status updated successfully.');
  }

  async getGiftById(id, lean = true) {
    let gift = this.giftCourseModel.findById(id);
    if (lean) {
      gift = await gift.lean();
    } else {
      gift = await gift.exec();
    }

    return ResponseHandler.success(gift);
  }

  async getGiftByCode(giftCode, lean = true) {
    let gift = this.giftCourseModel.findOne({ giftCode });
    if (lean) {
      gift = await gift.lean();
    } else {
      gift = await gift.exec();
    }

    return ResponseHandler.success(gift);
  }

  async getValidGiftByCode(giftCode, lean = true) {
    let gift = this.giftCourseModel.findOne({ giftCode, status: { $in: ['pending', 'approved', 'processed', 'transferred'] } });
    if (lean) {
      gift = await gift.lean();
    } else {
      gift = await gift.exec();
    }

    return ResponseHandler.success(gift);
  }

  async sendRecepientMail(giftObj, course, courseUrl, senderId) {
    // const course = await this.courseModel.findById(giftObj.courseId).populate('collegeId').lean().exec();
    const sender = await this.learnerModel.findById(senderId);

    let courseVenue = '';
    switch (course.venue) {
      case Venue.INPERSON:
        courseVenue = 'In Person Course';
        break;
      case Venue.BLENDED:
        courseVenue = 'Blended Course';
        break;
      case Venue.ONLINE:
        courseVenue = 'Online - On Demand Course';
        break;
      case Venue.ONLINE_SCHEDULED:
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

    mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;

    return true;
  }
}
