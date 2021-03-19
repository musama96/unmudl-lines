import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { CreateCourseDto } from './dto/createCourse.dto';
import { EditCourseDto } from './dto/editCourse.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as mongoose from 'mongoose';
import { AVALARA_PASSWORD, AVALARA_USERNAME, LOCATION_SEARCH_RADIUS, BLOG_THUMBNAIL_SIZE, COURSE_THUMBNAIL_SIZE } from '../config/config';
import { CourseType, LearnerCourseListSortBy, Funding, LearnersCoursesListDto } from './dto/learnersCoursesList.dto';
import responseMessages from '../config/responseMessages';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import * as btoa from 'btoa';
import * as json2csv from 'json2csv';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import { CreateDraftDto } from './dto/createDraft.dto';
import { EditDraftDto } from './dto/editDraft.dto';
import { CoursesCsvDto } from './dto/coursesCsv.dto';
import { CopyDraftDto } from './dto/copyDraft.dto';
import { CoursesListDto, CourseListStatus } from './dto/coursesList.dto';
import { CoursesSectionDataDto } from './dto/coursesSectionData.dto';
import { TaxRatesService } from '../tax-rates/tax-rates.service';
import { AddToCartDto } from './dto/addToCart.dto';
import { LearnerUpdate } from '../common/interfaces/learnerUpdate.interface';
import { RelatedCredentials, CourseStatus } from './courses.model';
import { GetPriceAfterCommissionDto } from './dto/getPriceAfterCommission.dto';
import { UpdateDraftExternalDto } from './dto/updateDraftExternal.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { RedisKeys } from '../config/redisKeys';
import { removeFilesFromS3 } from '../s3upload/s3';
import { CollegesService } from '../colleges/colleges.service';
const sharp = require('sharp');

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('promos') private readonly promoModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('trashed-courses') private readonly trashedCourseModel,
    @InjectModel('course-drafts') private readonly courseDraftModel,
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('learners') private readonly learnerModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('ratingCategories') private readonly ratingCategoriesModel,
    @InjectModel('performance-outcomes') private readonly performanceOutcomesModel,
    @InjectModel('cip-certificates') private readonly cipCertificatesModel,
    @InjectModel('level-anchors') private readonly levelAnchorsModel,
    @InjectModel('landing-page') private readonly landingPageModel,
    @InjectModel('blogs') private readonly blogModel,
    @InjectModel('enrollments') private readonly enrollmentModel,
    @InjectModel('course-categories') private readonly courseCategoryModel,
    @InjectModel('employers') private readonly employerModel,
    private readonly notificationsService: NotificationsService,
    private readonly redisCacheService: RedisCacheService,
    private readonly collegesService: CollegesService,
  ) {}

  async getRatingCategoryIdbyIdentifier(identifier) {
    const category = await this.ratingCategoriesModel.findOne({ identifier }).lean();
    return category._id;
  }

  async getCourseData(courseId) {
    const course = await this.courseModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(courseId),
        },
      },
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
          // totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.salesTax', 100] }] }] },
          totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.unmudlShare', 100] }] }] },
        },
      },
      {
        $addFields: {
          totalPriceWithTax: { $add: ['$totalPrice', { $multiply: ['$totalPrice', { $divide: ['$collegeObj.salesTax', 100] }] }] },
        },
      },
    ]);
    return course[0];
  }

  async getPerformanceOutcomes(keyword) {
    const performanceOutcomes = await this.performanceOutcomesModel
      .find()
      .byKeyword(keyword)
      .lean();
    return ResponseHandler.success(performanceOutcomes);
  }

  async createPerformanceOutcomeTag(title: string) {
    const performanceOutcome = await this.performanceOutcomesModel.create({ title });
    return ResponseHandler.success(performanceOutcome);
  }

  async checkIfCourseBelongsToCollege(courseId, collegeId) {
    const course = await this.courseModel.findById(courseId).exec();
    collegeId = mongoose.Types.ObjectId(collegeId);

    if (course) {
      if (
        (course.collegeId && course.collegeId.toString() === collegeId.toString()) ||
        (course._doc && course._doc.collegeId && course._doc.collegeId.toString() === collegeId.toString())
      ) {
        return ResponseHandler.success(true);
      } else {
        return ResponseHandler.fail('Course does not belong to your college.');
      }
    } else {
      return ResponseHandler.fail('Course not found.');
    }
  }

  async getInstructorsCourses(instructorId) {
    const instructor = await this.userModel
      .findOne({ numId: instructorId }, '_id')
      .lean()
      .exec();
    instructorId = mongoose.Types.ObjectId(instructor._id);
    return await this.courseModel
      .find({ instructorIds: instructorId }, 'title coverPhoto coverPhotoThumbnail collegeId price tax rating numId')
      .populate('collegeId', 'title collegeLogo')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getInstructorReviews(instructorNumId, pagination) {
    const instructor = await this.userModel.findOne({ numId: instructorNumId }, 'numId');
    const instructorId = mongoose.Types.ObjectId(instructor._id);
    const { page, perPage } = pagination;
    // console.log(perPage);
    const [reviews, reviewsForCount] = await Promise.all([
      this.courseModel.aggregate([
        {
          $match: { instructorIds: instructorId },
        },
        {
          $unwind: '$reviews',
        },
        {
          $match: { 'reviews.review': { $ne: null } },
        },
        {
          $project: {
            // reviewsCount: {$sum: 1},
            reviews: '$reviews',
          },
        },
        { $sort: { 'reviews.dateAdded': -1 } },
        { $skip: (page - 1) * perPage },
        { $limit: perPage },
        {
          $lookup: {
            from: 'learners',
            localField: 'reviews.learner',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: '$learner' },
        {
          $project: {
            review: '$reviews.review',
            'learner.fullname': '$learner.fullname',
            'learner.firstname': '$learner.firstname',
            'learner.lastname': '$learner.lastname',
            'learner.profilePhoto': '$learner.profilePhoto',
            'learner.profilePhotoThumbnail': '$learner.profilePhotoThumbnail',
            rating: '$reviews.avgRating',
            createdAt: '$reviews.dateAdded',
          },
        },
      ]),
      this.courseModel.aggregate([
        {
          $match: { instructorIds: instructorId },
        },
        {
          $unwind: '$reviews',
        },
        {
          $match: { 'reviews.review': { $ne: null } },
        },
        { $project: { id: '$_id' } },
      ]),
    ]);
    return ResponseHandler.success({ reviews, reviewsCount: reviewsForCount.length });
  }

  async getInstructorCourses(instructorNumId, pagination) {
    const instructor = await this.userModel.findOne({ numId: instructorNumId }, 'numId');
    if (!instructor) {
      return ResponseHandler.fail('No instructor exist by this Id.');
    }
    const instructorId = mongoose.Types.ObjectId(instructor._id);
    const { page, perPage } = pagination;

    const [courses, coursesCount] = await Promise.all([
      this.courseModel
        .aggregate([
          {
            $match: { instructorIds: instructorId, unpublishedDate: null },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
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
              'college.numId': '$collegeObj.numId',
              'college.title': '$collegeObj.title',
              'college.collegeLogo': '$collegeObj.collegeLogo',
              'college.collegeLogoThumbnail': '$collegeObj.collegeLogoThumbnail',
              'college.city': '$collegeObj.city',
              'college.state': '$collegeObj.state',
              // totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.salesTax', 100] }] }] },
              totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.unmudlShare', 100] }] }] },
            },
          },
          {
            $addFields: {
              totalPriceWithTax: { $add: ['$totalPrice', { $multiply: ['$totalPrice', { $divide: ['$collegeObj.salesTax', 100] }] }] },
            },
          },
          { $unset: 'collegeObj' },
          {
            $lookup: {
              from: 'courses',
              localField: 'followUpCourseId',
              foreignField: '_id',
              as: 'followUpCourseObj',
            },
          },
          {
            $addFields: {
              'followUpCourse.rating': '$followUpCourseObj[0].rating',
              'followUpCourse.ratingCount': { $size: { $ifNull: ['$followUpCourseObj[0].reviews', []] } },
            },
          },
          {
            $project: {
              numId: 1,
              title: 1,
              coverPhoto: 1,
              coverPhotoThumbnail: 1,
              college: 1,
              rating: 1,
              ratingCount: { $size: '$reviews' },
              totalPrice: 1,
              followUpCourse: 1,
            },
          },
        ])
        .exec(),
      this.courseModel.countDocuments({ instructorIds: instructorId, unpublishedDate: null }),
    ]);

    return ResponseHandler.success({ courses, coursesCount });
  }

  async getCourse(courseId, college) {
    const course = await this.courseModel
      .findById(courseId)
      .populate('employers')
      .populate('followupCourseId', 'title')
      .populate('collegeId', 'title orgId')
      .populate('relatedCourses', 'title coverPhoto coverPhotoThumbnail')
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail invitation')
      .lean()
      .exec();

    const collegeId = mongoose.Types.ObjectId(college);

    if (course) {
      // console.log(collegeId)
      if (
        !college ||
        (course.collegeId._id && course.collegeId._id.toString() === collegeId.toString()) ||
        (course._doc && course._doc.collegeId && course._doc.collegeId.toString() === collegeId.toString())
      ) {
        // course.time.start = moment(course.time.start).format('h:mm A');
        return ResponseHandler.success({ course });
      } else {
        return ResponseHandler.fail('Course does not belong to your college.');
      }
    } else {
      return ResponseHandler.fail('Course not found.');
    }
  }

  async getCourseDraft(draftId, college) {
    const course = await this.courseDraftModel
      .findById(draftId)
      // .populate('state')
      .populate('employers')
      .populate('followupCourseId', 'title')
      .populate('collegeId', 'numId title orgId')
      .populate('relatedCourses', 'title coverPhoto coverPhotoThumbnail')
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail invitation')
      //  .populate('performanceOutcomes', 'title')
      .lean()
      .exec();

    const collegeId = mongoose.Types.ObjectId(college);

    if (course) {
      // console.log(collegeId)
      if (
        !college ||
        (course.collegeId._id && course.collegeId._id.toString() === collegeId.toString()) ||
        (course._doc && course._doc.collegeId && course._doc.collegeId.toString() === collegeId.toString())
      ) {
        // course.time.start = moment(course.time.start).format('h:mm A');
        return ResponseHandler.success({ course });
      } else {
        return ResponseHandler.fail('Course draft does not belong to your college.');
      }
    } else {
      return ResponseHandler.fail('Course draft not found.');
    }
  }

  async getCourseDetails(courseId) {
    const course = await this.courseModel
      .findOne({ numId: courseId })
      .populate(
        'collegeId',
        'collegeLogo collegeLogoThumbnail title url contact address description salesTax numId ' +
          'city state unmudlShare streetAddress country zip orgId timeZone',
      )
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail numId')
      .populate('reviews.learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('reviews.rating.category')
      .populate('performanceOutcomes', 'title')
      .populate({
        path: 'followUpCourseId',
        select: 'rating reviews numId',
        populate: { path: 'reviews.learner', select: 'fullname profilePhoto profilePhotoThumbnail' },
      })
      .populate('relatedCourses', 'title coverPhoto coverPhotoThumbnail numId')
      .populate('employers', 'title website logo')
      .lean()
      .exec();
    return course;
  }

  async getCourseDetailsForEnrollments(courseId) {
    const course = await this.courseModel
      .findById(courseId)
      .populate(
        'collegeId',
        'collegeLogo collegeLogoThumbnail title url contact address description salesTax numId city state unmudlShare streetAddress country zip',
      )
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail numId')
      .populate('reviews.learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('reviews.rating.category')
      .populate('performanceOutcomes', 'title')
      .populate({
        path: 'followUpCourseId',
        select: 'rating reviews numId',
        populate: { path: 'reviews.learner', select: 'fullname profilePhoto profilePhotoThumbnail' },
      })
      .populate('relatedCourses', 'title coverPhoto coverPhotoThumbnail numId')
      .populate('employers', 'title website logo')
      .lean()
      .exec();
    return course;
  }

  async getCourseDetailsByMongoId(courseId) {
    const course = await this.courseModel
      .findById(courseId)
      .populate(
        'collegeId',
        'collegeLogo collegeLogoThumbnail title url contact address description salesTax numId city country unmudlShare',
      )
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail numId')
      .populate('reviews.learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('reviews.rating.category')
      .populate('performanceOutcomes', 'title')
      .populate({
        path: 'followUpCourseId',
        select: 'rating reviews numId',
        populate: { path: 'reviews.learner', select: 'fullname profilePhoto profilePhotoThumbnail' },
      })
      .populate('employers', 'title website logo')
      .lean()
      .exec();
    return course;
  }

  async getDraftDetails(draftId) {
    const draft = await this.courseDraftModel
      .findOne({ numId: Number(draftId) })
      .populate(
        'collegeId',
        'collegeLogo collegeLogoThumbnail title url contact address description salesTax numId city country unmudlShare',
      )
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail numId')
      .populate('reviews.learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('reviews.rating.category')
      .populate('performanceOutcomes', 'title')
      .populate({
        path: 'followUpCourseId',
        select: 'rating reviews numId',
        populate: { path: 'reviews.learner', select: 'fullname profilePhoto profilePhotoThumbnail' },
      })
      .populate('employers', 'title website logo')
      .lean()
      .exec();
    return draft;
  }

  async getCourseById(courseId) {
    return await this.courseModel.findById(courseId).exec();
  }

  async getCourseWithCollegeById(courseId, lean = true) {
    let course = this.courseModel.findById(courseId).populate('collegeId');

    if (lean) {
      course = await course.lean();
    } else {
      course = await course.exec();
    }

    return ResponseHandler.success(course);
  }

  async updateCourseInstructors(courseId, userId) {
    const course = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          $push: { instructorIds: userId },
        },
        { new: true },
      )
      .exec();

    return ResponseHandler.success(course, responseMessages.success.updateCourseInstructors);
  }

  async getCourses(params: CoursesListDto | CoursesSectionDataDto, isAdmin = false) {
    const {
      daysLeft,
      minPrice,
      maxPrice,
      keyword,
      open,
      openApplied,
      rating,
      page,
      perPage,
      collegeId,
      sortBy,
      sortOrder,
      instructorId,
      status,
      courseIds,
    } = params;

    let college = null;

    if (collegeId) {
      college = await this.collegeModel.findById(collegeId).lean();
    }

    const checkDate = momentTz
      .tz(college && college.timeZone && college.timeZone.value ? college.timeZone.value : 'America/Chicago')
      .add(24, 'hours');

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }

    if (courseIds) {
      const selectedCourses = courseIds.map(course => mongoose.Types.ObjectId(course));
      pipeline.push({
        $match: { _id: { $nin: selectedCourses } },
      });
    }

    if (openApplied) {
      pipeline.push({
        $addFields: {
          unpublished: {
            $cond: {
              if: '$unpublishedDate',
              then: true,
              else: false,
            },
          },
        },
      });

      if (Boolean(open)) {
        // @ts-ignore
        match.$and = [
          {
            enrollmentsCanceled: false,
          },
          {
            unpublished: false,
          },
          {
            enrollmentDeadline: {
              $gte: new Date(),
            },
          },
        ];
        // match.enrollmentsCanceled = false;
        if (daysLeft) {
          // @ts-ignore
          match.enrollmentDeadline = {
            $lte: new Date(
              moment()
                .add(daysLeft, 'day')
                .startOf('d')
                .toISOString(),
            ),
          };
        }
      } else {
        // @ts-ignore
        match.$or = [
          {
            enrollmentsCanceled: true,
          },
          {
            unpublished: true,
          },
          {
            enrollmentDeadline: {
              $lte: new Date(),
            },
          },
        ];
      }
    }

    if (rating) {
      // @ts-ignore
      match.rating = {
        $gte: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }
    if (instructorId) {
      // @ts-ignore
      match.instructorIds = mongoose.Types.ObjectId(instructorId);
    }

    pipeline.push({
      $match: match,
    });

    switch (status) {
      case CourseListStatus.PUBLISHED:
        // @ts-ignore
        pipeline.push({
          $match: {
            unpublishedDate: null,
            status: { $nin: [CourseStatus.CANCELED, CourseStatus.COMING_SOON] },
          },
        });
        break;
      case CourseListStatus.UNPUBLISH:
        // @ts-ignore
        pipeline.push({
          $match: {
            $or: [
              {
                unpublishedDate: { $ne: null },
              },
              {
                status: CourseStatus.CANCELED,
              },
            ],
          },
        });
        break;
      case CourseListStatus.COMING_SOON:
        // @ts-ignore
        pipeline.push({
          $match: {
            status: CourseListStatus.COMING_SOON,
          },
        });
        break;
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$courseId', '$$courseId'] },
                      { $ne: ['$status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'enrolled',
          },
        },
        {
          $addFields: {
            enrolled: { $size: '$enrolled' },
          },
        },
      ],
    );

    if (open !== 2) {
      if (Boolean(open)) {
        pipeline.push(
          ...[
            {
              $match: {
                $expr: {
                  $gt: ['$enrollmentsAllowed', '$enrolled'],
                },
              },
            },
          ],
        );
      }
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: '_id',
            as: 'collegeObj',
          },
        },
        { $unwind: '$collegeObj' },
      ],
    );

    if (!isAdmin) {
      pipeline.push({ $match: { 'collegeObj.isSuspended': { $ne: true } } });
    }

    const countPipeline = Object.assign([], pipeline);
    countPipeline.push(
      ...[
        {
          $project: {
            numId: 1,
          },
        },
      ],
    );
    pipeline.push(
      ...[
        {
          $project: {
            numId: 1,
            title: 1,
            price: 1,
            rating: 1,
            enrolled: 1,
            coverPhoto: 1,
            coverPhotoThumbnail: 1,
            totalRevenue: 1,
            collegeRevenue: 1,
            unmudlRevenue: 1,
            enrollmentsAllowed: 1,
            unpublishedDate: 1,
            enrollmentDeadline: 1,
            enrollmentsCanceled: 1,
            status: 1,
            createdAt: 1,
            // @ts-ignore
            hasDeadlineWithin24hours: { $cond: [{ $lt: ['$enrollmentDeadline', new Date(checkDate)] }, true, false] },
          },
        },
        {
          $sort: sort,
        },
      ],
    );
    // console.log(pipeline);
    const [courses, coursesCount] = await Promise.all([
      this.courseModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.courseModel.aggregate(countPipeline),
    ]);

    // const rows = await this.getCoursesRows(params);

    return ResponseHandler.success({
      courses,
      rows: coursesCount.length,
    });
  }

  async getCoursesDropdown(params: CoursesListDto) {
    const { page, perPage, collegeId, keyword } = params;

    const match = {
      status: { $nin: [CourseStatus.CANCELED, CourseStatus.UNPUBLISH] },
      unpublishedDate: null,
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const courses = await this.courseModel
      .find(match, 'title coverPhoto coverPhotoThumbnail collegeId instructorIds date instructorDisplayName')
      .sort({ title: 1 })
      .paginate(page, perPage)
      .populate('collegeId', 'title')
      .populate('instructorIds', 'fullname')
      .sort({ title: 1 })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

    return ResponseHandler.success(courses);
  }

  async getCoursesDropdownForEmployerPortal(params: CoursesListDto, user) {
    const { page, perPage, keyword } = params;

    const match: any = {
      status: { $nin: [CourseStatus.CANCELED, CourseStatus.UNPUBLISH] },
      unpublishedDate: null,
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    pipeline.push({ $match: match });

    const {
      subscription: { activePlan, connectedCollege, connectedState },
    } = user;

    switch (activePlan.level) {
      case 0:
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $in: ['$collegeId', [connectedCollege]] },
                then: true,
                else: false,
              },
            },
          },
        });
        break;
      case 1:
        const { data: colleges } = await this.collegesService.getCollegesByStateShortName(
          connectedState ? connectedState.shortName : 'undefined',
        );
        const collegeIds = colleges.map(college => mongoose.Types.ObjectId(college._id));
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $in: ['$collegeId', collegeIds] },
                then: true,
                else: false,
              },
            },
          },
        });
        break;
      case 2:
        pipeline.push({ $addFields: { isAvailable: true } });
        break;
    }

    pipeline.push(
      ...[
        { $sort: { isAvailable: -1, title: 1 } },
        { $skip: (page - 1) * perPage },
        { $limit: perPage },
        {
          $project: {
            date: 1,
            title: 1,
            collegeId: 1,
            coverPhoto: 1,
            isAvailable: 1,
            instructorIds: 1,
            coverPhotoThumbnail: 1,
            instructorDisplayName: 1,
          },
        },
        {
          $lookup: {
            from: 'colleges',
            let: { collegeId: '$collegeId' },
            pipeline: [{ $match: { $expr: { $eq: ['$$collegeId', '$_id'] } } }, { $project: { title: 1, isSuspended: 1 } }],
            as: 'collegeId',
          },
        },
        { $unwind: { path: '$instructorIds', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            let: { instructorIds: '$instructorIds' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$instructorIds'] } } }, { $project: { fullname: 1 } }],
            as: 'instructorIds',
          },
        },
        { $unwind: { path: '$collegeId', preserveNullAndEmptyArrays: true } },
        { $match: { 'collegeId.isSuspended': { $ne: true } } },
      ],
    );

    const courses = await this.courseModel
      .aggregate(pipeline)
      // .populate('collegeId', 'title')
      // .populate('instructorIds', 'fullname')
      // .sort({ title: 1 })
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const rows = await this.courseModel.countDocuments(match).exec();

    return ResponseHandler.success({ courses, rows });
  }

  async GetCoursesCsv(params: CoursesCsvDto) {
    const { daysLeft, minPrice, maxPrice, keyword, open, openApplied, rating, collegeId, sortBy, sortOrder, instructorId, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }

    if (openApplied) {
      pipeline.push({
        $addFields: {
          unpublished: {
            $cond: {
              if: '$unpublishedDate',
              then: true,
              else: false,
            },
          },
        },
      });

      if (Boolean(open)) {
        // @ts-ignore
        match.$and = [
          {
            enrollmentsCanceled: false,
          },
          {
            unpublished: false,
          },
          {
            enrollmentDeadline: {
              $gte: new Date(),
            },
          },
        ];
        // match.enrollmentsCanceled = false;
        if (daysLeft) {
          // @ts-ignore
          match.enrollmentDeadline = {
            $lte: new Date(
              moment()
                .add(daysLeft, 'day')
                .startOf('d')
                .toISOString(),
            ),
          };
        }
      } else {
        // @ts-ignore
        match.$or = [
          {
            enrollmentsCanceled: true,
          },
          {
            unpublished: true,
          },
          {
            enrollmentDeadline: {
              $lte: new Date(),
            },
          },
        ];
      }
    }

    if (rating) {
      // @ts-ignore
      match.rating = {
        $gte: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }
    if (instructorId) {
      // @ts-ignore
      match.instructorIds = mongoose.Types.ObjectId(instructorId);
    }

    pipeline.push({
      $match: match,
    });

    switch (status) {
      case 'published':
        // @ts-ignore
        pipeline.push({
          $match: {
            unpublishedDate: null,
            status: { $ne: 'canceled' },
          },
        });
        break;
      case 'unpublished':
        // @ts-ignore
        pipeline.push({
          $match: {
            $or: [
              {
                unpublishedDate: { $ne: null },
              },
              {
                status: 'canceled',
              },
            ],
          },
        });
        break;
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$courseId', '$$courseId'] },
                      { $ne: ['$status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'enrolled',
          },
        },
        {
          $addFields: {
            enrolled: { $size: '$enrolled' },
          },
        },
      ],
    );

    if (Boolean(open)) {
      pipeline.push(
        ...[
          {
            $match: {
              $expr: {
                $gt: ['$enrollmentsAllowed', '$enrolled'],
              },
            },
          },
        ],
      );
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'employers',
            localField: 'employers',
            foreignField: '_id',
            as: 'employers',
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'followUpCourseId',
            foreignField: '_id',
            as: 'followUpCourse',
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'relatedCourses',
            foreignField: '_id',
            as: 'relatedCourses',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'instructorIds',
            foreignField: '_id',
            as: 'instructor',
          },
        },
        {
          $addFields: {
            followUpCourse: {
              $arrayElemAt: ['$followUpCourse', 0],
            },
            instructor: {
              $arrayElemAt: ['$instructor', 0],
            },
          },
        },
        {
          $project: {
            'Unmudl Original': {
              $cond: {
                if: '$isUnmudlOriginal',
                then: 'Yes',
                else: 'No',
              },
            },
            'Course Type': {
              $cond: {
                if: '$followUpCourse',
                then: 'Followup',
                else: 'New',
              },
            },
            'Followup Course': {
              $cond: {
                if: '$followUpCourse',
                then: '$followUpCourse.title',
                else: '',
              },
            },
            'Course Title': '$title',
            'Course Price': '$price',
            'No of Credits': '$credits',
            'Total Enrollments Allowed': '$enrollmentsAllowed',
            'Enrollment Deadline': { $dateToString: { date: '$enrollmentDeadline', format: '%Y-%m-%d' } },
            Instructor: 1, // '$instructor.fullname',
            'Course Location': '$venue',
            Address: '$address',
            Town: '$city',
            State: '$state.longName',
            'Zip Code': '$zip',
            'Course Dates/Length': {
              $concat: [
                { $dateToString: { date: '$date.start', format: '%Y-%m-%d' } },
                ' - ',
                { $dateToString: { date: '$date.end', format: '%Y-%m-%d' } },
              ],
            },
            'Hours Offered': {
              $reduce: {
                input: '$hoursOffered',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this'],
                    },
                    else: '$$this',
                  },
                },
              },
            },
            'Additional Attendance Information': '$attendanceInformation',
            'Course Schedule': '$schedule',
            Timings: 'Need Info',
            'Course Description': '$description',
            'Learning Objectives': 'Need info',
            'Attached Files': {
              $reduce: {
                input: '$attachments',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this'],
                    },
                    else: '$$this',
                  },
                },
              },
            },
            'Eligibility Restrictions': '$eligibilityRestrictions',
            'Related Occupations': {
              $reduce: {
                input: '$occupations',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Knowledge Outcomes': {
              $reduce: {
                input: '$knowledgeOutcomes',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            Skills: {
              $reduce: {
                input: '$skillOutcomes',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            Experience: {
              $reduce: {
                input: '$experiences',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            'Related Credentials': 'Need Info',
            'Related Courses': {
              $reduce: {
                input: '$relatedCourses',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Employer Title': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Employer Website': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.website'],
                    },
                    else: '$$this.website',
                  },
                },
              },
            },
            'Employer Logo': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.logo'],
                    },
                    else: '$$this.logo',
                  },
                },
              },
            },
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const courses = await this.courseModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = [
      'Unmudl Original',
      'Course Type',
      'Followup Course',
      'Course Title',
      'Course Price',
      'No of Credits',
      'Total Enrollments Allowed',
      'Enrollment Deadline',
      'Instructor',
      'Course Location',
      'Address',
      'Town',
      'State',
      'Zip Code',
      'Course Dates/Length',
      'Hours Offered',
      'Additional Attendance Information',
      'Course Schedule',
      'Timings',
      'Course Description',
      'Learning Objectives',
      'Attached Files',
      'Eligibility Restrictions',
      'Related Occupations',
      'Knowledge Outcomes',
      'Skills',
      'Experience',
      'Related Credentials',
      'Related Courses',
      'Employer Title',
      'Employer Website',
      'Employer Logo',
    ];
    return json2csv.parse(courses, { fields });
  }

  async getDraftCourses(params: CoursesListDto) {
    const {
      daysLeft,
      minPrice,
      maxPrice,
      keyword,
      open,
      openApplied,
      rating,
      page,
      perPage,
      collegeId,
      sortBy,
      sortOrder,
      instructorId,
    } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }

    if (openApplied) {
      pipeline.push({
        $addFields: {
          unpublished: {
            $cond: {
              if: '$unpublishedDate',
              then: true,
              else: false,
            },
          },
        },
      });

      if (Boolean(open)) {
        // @ts-ignore
        match.$and = [
          {
            enrollmentsCanceled: false,
          },
          {
            unpublished: false,
          },
          {
            enrollmentDeadline: {
              $gte: new Date(),
            },
          },
        ];
        // match.enrollmentsCanceled = false;
        if (daysLeft) {
          // @ts-ignore
          match.enrollmentDeadline = {
            $lte: new Date(
              moment()
                .add(daysLeft, 'day')
                .startOf('d')
                .toISOString(),
            ),
          };
        }
      } else {
        // @ts-ignore
        match.$or = [
          {
            enrollmentsCanceled: true,
          },
          {
            unpublished: true,
          },
          {
            enrollmentDeadline: {
              $lte: new Date(),
            },
          },
        ];
      }
    }

    if (rating) {
      // @ts-ignore
      match.rating = {
        $gte: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }
    if (instructorId) {
      // @ts-ignore
      match.instructorIds = mongoose.Types.ObjectId(instructorId);
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$courseId', '$$courseId'] },
                      { $ne: ['$status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'enrolled',
          },
        },
        {
          $addFields: {
            enrolled: { $size: '$enrolled' },
          },
        },
      ],
    );

    if (Boolean(open)) {
      pipeline.push(
        ...[
          {
            $match: {
              $expr: {
                $gt: ['$enrollmentsAllowed', '$enrolled'],
              },
            },
          },
        ],
      );
    }

    pipeline.push(
      ...[
        {
          $project: {
            numId: 1,
            title: 1,
            price: 1,
            rating: 1,
            enrolled: 1,
            coverPhoto: 1,
            coverPhotoThumbnail: 1,
            totalRevenue: 1,
            collegeRevenue: 1,
            enrollmentsAllowed: 1,
            unpublishedDate: 1,
            enrollmentDeadline: 1,
            enrollmentsCanceled: 1,
            createdAt: 1,
          },
        },
        {
          $sort: sort,
        },
      ],
    );
    // console.log(pipeline);
    const courses = await this.courseDraftModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getDraftCoursesRows(params);

    return ResponseHandler.success({
      courses,
      rows: rows.data,
    });
  }

  async getDraftCoursesCsv(params: CoursesCsvDto) {
    const { daysLeft, minPrice, maxPrice, keyword, open, openApplied, rating, collegeId, sortBy, sortOrder, instructorId } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }

    if (openApplied) {
      pipeline.push({
        $addFields: {
          unpublished: {
            $cond: {
              if: '$unpublishedDate',
              then: true,
              else: false,
            },
          },
        },
      });

      if (Boolean(open)) {
        // @ts-ignore
        match.$and = [
          {
            enrollmentsCanceled: false,
          },
          {
            unpublished: false,
          },
          {
            enrollmentDeadline: {
              $gte: new Date(),
            },
          },
        ];
        // match.enrollmentsCanceled = false;
        if (daysLeft) {
          // @ts-ignore
          match.enrollmentDeadline = {
            $lte: new Date(
              moment()
                .add(daysLeft, 'day')
                .startOf('d')
                .toISOString(),
            ),
          };
        }
      } else {
        // @ts-ignore
        match.$or = [
          {
            enrollmentsCanceled: true,
          },
          {
            unpublished: true,
          },
          {
            enrollmentDeadline: {
              $lte: new Date(),
            },
          },
        ];
      }
    }

    if (rating) {
      // @ts-ignore
      match.rating = {
        $gte: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }
    if (instructorId) {
      // @ts-ignore
      match.instructorIds = mongoose.Types.ObjectId(instructorId);
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$courseId', '$$courseId'] },
                      { $ne: ['$status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'enrolled',
          },
        },
        {
          $addFields: {
            enrolled: { $size: '$enrolled' },
          },
        },
      ],
    );

    if (Boolean(open)) {
      pipeline.push(
        ...[
          {
            $match: {
              $expr: {
                $gt: ['$enrollmentsAllowed', '$enrolled'],
              },
            },
          },
        ],
      );
    }

    pipeline.push(
      ...[
        {
          $project: {
            'Unmudl Original': {
              $cond: {
                if: '$isUnmudlOriginal',
                then: 'Yes',
                else: 'No',
              },
            },
            'Course Type': {
              $cond: {
                if: '$followUpCourse',
                then: 'Followup',
                else: 'New',
              },
            },
            'Followup Course': {
              $cond: {
                if: '$followUpCourse',
                then: '$followUpCourse.title',
                else: '',
              },
            },
            'Course Title': '$title',
            'Course Price': '$price',
            'No of Credits': '$credits',
            'Total Enrollments Allowed': '$enrollmentsAllowed',
            'Enrollment Deadline': { $dateToString: { date: '$enrollmentDeadline', format: '%Y-%m-%d' } },
            Instructor: 1, // '$instructor.fullname',
            'Course Location': '$venue',
            Address: '$address',
            Town: '$city',
            State: '$state.longName',
            'Zip Code': '$zip',
            'Course Dates/Length': {
              $concat: [
                { $dateToString: { date: '$date.start', format: '%Y-%m-%d' } },
                ' - ',
                { $dateToString: { date: '$date.end', format: '%Y-%m-%d' } },
              ],
            },
            'Hours Offered': {
              $reduce: {
                input: '$hoursOffered',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this'],
                    },
                    else: '$$this',
                  },
                },
              },
            },
            'Additional Attendance Information': '$attendanceInformation',
            'Course Schedule': '$schedule',
            Timings: 'Need Info',
            'Course Description': '$description',
            'Learning Objectives': 'Need info',
            'Attached Files': {
              $reduce: {
                input: '$attachments',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this'],
                    },
                    else: '$$this',
                  },
                },
              },
            },
            'Eligibility Restrictions': '$eligibilityRestrictions',
            'Related Occupations': {
              $reduce: {
                input: '$occupations',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Knowledge Outcomes': {
              $reduce: {
                input: '$knowledgeOutcomes',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            Skills: {
              $reduce: {
                input: '$skillOutcomes',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            Experience: {
              $reduce: {
                input: '$experiences',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.name'],
                    },
                    else: '$$this.name',
                  },
                },
              },
            },
            'Related Credentials': 'Need Info',
            'Related Courses': {
              $reduce: {
                input: '$relatedCourses',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Employer Title': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.title'],
                    },
                    else: '$$this.title',
                  },
                },
              },
            },
            'Employer Website': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.website'],
                    },
                    else: '$$this.website',
                  },
                },
              },
            },
            'Employer Logo': {
              $reduce: {
                input: '$employers',
                initialValue: '',
                in: {
                  $cond: {
                    if: {
                      $ne: ['$$value', ''],
                    },
                    then: {
                      $concat: ['$$value', ' - ', '$$this.logo'],
                    },
                    else: '$$this.logo',
                  },
                },
              },
            },
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const courses = await this.courseDraftModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = [
      'Unmudl Original',
      'Course Type',
      'Followup Course',
      'Course Title',
      'Course Price',
      'No of Credits',
      'Total Enrollments Allowed',
      'Enrollment Deadline',
      'Instructor',
      'Course Location',
      'Address',
      'Town',
      'State',
      'Zip Code',
      'Course Dates/Length',
      'Hours Offered',
      'Additional Attendance Information',
      'Course Schedule',
      'Timings',
      'Course Description',
      'Learning Objectives',
      'Attached Files',
      'Eligibility Restrictions',
      'Related Occupations',
      'Knowledge Outcomes',
      'Skills',
      'Experience',
      'Related Credentials',
      'Related Courses',
      'Employer Title',
      'Employer Website',
      'Employer Logo',
    ];
    return json2csv.parse(courses, { fields });
  }

  async getCoursesRows(params) {
    const { daysLeft, minPrice, maxPrice, keyword, open, rating, collegeId } = params;

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }
    if (Boolean(open)) {
      // @ts-ignore
      match.enrollmentsCanceled = false;
      if (daysLeft) {
        // @ts-ignore
        match.enrollmentDeadline = {
          $lte: new Date(
            moment()
              .add(daysLeft, 'day')
              .startOf('d')
              .toISOString(),
          ),
        };
      }
    } else {
      // @ts-ignore
      match.enrollmentsCanceled = true;
    }

    if (rating && rating.length > 0) {
      // @ts-ignore
      match.rating = {
        $in: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const pipeline = [];

    pipeline.push({
      $match: match,
    });

    if (Boolean(open)) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'enrollments',
              localField: '_id',
              foreignField: 'courseId',
              as: 'enrolled',
            },
          },
          {
            $addFields: {
              enrolled: { $size: '$enrolled' },
            },
          },
          {
            $match: {
              $expr: {
                $gt: ['$enrollmentsAllowed', '$enrolled'],
              },
            },
          },
        ],
      );
    }

    pipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const rows = await this.courseModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  async getDraftCoursesRows(params) {
    const { daysLeft, minPrice, maxPrice, keyword, open, openApplied, rating, collegeId, sortBy, sortOrder, instructorId } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    const pipeline = [];

    if (minPrice || maxPrice) {
      // @ts-ignore
      match.price = {};
      if (minPrice) {
        // @ts-ignore
        match.price.$gte = minPrice;
      }
      if (maxPrice) {
        // @ts-ignore
        match.price.$lte = maxPrice;
      }
    }

    if (openApplied) {
      pipeline.push({
        $addFields: {
          unpublished: {
            $cond: {
              if: '$unpublishedDate',
              then: true,
              else: false,
            },
          },
        },
      });

      if (Boolean(open)) {
        // @ts-ignore
        match.$and = [
          {
            enrollmentsCanceled: false,
          },
          {
            unpublished: false,
          },
          {
            enrollmentDeadline: {
              $gte: new Date(),
            },
          },
        ];
        // match.enrollmentsCanceled = false;
        if (daysLeft) {
          // @ts-ignore
          match.enrollmentDeadline = {
            $lte: new Date(
              moment()
                .add(daysLeft, 'day')
                .startOf('d')
                .toISOString(),
            ),
          };
        }
      } else {
        // @ts-ignore
        match.$or = [
          {
            enrollmentsCanceled: true,
          },
          {
            unpublished: true,
          },
          {
            enrollmentDeadline: {
              $lte: new Date(),
            },
          },
        ];
      }
    }

    if (rating) {
      // @ts-ignore
      match.rating = {
        $gte: rating,
      };
    }
    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }
    if (instructorId) {
      // @ts-ignore
      match.instructorIds = mongoose.Types.ObjectId(instructorId);
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$courseId', '$$courseId'] },
                      { $ne: ['$status', EnrollmentStatus.CANCELED] },
                      { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                      { $ne: ['$status', EnrollmentStatus.DECLINED] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'enrolled',
          },
        },
        {
          $addFields: {
            enrolled: { $size: '$enrolled' },
          },
        },
      ],
    );

    if (Boolean(open)) {
      pipeline.push(
        ...[
          {
            $match: {
              $expr: {
                $gt: ['$enrollmentsAllowed', '$enrolled'],
              },
            },
          },
        ],
      );
    }

    pipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const rows = await this.courseDraftModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  async getFollowUpCourses(params) {
    const { keyword, perPage, collegeId } = params;

    const courses = await this.courseModel
      .find(
        {
          title: {
            $regex: keyword,
            $options: 'i',
          },
          collegeId: mongoose.Types.ObjectId(collegeId),
          'date.end': {
            $lt: new Date(),
          },
        },
        'title',
      )
      .sort({ title: 1 })
      .paginate(1, perPage)
      .lean();

    return ResponseHandler.success(courses);
  }

  async getTopCourses(params) {
    const { page, perPage, start, end, collegeId } = params;

    const match = {};

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const pipeline = [];

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrolled',
          },
        },
      ],
    );

    pipeline.push({
      $addFields: {
        enrolled: {
          $filter: {
            input: '$enrolled',
            as: 'enrollment',
            cond: {
              $and: [
                { $gte: ['$$enrollment.createdAt', new Date(start)] },
                { $lte: ['$$enrollment.createdAt', new Date(end)] },
                { $in: ['$$enrollment.status', ['processed', 'transferred']] },
              ],
            },
          },
        },
      },
    });

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        {
          $project: {
            numId: 1,
            time: 1,
            title: 1,
            createdAt: 1,
            coverPhoto: 1,
            coverPhotoThumbnail: 1,
            totalRevenue: { $sum: '$enrolled.totalRevenue' },
            collegeRevenue: { $sum: '$enrolled.collegeShare' },
            unmudlRevenue: { $sum: '$enrolled.unmudlShare' },
            enrollmentsAllowed: 1,
            enrollmentDeadline: 1,
            startDate: '$date.start',
            endDate: '$date.end',
            enrolled: { $size: '$enrolled' },
            college: { $arrayElemAt: ['$college.title', 0] },
          },
        },
        {
          $sort: {
            totalRevenue: -1,
            enrolled: -1,
          },
        },
      ],
    );

    const courses = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getCoursesAnalyticsCount(params);

    return ResponseHandler.success({
      courses,
      rows: rows.data,
    });
  }

  async getTopCoursesCsv(params) {
    const { page, perPage, start, end, collegeId } = params;

    const match = {};

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const pipeline = [];

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrolled',
          },
        },
      ],
    );

    pipeline.push({
      $addFields: {
        enrolled: {
          $filter: {
            input: '$enrolled',
            as: 'enrollment',
            cond: {
              $and: [
                { $gte: ['$$enrollment.createdAt', new Date(start)] },
                { $lte: ['$$enrollment.createdAt', new Date(end)] },
                { $in: ['$$enrollment.status', ['processed', 'transferred']] },
              ],
            },
          },
        },
      },
    });

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        {
          $project: {
            'Course Name': '$title',
            'Total Earnings': { $sum: '$enrolled.totalRevenue' },
            'College Earnings': { $sum: '$enrolled.collegeShare' },
            'Earnings Shared': { $sum: '$enrolled.unmudlShare' },
            'Allowed Enrollments': '$enrollmentsAllowed',
            'Enrollment Deadline': { $dateToString: { date: '$enrollmentDeadline', format: '%Y-%m-%d' } },
            'Start Date': { $dateToString: { date: '$date.start', format: '%Y-%m-%d' } },
            'End Date': { $dateToString: { date: '$date.end', format: '%Y-%m-%d' } },
            'Start Time': {
              $dateToString: {
                date: { $arrayElemAt: ['$time.start', 0] },
                format: '%H:%M',
              },
            },
            'End Time': {
              $dateToString: {
                date: { $arrayElemAt: ['$time.end', 0] },
                format: '%H:%M',
              },
            },
            'Total Learners Enrolled': { $size: '$enrolled' },
            'College Name': { $arrayElemAt: ['$college.title', 0] },
          },
        },
        {
          $sort: {
            'Total Earnings': -1,
            'Total Learners Enrolled': -1,
          },
        },
      ],
    );

    const courses = await this.courseModel
      .aggregate(pipeline)
      // .skip((page - 1) * perPage)
      // .limit(perPage)
      .exec();

    const fields = [
      'Course Name',
      'College Name',
      'Total Earnings',
      'College Earnings',
      'Earnings Shared',
      'Allowed Enrollments',
      'Enrollment Deadline',
      'Start Date',
      'End Date',
      'Start Time',
      'End Time',
      'Total Learners Enrolled',
    ];
    return json2csv.parse(courses, { fields });
  }

  async getCoursesAnalyticsCount(params) {
    const { collegeId } = params;

    const match = {};

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const pipeline = [];

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const count = await this.courseModel.aggregate(pipeline).exec();

    return ResponseHandler.success(count.length > 0 ? count[0].rows : 0);
  }

  async getCoursesAnalyticsById(courseId) {
    const courses = await this.courseModel
      .aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrolled',
          },
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        {
          $project: {
            enrollmentsAllowed: 1,
            enrollmentDeadline: 1,
            time: 1,
            date: 1,
            enrolled: { $size: '$enrolled' },
            college: { $arrayElemAt: ['$college.title', 0] },
          },
        },
        {
          $sort: {
            totalRevenue: -1,
          },
        },
      ])
      .exec();

    return ResponseHandler.success(courses.length > 0 ? courses[0] : null);
  }

  async getRevenue(courseId) {
    const revenue = await this.courseModel
      .findOne({
        _id: courseId,
      })
      .select(['totalRevenue', 'sharedRevenue', 'collegeRevenue'])
      .exec();

    return ResponseHandler.success(revenue);
  }

  async getReviews(courseId, userId, pagination) {
    const { page, perPage } = pagination;
    const overallExperience = await this.getRatingCategoryIdbyIdentifier('overallExperience');
    const reviews = await this.courseModel
      .aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $unwind: '$reviews',
        },
        {
          $project: {
            review: '$reviews',
          },
        },
        {
          $sort: {
            'review.createdAt': -1,
          },
        },
        { $skip: (page - 1) * perPage },
        { $limit: perPage },
        {
          $lookup: {
            from: 'reported-activities',
            let: { reviewId: '$review._id', userId },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$reviewId', '$$reviewId'] }, { $eq: ['$reportingUserId', '$$userId'] }] } } },
              { $limit: 1 },
            ],
            as: 'report',
          },
        },
        { $unwind: { path: '$report', preserveNullAndEmptyArrays: true } },
        { $unwind: '$review.ratings' },
        {
          $match: {
            'review.ratings.category': mongoose.Types.ObjectId(overallExperience),
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'review.learner',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: '$learner' },
        {
          $project: {
            fullname: '$learner.fullname', // reviewer name
            profilePhoto: '$learner.profilePhoto',
            profilePhotoThumbnail: '$learner.profilePhotoThumbnail',
            rating: '$review.avgRating', // avg rating
            reviewId: '$review._id',
            experience: '$review.ratings.value', // same criteria as the overallExperience
            createdAt: '$review.dateAdded',
            review: '$review.review', // review text
            isReported: { $cond: [{ $ifNull: ['$report', false] }, true, false] },
          },
        },
      ])
      .exec();

    return ResponseHandler.success(reviews);
  }

  async getReviewsCount(courseId) {
    const course = await this.courseModel.findById(courseId, 'reviews').lean();
    return course.reviews.length;
  }

  async getRatings(courseId) {
    // tslint:disable-next-line:prefer-const
    let [ratings, satisfiedRating] = await Promise.all([
      this.courseModel
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(courseId),
              // numId: courseId,
            },
          },
          {
            $unwind: '$reviews',
          },
          {
            $project: {
              reviews: 1,
            },
          },
          {
            $unwind: '$reviews.ratings',
          },
          {
            $group: {
              _id: '$reviews.ratings.category',
              rating: { $avg: '$reviews.ratings.value' },
              reviewsCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: 'ratingcategories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
            },
          },
          {
            $addFields: {
              category: {
                $arrayElemAt: ['$category', 0],
              },
            },
          },
          {
            $addFields: {
              category: '$category.identifier',
            },
          },
        ])
        .exec(),
      this.courseModel
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(courseId),
              // numId: courseId,
            },
          },
          {
            $unwind: '$reviews',
          },
          {
            $match: { 'reviews.avgRating': { $gte: 4 } },
          },
        ])
        .exec(),
    ]);
    ratings = ratings.reduce((obj, item) => {
      obj[item.category] = item;
      return obj;
    }, {});
    return { ratings, satisfiedRating: satisfiedRating.length };
  }

  async getRatingsById(courseId, isNumId) {
    const match = isNumId ? { numId: courseId } : { _id: mongoose.Types.ObjectId(courseId) };
    let ratings = await this.courseModel
      .aggregate([
        {
          $match: match,
        },
        {
          $unwind: '$reviews',
        },
        {
          $project: {
            reviews: 1,
          },
        },
        {
          $unwind: '$reviews.ratings',
        },
        {
          $group: {
            _id: '$reviews.ratings.category',
            rating: { $avg: '$reviews.ratings.value' },
            reviewsCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'ratingcategories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $addFields: {
            category: {
              $arrayElemAt: ['$category', 0],
            },
          },
        },
        {
          $addFields: {
            category: '$category.identifier',
          },
        },
      ])
      .exec();

    ratings = ratings.reduce((obj, item) => {
      obj[item.category] = item;
      return obj;
    }, {});
    return ratings;
  }

  async getInstructorRatings(instructorId) {
    const instructorRatings = await this.courseModel
      .aggregate([
        {
          $match: {
            instructorIds: mongoose.Types.ObjectId(instructorId),
            'reviews.0': { $exists: true },
          },
        },
        {
          $group: {
            _id: '',
            rating: { $avg: '$instructorRating' },
            reviewsCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    return instructorRatings[0];
  }

  async createCourse(course: CreateCourseDto, user) {
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { course: 1 } }, { new: true, upsert: true }).lean();
    // @ts-ignore
    course.numId = counter.course;

    const college = await this.collegeModel.findById(course.collegeId).lean();
    course.timeZone = college.timeZone ? college.timeZone : null;

    const newCourse = await this.courseModel.create(course);

    if (course.draftId) {
      const draft = await this.courseDraftModel.findOneAndRemove({ _id: mongoose.Types.ObjectId(course.draftId) });
      // console.log(draft);
      const files = [];
      draft && draft.coverPhoto && draft.coverPhoto !== newCourse.coverPhoto ? files.push(draft.coverPhoto) : null;
      draft && draft.coverPhotoThumbnail && draft.coverPhotoThumbnail !== newCourse.coverPhotoThumbnail
        ? files.push(draft.coverPhotoThumbnail)
        : null;
      draft && draft.attachments && draft.attachments.length > 0
        ? draft.attachments.map(attachment => {
            if (!newCourse.attachments || newCourse.attachments.length < 1 || !newCourse.attachments.includes(attachment)) {
              files.push(attachment);
            }
          })
        : null;
      // console.log(files);
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    if (newCourse.relatedCourses && newCourse.relatedCourses.length > 0) {
      this.notificationsService.relatedCourseAdded(newCourse);
    }
    this.notificationsService.courseAdded(newCourse, user);

    try {
      const redisConnected = await this.redisCacheService.checkClient();
      if (redisConnected) {
        await this.redisCacheService.del(RedisKeys.sitemapCourses);
      }
    } catch (err) {
      console.log(err.message);
    }
    return newCourse;
  }

  async createCourseDraft(courseDraft: CreateDraftDto) {
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { draft: 1 } }, { new: true, upsert: true }).lean();
    // @ts-ignore
    courseDraft.numId = counter.draft;

    const college = await this.collegeModel.findById(courseDraft.collegeId).lean();
    courseDraft.timeZone = college.timeZone ? college.timeZone : '';

    const newDraft = await this.courseDraftModel.create(courseDraft);
    await newDraft.populate('collegeId', 'numId title').execPopulate();
    return newDraft;
  }

  async updateCourseDraft(courseDraft: UpdateDraftExternalDto) {
    let existingDraft;
    if (courseDraft.coverPhoto || courseDraft.coverPhotoThumbnail || courseDraft.attachments) {
      existingDraft = await this.courseDraftModel
        .findById(courseDraft._id, 'coverPhoto coverPhotoThumbnail attachments')
        .lean()
        .exec();
      const files = [];
      existingDraft.coverPhoto && existingDraft.coverPhoto !== courseDraft.coverPhoto ? files.push(existingDraft.coverPhoto) : null;
      existingDraft.coverPhotoThumbnail && existingDraft.coverPhotoThumbnail !== courseDraft.coverPhotoThumbnail
        ? files.push(existingDraft.coverPhotoThumbnail)
        : null;
      existingDraft.attachments && existingDraft.attachments.length > 0
        ? existingDraft.attachments.map(attachment => {
            if (courseDraft.attachments && !courseDraft.attachments.includes(attachment)) {
              files.push(attachment);
            }
          })
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const courseId = courseDraft._id;
    delete courseDraft._id;
    const newDraft = await this.courseDraftModel
      .findByIdAndUpdate(
        courseId,
        {
          $set: courseDraft,
        },
        { new: true },
      )
      .exec();

    return ResponseHandler.success(newDraft, 'Course draft updated successfully.');
  }

  async createDraftFromCourse(copyDraftDto: CopyDraftDto, user: any) {
    const { courseId, title } = copyDraftDto;

    const course = await this.courseModel.findById(courseId).lean();
    const college = await this.collegeModel.findById(course.collegeId).lean();
    if (!course || (user.collegeId && user.collegeId.toString() !== course.collegeId.toString())) {
      return ResponseHandler.fail('You can only create draft from course of your own college.');
    }
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { draft: 1 } }, { new: true, upsert: true }).lean();
    // @ts-ignore
    course.numId = counter.draft;
    course.title = title;
    course.timeZone = college.timeZone;
    delete course._id;

    const draft = await this.courseDraftModel.create(course);
    await draft
      .populate('employers')
      .populate('followupCourseId', 'title')
      .populate('collegeId', 'numId title')
      .populate('relatedCourses', 'title')
      .populate('instructorIds', 'fullname profilePhoto profilePhotoThumbnail  invitation')
      .execPopulate();

    return ResponseHandler.success(draft);
  }

  async cancelCourse(id, reasons: string[], user: string) {
    const course = await this.courseModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            cancelReasons: reasons,
            canceledBy: user,
            status: CourseStatus.CANCELED,
            unpublishedDate: new Date(),
            unpublishedBy: user,
          },
        },
        { new: true },
      )
      .lean();

    return ResponseHandler.success(course);
  }

  async updateCourse(course: EditCourseDto) {
    let existingCourse;
    if (course.coverPhoto || course.coverPhotoThumbnail || course.attachments) {
      existingCourse = await this.courseModel
        .findById(course.courseId, 'coverPhoto coverPhotoThumbnail attachments')
        .lean()
        .exec();
      const files = [];
      existingCourse.coverPhoto && existingCourse.coverPhoto !== course.coverPhoto ? files.push(existingCourse.coverPhoto) : null;
      existingCourse.coverPhotoThumbnail && existingCourse.coverPhotoThumbnail !== course.coverPhotoThumbnail
        ? files.push(existingCourse.coverPhotoThumbnail)
        : null;
      existingCourse.attachments && existingCourse.attachments.length > 0
        ? existingCourse.attachments.map(attachment => {
            if (course.attachments && !course.attachments.includes(attachment)) {
              files.push(attachment);
            }
          })
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const checkDate = moment()
      .add(24, 'hours')
      .toISOString();
    return await this.courseModel.findOneAndUpdate(
      course.isCollegeRequest
        ? // @ts-ignore
          { _id: course.courseId, enrollmentDeadline: { $gt: new Date(checkDate) } }
        : { _id: course.courseId },
      course,
      { new: true },
    );
  }

  async updateDraft(draft: EditDraftDto) {
    let existingDraft;
    if (draft.coverPhoto || draft.coverPhotoThumbnail || draft.attachments) {
      existingDraft = await this.courseDraftModel
        .findById(draft.draftId, 'coverPhoto coverPhotoThumbnail attachments')
        .lean()
        .exec();
      const files = [];
      existingDraft.coverPhoto && existingDraft.coverPhoto !== draft.coverPhoto ? files.push(existingDraft.coverPhoto) : null;
      existingDraft.coverPhotoThumbnail && existingDraft.coverPhotoThumbnail !== draft.coverPhotoThumbnail
        ? files.push(existingDraft.coverPhotoThumbnail)
        : null;
      existingDraft.attachments && existingDraft.attachments.length > 0
        ? existingDraft.attachments.map(attachment => {
            if (draft.attachments && !draft.attachments.includes(attachment)) {
              files.push(attachment);
            }
          })
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    // const checkDate = moment().add(24, 'hours');
    const updatedDratft = await this.courseDraftModel.findOneAndUpdate(
      // @ts-ignore
      { _id: draft.draftId },
      draft,
      { new: true },
    );
    return await updatedDratft.populate('collegeId', 'numId title').execPopulate();
  }

  async updateCourseRevenue(revenueDetails) {
    const course = await this.courseModel
      .findByIdAndUpdate(
        revenueDetails.courseId,
        {
          $set: {
            totalRevenue: revenueDetails.totalRevenue,
            unmudlRevenue: revenueDetails.unmudlRevenue,
            collegeRevenue: revenueDetails.collegeRevenue,
            salesTax: revenueDetails.salesTax,
          },
        },
        { new: true },
      )
      .exec();

    return ResponseHandler.success(course);
  }

  async getValidCoursesForPromo(params) {
    const { keyword, promoTitle, page, perPage, collegeId } = params;

    const pipeline = [];

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
      enrollmentDeadline: {
        $gt: new Date(),
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = collegeId;
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push({
      $lookup: {
        from: 'promos',
        localField: '_id',
        foreignField: 'courses',
        as: 'promos',
      },
    });

    pipeline.push({
      $match: {
        'promos.title': {
          $ne: promoTitle,
        },
      },
    });

    pipeline.push({
      $sort: {
        enrollmentDeadline: -1,
      },
    });

    pipeline.push({
      $project: {
        _id: '$_id',
        title: 1,
        price: 1,
        enrollmentDeadline: 1,
      },
    });

    const courses = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getValidPromoCoursesCount(params);

    return ResponseHandler.success({
      courses,
      rows: rows.data,
    });
  }

  async getValidPromoCoursesCount(params) {
    const { keyword, promoTitle, collegeId } = params;

    const pipeline = [];

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
      enrollmentDeadline: {
        $gt: new Date(),
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = collegeId;
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push({
      $lookup: {
        from: 'promos',
        localField: '_id',
        foreignField: 'courses',
        as: 'promo',
      },
    });

    pipeline.push({
      $unwind: '$promo',
    });

    pipeline.push({
      $match: {
        'promo.title': {
          $ne: promoTitle,
        },
      },
    });

    pipeline.push({
      $group: {
        _id: '$_id',
      },
    });

    pipeline.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    const courses = await this.courseModel.aggregate(pipeline).exec();

    const count = courses.length > 0 ? courses[0].count : 0;

    return ResponseHandler.success(count);
  }

  async setEnrollmentCancelledStatus(courseId, status) {
    await this.courseModel.findOneAndUpdate(
      {
        _id: courseId,
      },
      {
        $set: {
          enrollmentsCanceled: status,
        },
      },
    );

    return ResponseHandler.success(null, `Course enrollment status updated successfully.`);
  }

  async getCoursesCount(params = null) {
    const find = {};

    const { collegeId, start, end } = params;

    if (collegeId) {
      // @ts-ignore
      find.collegeId = collegeId;
    }

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

    const count = await this.courseModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getEnrollmentStatistics(params) {
    const { filter, page, perPage, collegeId } = params;

    const pipeline = [];

    const match = {
      enrollmentDeadline: {
        $gte: new Date(),
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': {
              $nin: ['canceled', 'declined', 'refunded'],
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            course: { $first: '$title' },
            coverPhoto: { $first: '$coverPhoto' },
            coverPhotoThumbnail: { $first: '$coverPhotoThumbnail' },
            college: { $first: '$collegeId' },
            enrollmentDeadline: { $first: '$enrollmentDeadline' },
            enrollmentsAllowed: { $first: '$enrollmentsAllowed' },
            enrollments: { $push: '$enrollments' },
          },
        },
      ],
    );

    if (!collegeId) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'colleges',
              localField: 'college',
              foreignField: '_id',
              as: 'college',
            },
          },
          {
            $addFields: {
              enrollments: { $size: '$enrollments' },
              college: { $arrayElemAt: ['$college.title', 0] },
            },
          },
        ],
      );
    } else {
      pipeline.push({
        $addFields: {
          enrollments: { $size: '$enrollments' },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $addFields: {
            enrollmentRate: {
              $divide: ['$enrollments', '$enrollmentsAllowed'],
            },
          },
        },
        {
          $addFields: {
            enrollmentRate: {
              $multiply: ['$enrollmentRate', 100],
            },
          },
        },
      ],
    );

    if (filter === 'underenrolled') {
      const twoWeeks = moment()
        .endOf('day')
        .add(2, 'w')
        .toISOString();
      pipeline.push({
        $match: {
          enrollmentRate: {
            $lte: 20,
          },
          // enrollmentDeadline: {
          //   $lte: new Date(twoWeeks),
          // },
        },
      });
    } else {
      const oneWeek = moment()
        .endOf('day')
        .add(1, 'w')
        .toISOString();
      pipeline.push({
        $match: {
          enrollmentRate: {
            $gte: 85,
          },
          // enrollmentDeadline: {
          //   $gte: new Date(oneWeek),
          // },
        },
      });
    }

    const statistics = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getEnrollmentStatisticsRows(params);

    return ResponseHandler.success({
      statistics,
      rows: rows.data,
    });
  }

  async updateCourseTimeZone(courseId, timeZone) {
    const course = await this.courseModel.findByIdAndUpdate(courseId, { $set: { timeZone } }, { new: true }).exec();

    return ResponseHandler.success(course);
  }

  async getRefundStatistics(params) {
    const { refundRate, page, perPage, collegeId } = params;

    const pipeline = [];

    if (collegeId) {
      pipeline.push({
        $match: {
          collegeId,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalEnrollments: {
              $size: '$enrollments',
            },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': 'refunded',
          },
        },
        {
          $group: {
            _id: '$_id',
            course: { $first: '$title' },
            coverPhoto: { $first: '$coverPhoto' },
            coverPhotoThumbnail: { $first: '$coverPhotoThumbnail' },
            college: { $first: '$collegeId' },
            enrollmentsAllowed: { $first: '$enrollmentsAllowed' },
            enrollmentDeadline: { $first: '$enrollmentDeadline' },
            totalEnrollments: { $first: '$totalEnrollments' },
            refundedEnrollments: { $push: '$enrollments' },
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'colleges',
              localField: 'college',
              foreignField: '_id',
              as: 'college',
            },
          },
          {
            $addFields: {
              college: { $arrayElemAt: ['$college', 0] },
              refundedEnrollments: { $size: '$refundedEnrollments' },
            },
          },
        ],
      );
    } else {
      pipeline.push({
        $addFields: {
          refundedEnrollments: { $size: '$refundedEnrollments' },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $addFields: {
            refundRate: {
              $cond: {
                if: { $ne: ['$totalEnrollments', 0] },
                then: { $divide: ['$refundedEnrollments', '$totalEnrollments'] },
                else: 0,
              },
            },
          },
        },
        {
          $addFields: {
            refundRate: {
              $multiply: ['$refundRate', 100],
            },
          },
        },
        {
          $match: {
            refundRate: {
              $lte: refundRate,
            },
          },
        },
      ],
    );

    const statistics = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getRefundStatisticsRows(params);

    return ResponseHandler.success({
      courses: statistics,
      rows: rows.data,
    });
  }

  async getHighRejectionCourses(params) {
    const { rejectionRate, page, perPage, collegeId } = params;

    const pipeline = [];

    if (collegeId) {
      pipeline.push({
        $match: {
          collegeId,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalEnrollments: {
              $size: '$enrollments',
            },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': 'declined',
          },
        },
        {
          $group: {
            _id: '$_id',
            course: { $first: '$title' },
            coverPhoto: { $first: '$coverPhoto' },
            coverPhotoThumbnail: { $first: '$coverPhotoThumbnail' },
            college: { $first: '$collegeId' },
            enrollmentsAllowed: { $first: '$enrollmentsAllowed' },
            enrollmentDeadline: { $first: '$enrollmentDeadline' },
            totalEnrollments: { $first: '$totalEnrollments' },
            rejectedEnrollments: { $push: '$enrollments' },
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'colleges',
              localField: 'college',
              foreignField: '_id',
              as: 'college',
            },
          },
          {
            $addFields: {
              college: { $arrayElemAt: ['$college', 0] },
              rejectedEnrollments: { $size: '$rejectedEnrollments' },
            },
          },
        ],
      );
    } else {
      pipeline.push({
        $addFields: {
          rejectedEnrollments: { $size: '$rejectedEnrollments' },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $addFields: {
            rejectionRate: {
              $cond: {
                if: { $ne: ['$totalEnrollments', 0] },
                then: { $divide: ['$rejectedEnrollments', '$totalEnrollments'] },
                else: 0,
              },
            },
          },
        },
        {
          $addFields: {
            rejectionRate: {
              $multiply: ['$rejectionRate', 100],
            },
          },
        },
        {
          $match: {
            rejectionRate: {
              $lte: rejectionRate,
            },
          },
        },
      ],
    );

    const statistics = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getHighRejectionCoursesRows(params);

    return ResponseHandler.success({
      courses: statistics,
      rows: rows.data,
    });
  }

  async getEnrollmentStatisticsRows(params) {
    const { filter, collegeId } = params;

    const pipeline = [];

    const match = {
      enrollmentDeadline: {
        $gte: new Date(),
      },
    };

    if (collegeId) {
      // @ts-ignore
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': {
              $nin: ['canceled', 'declined', 'refunded', 'unpaid'],
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            enrollmentDeadline: { $first: '$enrollmentDeadline' },
            enrollmentsAllowed: { $first: '$enrollmentsAllowed' },
            enrollments: { $push: '$enrollments' },
          },
        },
        {
          $addFields: {
            enrollments: { $size: '$enrollments' },
          },
        },
        {
          $addFields: {
            enrollmentRate: {
              $divide: ['$enrollments', '$enrollmentsAllowed'],
            },
          },
        },
        {
          $addFields: {
            enrollmentRate: {
              $multiply: ['$enrollmentRate', 100],
            },
          },
        },
      ],
    );

    if (filter === 'underenrolled') {
      const twoWeeks = moment()
        .endOf('day')
        .add(2, 'w')
        .toISOString();
      pipeline.push({
        $match: {
          enrollmentRate: {
            $lte: 20,
          },
          // enrollmentDeadline: {
          //   $lte: new Date(twoWeeks),
          // },
        },
      });
    } else {
      const oneWeek = moment()
        .endOf('day')
        .add(1, 'w')
        .toISOString();
      pipeline.push({
        $match: {
          enrollmentRate: {
            $gte: 85,
          },
          // enrollmentDeadline: {
          //   $gte: new Date(oneWeek),
          // },
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const rows = await this.courseModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  async getRefundStatisticsRows(params) {
    const { refundRate, page, perPage, collegeId } = params;

    const pipeline = [];

    if (collegeId) {
      pipeline.push({
        $match: {
          collegeId,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalEnrollments: {
              $size: '$enrollments',
            },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': 'refunded',
          },
        },
        {
          $group: {
            _id: '$_id',
            course: { $first: '$title' },
            coverPhoto: { $first: '$coverPhoto' },
            coverPhotoThumbnail: { $first: '$coverPhotoThumbnail' },
            college: { $first: '$collegeId' },
            enrollmentsAllowed: { $first: '$enrollmentsAllowed' },
            enrollmentDeadline: { $first: '$enrollmentDeadline' },
            totalEnrollments: { $first: '$totalEnrollments' },
            refundedEnrollments: { $push: '$enrollments' },
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: 'colleges',
              localField: 'college',
              foreignField: '_id',
              as: 'college',
            },
          },
          {
            $addFields: {
              college: { $arrayElemAt: ['$college', 0] },
              refundedEnrollments: { $size: '$refundedEnrollments' },
            },
          },
        ],
      );
    } else {
      pipeline.push({
        $addFields: {
          refundedEnrollments: { $size: '$refundedEnrollments' },
        },
      });
    }

    pipeline.push(
      ...[
        {
          $addFields: {
            refundRate: {
              $cond: {
                if: { $ne: ['$totalEnrollments', 0] },
                then: { $divide: ['$refundedEnrollments', '$totalEnrollments'] },
                else: 0,
              },
            },
          },
        },
        {
          $addFields: {
            refundRate: {
              $multiply: ['$refundRate', 100],
            },
          },
        },
        {
          $match: {
            refundRate: {
              $lte: refundRate,
            },
          },
        },
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const rows = await this.courseModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  async getHighRejectionCoursesRows(params) {
    const { rejectionRate, collegeId } = params;

    const pipeline = [];

    if (collegeId) {
      pipeline.push({
        $match: {
          collegeId,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalEnrollments: {
              $size: '$enrollments',
            },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollments.status': 'declined',
          },
        },
        {
          $group: {
            _id: '$_id',
            totalEnrollments: { $first: '$totalEnrollments' },
            rejectedEnrollments: { $push: '$enrollments' },
          },
        },
        {
          $addFields: {
            rejectedEnrollments: { $size: '$rejectedEnrollments' },
          },
        },
        {
          $addFields: {
            rejectionRate: {
              $cond: {
                if: { $ne: ['$totalEnrollments', 0] },
                then: { $divide: ['$rejectedEnrollments', '$totalEnrollments'] },
                else: 0,
              },
            },
          },
        },
        {
          $addFields: {
            rejectionRate: {
              $multiply: ['$rejectionRate', 100],
            },
          },
        },
        {
          $match: {
            rejectionRate: {
              $gte: rejectionRate,
            },
          },
        },
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const rows = await this.courseModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  // async getFollowUpCourses(collegeId) {
  //   collegeId = mongoose.Types.ObjectId(collegeId);
  //   return await this.courseModel.find({collegeId, 'date.end': {$lt: Date.now()}}, 'title')
  //                                .sort({title: 1}).lean().exec();
  // }

  async getCoursesforLearners(params: LearnersCoursesListDto, learner, queryParams?: string) {
    const {
      keyword,
      courseType,
      colleges,
      collegeNames,
      page,
      perPage,
      minPrice,
      maxPrice,
      rating,
      startDate,
      endDate,
      relatedCredentials,
      hoursOffered,
      occupations,
      skillOutcomes,
      knowledgeOutcomes,
      experiences,
      minEnrollments,
      maxEnrollments,
      lat,
      lng,
      employers,
      categories,
      sort,
      credits,
      continuingCredits,
      collegeId,
      funding,
    } = params;

    const redisConnected = await this.redisCacheService.checkClient();

    const [collegesListCache, courseCategoriesCache] = await Promise.all([
      redisConnected ? this.redisCacheService.get(RedisKeys.collegesListForFilter) : null,
      redisConnected && !collegeId ? this.redisCacheService.get(RedisKeys.courseCategoriesForFilter) : null,
    ]);
    let cachedData = null;
    if (!learner && redisConnected) {
      cachedData = await this.redisCacheService.get(queryParams);
    }
    // console.log(cachedData ? 'cache exists' : 'cache gone');
    if (!cachedData) {
      const [keywordColleges, keywordEmployers] = keyword
        ? await Promise.all([
            this.collegeModel
              .find({ title: { $regex: keyword, $options: 'i' } }, '_id')
              .lean()
              .exec(),
            this.employerModel
              .find({ title: { $regex: keyword, $options: 'i' } }, '_id')
              .lean()
              .exec(),
          ])
        : [[], []];
      const collegeIds = keyword ? keywordColleges.map(college => college._id) : [];
      const employerIds = keyword ? keywordEmployers.map(employer => employer._id) : [];
      const match = {
        enrollmentDeadline: { $gte: new Date() },
        unpublishedDate: null,
        status: { $nin: [CourseStatus.CANCELED, CourseStatus.COMING_SOON] },
      };

      const lowerPriceRange = minPrice ? minPrice : -1;
      const upperPriceRange = maxPrice ? maxPrice : Infinity;

      if (collegeId) {
        // @ts-ignore
        match.collegeId = mongoose.Types.ObjectId(collegeId);
      }

      // if (colleges && !collegeId) {
      //   const collegesFilter = colleges.map(college => mongoose.Types.ObjectId(college));
      //   // @ts-ignore
      //   match.collegeId = { $in: collegesFilter };
      // }

      if (courseType) {
        // @ts-ignore
        match.venue = { $in: courseType };
      }
      if (hoursOffered) {
        // @ts-ignore
        match.hoursOffered = { $in: hoursOffered };
      }
      // if (employers) {
      //   const employerLists = employers.map(employer => mongoose.Types.ObjectId(employer));
      //   // @ts-ignore
      //   match.employers = { $in: employerLists };
      // }
      if (categories) {
        // @ts-ignore
        match.categories = { $all: categories };
      }

      if (rating) {
        // @ts-ignore
        match.rating = {
          $gte: rating,
        };
      }

      if (minEnrollments) {
        // @ts-ignore
        match.enrollmentsAllowed = { $gte: minEnrollments };
      }

      if (maxEnrollments) {
        if (minEnrollments) {
          // @ts-ignore
          match.enrollmentsAllowed.$lte = maxEnrollments;
        } else {
          // @ts-ignore
          match.enrollmentsAllowed = { $lte: maxEnrollments };
        }
      }

      // if (credits) {
      //   // @ts-ignore
      //   match.credits = {$ne: null, $gt: 0};
      //   // match.credits.$gt = 0;
      // }

      // if (continuingCredits) {
      //   // @ts-ignore
      //   match.continuingCredits = {$ne: null, $gt: 0};
      // }

      if (lat || lng) {
        // @ts-ignore
        match.coordinates = {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        };
      }

      if (occupations) {
        // @ts-ignore
        match.occupations = { $elemMatch: { title: { $in: occupations } } };
      }

      if (skillOutcomes) {
        // @ts-ignore
        match.skillOutcomes = { $elemMatch: { name: { $in: skillOutcomes } } };
      }

      if (knowledgeOutcomes) {
        // @ts-ignore
        match.knowledgeOutcomes = { $elemMatch: { name: { $in: knowledgeOutcomes } } };
      }

      if (experiences) {
        // @ts-ignore
        match.experiences = { $elemMatch: { name: { $in: experiences } } };
      }

      if (keyword || relatedCredentials || credits || continuingCredits || funding) {
        // @ts-ignore
        match.$and = [];

        if (relatedCredentials) {
          const credentialMatch = { $or: [] };
          if (relatedCredentials.includes(RelatedCredentials.LICENSE)) {
            // @ts-ignore
            credentialMatch.$or.push({ licenses: { $exists: true, $ne: [] } });
          }
          if (relatedCredentials.includes(RelatedCredentials.CERTIFICATE)) {
            // @ts-ignore
            credentialMatch.$or.push({ certificates: { $exists: true, $ne: [] } });
          }
          if (relatedCredentials.includes(RelatedCredentials.CERTIFICATION)) {
            // @ts-ignore
            credentialMatch.$or.push({ certifications: { $exists: true, $ne: [] } });
          }
          if (relatedCredentials.includes(RelatedCredentials.ASSOCIATESDEGREE)) {
            // @ts-ignore
            credentialMatch.$or.push({ associateDegrees: { $exists: true, $ne: [] } });
          }
          // @ts-ignore
          match.$and.push(credentialMatch);
        }

        if (keyword) {
          // @ts-ignore
          match.$and.push({
            $or: [
              { collegeId: { $in: collegeIds } },
              { employers: { $in: employerIds } },
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
              { outline: { $regex: keyword, $options: 'i' } },
              { venue: { $regex: keyword, $options: 'i' } },
              { 'occupations.title': { $regex: keyword, $options: 'i' } },
              { 'knowledgeOutcomes.name': { $regex: keyword, $options: 'i' } },
              { 'skillOutcomes.name': { $regex: keyword, $options: 'i' } },
              { 'experiences.name': { $regex: keyword, $options: 'i' } },
              { 'associateDegrees.CIPTitle': { $regex: keyword, $options: 'i' } },
              { 'certificates.CIPTitle': { $regex: keyword, $options: 'i' } },
              { 'certifications.Name': { $regex: keyword, $options: 'i' } },
              { 'licenses.Title': { $regex: keyword, $options: 'i' } },
            ],
          });
        }

        if (credits || continuingCredits) {
          const creditMatch = { $or: [] };

          if (credits) {
            // @ts-ignore
            creditMatch.$or.push({ credits: { $ne: null, $gt: 0 } });
          }
          if (continuingCredits) {
            // @ts-ignore
            creditMatch.$or.push({ continuingCredits: { $ne: null, $gt: 0 } });
          }
          // @ts-ignore
          match.$and.push(creditMatch);
        }

        if (funding) {
          const fundingMatch = { $or: [] };
          if (funding.includes(Funding.WIOA)) {
            // @ts-ignore
            fundingMatch.$or.push({ wioaFunds: true });
          }
          if (funding.includes(Funding.VETERAN_BENEFITS)) {
            // @ts-ignore
            fundingMatch.$or.push({ veteranBenefits: true });
          }

          // @ts-ignore
          match.$and.push(fundingMatch);
        }
      }

      const pipeline = [];

      pipeline.push({
        $match: match,
      });

      if (startDate) {
        pipeline.push(
          ...[
            {
              $match: {
                'date.start': {
                  $gte: new Date(
                    moment(startDate)
                      .startOf('day')
                      .toISOString(),
                  ),
                },
              },
            },
          ],
        );
      }

      if (endDate) {
        pipeline.push(
          ...[
            {
              $match: {
                'date.end': {
                  $lte: new Date(
                    moment(endDate)
                      .endOf('day')
                      .toISOString(),
                  ),
                },
              },
            },
          ],
        );
      }

      pipeline.push(
        ...[
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
              totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.unmudlShare', 100] }] }] },
            },
          },
          {
            $match: {
              'collegeObj.isSuspended': { $ne: true },
              totalPrice: { $gte: lowerPriceRange, $lte: upperPriceRange },
            },
          },
          {
            $lookup: {
              from: 'employers',
              localField: 'employers',
              foreignField: '_id',
              as: 'employers',
            },
          },
        ],
      );

      if (collegeNames && collegeNames.length > 0) {
        pipeline.push(
          ...[
            {
              $match: {
                'collegeObj.title': { $in: collegeNames },
              },
            },
          ],
        );
      }

      if (colleges && colleges.length > 0 && !collegeId) {
        pipeline.push(
          ...[
            {
              $match: {
                'collegeObj.title': { $in: colleges },
              },
            },
          ],
        );
      }

      if (employers && employers.length > 0) {
        pipeline.push(
          ...[
            {
              $match: {
                'employers.title': { $in: employers },
              },
            },
          ],
        );
      }

      const countPipeline = Object.assign([], pipeline);
      const filtersPipeline = Object.assign([], pipeline);

      countPipeline.push(
        ...[
          {
            $project: {
              _id: 1,
            },
          },
        ],
      );

      // const sortObj = { $sort: { enrollmentEnded: 1, sort: 1, createdAt: -1 } };
      let sortObj = {};
      switch (sort) {
        case LearnerCourseListSortBy.Relevance:
          sortObj = { $sort: { enrollmentEnded: 1, sort: 1, enrollmentDeadline: 1, createdAt: -1 } };
          break;
        case LearnerCourseListSortBy.ComunityCollege:
          sortObj = { $sort: { enrollmentEnded: 1, 'college.title': 1, sort: 1, enrollmentDeadline: 1, createdAt: -1 } };
          break;
        case LearnerCourseListSortBy.HighestPrice:
          sortObj = { $sort: { enrollmentEnded: 1, totalPrice: -1, sort: 1, enrollmentDeadline: 1, createdAt: -1 } };
          break;
        case LearnerCourseListSortBy.LowestPrice:
          sortObj = { $sort: { enrollmentEnded: 1, totalPrice: 1, sort: 1, enrollmentDeadline: 1, createdAt: -1 } };
          break;
        case LearnerCourseListSortBy.MostRecent:
          sortObj = { $sort: { enrollmentEnded: 1, enrollmentDeadline: 1, createdAt: -1, sort: 1 } };
          break;
        default:
          sortObj = { $sort: { enrollmentEnded: 1 } };
      }

      pipeline.push(
        ...[
          {
            $addFields: {
              enrollmentEnded: { $cond: [{ $lte: ['$enrollmentDeadline', new Date()] }, 1, 0] },
              sort: {
                $switch: {
                  branches: [
                    {
                      case: { $regexMatch: { input: '$title', regex: keyword, options: 'i' } },
                      then: 1,
                    },
                    {
                      case: { $regexMatch: { input: '$venue', regex: keyword, options: 'i' } },
                      then: 2,
                    },
                    {
                      case: { $in: ['$collegeId', collegeIds] },
                      then: 3,
                    },
                    {
                      case: { $gt: [{ $size: { $setIntersection: ['$employers', employerIds] } }, 0] },
                      then: 4,
                    },
                    {
                      case: { $regexMatch: { input: '$description', regex: keyword, options: 'i' } },
                      then: 5,
                    },
                    {
                      case: { $regexMatch: { input: '$outline', regex: keyword, options: 'i' } },
                      then: 5,
                    },
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: 'associateDegrees.CIPTitle', regex: keyword, options: 'i' } },
                          { $regexMatch: { input: 'certificates.CIPTitle', regex: keyword, options: 'i' } },
                          { $regexMatch: { input: 'certifications.Name', regex: keyword, options: 'i' } },
                          { $regexMatch: { input: 'licenses.Title', regex: keyword, options: 'i' } },
                        ],
                      },
                      then: 6,
                    },
                  ],
                  default: 7,
                },
              },
            },
          },
          sortObj,
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
          {
            $lookup: {
              from: 'enrollments',
              let: { courseId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$courseId', '$$courseId'] },
                        { $ne: ['$status', EnrollmentStatus.CANCELED] },
                        { $ne: ['$status', EnrollmentStatus.REFUNDED] },
                        { $ne: ['$status', EnrollmentStatus.DECLINED] },
                      ],
                    },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: 'enrollments',
            },
          },
          {
            $addFields: {
              totalEnrollments: { $size: '$enrollments' },
              'college._id': '$collegeObj._id',
              'college.title': '$collegeObj.title',
              'college.collegeLogo': '$collegeObj.collegeLogo',
              'college.collegeLogoThumbnail': '$collegeObj.collegeLogoThumbnail',
              'college.numId': '$collegeObj.numId',
              'college.city': '$collegeObj.city',
              'college.state': '$collegeObj.state',
              'college.zip': '$collegeObj.zip',
            },
          },
          {
            $addFields: {
              availableSlots: { $subtract: ['$enrollmentsAllowed', '$totalEnrollments'] },
            },
          },
          // {
          //   $lookup: {
          //     from: 'employers',
          //     localField: 'employers',
          //     foreignField: '_id',
          //     as: 'employers',
          //   },
          // },
          {
            $project: {
              title: 1,
              coverPhoto: 1,
              coverPhotoThumbnail: 1,
              numId: 1,
              college: 1,
              rating: 1,
              ratingCount: { $size: '$reviews' },
              date: 1,
              enrollmentDeadline: 1,
              isUnmudlOriginal: 1,
              autoEnroll: 1,
              description: 1,
              totalPrice: 1,
              availableSlots: 1,
              venue: 1,
              coordinates: 1,
              employers: 1,
              'occupations.title': 1,
              'skillOutcomes.name': 1,
              'knowledgeOutcomes.name': 1,
              'experiences.name': 1,
              credits: 1,
              continuingCredits: 1,
              associateDegrees: 1,
              certificates: 1,
              certifications: 1,
              licenses: 1,
              address: 1,
              time: 1,
              customSchedule: 1,
              categories: 1,
              collegeObj: 1,
              enrollmentEnded: 1,
            },
          },
          sortObj,
          { $unset: 'collegeObj' },
        ],
      );

      if (learner) {
        const cart = learner.cart.map(cartObj => mongoose.Types.ObjectId(cartObj.course));
        const wishlist = learner.wishList.map(wishlistObj => mongoose.Types.ObjectId(wishlistObj.course));
        pipeline.push(
          ...[
            {
              $lookup: {
                from: 'enrollments',
                let: { courseId: '$_id', learnerId: mongoose.Types.ObjectId(learner._id) },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ['$courseId', '$$courseId'] }, { $eq: ['$learnerId', '$$learnerId'] }] } } },
                  { $sort: { createdAt: -1 } },
                  { $project: { status: 1 } },
                  { $limit: 1 },
                ],
                as: 'enrollments',
              },
            },
            { $unwind: { path: '$enrollments', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                enrollmentStatus: { $ifNull: ['$enrollments.status', null] },
                enrollmentId: { $ifNull: ['$enrollments._id', null] },
                isInCart: { $cond: { if: { $in: ['$_id', cart] }, then: true, else: false } },
                isInWishList: { $cond: { if: { $in: ['$_id', wishlist] }, then: true, else: false } },
              },
            },
            { $unset: 'enrollments' },
            sortObj,
          ],
        );
      }

      const [courses, allCourses, landingPageInfo, collegesList, courseCategories, { data: filters }] = await Promise.all([
        this.courseModel.aggregate(pipeline).exec(),
        this.courseModel.aggregate(countPipeline).exec(),
        this.landingPageModel
          .findOne({}, 'title tagLine')
          .lean()
          .exec(),
        !collegesListCache
          ? this.collegeModel
              .find({ isSuspended: { $ne: true }, invitation: { $ne: 'pending' } }, 'title')
              .sort({ title: 1 })
              .collation({ locale: 'en', strength: 2 })
              .lean()
              .exec()
          : collegesListCache,
        !courseCategoriesCache
          ? !collegeId
            ? this.courseCategoryModel
                .find({}, 'title')
                .sort({ title: 1 })
                .lean()
                .exec()
            : this.courseCategoryModel.aggregate([
                {
                  $lookup: {
                    from: 'courses',
                    let: { title: '$title' },
                    pipeline: [
                      { $unwind: '$categories' },
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$categories', '$$title'] },
                              { $gte: ['$enrollmentDeadline', new Date()] },
                              { $eq: ['$unpublishedDate', null] },
                              { $ne: ['$status', CourseStatus.CANCELED] },
                              { $ne: ['$status', CourseStatus.COMING_SOON] },
                            ],
                          },
                        },
                      },
                      {
                        $lookup: {
                          from: 'colleges',
                          localField: 'collegeId',
                          foreignField: '_id',
                          as: 'college',
                        },
                      },
                      { $unwind: '$college' },
                      { $match: { 'college._id': mongoose.Types.ObjectId(collegeId) } },
                      { $limit: 1 },
                      { $project: { _id: 1 } },
                    ],
                    as: 'courses',
                  },
                },
                { $unwind: '$courses' },
                { $project: { _id: 1, title: 1 } },
              ])
          : courseCategoriesCache,
        this.getLearnerCourseSearchFilters(filtersPipeline),
      ]);

      const responseData = {
        courses,
        coursesCount: allCourses.length,
        title: landingPageInfo.title,
        tagLine: landingPageInfo.tagLine,
        filters,
      };

      if (redisConnected) {
        await this.redisCacheService.set(queryParams, responseData, 10);
        if (!collegesListCache) {
          await this.redisCacheService.set(RedisKeys.collegesListForFilter, collegesList, 30);
        }
        if (!courseCategoriesCache && !collegeId) {
          await this.redisCacheService.set(RedisKeys.courseCategoriesForFilter, courseCategories, 30);
        }
      }
      // @ts-ignore
      responseData.collegesList = !collegeId ? collegesList : [];
      // @ts-ignore
      responseData.courseCategories = courseCategories;

      return ResponseHandler.success(responseData);
    } else {
      const [collegesList, courseCategories] = await Promise.all([
        !collegesListCache
          ? this.collegeModel
              .find({ isSuspended: { $ne: true }, invitation: { $ne: 'pending' } }, 'title')
              .sort({ title: 1 })
              .collation({ locale: 'en', strength: 2 })
              .lean()
              .exec()
          : collegesListCache,
        !courseCategoriesCache
          ? this.courseCategoryModel
              .find({}, 'title')
              .sort({ title: 1 })
              .lean()
              .exec()
          : courseCategoriesCache,
      ]);

      if (!collegesListCache && redisConnected) {
        await this.redisCacheService.set(RedisKeys.collegesListForFilter, collegesList, 30);
      }
      if (!courseCategoriesCache && redisConnected) {
        await this.redisCacheService.set(RedisKeys.courseCategoriesForFilter, courseCategories, 30);
      }
      // @ts-ignore
      cachedData.collegesList = !collegeId ? collegesList : [];
      // @ts-ignore
      cachedData.courseCategories = courseCategories;

      return ResponseHandler.success(cachedData);
    }
  }

  async getLearnerCourseSearchFilters(pipeline) {
    const [colleges, employers, categories, price, date] = await Promise.all([
      this.courseModel
        .aggregate([
          ...pipeline,
          { $group: { _id: '$collegeId', college: { $first: '$collegeObj' } } },
          { $project: { _id: 1, title: '$college.title' } },
          { $sort: { title: 1 } },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.courseModel
        .aggregate([
          ...pipeline,
          { $unwind: '$employers' },
          { $group: { _id: '$employers._id', employer: { $first: '$employers' }, coursesCount: { $sum: 1 } } },
          {
            $project: {
              _id: 1,
              coursesCount: 1,
              createdAt: '$employer.createdAt',
              title: '$employer.title',
              updatedAt: '$employer.updatedAt',
              website: '$employer.website',
              logo: '$employer.logo',
            },
          },
          { $sort: { title: 1 } },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.courseModel
        .aggregate([
          ...pipeline,
          { $unwind: '$categories' },
          { $group: { _id: '$categories' } },
          {
            $lookup: {
              from: 'course-categories',
              localField: '_id',
              foreignField: 'title',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          { $project: { _id: '$category._id', title: '$category.title' } },
          { $sort: { title: 1 } },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.courseModel.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' },
          },
        },
      ]),
      this.courseModel.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            startMin: { $max: '$date.start' },
            startMax: { $min: '$date.start' },
            endMin: { $min: '$date.end' },
            endMax: { $max: '$date.end' },
          },
        },
      ]),
    ]);

    return ResponseHandler.success({
      colleges,
      employers,
      categories,
      price: price.length > 0 ? price[0] : { min: 0, max: 0 },
      date: date.length > 0 ? date[0] : { startMin: null, startMax: null, endMin: null, endMax: null },
    });
  }

  async addToCart(cartData: AddToCartDto, learner) {
    if (cartData.emailAddress) {
      const existingLearner = await this.learnerModel
        .findOne({ emailAddress: cartData.emailAddress, _id: { $ne: learner._id } }, '_id')
        .lean()
        .exec();
      if (existingLearner) {
        return ResponseHandler.fail(responseMessages.common.emailRegistered);
      }
    }

    if (cartData.phoneNumber) {
      const existingLearner = await this.learnerModel
        .findOne({ phoneNumber: cartData.phoneNumber, _id: { $ne: learner._id } }, '_id')
        .lean()
        .exec();
      if (existingLearner) {
        return ResponseHandler.fail(responseMessages.common.phoneNumberRegistered);
      }
    }
    const update: LearnerUpdate = { $addToSet: { cart: cartData }, $pull: { wishList: { course: cartData.course } } };

    cartData.phoneNumber && learner.primarySignup !== 'phoneNumber'
      ? (update.phoneNumber = cartData.phoneNumber)
      : (cartData.phoneNumber = cartData.phoneNumber);
    cartData.emailAddress && learner.primarySignup !== 'emailAddress'
      ? (update.emailAddress = cartData.emailAddress)
      : (cartData.emailAddress = cartData.emailAddress);
    cartData.firstname ? (update.firstname = cartData.firstname) : (cartData.firstname = cartData.firstname);
    cartData.lastname ? (update.lastname = cartData.lastname) : (cartData.lastname = cartData.lastname);
    cartData.firstname ? (update.fullname = cartData.firstname + ' ' + cartData.lastname) : (cartData.firstname = cartData.firstname);
    cartData.dateOfBirth ? (update.dateOfBirth = cartData.dateOfBirth) : (cartData.dateOfBirth = cartData.dateOfBirth);
    cartData.address ? (update.address = cartData.address) : (cartData.address = cartData.address);
    cartData.gender ? (update.gender = cartData.gender) : (cartData.gender = cartData.gender);
    cartData.city ? (update.city = cartData.city) : (cartData.city = cartData.city);
    cartData.state ? (update.state = cartData.state) : (cartData.state = cartData.state);
    cartData.zip ? (update.zip = cartData.zip) : (cartData.zip = cartData.zip);
    cartData.country ? (update.country = cartData.country) : (cartData.country = cartData.country);
    cartData.coordinates ? (update.coordinates = cartData.coordinates) : (cartData.coordinates = cartData.coordinates);
    cartData.veteranBenefits !== undefined
      ? (update.veteranBenefits = cartData.veteranBenefits)
      : (cartData.veteranBenefits = cartData.veteranBenefits);
    cartData.militaryStatus ? (update.militaryStatus = cartData.militaryStatus) : (cartData.militaryStatus = cartData.militaryStatus);
    cartData.isSpouseActive !== undefined
      ? (update.isSpouseActive = cartData.isSpouseActive)
      : (cartData.isSpouseActive = cartData.isSpouseActive);
    cartData.militaryBenefit ? (update.militaryBenefit = cartData.militaryBenefit) : (cartData.militaryBenefit = cartData.militaryBenefit);
    // cartData.cumulativePostNineElevenService ? (update.cumulativePostNineElevenService = cartData.cumulativePostNineElevenService) : (cartData.cumulativePostNineElevenService = cartData.cumulativePostNineElevenService);
    // cartData.completedEnlishment ? (update.completedEnlishment = cartData.completedEnlishment) : (cartData.completedEnlishment = cartData.completedEnlishment);
    // cartData.isEligiblePostNineElevenBill ? (update.isEligiblePostNineElevenBill = cartData.isEligiblePostNineElevenBill) : (cartData.isEligiblePostNineElevenBill = cartData.isEligiblePostNineElevenBill);
    // cartData.dependentCount ? (update.dependentCount = cartData.dependentCount) : (cartData.dependentCount = cartData.dependentCount);
    cartData.wioaBenefits !== undefined ? (update.wioaBenefits = cartData.wioaBenefits) : (cartData.wioaBenefits = cartData.wioaBenefits);
    const updatedLearner = await this.learnerModel.findOneAndUpdate(
      {
        _id: learner._id,
        'cart.course': { $ne: cartData.course },
      },
      update,
      {
        new: true,
      },
    );

    return updatedLearner ? ResponseHandler.success(updatedLearner) : ResponseHandler.fail('Course already in cart');
  }

  async updateCoursePublishedStatus(course) {
    const oldCourse = await this.courseModel.findById(course._id).exec();

    if (oldCourse) {
      const newCourse = await this.courseModel.findByIdAndUpdate(
        course._id,
        {
          $set: {
            status: course.status,
            unpublishedBy: course.unpublishedBy,
            unpublishedDate: course.unpublishedDate,
          },
        },
        {
          new: true,
        },
      );

      return ResponseHandler.success(newCourse, responseMessages.success.publishedStatus(course.status));
    } else {
      return ResponseHandler.fail(responseMessages.editCourse.courseNotFound);
    }
  }
  async addToWishList(courseIds, learner) {
    const courses = [];
    courseIds.forEach(courseId => {
      courses.push({ course: courseId });
    });
    const updatedLearner = await this.learnerModel.findOneAndUpdate(
      {
        _id: learner._id,
        'wishList.course': { $nin: courseIds },
      },
      {
        $addToSet: { wishList: { $each: courses } },
      },
      {
        new: true,
      },
    );

    return updatedLearner ? ResponseHandler.success(updatedLearner) : ResponseHandler.fail('Course already in wishList');
  }

  async addToCheckoutList(courses, courseIds, learner) {
    const updatedLearner = await this.learnerModel.findOneAndUpdate(
      {
        _id: learner._id,
      },
      {
        $push: { checkoutList: { $each: courses } },
        $pull: { cart: { course: { $in: courseIds } } },
      },
      {
        new: true,
      },
    );

    return ResponseHandler.success(updatedLearner);
  }

  async getPromosForCourse(params) {
    const { courseId, collegeId, page, perPage, keyword } = params;

    const match = {};

    // @ts-ignore
    match.$or = [
      {
        $expr: {
          $and: [{ $eq: ['$courses', mongoose.Types.ObjectId(courseId)] }, { $eq: ['$applyTo', 'selected'] }],
        },
      },
      {
        $expr: {
          $and: [{ $eq: ['$applyTo', 'all'] }, { $eq: ['$type', 'unmudl'] }],
        },
      },
      {
        $expr: {
          $and: [{ $eq: ['$applyTo', 'all'] }, { $eq: ['$collegeId', collegeId] }],
        },
      },
    ];

    const promos = await this.promoModel
      .aggregate([
        {
          $match: {
            title: {
              $regex: keyword,
              $options: 'i',
            },
          },
        },
        {
          $unwind: {
            path: '$courses',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: match,
        },
      ])
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return ResponseHandler.success(promos);
  }

  async getReviewById(id): Promise<SuccessInterface> {
    const course = await this.courseModel
      .findOne({
        'reviews._id': id,
      })
      .lean();

    if (course) {
      const review = await course.reviews.filter(item => item._id.toString() === id);

      return ResponseHandler.success(review && review.length > 0 ? review[0] : null);
    }
    return ResponseHandler.success(null);
  }

  async getRatingCategories() {
    const categories = await this.ratingCategoriesModel
      .find()
      .sort({ order: 1 })
      .lean();
    return ResponseHandler.success(categories);
  }

  async getLevelAnchors(params) {
    const { elementID, limit } = params;
    const anchors = await this.levelAnchorsModel
      .find({ elementID })
      .sort({ anchorValue: -1 })
      .limit(limit)
      .lean()
      .exec();
    return ResponseHandler.success(anchors);
  }

  async getCipCertificates(params) {
    const { keyword, page, perPage } = params;

    const certificates = await this.cipCertificatesModel
      .find({}, 'CIPTitle CIPCode CIPDefinitions')
      .byKeyword(keyword)
      .paginate(page, perPage)
      .lean();
    return ResponseHandler.success(certificates);
  }

  async updateCip() {
    const certificates = await this.cipCertificatesModel.find();
    // console.log(certificates);
    const promises = certificates.map(certificate => {
      // console.log(certificate."CIPFamily");
      // certificate.CIPFamily = certificate.CIPFamily.replace('="', '');
      certificate.CIPTitle = certificate.CIPTitle.replace('"', '');
      certificate.CIPCode = certificate.CIPCode.replace('"', '');
      // certificate.CIPCode = certificate.CIPCode.replace('=', '');
      // console.log(certificate.CIPFamily);
      return certificate.save();
    });
    await Promise.all(promises);
    return ResponseHandler.success({}, 'allDone');
  }

  mergeArrays(...arrays) {
    let jointKnowledge = [];
    let jointSkills = [];
    let jointExperience = [];

    // console.log(arrays[0]);
    arrays.forEach(array => {
      // console.log(array.status);
      jointKnowledge = array.data.knowledge ? [...jointKnowledge, ...array.data.knowledge.element] : jointKnowledge;
      jointSkills = array.data.skills ? [...jointSkills, ...array.data.skills.element] : jointSkills;
      jointExperience = array.data.detailed_work_activities
        ? [...jointExperience, ...array.data.detailed_work_activities.activity]
        : jointExperience;
    });
    const knowledge = jointKnowledge.filter((item, index) => jointKnowledge.map(obj => obj.id).indexOf(item.id) === index);
    const skills = jointSkills.filter((item, index) => jointSkills.map(obj => obj.id).indexOf(item.id) === index);
    const experience = jointExperience.filter((item, index) => jointExperience.map(obj => obj.id).indexOf(item.id) === index);
    return { knowledge, skills, experience };
  }

  async getOccupationsForFilter(keyword) {
    const data = await this.courseModel.aggregate([
      {
        $match: { 'occupations.title': { $regex: keyword, $options: 'i' } },
      },
      { $unwind: '$occupations' },
      {
        $group: {
          _id: '$occupations.title',
          title: { $first: '$occupations.title' },
        },
      },
    ]);
    return ResponseHandler.success(data);
  }

  async getSkillsForFilter(keyword) {
    const data = await this.courseModel.aggregate([
      {
        $match: { 'skillOutcomes.name': { $regex: keyword, $options: 'i' } },
      },
      { $unwind: '$skillOutcomes' },
      {
        $group: {
          _id: '$skillOutcomes.name',
          title: { $first: '$skillOutcomes.name' },
        },
      },
    ]);
    return ResponseHandler.success(data);
  }

  async getKnowledgeOutcomesForFilter(keyword) {
    const data = await this.courseModel.aggregate([
      {
        $match: { 'knowledgeOutcomes.name': { $regex: keyword, $options: 'i' } },
      },
      { $unwind: '$knowledgeOutcomes' },
      {
        $group: {
          _id: '$knowledgeOutcomes.name',
          title: { $first: '$knowledgeOutcomes.name' },
        },
      },
    ]);
    return ResponseHandler.success(data);
  }

  async getExperiencesForFilter(keyword) {
    const data = await this.courseModel.aggregate([
      {
        $match: { 'experiences.name': { $regex: keyword, $options: 'i' } },
      },
      { $unwind: '$experiences' },
      {
        $group: {
          _id: '$experiences.name',
          title: { $first: '$experiences.name' },
        },
      },
    ]);
    return ResponseHandler.success(data);
  }

  async checkPromo(params) {
    const { courseId, promoCode, learnerId, cart } = params;
    const [course, promo] = await Promise.all([
      this.courseModel
        .findById(courseId)
        .populate('collegeId')
        .lean()
        .exec(),
      this.promoModel
        .findOne({ title: promoCode })
        .lean()
        .exec(),
    ]);
    // console.log(promo);
    if (!promo) {
      return ResponseHandler.fail('Invalid promo code.');
    }
    if (promo.learners && promo.learners.length > 0 && promo.learners.map(id => id.toString()).includes(learnerId.toString())) {
      const validEnrollmentWithPromo = await this.enrollmentModel
        .findOne({
          promoId: promo._id,
          learnerId,
          courseId,
          status: ['pending', 'approved', 'processed', 'transferred'],
        })
        .lean();
      if (validEnrollmentWithPromo) {
        return ResponseHandler.fail('You have already used this promo code.');
      }
    }
    // if (cart && cart.length > 0 && cart.map(obj => obj.promo.toString()).includes(promo._id.toString())) {
    //   return ResponseHandler.fail('You have already added this promo to a course in your cart.');
    // }
    if (new Date(promo.date.start) > new Date()) {
      return ResponseHandler.fail('Promo code is not valid yet.');
    }
    if (new Date(promo.date.end) < new Date()) {
      return ResponseHandler.fail('Promo code is expired.');
    }
    if (promo.courses && promo.courses.length > 0 && !promo.courses.map(id => id.toString()).includes(course._id.toString())) {
      return ResponseHandler.fail('Promo code not applicable for this course.');
    }
    if (
      (!promo.courses || (promo.courses && promo.courses.length < 1)) &&
      promo.collegeId &&
      promo.collegeId.toString() !== course.collegeId._id.toString()
    ) {
      return ResponseHandler.fail('Promo code not applicable for this course.');
    }

    let discountedPrice = 0;
    const coursePrice = course.price + course.price * (course.collegeId.unmudlShare / 100);
    if (promo.discountMetric !== 'percentage') {
      discountedPrice = coursePrice - promo.discount;
    } else {
      discountedPrice = coursePrice - coursePrice * (promo.discount / 100);
    }

    const discountedPriceWithTax = discountedPrice + discountedPrice * (course.collegeId.salesTax / 100);

    await this.learnerModel.updateOne(
      { _id: mongoose.Types.ObjectId(learnerId), 'cart.course': mongoose.Types.ObjectId(course._id) },
      { 'cart.$.promo': promo._id },
      { upsert: false, new: true },
    );

    return ResponseHandler.success({ discountedPrice, discountedPriceWithTax, promoId: promo._id });
  }

  async removePromo(courseId: string, learnerId: string) {
    await this.learnerModel.updateOne(
      { _id: mongoose.Types.ObjectId(learnerId), 'cart.course': mongoose.Types.ObjectId(courseId) },
      { 'cart.$.promo': null },
      { upsert: false, new: true },
    );

    return ResponseHandler.success({}, 'Promo removed successfully.');
  }

  async getHighestPriceAndEnrollmentSize() {
    const courses = await this.courseModel.aggregate([
      { $match: { unpublishedDate: null } },
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
          totalPrice: { $add: ['$price', { $multiply: ['$price', { $divide: ['$collegeObj.unmudlShare', 100] }] }] },
        },
      },
      {
        $group: {
          _id: null,
          highestPrice: { $max: '$totalPrice' },
          highestEnrollmentSize: { $max: '$enrollmentsAllowed' },
        },
      },
    ]);

    return ResponseHandler.success({
      highestPrice: courses[0].highestPrice,
      highestEnrollmentSize: courses[0].highestEnrollmentSize,
    });
  }
  // .data
  async getTaxForLearner(course, learner) {
    return ResponseHandler.success(0);
    // const courseData = await this.courseModel
    //   .findById(course._id, 'collegeId')
    //   .populate('collegeId', 'zip state')
    //   .lean()
    //   .exec();
    // if (learner.state && courseData.collegeId.state && courseData.collegeId.state.shortName === learner.state.shortName) {
    //   return ResponseHandler.success(0);
    // } else {
    //   if (learner.zip) {
    //     const { data: taxRate } = await this.taxRatesService.getTaxRateByPostalCode(learner.zip);

    //     if (!taxRate) {
    //       const url = `https://rest.avatax.com/api/v2/taxrates/bypostalcode`;

    //       const authString = `${AVALARA_USERNAME}:${AVALARA_PASSWORD}`;
    //       const encodedAuth = btoa(authString);
    //       // console.log(courseData.collegeId.zip);
    //       try {
    //         const response = await this.httpService
    //           .get(url, {
    //             params: {
    //               country: 'us',
    //               postalCode: learner.zip, // courseData.collegeId.zip,
    //             },
    //             headers: {
    //               authorization: `Basic ${encodedAuth}`,
    //             },
    //           })
    //           .toPromise();

    //         // console.log(courseData.collegeId);
    //         await this.taxRatesService.addTaxRate({
    //           state: courseData.collegeId.state ? courseData.collegeId.state.shortName : null,
    //           postalCode: learner.zip,
    //           taxRate: response.data.totalRate * 100,
    //         });
    //         // console.log(response.data.totalRate * 100);
    //         return ResponseHandler.success(response.data.totalRate * 100);
    //       } catch (e) {
    //         return ResponseHandler.success(
    //           0,
    //           'Your zip code is invalid. Please update it from your profile as it is used for tax calculation.',
    //         );
    //       }
    //     } else {
    //       return ResponseHandler.success(taxRate.taxRate);
    //     }
    //   } else {
    //     return ResponseHandler.fail('Please update your address from profile as it is used for tax calculation.');
    //   }
    // }
  }

  async resizeThumbnails() {
    const courses = await this.courseModel
      .find({ coverPhoto: { $nin: [null, '', undefined] }, unpublishedDate: null })
      .lean()
      .exec();
    await Promise.all(
      courses.map(async course => {
        const coverPhoto = 'public' + course.coverPhoto;
        await sharp(coverPhoto)
          .resize(COURSE_THUMBNAIL_SIZE)
          .toFile(coverPhoto.replace('.', '_t.'));
        // createCourseDto.coverPhotoThumbnail = createCourseDto.coverPhotoPath.replace('.', '_t.');
        return this.courseModel.findByIdAndUpdate(course._id, { coverPhotoThumbnail: course.coverPhoto.replace('.', '_t.') });
      }),
    );

    const blogs = await this.blogModel
      .find({ headerImage: { $nin: [null, ''] } })
      .lean()
      .exec();
    await Promise.all(
      blogs.map(async blog => {
        const headerImage = 'public' + blog.headerImage;
        await sharp(headerImage)
          .resize(BLOG_THUMBNAIL_SIZE)
          .toFile(headerImage.replace('.', '_t.'));
        // createblogDto.headerImageThumbnail = createblogDto.headerImagePath.replace('.', '_t.');
        return this.blogModel.findByIdAndUpdate(blog._id, { headerImageThumbnail: blog.headerImage.replace('.', '_t.') });
      }),
    );
    return ResponseHandler.success({}, 'resized successfull.');
  }

  async deleteCourse(courseId: string) {
    const [course, enrollments] = await Promise.all([
      this.courseModel
        .findById(courseId)
        .lean()
        .exec(),
      this.enrollmentModel.countDocuments({ courseId: mongoose.Types.ObjectId(courseId) }),
    ]);

    if (!course.unpublishedDate) {
      return ResponseHandler.fail('Cannot delete a published course.');
    }
    if (enrollments > 0) {
      return ResponseHandler.fail('Cannot delete this course as it has enrollments.');
    }

    course.courseId = course._id;
    delete course._id;
    await Promise.all([
      this.trashedCourseModel.create(course),
      this.courseModel.deleteOne({ _id: mongoose.Types.ObjectId(courseId) }).exec(),
    ]);
    return ResponseHandler.success({}, 'Course deleted successfully.');
  }

  async getCoursePriceAfterCommission({ collegeId, price, isDisplayPrice }: GetPriceAfterCommissionDto) {
    const college = await this.collegeModel
      .findById(collegeId, 'unmudlShare')
      .lean()
      .exec();
    const displayedPrice = isDisplayPrice ? price : (price * (college.unmudlShare / 100 + 1)).toFixed(2);
    const collegePrice = isDisplayPrice ? (price / (college.unmudlShare / 100 + 1)).toFixed(2) : price;
    return ResponseHandler.success({ displayedPrice, collegePrice });
  }

  async getDraftExist(draftId: string) {
    const draft = await this.courseDraftModel.findById(draftId);
    return !!draft ? ResponseHandler.success({}, 'Draft exists.') : ResponseHandler.fail('Draft does not exist.');
  }

  async getCourseCategories(keyword) {
    const categories = await this.courseCategoryModel
      .find()
      .byKeyword(keyword)
      .sort({ title: 1 })
      .lean()
      .exec();
    return ResponseHandler.success(categories);
  }

  // async updateCategories() {

  //   const promises = arr.map(arrObj => {
  //     if (arrObj.categories && arrObj.categories.length > 0) {
  //       return this.courseModel.findByIdAndUpdate(arrObj._id, {categories: arrObj.categories}, {new: false})
  //     };
  //   });
  //   const res = await Promise.all(promises);

  //   return res;
  // }
}
