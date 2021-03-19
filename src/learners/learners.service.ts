import { forwardRef, Inject, Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import CommonFunctions from '../common/functions';
import * as mongoose from 'mongoose';
import { Learner, PrimarySignup } from './learner.model';
import { MailerService } from '@nest-modules/mailer';
import { twilioClient } from '../config/config';
import { LearnerTokensService } from './learnerTokens.service';
import responseMessages from '../config/responseMessages';
import * as json2csv from 'json2csv';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import { UserAuthCredentialsDto } from '../auth/dto/userAuthCredentila.dto';
import { CoursesService } from '../courses/courses.service';
import { EmailDto } from '../common/dto/email.dto';
import { PhoneNumberDto } from '../common/dto/phoneNumber.dto';
import { UpdateSuspendLearnerDto } from './dto/updateSuspend.dto';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { ExternalService } from '../external/external.service';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';
import { removeFilesFromS3 } from '../s3upload/s3';
import { GetHelpAndSupportChatsDto } from './dto/getHelpAndSupportChats.dto';
const hbs = require('handlebars');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

@Injectable()
export class LearnersService {
  constructor(
    @InjectModel('learners') private readonly learnerModel,
    @InjectModel('enrollments') private readonly enrollmentModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('learner-notifications') private readonly notificationsModel,
    @InjectModel('email-logs') private readonly emailLogModel,
    @InjectModel('chats') private readonly chatModel,
    private readonly mailerService: MailerService,
    private readonly coursesService: CoursesService,
    private readonly externalService: ExternalService,
    @Inject(forwardRef(() => LearnerTokensService)) private readonly learnerTokensService: LearnerTokensService,
    @Inject(forwardRef(() => EmailLogsService)) private readonly emailLogsService: EmailLogsService,
  ) {}

  private readonly logger = new Logger('Learners Service');

  async validateEmail(emailDto: EmailDto) {
    const filter = emailDto.learnerId
      ? { emailAddress: emailDto.emailAddress, _id: { $ne: emailDto.learnerId } }
      : { emailAddress: emailDto.emailAddress };
    const learner = await this.learnerModel
      .findOne(filter, '_id')
      .lean()
      .exec();
    return learner ? ResponseHandler.fail(responseMessages.common.emailRegistered) : ResponseHandler.success({}, 'Email is valid.');
  }

  async validatePhoneNumber(phoneNumberDto: PhoneNumberDto) {
    const filter = phoneNumberDto.learnerId
      ? { phoneNumber: phoneNumberDto.phoneNumber, _id: { $ne: phoneNumberDto.learnerId } }
      : { phoneNumber: phoneNumberDto.phoneNumber };
    const learner = await this.learnerModel
      .findOne(filter, '_id')
      .lean()
      .exec();
    return learner
      ? ResponseHandler.fail(responseMessages.common.phoneNumberRegistered)
      : ResponseHandler.success({}, 'Phone number is valid.');
  }

  async insertLearner(learner) {
    learner.fullname = learner.firstname + ' ' + learner.lastname;
    if (learner.password) {
      learner.password = await CommonFunctions.getHash(learner.password);
    } else {
      // @ts-ignore
      learner.isVerified = true;
    }
    learner.primarySignup = learner.emailAddress ? PrimarySignup.EMAIL_ADDRESS : PrimarySignup.PHONE_NUMBER;
    const newLearner = new this.learnerModel(learner);
    const result = await newLearner.save();
    result.password = '';
    return ResponseHandler.success(result, 'Learner created successfully.');
  }

  async createLearnerForOtherSignups(learner) {
    const newLearner = new this.learnerModel(learner);
    const res = await newLearner.save();
    return res;
  }

  async validateLearnerForLogin(authCredentialsDto: UserAuthCredentialsDto) {
    const { emailAddress, password, phoneNumber } = authCredentialsDto;
    const find = emailAddress ? { emailAddress } : { phoneNumber };
    const learner = await this.learnerModel
      .findOne(find)
      .select('+password')
      .lean();
    if (learner && (await CommonFunctions.compareHash(password, learner.password))) {
      return learner;
    }
    return null;
  }

  async updateLastLoggedIn(learnerId) {
    await this.learnerModel
      .findOneAndUpdate(
        {
          _id: learnerId,
        },
        {
          $set: {
            lastLoggedIn: Date.now(),
          },
        },
      )
      .exec();
  }

  async verifyLearner(learnerId: string) {
    const learner = await this.learnerModel
      .findOneAndUpdate({ _id: learnerId }, { isVerified: true }, { new: true })
      .lean()
      .exec();
    learner.password = '';
    return ResponseHandler.success({}, responseMessages.createLearner.verified);
  }

  async getLearnerById(learnerId: string) {
    return await this.learnerModel.findById(learnerId).lean();
  }

  async getLearnerByEmail(emailAddress: string) {
    return await this.learnerModel.findOne({ emailAddress });
  }

  async getLearnerByPhoneNumber(phoneNumber: string) {
    return await this.learnerModel.findOne({ phoneNumber }).lean();
  }

  async getLearnerCourses(courseIds: string[], learnerId: string) {
    let courses = await this.courseModel
      .aggregate([
        {
          $match: { _id: { $in: courseIds } },
        },
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id', learnerId: mongoose.Types.ObjectId(learnerId) },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$courseId', '$$courseId'] }, { $eq: ['$learnerId', '$$learnerId'] }] } } },
              { $sort: { createdAt: -1 } },
              { $project: { status: 1 } },
              { $limit: 1 },
            ],
            as: 'enrollment',
          },
        },
        { $unwind: { path: '$enrolment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: '_id',
            as: 'collegeObj',
          },
        },
        { $unwind: '$collegeObj' },
        {
          $addFields: {
            'college.title': '$collegeObj.title',
            'college.collegeLogo': '$collegeObj.collegeLogo',
            'college.collegeLogoThumbnail': '$collegeObj.collegeLogoThumbnail',
            'college.numId': '$collegeObj.numId',
            'college.city': '$collegeObj.city',
            'college.state': '$collegeObj.state',
            salesTax: '$collegeObj.salesTax',
            // totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.salesTax', 100] }] }] },
            totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.unmudlShare', 100] }] }] },
            enrollmentStatus: { $ifNull: ['$enrollments.status', null] },
          },
        },
        {
          $addFields: {
            totalPriceWithTax: { $add: ['$totalPrice', { $multiply: ['$totalPrice', { $divide: ['$collegeObj.salesTax', 100] }] }] },
          },
        },
        { $unset: 'collegeObj' },
        {
          $project: {
            title: 1,
            coverPhoto: 1,
            coverPhotoThumbnail: 1,
            numId: 1,
            autoEnroll: 1,
            college: 1,
            rating: 1,
            ratingCount: { $size: '$reviews' },
            date: 1,
            enrollmentDeadline: 1,
            isUnmudlOriginal: 1,
            description: 1,
            totalPrice: 1,
            displayPrice: 1,
            salesTax: 1,
            zip: 1,
            state: 1,
            venue: 1,
          },
        },
        {
          $addFields: {
            sort: {
              $indexOfArray: [courseIds, '$_id'],
            },
          },
        },
        { $sort: { sort: 1 } },
        { $addFields: { sort: '$$REMOVE' } },
      ])
      .exec();

    const learner = await this.learnerModel.findById(learnerId).lean();
    courses = await Promise.all(
      courses.map(async course => {
        const { data: taxRate } = await this.coursesService.getTaxForLearner(course, learner);
        course.salesTax = taxRate;
        return course;
      }),
    );
    return ResponseHandler.success(courses);
  }

  async updateLearner(update, learnerId) {
    let existingLearner;
    if (update.profilePhoto) {
      existingLearner = await this.learnerModel
        .findById(learnerId, 'profilePhoto profilePhotoThumbnail')
        .lean()
        .exec();
      const files = [];
      existingLearner.profilePhoto && existingLearner.profilePhoto !== update.profilePhoto
        ? files.push(existingLearner.profilePhoto)
        : null;
      existingLearner.profilePhotoThumbnail && existingLearner.profilePhotoThumbnail !== update.profilePhotoThumbnail
        ? files.push(existingLearner.profilePhotoThumbnail)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const learner = await this.learnerModel
      .findOneAndUpdate({ _id: learnerId }, update, { new: true })
      .lean()
      .exec();
    learner.dateOfBirth = learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : learner.dateOfBirth;
    return learner;
  }

  async changePassword(passwordDto, learnerId) {
    const learner = await this.learnerModel
      .findById(learnerId)
      .select('+password')
      .exec();
    const verify = await CommonFunctions.compareHash(passwordDto.oldPassword, learner.password);
    if (verify) {
      const password = await CommonFunctions.getHash(passwordDto.password);
      const updatedLearner = await this.updateLearner({ password }, learnerId);
      return ResponseHandler.success({}, 'Password changed successfully');
    } else {
      ResponseHandler.fail(responseMessages.common.incorrectPassword);
    }
  }

  async createPassword(passwordDto, learnerId) {
    const learner = await this.learnerModel
      .findById(learnerId)
      .select('+password')
      .exec();
    if (!learner.hasPassword) {
      const password = await CommonFunctions.getHash(passwordDto.password);
      const updatedLearner = await this.updateLearner({ password, hasPassword: true }, learnerId);
      return ResponseHandler.success({}, 'Password created successfully');
    } else {
      ResponseHandler.fail(responseMessages.common.notSocialLogin);
    }
  }

  async sendResetPasswordLink(learner: Learner): Promise<boolean> {
    try {
      const code = await this.learnerTokensService.createLearnerVerification(learner._id.toString());
      // const url = LEARNER_FORGOT_PASSWORD_URL;
      const text =
        'You are receiving this message because you asked for a password reset. Use this code to reset your password "' + code + '"';
      if (learner.emailAddress) {
        const mailData = {
          to: learner.emailAddress,
          from: process.env.LEARNER_NOREPLY_FROM,
          subject: 'Password Reset for Unmudl.com',
          template: 'learnerPasswordReset',
          context: {
            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
            siteName: process.env.SITE_NAME,
            code,
          },
        };
        const mail = await this.mailerService.sendMail(mailData);

        mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
      } else {
        await twilioClient.messages.create({
          to: learner.phoneNumber,
          from: process.env.TWILIO_NUMBER,
          body: text,
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  async updatePassword(password: string, learnerId: string) {
    try {
      const passwordHash = await CommonFunctions.getHash(password);

      const updatedLearner = await this.learnerModel.findOneAndUpdate({ _id: learnerId }, { password: passwordHash });
      return !!updatedLearner;
    } catch {
      return false;
    }
  }

  async sendVerificationLink(learner: Learner): Promise<boolean> {
    try {
      const code = await this.learnerTokensService.createLearnerVerification(learner._id.toString());
      // const text = 'Enter the following code to verify your email "' + code + '"';
      const verificationMailCount = await this.emailLogModel
        .countDocuments({
          to: learner.emailAddress ? learner.emailAddress : null,
          template: 'learnerInvitation',
        })
        .exec();
      if (learner.emailAddress && verificationMailCount < 3) {
        const mailData = {
          to: learner.emailAddress,
          from: process.env.LEARNER_NOREPLY_FROM,
          subject: 'Here is Your Unmudl Confirmation Code',
          template: 'learnerInvitation',
          ses: {
            ConfigurationSetName: 'emails',
          },
          context: {
            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
            siteName: process.env.SITE_NAME,
            code,
          },
        };
        const mail = await this.mailerService.sendMail(mailData);

        mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;

        return true;
      } else if (learner.phoneNumber) {
        await twilioClient.messages.create({
          to: learner.phoneNumber,
          from: process.env.TWILIO_NUMBER,
          body: `Welcome to UNMUDL, use the following code to complete your signup: ${code}`,
        });

        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async testMailLog() {
    // const mail = await this.mailerService.sendMail({
    //   to: 'saad.gillani@turingtechnologies.org',
    //   from: process.env.MAILER_FROM,
    //   subject: 'Unmudl account verification code',
    //   template: 'learnerInvitation',
    //   context: {
    //     unmudlLogo: process.env.UNMUDL_LOGO_PATH,
    //     siteName: process.env.SITE_NAME,
    //     code: 872487,
    //   },
    // });

    hbs.registerPartial('header', 'src/common/templates/partials');
    hbs.registerPartial('footer', 'src/common/templates/partials');

    const content = await readFile('src/common/templates/emails/learnerInvitation.hbs', 'utf8');
    // Implement cache if you want
    const template = hbs.compile(content);

    let str = template({
      unmudlLogo: process.env.UNMUDL_LOGO_PATH,
      siteName: process.env.SITE_NAME,
      code: '872487',
    });
    return str;
  }

  async getAnalyticsCount(params = null) {
    const { collegeId, start, end } = params;
    const match = {};

    if (start || end) {
      // @ts-ignore
      match.createdAt = {};
      if (start) {
        // @ts-ignore
        match.createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
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
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'learners',
              localField: 'learnerId',
              foreignField: '_id',
              as: 'learner',
            },
          },
          { $unwind: '$learner' },
        ],
      );
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    pipeline.push({
      $group: {
        _id: '$learner._id',
      },
    });

    pipeline.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    const count = await this.enrollmentModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count.length > 0 ? count[0].count : 0);
  }

  async getAnalyticsCountForAdmin(params: { start?: string; end?: string } = { start: null, end: null }) {
    const { start, end } = params;
    const find = {};

    if (start || end) {
      // @ts-ignore
      find.createdAt = {};
      if (start) {
        // @ts-ignore
        find.createdAt.$gte = start;
      }
      if (end) {
        // @ts-ignore
        find.createdAt.$lte = end;
      }
    }

    const count = await this.learnerModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getCount(params) {
    const { start, end } = params;
    const find = {};

    if (start || end) {
      const createdAt = {};

      if (start) {
        // @ts-ignore
        createdAt.$gte = start;
      }
      if (end) {
        // @ts-ignore
        createdAt.$lte = end;
      }

      // @ts-ignore
      find.createdAt = createdAt;
    }

    const count = await this.learnerModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getGrowth(params) {
    const interval = Number(params.interval) ? Number(params.interval) : 1;
    const { start, end } = params;

    const pipeline = [];

    pipeline.push({
      $match: {
        createdAt: {
          $gte: new Date(start),
          $lt: new Date(end),
        },
      },
    });

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

    const count = await this.learnerModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count);
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string) {
    await this.learnerModel.findOneAndUpdate({ _id: userId }, { $set: { stripeCustomerId } });
  }

  async getLearnerDetails(params) {
    const { learnerId, collegeId } = params;

    const pipeline = [];
    pipeline.push(
      ...[
        {
          $match: {
            learnerId: mongoose.Types.ObjectId(learnerId),
            status: { $in: ['pending', 'approved', 'processed', 'transferred'] },
          },
        },
        {
          $sort: {
            createdAt: -1,
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
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'learners',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learner',
          },
        },
        {
          $addFields: {
            learner: {
              $arrayElemAt: ['$learner', 0],
            },
            'course.enrollmentStatus': '$status',
            'course.enrollmentId': '$_id',
            'course.learnerData': '$learnerData',
          },
        },
        {
          $group: {
            _id: '$learner._id',
            learner: { $first: '$learner' },
            lastCourseBought: { $first: { $arrayElemAt: ['$course.title', 0] } },
            moneySpent: { $sum: '$totalPaid' },
            totalCoursesBought: { $sum: 1 },
            currentlyEnrolledInTemp: { $push: { $arrayElemAt: ['$course', 0] } },
            previousCoursesTemp: { $push: { $arrayElemAt: ['$course', 0] } },
          },
        },
        {
          $addFields: {
            fullname: '$learner.fullname',
            phoneNumber: '$learner.phoneNumber',
            profilePhoto: '$learner.profilePhoto',
            profilePhotoThumbnail: '$learner.profilePhotoThumbnail',
            emailAddress: '$learner.emailAddress',
            dateOfBirth: { $dateToString: { format: '%m-%d-%Y', date: '$learner.dateOfBirth' } },
            lastLoggedIn: '$learner.lastLoggedIn',
            paymentMethod: '$learner.stripeCustomerId',
            zip: '$learner.zip',
            address: '$learner.address',
            city: '$learner.city',
            state: '$learner.state',
            country: '$learner.country',
            currentlyEnrolledInTemp: {
              $filter: {
                input: '$currentlyEnrolledInTemp',
                as: 'currentlyEnrolledIn',
                cond: {
                  $and: [
                    { $gte: ['$$currentlyEnrolledIn.date.end', new Date()] },
                    { $ne: ['$$currentlyEnrolledIn.enrollmentStatus', 'pending'] },
                  ],
                },
              },
            },
            previousCoursesTemp: {
              $filter: {
                input: '$previousCoursesTemp',
                as: 'previousCoursesTemp',
                cond: { $lt: ['$$previousCoursesTemp.date.end', new Date()] },
              },
            },
          },
        },
        {
          $addFields: {
            previousCourses: '$previousCoursesTemp.title',
            currentlyEnrolledIn: {
              $map: {
                input: '$currentlyEnrolledInTemp',
                as: 'currentlyEnrolledInTemp',
                in: {
                  _id: '$$currentlyEnrolledInTemp._id',
                  title: '$$currentlyEnrolledInTemp.title',
                  start: '$$currentlyEnrolledInTemp.date.start',
                  end: '$$currentlyEnrolledInTemp.date.end',
                  enrollmentId: '$$currentlyEnrolledInTemp.enrollmentId',
                  enrollmentStatus: '$$currentlyEnrolledInTemp.enrollmentStatus',
                  learnerData: '$$currentlyEnrolledInTemp.learnerData',
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            let: { learnerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$learnerId', '$$learnerId'] }, { $in: ['$status', [EnrollmentStatus.PENDING]] }],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $project: { courseId: 1, learnerData: 1 } },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'courseId',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
              { $match: { 'course.collegeId': collegeId ? mongoose.Types.ObjectId(collegeId) : { $ne: null } } },
              {
                $project: {
                  learnerData: 1,
                  'course._id': 1,
                  'course.title': 1,
                  'course.externalCourseId': 1,
                },
              },
            ],
            as: 'pendingEnrollments',
          },
        },
        {
          $unset: ['learner', 'currentlyEnrolledInTemp', 'previousCoursesTemp'],
        },
      ],
    );

    let learner = await this.enrollmentModel.aggregate(pipeline).exec();
    let studentIdData = [];
    if (collegeId) {
      studentIdData = await this.enrollmentModel
        .aggregate([
          { $match: { learnerId: mongoose.Types.ObjectId(learnerId), 'learnerData.studentId': { $ne: null } } },
          {
            $lookup: {
              from: 'courses',
              localField: 'courseId',
              foreignField: '_id',
              as: 'course',
            },
          },
          { $unwind: '$course' },
          { $match: { 'course.collegeId': mongoose.Types.ObjectId(collegeId) } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ])
        .exec();
    }

    if (learner && learner.length > 0) {
      learner[0].studentId = studentIdData.length > 0 ? studentIdData[0].learnerData.studentId : null;
      return ResponseHandler.success(learner[0]);
    } else {
      learner = await this.learnerModel.findById(learnerId).exec();
      if (learner) {
        return ResponseHandler.success({
          _id: learner._id,
          fullname: learner.fullname,
          emailAddress: learner.emailAddress,
          phoneNumber: learner.phoneNumber,
          dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
          lastLoggedIn: learner.lastLoggedIn ? learner.lastLoggedIn : '',
          paymentMethod: !!learner.stripeCustomerId,
          city: learner.city ? learner.city : '',
          state: learner.state ? learner.state : '',
          country: learner.country ? learner.country : '',
          lastCourseBought: '',
          moneySpent: 0,
          totalCoursesBought: 0,
        });
      } else {
        return ResponseHandler.fail('Learner not found.');
      }
    }
  }

  async getLearnersByCollege(params, approved = '') {
    const { page, perPage, keyword, collegeId, searchBy, lat, lng, sortBy, sortOrder } = params;
    const pipeline = [];

    let match = {};

    const sort = {};
    sort[sortBy ? sortBy : 'createdAt'] = Number(sortOrder ? sortOrder : -1);

    if (searchBy === 'keyword') {
      match = {
        'learner.fullname': {
          $regex: keyword,
          $options: 'i',
        },
      };
    } else {
      match = {
        'learner.coordinates': {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
      };
    }

    if (approved === 'true') {
      pipeline.push({
        $match: {
          status: 'approved',
        },
      });
    } else if (approved === 'false') {
      pipeline.push({
        $match: {
          status: {
            $ne: 'approved',
          },
        },
      });
    }

    pipeline.push(
      ...[
        { $addFields: { sort: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } },
        {
          $sort: {
            sort: -1,
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$learnerId',
            course: {
              $push: '$courseId',
            },
            createdAt: {
              $first: '$createdAt',
            },
            status: {
              $first: '$status',
            },
            sort: {
              $first: '$sort',
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
          $unwind: {
            path: '$learner',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: match,
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
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    const countPipeline = Object.assign([], pipeline);
    countPipeline.push(
      ...[
        {
          $group: { _id: '$learner._id' },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    );

    const countPipelineTest = Object.assign([], pipeline);
    countPipelineTest.push(
      ...[
        {
          $group: { _id: '$learner._id' },
        },
      ],
    );

    pipeline.push(
      ...[
        { $addFields: { sort: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } },
        {
          $sort: {
            sort: -1,
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$learner._id',
            course: { $first: '$course' },
            mostRecentCourse: { $last: '$course' },
            status: { $first: '$status' },
            fullname: { $first: '$learner.fullname' },
            profilePhoto: { $first: '$learner.profilePhoto' },
            profilePhotoThumbnail: { $first: '$learner.profilePhotoThumbnail' },
            emailAddress: { $first: '$learner.emailAddress' },
            phoneNumber: { $first: '$learner.phoneNumber' },
            lastLoggedIn: { $first: '$learner.lastLoggedIn' },
            paymentMethod: { $first: '$learner.stripeCustomerId' },
            city: { $first: '$learner.city' },
            state: { $first: '$learner.state' },
            country: { $first: '$learner.country' },
            createdAt: { $first: '$createdAt' },
          },
        },
        // {
        //   $lookup: {
        //     from: 'states',
        //     localField: 'state',
        //     foreignField: '_id',
        //     as: 'state',
        //   },
        // },
        {
          $lookup: {
            from: 'enrollments',
            let: { learnerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$learnerId', '$$learnerId'] }],
                  },
                },
              },
              { $addFields: { sort: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } },
              {
                $lookup: {
                  from: 'courses',
                  localField: 'courseId',
                  foreignField: '_id',
                  as: 'course',
                },
              },
              { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
              collegeId ? { $match: { 'course.collegeId': mongoose.Types.ObjectId(collegeId) } } : {},
              { $sort: { sort: -1, createdAt: -1 } },
              { $limit: 1 },
              { $project: { 'course.title': 1 } },
            ],
            as: 'recentEnrollment',
          },
        },
        { $unwind: { path: '$recentEnrollment', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            // state: { $arrayElemAt: ['$state.name', 0] },
            mostRecentCourse: '$recentEnrollment.course.title',
            paymentMethod: { $cond: { if: '$paymentMethod', then: true, else: false } },
          },
        },
      ],
    );
    if (collegeId) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'enrollments',
              let: { learnerId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$learnerId', '$$learnerId'] }],
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
                { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
                { $match: { 'course.collegeId': mongoose.Types.ObjectId(collegeId) } },
                {
                  $addFields: {
                    status: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$status', 'pending'] }, then: 'pending' },
                          { case: { $eq: ['$status', 'approved'] }, then: 'admitted' },
                          { case: { $eq: ['$status', 'processed'] }, then: 'admitted' },
                          { case: { $eq: ['$status', 'transferred'] }, then: 'admitted' },
                        ],
                        default: 'canceled',
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                  },
                },
              ],
              as: 'enrollmentsCount',
            },
          },
          // { $unwind: { path: '$enrollmentsCount', preserveNullAndEmptyArrays: true } },
        ],
      );
    } else {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'enrollments',
              let: { learnerId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$learnerId', '$$learnerId'] }],
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
                { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
                {
                  $addFields: {
                    status: {
                      $switch: {
                        branches: [
                          { case: { $eq: ['$status', 'pending'] }, then: 'pending' },
                          { case: { $eq: ['$status', 'approved'] }, then: 'admitted' },
                          { case: { $eq: ['$status', 'processed'] }, then: 'admitted' },
                          { case: { $eq: ['$status', 'transferred'] }, then: 'admitted' },
                        ],
                        default: 'canceled',
                      },
                    },
                  },
                },
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                  },
                },
              ],
              as: 'enrollmentsCount',
            },
          },
          // { $unwind: { path: '$enrollmentsCount', preserveNullAndEmptyArrays: true } },
        ],
      );
    }

    pipeline.push(
      ...[
        {
          $addFields: {
            admitted: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 0] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 0] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 1] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 1] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 2] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 2] },
                  },
                ],
                default: 0,
              },
            },
            pending: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 0] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 0] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 1] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 1] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 2] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 2] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $sort: sort,
        },
      ],
    );
    // console.log(pipeline[0].$match);
    const [learners, learnersCount] = await Promise.all([
      this.enrollmentModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.enrollmentModel.aggregate(countPipeline).exec(),
    ]);

    // const rows = await this.getLearnersCountByCollege(params, approved);

    return ResponseHandler.success({
      learners,
      rows: learnersCount && learnersCount.length > 0 ? learnersCount[0].count : 0,
    });
  }

  async getLearnersForAdmin(params, approved = '') {
    const { page, perPage, keyword, searchBy, lat, lng, sortBy, sortOrder } = params;
    // const countPipeline = Object.assign([], pipeline);
    const pipeline = [];

    let match = {};

    const sort = {};
    sort[sortBy ? sortBy : 'createdAt'] = Number(sortOrder ? sortOrder : -1);

    if (searchBy === 'keyword') {
      match = {
        fullname: {
          $regex: keyword,
          $options: 'i',
        },
      };
    } else {
      match = {
        coordinates: {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
      };
    }

    if (approved === 'true') {
      pipeline.push({
        $match: {
          status: 'approved',
        },
      });
    } else if (approved === 'false') {
      pipeline.push({
        $match: {
          status: {
            $ne: 'approved',
          },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { learnerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$learnerId', '$$learnerId'] }],
                  },
                },
              },
              { $addFields: { sort: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } },
              { $sort: { sort: -1, createdAt: -1 } },
              { $limit: 1 },
            ],
            as: 'enrollment',
          },
        },
        { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
        {
          $sort: {
            'enrollment.createdAt': -1,
            createdAt: -1,
          },
        },
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'enrollment.courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
      ],
    );

    const countPipeline = Object.assign([], pipeline);
    countPipeline.push(
      ...[
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    );

    pipeline.push(
      ...[
        {
          $sort: {
            'enrollment.createdAt': -1,
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$_id',
            course: { $first: '$course' },
            mostRecentCourse: { $first: '$course' },
            status: { $first: '$enrollment.status' },
            fullname: { $first: '$fullname' },
            profilePhoto: { $first: '$profilePhoto' },
            profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
            emailAddress: { $first: '$emailAddress' },
            phoneNumber: { $first: '$phoneNumber' },
            lastLoggedIn: { $first: '$lastLoggedIn' },
            paymentMethod: { $first: '$stripeCustomerId' },
            city: { $first: '$city' },
            state: { $first: '$state' },
            country: { $first: '$country' },
            createdAt: { $first: '$createdAt' },
          },
        },
        {
          $addFields: {
            mostRecentCourse: '$mostRecentCourse.title',
            paymentMethod: { $cond: { if: '$paymentMethod', then: true, else: false } },
          },
        },
      ],
    );

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { learnerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$learnerId', '$$learnerId'] }],
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
              { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
              {
                $addFields: {
                  status: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$status', 'pending'] }, then: 'pending' },
                        { case: { $eq: ['$status', 'approved'] }, then: 'admitted' },
                        { case: { $eq: ['$status', 'processed'] }, then: 'admitted' },
                        { case: { $eq: ['$status', 'transferred'] }, then: 'admitted' },
                      ],
                      default: 'canceled',
                    },
                  },
                },
              },
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
            as: 'enrollmentsCount',
          },
        },
        // { $unwind: { path: '$enrollmentsCount', preserveNullAndEmptyArrays: true } },
      ],
    );

    pipeline.push(
      ...[
        {
          $addFields: {
            admitted: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 0] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 0] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 1] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 1] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 2] }, 'admitted'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 2] },
                  },
                ],
                default: 0,
              },
            },
            pending: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 0] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 0] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 1] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 1] },
                  },
                  {
                    case: { $eq: [{ $arrayElemAt: ['$enrollmentsCount._id', 2] }, 'pending'] },
                    then: { $arrayElemAt: ['$enrollmentsCount.count', 2] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $sort: sort,
        },
      ],
    );
    // console.log(pipeline[0].$match);
    const [learners, learnersCount] = await Promise.all([
      this.learnerModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.learnerModel.aggregate(countPipeline).exec(),
    ]);

    // const rows = await this.getLearnersCountByCollege(params, approved);

    return ResponseHandler.success({
      learners,
      rows: learnersCount && learnersCount.length > 0 ? learnersCount[0].count : 0,
    });
  }

  async getEnrollmentStatusesCount() {}

  async getLearnersByCourse(params, approved = '') {
    const { page, perPage, keyword, courseId, searchBy, lat, lng, sortBy, sortOrder } = params;

    let match = {};

    if (searchBy === 'keyword') {
      match = {
        'learner.fullname': {
          $regex: keyword,
          $options: 'i',
        },
      };
    } else {
      match = {
        'learner.coordinates': {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
      };
    }

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [];

    if (approved === 'true') {
      pipeline.push({
        $match: {
          status: {
            $in: ['approved', 'processed', 'transferred'],
          },
        },
      });
    } else if (approved === 'false') {
      pipeline.push({
        $match: {
          status: {
            $nin: ['approved', 'processed', 'transferred'],
          },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $match: {
            courseId: mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learner',
          },
        },
        {
          $project: {
            learner: {
              $arrayElemAt: ['$learner', 0],
            },
            createdAt: 1,
            status: 1,
          },
        },
        {
          $match: match,
        },
      ],
    );

    const countPipeline = Object.assign([], pipeline);
    countPipeline.push(
      ...[
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    );

    pipeline.push(
      ...[
        {
          $sort: sort,
        },
      ],
    );

    const [learners, learnersCount] = await Promise.all([
      this.enrollmentModel
        .aggregate(pipeline)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.enrollmentModel.aggregate(countPipeline).exec(),
    ]);

    // const rows = await this.getLearnersCountByCourse(params, approved);

    return ResponseHandler.success({
      learners,
      rows: learnersCount && learnersCount.length > 0 ? learnersCount[0].count : 0,
    });
  }

  async getLearnersByCollegeCsv(params) {
    const { keyword, collegeId, searchBy, lat, lng, sortBy, sortOrder } = params;

    const pipeline = [];

    let match = {};

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    if (searchBy === 'keyword') {
      match = {
        'learner.fullname': {
          $regex: keyword,
          $options: 'i',
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    } else {
      match = {
        'learner.coordinates': {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    }

    pipeline.push(
      ...[
        {
          $match: { status: { $in: ['approved', 'pending', 'processed', 'transferred'] } },
        },
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
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    pipeline.push(
      ...[
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
          $sort: {
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$learner._id',
            'Full Name': { $first: '$learner.fullname' },
            'Email Address': { $first: '$learner.emailAddress' },
            'Most Recent Course': { $first: '$course.title' },
            'Last Logged In': { $first: '$learner.lastLoggedIn' },
            'Payment Method': { $first: '$learner.stripeCustomerId' },
            City: { $first: '$learner.city' },
            State: { $first: '$learner.state.longName' },
            Country: { $first: '$learner.country' },
            'Joined On': { $first: '$createdAt' },
          },
        },
        // {
        //   $lookup: {
        //     from: 'states',
        //     localField: 'state',
        //     foreignField: '_id',
        //     as: 'state',
        //   },
        // },
        // {
        //   $lookup: {
        //     from: 'countries',
        //     localField: 'Country',
        //     foreignField: '_id',
        //     as: 'Country',
        //   },
        // },
        {
          $addFields: {
            // State: { $arrayElemAt: ['$state.name', 0] },
            'Last Logged In': { $dateToString: { date: '$Last Logged In', format: '%Y-%m-%d' } },
            'Joined On': { $dateToString: { date: '$Joined On', format: '%Y-%m-%d' } },
            // Country: { $arrayElemAt: ['$Country.name', 0] },
            // 'Most Recent Course': '$mostRecentCourse.title',
            'Payment Method': { $cond: { if: '$Payment Method', then: 'Added', else: 'Not Added' } },
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const fields = [
      'Full Name',
      'Email Address',
      'Most Recent Course',
      'Last Logged In',
      'Payment Method',
      'City',
      'State',
      'Country',
      'Joined On',
    ];
    // console.log('hi');
    const learners = await this.enrollmentModel.aggregate(pipeline).exec();
    return json2csv.parse(learners, { fields });
  }

  async getLearnersForUnmudlAdminCsv(params) {
    const { keyword, searchBy, lat, lng, sortBy, sortOrder } = params;

    switch (sortBy) {
      case 'fullname':
        break;
    }

    const pipeline = [];

    let match = {};

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    if (searchBy === 'keyword') {
      match = {
        fullname: {
          $regex: keyword,
          $options: 'i',
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    } else {
      match = {
        coordinates: {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            let: { learner: '$_id' },
            pipeline: [
              {
                $match: { $expr: { $eq: ['$learnerId', '$$learner'] } },
              },
              {
                $sort: {
                  createdAt: -1,
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
                $unwind: '$course',
              },
            ],
            as: 'enrollment',
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            'Full Name': '$fullname',
            'Email Address': '$emailAddress',
            enrollment: { $arrayElemAt: ['$enrollment', 0] },
            'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
            'Joined On': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            'Payment Method': { $cond: { if: '$stripeCustomerId', then: 'Added', else: 'Not Added' } },
            City: '$city',
            State: '$state.longName',
            Country: '$country',
          },
        },
        {
          $project: {
            'Full Name': 1,
            'Email Address': 1,
            'Last Logged In': 1,
            'Joined On': 1,
            'Payment Method': 1,
            'Most Recent Course': '$enrollment.course.title',
            City: 1,
            State: 1,
            Country: 1,
          },
        },
      ],
    );

    const fields = [
      'Full Name',
      'Email Address',
      'Most Recent Course',
      'Last Logged In',
      'Payment Method',
      'City',
      'State',
      'Country',
      'Joined On',
    ];
    // console.log('hi');
    const learners = await this.learnerModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return json2csv.parse(learners, { fields });
  }

  async getLearnersByCourseCsv(params) {
    const { keyword, courseId, searchBy, lat, lng, sortBy, sortOrder } = params;

    let match = {};

    if (searchBy === 'keyword') {
      match = {
        'learner.fullname': {
          $regex: keyword,
          $options: 'i',
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    } else {
      match = {
        'learner.coordinates': {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(process.env.LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
        // status: {$in: ['approved', 'pending', 'processed']},
      };
    }

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [
      {
        $match: {
          courseId: mongoose.Types.ObjectId(courseId),
          status: { $in: ['pending', 'approved', 'processed', 'transferred'] },
        },
      },
      {
        $lookup: {
          from: 'learners',
          localField: 'learnerId',
          foreignField: '_id',
          as: 'learner',
        },
      },
      {
        $project: {
          learner: {
            $arrayElemAt: ['$learner', 0],
          },
          createdAt: 1,
        },
      },
      {
        $match: match,
      },
      {
        $sort: sort,
      },
    ];

    const learners = await this.enrollmentModel.aggregate(pipeline).exec();

    const fields = [
      'Course Name',
      'College Name',
      'Total Earnings',
      'Earnings Shared',
      'Allowed Enrollments',
      'Enrollment Deadline',
      'Start Date',
      'End Date',
      'Start Time',
      'End Time',
      'Total Learners Enrolled',
    ];
    return json2csv.parse(learners, { fields });
  }

  async getLearnersCountByCollege(params, approved = '') {
    const { collegeId } = params;

    const match = {};

    if (collegeId) {
      match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
    }

    const pipeline = [];

    if (approved === 'true') {
      pipeline.push({
        $match: {
          status: 'approved',
        },
      });
    } else if (approved === 'false') {
      pipeline.push({
        $match: {
          status: {
            $ne: 'approved',
          },
        },
      });
    }

    pipeline.push(
      ...[
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
      ],
    );

    let count = await this.enrollmentModel.aggregate(pipeline).exec();

    if (count && count.length > 0) {
      count = count[0].count;
    } else {
      count = 0;
    }

    return ResponseHandler.success(count);
  }

  async getLearnersCountByCourse(params, approved = '') {
    const { keyword, courseId } = params;

    const match = {
      'learner.fullname': {
        $regex: keyword,
        $options: 'i',
      },
    };

    const initialMatch = {
      courseId: mongoose.Types.ObjectId(courseId),
    };

    if (approved === 'true') {
      // @ts-ignore
      initialMatch.status = 'approved';
    } else if (approved === 'false') {
      // @ts-ignore
      initialMatch.status = {
        $ne: 'approved',
      };
    }

    const count = await this.enrollmentModel
      .aggregate([
        {
          $match: initialMatch,
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learner',
          },
        },
        {
          $project: {
            learner: {
              $arrayElemAt: ['$learner', 0],
            },
            createdAt: 1,
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

    return ResponseHandler.success({
      count: count.length > 0 ? count[0].count : 0,
    });
  }

  async blacklistLearner(learnerId) {
    const learner = await this.learnerModel
      .findByIdAndUpdate(
        learnerId,
        {
          $set: { blacklisted: true },
        },
        { new: true },
      )
      .lean();

    return ResponseHandler.success(learner);
  }

  async getLearnersEnrollments(learnerId) {
    const [pendingEnrollments, acceptedTempEnrollments, declinedEnrollments] = await Promise.all([
      this.getEnrollments(learnerId, [EnrollmentStatus.PENDING]),
      this.getEnrollments(learnerId, [EnrollmentStatus.APPROVED, EnrollmentStatus.PROCESSED, EnrollmentStatus.TRANSFERRED]),
      this.getEnrollments(learnerId, [EnrollmentStatus.REFUNDED, EnrollmentStatus.CANCELED, EnrollmentStatus.DECLINED]),
    ]);

    let accessToken = null;

    const acceptedEnrollments = await Promise.all(
      acceptedTempEnrollments.map(async enrollment => {
        if (enrollment.course.externalCourseId && enrollment.course.college.orgId) {
          if (accessToken == null) {
            const { data } = await this.externalService.getLmsToken();
            accessToken = data.accessToken;
          }
          if (accessToken) {
            const {
              data: { courseLaunchURL },
            } = await this.externalService.getCourseLaunch({
              courseId: enrollment.course.externalCourseId,
              orgId: enrollment.course.college.orgId,
              userId: enrollment.learnerId,
              accessToken,
            });

            this.logger.warn('Course: ' + enrollment.course._id.toString());
            this.logger.log('Launch Url: ' + (courseLaunchURL ? courseLaunchURL.toString() : ''));
            this.logger.log('Start Date: ' + enrollment.course.date ? enrollment.course.date.start : 'Not provided');
            this.logger.log(
              'Current Date: ' +
                moment.tz(enrollment.course.college.timeZone ? enrollment.course.college.timeZone.value : 'America/Chicago'),
            );

            enrollment.course.canLaunch =
              enrollment.course.date && enrollment.course.date.start
                ? moment.tz(enrollment.course.college.timeZone ? enrollment.course.college.timeZone.value : 'America/Chicago') >
                  moment(enrollment.course.date.start)
                  ? 'yes'
                  : 'not-started'
                : 'no-start-date';

            enrollment.course.launchUrl = enrollment.course.canLaunch !== 'not-started' ? courseLaunchURL : null;

            this.logger.log('Can Launch: ' + enrollment.course.canLaunch);
          }
        }
        return enrollment;
      }),
    );

    return ResponseHandler.success({ pendingEnrollments, acceptedEnrollments, declinedEnrollments });
  }

  async removeCoursesFromCart(courseIds: string[], learnerId: string) {
    const learner = await this.learnerModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(learnerId) },
      { $pull: { cart: { course: { $in: courseIds } } } },
      { new: true },
    );
    return ResponseHandler.success({ cartCoursesCount: learner.cart ? learner.cart.length : 0 }, 'Courses successfully removed from cart.');
  }

  async removeCoursesFromWishList(courseIds: string[], learnerId: string) {
    const learner = await this.learnerModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(learnerId) },
      { $pull: { wishList: { course: { $in: courseIds } } } },
      { new: true },
    );
    return ResponseHandler.success({}, 'Courses successfully removed from wishlist.');
  }

  async getLearnerNotifications(params, learner) {
    const { page, perPage } = params;
    const [notifications, unreadNotificationsCount] = await Promise.all([
      this.notificationsModel
        .find({ receiver: learner._id })
        .sort({ createdAt: -1 })
        .paginate(page, perPage)
        .populate('course', 'coverPhoto coverPhotoThumbnail numId')
        .lean(),
      this.notificationsModel.countDocuments({ receiver: learner._id, isSeen: false }),
    ]);

    const notificationIds = notifications.map(notification => mongoose.Types.ObjectId(notification._id));
    await this.notificationsModel.updateMany(
      { _id: { $in: notificationIds } },
      { isSeen: true },
      { multi: true, upsert: false, timestamps: false },
    );

    return ResponseHandler.success({ notifications, unreadNotificationsCount });
  }

  async getEnrollments(learnerId, status: string[]) {
    learnerId = mongoose.Types.ObjectId(learnerId);
    return await this.enrollmentModel
      .aggregate([
        {
          $match: {
            learnerId,
            status: { $in: status },
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
        { $unwind: '$course' },
        {
          $lookup: {
            from: 'colleges',
            localField: 'course.collegeId',
            foreignField: '_id',
            as: 'course.college',
          },
        },
        { $unwind: '$course.college' },
        {
          $lookup: {
            from: 'courses',
            localField: 'course.followUpCourseId',
            foreignField: '_id',
            as: 'course.prevCourse',
          },
        },
        {
          $addFields: {
            'course.ratingCount': { $size: '$course.reviews' },
            'course.prevCourse.ratingCount': { $size: '$course.prevCourse.reviews' },
            // 'course.totalPrice': {
            //   $add: ['$course.price', { $multiply: ['$course.price', { $divide: ['$course.college.salesTax', 100] }] }],
            // },
            'course.totalPrice': {
              $add: ['$course.price', { $multiply: ['$course.price', { $divide: ['$course.college.unmudlShare', 100] }] }],
            },
          },
        },
        {
          $addFields: {
            'course.totalPriceWithTax': {
              $add: ['$course.totalPrice', { $multiply: ['$course.totalPrice', { $divide: ['$collegeObj.salesTax', 100] }] }],
            },
          },
        },
        {
          $project: {
            status: 1,
            learnerId: 1,
            createdAt: 1,
            courseActivity: 1,
            'course._id': 1,
            'course.coverPhoto': 1,
            'course.coverPhotoThumbnail': 1,
            'course.title': 1,
            'course.numId': 1,
            'course.totalPrice': 1,
            'course.displayPrice': 1,
            'course.autoEnroll': 1,
            'course.venue': 1,
            'course.college.timeZone': 1,
            'course.college.collegeLogo': 1,
            'course.college.collegeLogoThumbnail': 1,
            'course.college.title': 1,
            'course.college.numId': 1,
            'course.college.city': 1,
            'course.college.state': 1,
            'course.rating': 1,
            'course.ratingCount': 1,
            'course.prevCourse.rating': 1,
            'course.prevCourse.ratingCount': 1,
            'course.discountedPrice': { $cond: { if: '$promoId', then: '$totalPaid', else: null } },
            'course.description': 1,
            'course.date': 1,
            'course.enrollmentDeadline': 1,
            'course.isUnmudlOriginal': 1,
            'course.externalCourseId': 1,
            'course.college.orgId': 1,
            'course.isReviewed': {
              $cond: [{ $gt: [{ $size: { $setIntersection: ['$course.reviews.learner', [learnerId]] } }, 0] }, true, false],
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .exec();
  }

  async updateSuspend(suspendLearner: UpdateSuspendLearnerDto) {
    const learner = await this.learnerModel.findByIdAndUpdate(
      suspendLearner.learnerId,
      { isSuspended: suspendLearner.suspend },
      { new: true },
    );
    return ResponseHandler.success({}, `Learner ${learner.isSuspended ? 'suspended' : 'unsuspended'} successfully.`);
  }

  async getLearnerChats(learner, params: GetHelpAndSupportChatsDto) {
    const { filter } = params;

    const modules = [];
    if (filter === 'college') {
      modules.push('enquiries');
    } else if (filter === 'employer') {
      modules.push('source-talent');
    } else {
      modules.push(...['source-talent', 'enquiries']);
    }

    const chats = await this.chatModel.aggregate([
      {
        $match: { learner: mongoose.Types.ObjectId(learner._id), module: { $in: modules } },
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
        $lookup: {
          from: 'source-talents',
          localField: '_id',
          foreignField: 'chats',
          as: 'request',
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
        $lookup: {
          from: 'employer-companies',
          localField: 'employer',
          foreignField: '_id',
          as: 'employer',
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$chat', '$$chatId'] }] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'learners',
                localField: 'learner',
                foreignField: '_id',
                as: 'learner',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $lookup: {
                from: 'employer-admins',
                localField: 'employerAdmin',
                foreignField: '_id',
                as: 'employerAdmin',
              },
            },
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                message: 1,
                readByLearner: 1,
                'employerAdmin.fullname': 1,
                'employerAdmin.profilePhoto': 1,
                'employerAdmin.profilePhotoThumbnail': 1,
                'learner.fullname': 1,
                'learner.profilePhoto': 1,
                'learner.profilePhotoThumbnail': 1,
                'user.fullname': 1,
                'user.profilePhoto': 1,
                'user.profilePhotoThumbnail': 1,
                createdAt: 1,
              },
            },
          ],
          as: 'recentMessage',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$request', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employer-industries',
          localField: 'employer.industries',
          foreignField: '_id',
          as: 'employerIndustries',
        },
      },
      {
        $project: {
          'course._id': 1,
          'course.title': 1,
          'course.numId': 1,
          'course.coverPhoto': 1,
          'course.coverPhotoThumbnail': 1,
          'course.schedule': 1,
          'course.date': 1,
          'course.venue': 1,
          'course.customSchedule': 1,
          'course.time': 1,
          'course.timeZone': 1,
          'course.hoursPerWeek': 1,
          recentMessage: 1,
          'college.title': 1,
          'college.numId': 1,
          'college.collegeLogo': 1,
          'college.collegeLogoThumbnail': 1,
          createdAt: 1,
          'request._id': 1,
          'request.title': 1,
          'request.message': 1,
          'employer._id': 1,
          'employer.title': 1,
          'employer.employerLogo': 1,
          'employer.employerLogoThumbnail': 1,
          'employer.address': 1,
          'employer.city': 1,
          'employer.state': 1,
          'employer.url': 1,
          'employer.industries': '$employerIndustries',
          'employer.createdAt': 1,
          module: 1,
          type: 1,
        },
      },
      { $addFields: { employer: { $cond: [{ $eq: ['$employer', { industries: [] }] }, null, '$employer'] } } },
      { $sort: { 'recentMessage.createdAt': -1 } },
    ]);

    return ResponseHandler.success(chats);
  }
}
