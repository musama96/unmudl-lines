import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { College } from './college.model';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { ListDto } from '../common/dto/list.dto';
import { Role } from '../users/dto/createUser.dto';
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';
import * as json2csv from 'json2csv';
import { UpdateCollegeDto } from './dto/updateCollege.dto';
import { TransactionActivityCsvDto } from '../activities/dto/transactionActivityCsv.dto';
import { IntervalDto } from '../common/dto/interval.dto';
import { RecentActivityDto } from '../users/dto/recentActivity.dto';
import EmailHtmls from '../common/emailHtml';
import { CourseStatus } from '../courses/courses.model';
import { LocationDto } from './dto/location.dto';
import { LOCATION_SEARCH_RADIUS } from '../config/config';
import { JwtPayLoad } from '../auth/jwt.payload.interface';
import { JwtService } from '@nestjs/jwt';
import functions from '../common/functions';
import { UnmudlAccessLogsService } from '../unmudl-access-logs/unmudl-access-logs.service';
import { removeFilesFromS3 } from '../s3upload/s3';
import { CollegesListDto } from './dto/collegesList.dto';

@Injectable()
export class CollegesService {
  constructor(
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('collegetokens') private readonly collegeTokenModel,
    @InjectModel('enrollments') private readonly enrollmentModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('landing-pages') private readonly landingPageModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('employers') private readonly employerModel, // private readonly coursesService: CoursesService,
    private readonly jwtService: JwtService,
    private readonly unmudlAccessLogsService: UnmudlAccessLogsService,
  ) {}

  async create(college: College): Promise<SuccessInterface> {
    let newCollege = new this.collegeModel(college);
    const counter = await this.counterModel
      .findOneAndUpdate(
        {},
        { $inc: { college: 1 } },
        {
          new: true,
          upsert: true,
        },
      )
      .lean();
    newCollege.numId = counter.college;
    newCollege = await newCollege.save();
    return ResponseHandler.success(newCollege);
  }

  async getCollegesDropdown(keyword) {
    const colleges = await this.collegeModel
      .find(
        {
          title: { $regex: keyword ? keyword : '', $options: 'i' },
          invitation: 'accepted',
          isSuspended: { $ne: true },
        },
        'title collegeLogo collegeLogoThumbnail',
      )
      .sort({ title: 1 })
      .collation({ locale: 'en', strength: 2 });
    return ResponseHandler.success(colleges);
  }

  async getCollegesList(params) {
    const { keyword, page, perPage } = params;

    const [collegesList, { collegesCount, coursesCount, employersCount }] = await Promise.all([
      this.collegeModel
        .aggregate([
          {
            $match: {
              title: { $regex: keyword, $options: 'i' },
              isSuspended: { $ne: true },
              invitation: { $ne: 'pending' },
            },
          },
          { $sort: { title: 1 } },
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
          {
            $project: {
              title: 1,
              collegeLogo: 1,
              collegeLogoThumbnail: 1,
              numId: 1,
              description: 1,
              url: 1,
              city: 1,
              state: 1,
              country: 1,
              zip: 1,
              address: 1,
              streetAddress: 1,
            },
          },
          {
            $lookup: {
              from: 'courses',
              let: { collegeId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$collegeId', '$$collegeId'] }, { $eq: ['$unpublishedDate', null] }],
                    },
                  },
                },
              ],
              as: 'courses',
            },
          },
          {
            $addFields: {
              coursesCount: { $size: { $ifNull: ['$courses', []] } },
            },
          },
          { $unset: 'courses' },
          { $sort: { title: 1 } },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.getCollegeStats(),
    ]);

    return ResponseHandler.success({ collegesList, collegesCount, coursesCount, employersCount });
  }

  async getCollegeStats(collegeId = null) {
    const collegeMatch = collegeId ? { $eq: ['$collegeId', mongoose.Types.ObjectId(collegeId)] } : { $ne: ['$collegeId', null] };
    const [collegesCount, suspendedColleges, employers] = await Promise.all([
      !collegeId ? this.collegeModel.countDocuments({ isSuspended: { $ne: true }, invitation: { $ne: 'pending' } }) : 0,
      this.collegeModel
        .find({ isSuspended: true }, '_id')
        .lean()
        .exec(),
      // this.employerCompanyModel.countDocuments({isSuspended: { $ne: true }, invitation: { $ne: 'pending' } }),
      this.employerModel.aggregate([
        {
          $lookup: {
            from: 'courses',
            let: { employer: '$_id' },
            pipeline: [
              { $unwind: '$employers' },
              {
                $match: {
                  $expr: {
                    $and: [
                      collegeMatch,
                      { $eq: ['$employers', '$$employer'] },
                      { $eq: ['$unpublishedDate', null] },
                      { $gte: ['$enrollmentDeadline', new Date()] },
                      { $ne: ['$status', CourseStatus.CANCELED] },
                      { $ne: ['$status', CourseStatus.COMING_SOON] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'courses',
          },
        },
        { $unwind: '$courses' },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    const suspendedCollegeIds = suspendedColleges.map(college => college._id);
    const coursesCount = await this.courseModel.countDocuments({
      collegeId: collegeId ? mongoose.Types.ObjectId(collegeId) : { $nin: suspendedCollegeIds },
      unpublishedDate: null,
      status: { $ne: CourseStatus.COMING_SOON },
    });
    return { collegesCount, coursesCount, employersCount: employers && employers.length > 0 ? employers[0].count : 0 };
  }

  async getCollegesRevenue(params) {
    const { start, end } = params;
    const stats = await this.enrollmentModel.aggregate([
      {
        $match: { createdAt: { $gte: new Date(start), $lte: new Date(end) } },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          collegeRevenue: { $sum: '$collegeShare' },
          sharedRevenue: { $sum: '$unmudlShare' },
        },
      },
    ]);

    return {
      sharedRevenue: stats[0] ? stats[0].sharedRevenue : 0,
      collegeRevenue: stats[0] ? stats[0].collegeRevenue : 0,
      totalRevenue: stats[0] ? stats[0].totalRevenue : 0,
    };
  }

  async getCollegeBasicDetailsByNumId(collegeNumId) {
    return await this.collegeModel
      .findOne(
        { numId: Number(collegeNumId) },
        'numId collegeLogo collegeLogoThumbnail collegeBanner title createdAt url state city address streetAddress',
      )
      .lean();
  }

  async getColleges(params: CollegesListDto): Promise<SuccessInterface> {
    const { keyword, page, perPage, sortOrder, sortBy, state } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      title: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (state) {
      match['state.shortName'] = state;
    }

    const pipeline = [
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'partner-groups',
          localField: 'partnerGroup',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: {
          path: '$group',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'collegeId',
          as: 'course',
        },
      },
      {
        $addFields: {
          totalCourses: { $size: '$course' },
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'course._id',
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
        $group: {
          _id: '$_id',
          partner: { $first: '$title' },
          city: { $first: '$city' },
          address: { $first: '$address' },
          state: { $first: '$state' },
          collegeLogo: { $first: '$collegeLogo' },
          collegeLogoThumbnail: { $first: '$collegeLogoThumbnail' },
          collegeBanner: { $first: '$collegeBanner' },
          contact: { $first: '$contact' },
          totalCourses: { $first: '$totalCourses' },
          totalRevenue: { $sum: '$enrollments.totalRevenue' },
          collegeRevenue: { $sum: '$enrollments.collegeShare' },
          unmudlRevenue: { $sum: '$enrollments.unmudlShare' },
          commission: { $first: '$unmudlShare' },
          group: { $first: '$group' },
          isSuspended: { $first: '$isSuspended' },
        },
      },
      {
        $sort: sort,
      },
    ];

    const [colleges, rows] = await Promise.all([
      this.collegeModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.collegeModel.countDocuments(match),
    ]);
    return ResponseHandler.success({ colleges, rows });
  }

  async getCollegeNamesList(params: ListDto): Promise<SuccessInterface> {
    const { keyword, page, perPage, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [colleges, rows] = await Promise.all([
      this.collegeModel
        .find({
          title: {
            $regex: keyword,
            $options: 'i',
          },
        })
        .select('title')
        .sort(sort)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.collegeModel.countDocuments({
        title: {
          $regex: keyword,
          $options: 'i',
        },
      }),
    ]);
    return ResponseHandler.success({ colleges, rows });
  }

  async getCollegeNamesListForEmployerPortal(params: ListDto, user): Promise<SuccessInterface> {
    const { keyword, page, perPage, sortOrder, sortBy } = params;
    const {
      subscription: { activePlan, connectedCollege, connectedState },
    } = user;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const find: any = { isSuspended: { $ne: true } };

    if (keyword) {
      find.title = {
        $regex: keyword,
        $options: 'i',
      };
    }

    switch (activePlan.level) {
      case 0:
        find._id = mongoose.Types.ObjectId(connectedCollege);
        break;
      case 1:
        find['state.shortName'] = connectedState.shortName;
        break;
    }

    const [colleges, rows] = await Promise.all([
      this.collegeModel
        .find(find)
        .select('title')
        .sort(sort)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.collegeModel.countDocuments(find),
    ]);
    return ResponseHandler.success({ colleges, rows });
  }

  async getCollegeDetails({ collegeId }): Promise<SuccessInterface> {
    const pipeline = [
      {
        $match: {
          _id: mongoose.Types.ObjectId(collegeId),
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'collegeId',
          as: 'course',
        },
      },
      {
        $addFields: {
          totalCourses: { $size: '$course' },
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'course._id',
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
        $group: {
          _id: '$_id',
          partner: { $first: '$title' },
          isSuspended: { $first: '$isSuspended' },
          partnerGroupId: { $first: '$partnerGroup' },
          totalCourses: { $first: '$totalCourses' },
          commission: { $first: '$unmudlShare' },
          signedUpOn: { $first: '$createdAt' },
          description: { $first: '$description' },
          url: { $first: '$url' },
          contact: { $first: '$contact' },
          address: { $first: '$address' },
          collegeLogo: { $first: '$collegeLogo' },
          collegeLogoThumbnail: { $first: '$collegeLogoThumbnail' },
        },
      },
    ];

    const college = await this.collegeModel.aggregate(pipeline).exec();
    return ResponseHandler.success(college.length > 0 ? college[0] : null);
  }

  async getCollegesByStateShortName(state) {
    const find = {
      isSuspended: { $ne: true },
      invitation: 'accepted',
      'state.shortName': state,
    };

    const colleges = await this.collegeModel.find(find, 'title').lean();

    return ResponseHandler.success(colleges);
  }

  async getCollegesByStateShortNameForEmployerSubscriptions(state = null) {
    const find = {
      isSuspended: { $ne: true },
      invitation: 'accepted',
    };

    if (state) {
      find['state.shortName'] = state;
    }

    const colleges = await this.collegeModel
      .aggregate([
        {
          $match: find,
        },
        {
          $lookup: {
            from: 'courses',
            let: { collegeId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$collegeId', '$$collegeId'] },
                  enrollmentDeadline: { $gte: new Date() },
                  unpublishedDate: null,
                  status: { $nin: [CourseStatus.CANCELED, CourseStatus.COMING_SOON] },
                },
              },
              {
                $project: {
                  title: 1,
                },
              },
            ],
            as: 'courses',
          },
        },
        {
          $project: {
            title: 1,
            numId: 1,
            city: 1,
            state: 1,
            zip: 1,
            coordinates: 1,
            collegeLogo: 1,
            streetAddress: 1,
            collegeLogoThumbnail: 1,
            courses: { $size: '$courses' },
          },
        },
        {
          $sort: {
            courses: -1,
          },
        },
      ])
      .exec();

    return ResponseHandler.success(colleges);
  }

  async getCollegesAsCsv(params: ListDto): Promise<SuccessInterface> {
    const { keyword } = params;

    const pipeline = [
      {
        $match: {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'collegeId',
          as: 'course',
        },
      },
      {
        $addFields: {
          totalCourses: { $size: '$course' },
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: 'course._id',
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
        $group: {
          _id: '$_id',
          'Partner Name': { $first: '$title' },
          'Total Courses Uploaded': { $first: '$totalCourses' },
          'Total Earnings': { $sum: '$enrollments.totalRevenue' },
          'Total Earnings Shared': { $sum: '$enrollments.unmudlShare' },
          'Commission Percentage': { $first: '$unmudlShare' },
        },
      },
    ];

    const colleges = await this.collegeModel.aggregate(pipeline).exec();
    return ResponseHandler.success(colleges);
  }

  async getTopColleges(params): Promise<SuccessInterface> {
    const { page, perPage, start, end } = params;

    const pipeline = [];

    if (start || end) {
      const createdAt = {};
      if (start) {
        // @ts-ignore
        createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        createdAt.$lte = new Date(end);
      }

      pipeline.push({
        $match: {
          createdAt,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'collegeId',
            as: 'courses',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: 'courses._id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalRevenue: { $sum: '$courses.collegeRevenue' },
            unmudlRevenue: { $sum: '$courses.unmudlRevenue' },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            college: { $first: '$title' },
            collegeLogo: { $first: '$collegeLogo' },
            collegeLogoThumbnail: { $first: '$collegeLogoThumbnail' },
            totalRevenue: { $first: '$totalRevenue' },
            unmudlRevenue: { $first: '$unmudlRevenue' },
            location: { $first: '$city' },
            commission: { $first: '$unmudlShare' },
            totalLearners: {
              $addToSet: '$enrollments.learnerId',
            },
          },
        },
        {
          $addFields: {
            totalLearners: { $size: '$totalLearners' },
          },
        },
        {
          $sort: {
            totalRevenue: -1,
          },
        },
      ],
    );

    const colleges = await this.collegeModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getTopCollegesRows(params);

    return ResponseHandler.success({
      colleges,
      rows: rows.data,
    });
  }

  async getTopCollegesCsv(params): Promise<SuccessInterface> {
    const { page, perPage, start, end } = params;

    const pipeline = [];

    if (start || end) {
      const createdAt = {};
      if (start) {
        // @ts-ignore
        createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        createdAt.$lte = new Date(end);
      }

      pipeline.push({
        $match: {
          createdAt,
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'collegeId',
            as: 'courses',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: 'courses._id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $addFields: {
            totalRevenue: { $sum: '$courses.collegeRevenue' },
            unmudlRevenue: { $sum: '$courses.unmudlRevenue' },
          },
        },
        {
          $unwind: {
            path: '$enrollments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            'College Name': { $first: '$title' },
            Location: { $first: '$city' },
            'Total Learners': {
              $addToSet: '$enrollments.learnerId',
            },
            'Total Revenue Generated': { $first: '$totalRevenue' },
            'Earning Share Generated': { $first: '$unmudlRevenue' },
            'Commission %': { $first: '$unmudlShare' },
          },
        },
        {
          $addFields: {
            'Total Learners': { $size: '$Total Learners' },
          },
        },
        {
          $sort: {
            'Total Revenue Generated': -1,
          },
        },
      ],
    );

    const colleges = await this.collegeModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const fields = [
      'College Name',
      'Location',
      'Total Learners',
      'Total Revenue Generated',
      'Earning Share Generated',
      'Commission %',
      'Partnership Group',
    ];
    return json2csv.parse(colleges, { fields });
  }

  async getTopCollegesRows(params): Promise<SuccessInterface> {
    const { start, end } = params;

    const pipeline = [];

    if (start || end) {
      const createdAt = {};
      if (start) {
        // @ts-ignore
        createdAt.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        createdAt.$lte = new Date(end);
      }

      pipeline.push({
        $match: {
          createdAt,
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const colleges = await this.collegeModel.aggregate(pipeline).exec();

    return ResponseHandler.success(colleges.length > 0 ? colleges[0].rows : 0);
  }

  async verifyToken(token: string, remove = false) {
    const tokenData = await this.collegeTokenModel.aggregate([
      { $match: { token } },
      {
        $lookup: {
          from: 'colleges',
          localField: 'college',
          foreignField: '_id',
          as: 'college',
        },
      },
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'college-invitations',
          localField: 'college._id',
          foreignField: 'collegeId',
          as: 'collegeInvitation',
        },
      },
      { $unwind: { path: '$collegeInvitation', preserveNullAndEmptyArrays: true } },
      { $match: { 'collegeInvitation.isSuspended': { $ne: true } } },
      { $unset: 'collegeInvitation' },
      { $limit: 1 },
    ]);
    // .findOne({ token }).populate('college');

    if (remove) {
      await this.collegeTokenModel.deleteOne({ token }).exec();
    }

    return tokenData[0] ? tokenData[0] : null;
  }

  async updateCollege(college: UpdateCollegeDto) {
    let existingCollege;
    if (college.collegeLogo || college.collegeBanner) {
      existingCollege = await this.collegeModel
        .findById(college._id, 'collegeLogo collegeLogoThumbnail collegeBanner')
        .lean()
        .exec();
      const files = [];
      existingCollege.collegeLogo && existingCollege.collegeLogo !== college.collegeLogo ? files.push(existingCollege.collegeLogo) : null;
      existingCollege.collegeLogoThumbnail && existingCollege.collegeLogoThumbnail !== college.collegeLogoThumbnail
        ? files.push(existingCollege.collegeLogoThumbnail)
        : null;
      existingCollege.collegeBanner && existingCollege.collegeBanner !== college.collegeBanner
        ? files.push(existingCollege.collegeBanner)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const newCollege = await this.collegeModel
      .findByIdAndUpdate(
        college._id,
        {
          $set: college,
        },
        {
          new: true,
        },
      )
      .exec();

    return ResponseHandler.success(newCollege, responseMessages.success.updateCollege);
  }

  async updatePartnerCommission(collegeId, commission) {
    const newCollege = await this.collegeModel
      .findByIdAndUpdate(
        collegeId,
        {
          $set: {
            unmudlShare: commission,
          },
        },
        {
          new: true,
        },
      )
      .lean();

    return ResponseHandler.success(newCollege, 'Partner commission updated successfully.');
  }

  async updatePartnerGroup(collegeId, partnerGroupId) {
    const newCollege = await this.collegeModel
      .findByIdAndUpdate(
        collegeId,
        {
          $set: {
            partnerGroup: partnerGroupId,
          },
        },
        {
          new: true,
        },
      )
      .lean();

    return ResponseHandler.success(newCollege, 'Partner group updated successfully.');
  }

  async getCollegeById(collegeId): Promise<SuccessInterface> {
    const college = await this.collegeModel.findById(collegeId).lean();

    return ResponseHandler.success(college);
  }

  async getCollegeByNumId(collegeId): Promise<SuccessInterface> {
    const college = await this.collegeModel.findOne({ numId: collegeId }).lean();
    if (college) {
      delete college.unmudlShare;
    }

    return college ? ResponseHandler.success(college) : ResponseHandler.fail('College not found', null, 404);
  }

  async updateStripeId(collegeId: string, stripeId: string) {
    await this.collegeModel.findOneAndUpdate({ _id: collegeId }, { $set: { stripeId } });
  }

  async checkDomain(emailAddress, collegeId) {
    const college = await this.collegeModel.findById(collegeId).exec();

    if (college && college.domain && !emailAddress.includes(college.domain)) {
      return ResponseHandler.fail(responseMessages.inviteUser.invalidDomain);
    }
  }

  async getFinanceSummary(collegeId = null) {
    let match = {};
    // @ts-ignore
    match.status = 'processed';

    if (collegeId) {
      match['course.collegeId'] = mongoose.Types.ObjectId(collegeId);
    }

    let pendingPayments = await this.enrollmentModel
      .aggregate([
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
          $match: match,
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            collegeRevenue: { $sum: '$collegeShare' },
            unmudlRevenue: { $sum: '$unmudlShare' },
          },
        },
      ])
      .exec();

    pendingPayments = pendingPayments.length > 0 ? pendingPayments[0].collegeRevenue : 0;

    return ResponseHandler.success({
      pendingPayments,
    });
  }

  async getCollegesCount(params) {
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

    const count = await this.collegeModel.countDocuments(find).exec();

    return ResponseHandler.success(count);
  }

  async getCollegeGrowth(params, csv = false) {
    const { interval, start, end } = params;

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
            count: { $sum: 1 },
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
            count: { $sum: 1 },
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
            count: { $sum: 1 },
          },
        });
        break;
    }

    pipeline.push({
      $unset: '_id',
    });

    if (csv) {
      pipeline.push({
        $project: {
          'Joined On': {
            $dateToString: { format: '%m-%d-%Y', date: '$createdAt' },
          },
          'New Users Registered': '$count',
          createdAt: '$createdAt',
        },
      });
    }

    const colleges = await this.collegeModel.aggregate(pipeline).exec();

    return ResponseHandler.success(colleges);
  }

  async getAllColleges() {
    const colleges = await this.collegeModel
      .find(
        {
          invitation: 'accepted',
          isSuspended: { $ne: true },
        },
        'title collegeLogo collegeBanner collegeLogoThumbnail',
      )
      .lean();

    return ResponseHandler.success(colleges);
  }

  async getCollegeInstructors(collegeNumId, params) {
    const college = await this.collegeModel.findOne({ numId: Number(collegeNumId) }, 'title').lean();
    const collegeId = mongoose.Types.ObjectId(college ? college._id : null);
    const { perPage, page } = params;
    const [instructors, instructorsCount] = await Promise.all([
      this.userModel.aggregate([
        { $match: { collegeId, role: Role.INSTRUCTOR } },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'instructorIds',
            as: 'courses',
          },
        },
        {
          $addFields: {
            coursesCount: { $size: '$courses' },
          },
        },
        { $unwind: { path: '$courses', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            ratingCount: { $size: { $ifNull: ['$courses.reviews', []] } },
            'courses.instructorRating': { $cond: [{ $eq: ['$courses.instructorRating', 0] }, null, '$courses.instructorRating'] },
          },
        },
        {
          $group: {
            _id: '$_id',
            numId: { $first: '$numId' },
            profilePhoto: { $first: '$profilePhoto' },
            profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
            fullname: { $first: '$fullname' },
            rating: { $avg: '$courses.instructorRating' },
            ratingCount: { $sum: { $ifNull: ['$ratingCount', 0] } },
            coursesCount: { $first: '$coursesCount' },
            bio: { $first: '$bio' },
            designation: { $first: '$designation' },
            contact: { $first: '$contact' },
            collegeId: { $first: '$collegeId' },
          },
        },
        { $sort: { rating: -1, fullname: 1 } },
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
          },
        },
        { $unset: 'collegeObj' },
        {
          $lookup: {
            from: 'courses',
            let: { instructorId: '$_id' },
            pipeline: [
              { $unwind: '$instructorIds' },
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$instructorIds', '$$instructorId'] }, { $lt: ['$date.end', new Date()] }],
                  },
                },
              },
              { $sort: { 'date.end': -1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  numId: 1,
                },
              },
            ],
            as: 'lastCourseTaught',
          },
        },
        { $unwind: { path: '$lastCourseTaught', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            lastCourseTaught: { $ifNull: ['$lastCourseTaught', null] },
          },
        },
      ]),
      this.userModel.countDocuments({ collegeId, role: Role.INSTRUCTOR }),
    ]);
    return { instructors, instructorsCount };
  }

  async getCollegeCourses(collegeNumId, params) {
    const { perPage, page } = params;
    const college = await this.collegeModel.findOne({ numId: Number(collegeNumId) }, 'title').lean();
    const collegeId = college ? mongoose.Types.ObjectId(college._id) : null;
    const [courses, coursesCount] = await Promise.all([
      this.courseModel
        .aggregate([
          {
            $match: { collegeId, status: { $ne: 'canceled' }, unpublishedDate: null },
          },
          {
            $addFields: {
              sort: {
                $cond: {
                  if: { $eq: ['$status', CourseStatus.COMING_SOON] },
                  then: 1,
                  else: 2,
                },
              },
            },
          },
          { $sort: { sort: -1, createdAt: -1 } },
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
          // { $unwind: '$followUpCourseObj', preserveNullAndEmptyArrays: true },
          {
            $addFields: {
              'followUpCourse.rating': '$followUpCourseObj[0].rating',
              'followUpCourse.ratingCount': { $size: { $ifNull: ['$followUpCourseObj[0].reviews', []] } },
            },
          },
          // { $unset: 'followUpCourseObj' },
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
              unpublishedDate: 1,
              status: 1,
            },
          },
        ])
        .exec(),
      this.courseModel.countDocuments({ collegeId, status: { $ne: 'canceled' }, unpublishedDate: null }),
    ]);

    return { courses, coursesCount };
  }

  async getInstructorDetails(instructorId) {
    // let instructorRating = await this.coursesService.getRatingCategoryIdbyIdentifier(ratingCategories.TeachingMethadology);
    // instructorRating = mongoose.Types.ObjectId(instructorRating);
    return await this.userModel
      .aggregate([
        {
          $match: { numId: Number(instructorId) },
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
            'college.title': '$collegeObj.title',
            'college.collegeLogo': '$collegeObj.collegeLogo',
            'college.collegeLogoThumbnail': '$collegeObj.collegeLogoThumbnail',
            'college.numId': '$collegeObj.numId',
            'college.city': '$collegeObj.city',
            'college.state': '$collegeObj.state',
          },
        },
        {
          $unset: 'collegeObj',
        },
        {
          $lookup: {
            from: 'courses',
            let: { instructorId: '$_id' },
            pipeline: [
              { $unwind: '$instructorIds' },
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$instructorIds', '$$instructorId'] }, { $eq: ['$unpublishedDate', null] }],
                  },
                },
              },
            ],
            as: 'courses',
          },
        },
        {
          $addFields: {
            coursesCount: { $size: { $ifNull: ['$courses', []] } },
            rating: { $avg: '$courses.instructorRating' },
          },
        },
        { $unwind: { path: '$courses', preserveNullAndEmptyArrays: true } },
        // {
        //   $match: { 'courses.reviews.0': {$exists: true} },
        // },
        {
          $addFields: {
            reviewsCount: { $size: { $ifNull: ['$courses.reviews', []] } },
          },
        },
        {
          $group: {
            _id: '$_id',
            numId: { $first: '$numId' },
            fullname: { $first: '$fullname' },
            profilePhoto: { $first: '$profilePhoto' },
            profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
            college: { $first: '$college' },
            bio: { $first: '$bio' },
            contact: { $first: '$contact' },
            coursesCount: { $first: '$coursesCount' },
            rating: { $first: '$rating' },
            reviewsCount: { $sum: '$reviewsCount' },
          },
        },
      ])
      .exec();
  }

  async getCollegeRevenueGraph(params: IntervalDto) {
    const { collegeId, start, end, interval } = params;

    const match = {
      status: { $in: ['processed', 'transferred'] },
    };

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

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'courses',
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'courses.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    switch (interval) {
      case 1:
        pipeline.push(
          ...[
            {
              $addFields: {
                day: {
                  $dayOfYear: '$createdAt',
                },
                year: {
                  $year: '$createdAt',
                },
              },
            },
            {
              $group: {
                _id: {
                  day: '$day',
                  year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                revenue: { $sum: '$totalRevenue' },
              },
            },
          ],
        );
        break;
      case 30:
        pipeline.push(
          ...[
            {
              $addFields: {
                month: {
                  $month: '$createdAt',
                },
                year: {
                  $year: '$createdAt',
                },
              },
            },
            {
              $group: {
                _id: {
                  month: '$month',
                  year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                revenue: { $sum: '$totalRevenue' },
              },
            },
          ],
        );
        break;
      case 365:
        pipeline.push(
          ...[
            {
              $addFields: {
                year: {
                  $year: '$createdAt',
                },
              },
            },
            {
              $group: {
                _id: {
                  year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                revenue: { $sum: '$totalRevenue' },
              },
            },
          ],
        );
        break;
    }
    // console.log(pipeline[0].$match);
    const revenue = await this.enrollmentModel.aggregate(pipeline).exec();

    return ResponseHandler.success(revenue);
  }

  async getCollegeRevenueGraphAsCsv(params: IntervalDto) {
    const { collegeId, start, end, interval } = params;

    const match = {
      status: { $in: ['processed', 'transferred'] },
    };

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

    pipeline.push(
      ...[
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'courses',
          },
        },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'courses.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    const fields = [];

    switch (interval) {
      case 1:
        pipeline.push(
          ...[
            {
              $addFields: {
                day: { $dayOfYear: '$createdAt' },
                year: { $year: '$createdAt' },
                dateStr: { $dateToString: { format: '%m-%d-%Y', date: '$createdAt' } },
              },
            },
            {
              $group: {
                _id: {
                  day: '$day',
                  year: '$year',
                },
                Date: { $first: '$dateStr' },
                Revenue: { $sum: '$totalRevenue' },
                createdAt: { $first: '$createdAt' },
              },
            },
          ],
        );
        fields.push('Date');
        break;
      case 30:
        pipeline.push(
          ...[
            {
              $addFields: {
                month: {
                  $month: '$createdAt',
                },
                year: {
                  $year: '$createdAt',
                },
              },
            },
            {
              $group: {
                _id: {
                  month: '$month',
                  year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                Month: { $first: { $concat: ['$month', ' - ', '$year'] } },
                Revenue: { $sum: '$totalRevenue' },
              },
            },
          ],
        );
        fields.push('Month');
        break;
      case 365:
        pipeline.push(
          ...[
            {
              $addFields: {
                year: {
                  $year: '$createdAt',
                },
              },
            },
            {
              $group: {
                _id: {
                  year: '$year',
                },
                createdAt: { $first: '$createdAt' },
                Year: { $first: '$year' },
                Revenue: { $sum: '$totalRevenue' },
              },
            },
          ],
        );
        fields.push('Year');
        break;
    }
    pipeline.push(...[{ $sort: { createdAt: -1 } }]);

    fields.push('Revenue');
    const growth = await this.enrollmentModel.aggregate(pipeline).exec();

    return json2csv.parse(growth, { fields });
  }

  async getTransactionActivities(params: RecentActivityDto) {
    const { start, end, collegeId, page, perPage, keyword, courseId } = params;

    const pipeline = [];

    if (courseId) {
      pipeline.push({
        $match: {
          _id: mongoose.Types.ObjectId(courseId),
        },
      });
    } else if (collegeId) {
      pipeline.push({
        $match: {
          collegeId: mongoose.Types.ObjectId(collegeId),
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
            as: 'enrollment',
          },
        },
        {
          $unwind: {
            path: '$enrollment',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $and: [{ 'enrollment.transactionId': { $ne: null } }, { 'enrollment.transactionId': { $ne: '' } }],
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'enrollment.learnerId',
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
          $lookup: {
            from: 'promos',
            localField: 'enrollment.promoId',
            foreignField: '_id',
            as: 'promo',
          },
        },
        {
          $unwind: {
            path: '$promo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'gift-courses',
            localField: 'enrollment.giftId',
            foreignField: '_id',
            as: 'gift',
          },
        },
        {
          $unwind: {
            path: '$gift',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            'enrollment.updatedAt': {
              $gte: new Date(start),
              $lte: new Date(end),
            },
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
              localField: 'collegeId',
              foreignField: '_id',
              as: 'college',
            },
          },
          {
            $unwind: {
              path: '$college',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      );
    }

    pipeline.push(
      ...[
        {
          $project: {
            learner: '$learner.fullname',
            course: '$title',
            college: '$college.title',
            courseStatus: '$status',
            stripeTransactionId: '$enrollment.transactionId',
            stripeTransferId: '$enrollment.transferId',
            stripeDestinationPaymentId: '$enrollment.destPaymentId',
            createdAt: '$enrollment.createdAt',
            updatedAt: '$enrollment.updatedAt',
            totalPaid: '$enrollment.totalPaid',
            totalRevenue: '$enrollment.totalRevenue',
            status: '$enrollment.status',
            promo: '$promo.title',
            gift: '$gift.giftCode',
          },
        },
        {
          $match: {
            $or: [
              { learner: { $regex: keyword, $options: 'i' } },
              { course: { $regex: keyword, $options: 'i' } },
              { stripeTransactionId: { $regex: keyword, $options: 'i' } },
              { stripeTransferId: { $regex: keyword, $options: 'i' } },
              { stripeDestinationPaymentId: { $regex: keyword, $options: 'i' } },
              { promo: { $regex: keyword, $options: 'i' } },
            ],
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
      ],
    );

    const enrollments = await this.courseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return ResponseHandler.success(enrollments);
  }

  async getCollegeAdminsForEmail(id) {
    const admins = await this.userModel
      .find(
        {
          collegeId: mongoose.Types.ObjectId(id),
          role: { $in: ['superadmin', 'admin'] },
          'notifications.email': { $ne: false },
        },
        'fullname emailAddress',
      )
      .lean()
      .exec();

    return ResponseHandler.success(admins);
  }

  async getTransactionActivitiesCsv(params: TransactionActivityCsvDto) {
    const { start, end, collegeId } = params;

    const match: { collegeId?: mongoose.Types.ObjectId } = {};

    if (collegeId) {
      match.collegeId = mongoose.Types.ObjectId(collegeId);
    }

    const enrollments = await this.courseModel
      .aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollment',
          },
        },
        {
          $unwind: {
            path: '$enrollment',
            preserveNullAndEmptyArrays: true,
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
          $unwind: {
            path: '$college',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $and: [{ 'enrollment.transactionId': { $ne: null } }, { 'enrollment.transactionId': { $ne: '' } }],
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'enrollment.learnerId',
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
          $match: {
            'enrollment.updatedAt': {
              $gte: new Date(start),
              $lte: new Date(end),
            },
          },
        },
        {
          $sort: {
            'enrollment.updatedAt': -1,
          },
        },
        {
          $project: {
            'Learner Name': '$learner.fullname',
            'Learner Email': '$learner.emailAddress',
            'Learner Phone': { $concat: ['"', '$learner.phoneNumber', '"'] },
            'Student Id': '$learner.studentId',
            'Course Title': '$title',
            College: '$college.title',
            'Transaction Id': '$enrollment.destPaymentId',
            Status: {
              $switch: {
                branches: [
                  { case: { $eq: ['$enrollment.status', 'pending'] }, then: 'Pending' },
                  { case: { $eq: ['$enrollment.status', 'approved'] }, then: 'Admitted' },
                  { case: { $eq: ['$enrollment.status', 'processed'] }, then: 'Paid' },
                  { case: { $eq: ['$enrollment.status', 'transferred'] }, then: 'Paid' },
                  { case: { $eq: ['$enrollment.status', 'declined'] }, then: 'Denied' },
                  { case: { $eq: ['$enrollment.status', 'canceled'] }, then: 'Canceled' },
                  { case: { $eq: ['$enrollment.status', 'refunded'] }, then: 'Withdrawn' },
                ],
              },
            },
            'Transferred to College': {
              $cond: {
                if: { $eq: ['$enrollment.status', 'transferred'] },
                then: 'Yes',
                else: 'No',
              },
            },
            'Date Purchased': { $dateToString: { date: '$enrollment.createdAt', format: '%Y-%m-%d' } },
            'Price Paid by Learner': '$enrollment.totalPaid',
            'Credit Charges': { $subtract: ['$enrollment.stripeFee', 0.3] },
            'Stripe Fee': '0.3',
            'Sales Tax': '$enrollment.salesTax',
            'Net Revenue': '$enrollment.totalRevenue',
            'Marketplace Fee': '$enrollment.unmudlShare',
            'College Revenue': '$enrollment.collegeShare',
          },
        },
      ])
      .exec();

    const fields = ['Learner Name', 'Learner Email', 'Learner Phone', 'Student Id', 'Course Title'];

    if (!collegeId) {
      fields.push('College');
    }

    fields.push(
      ...[
        'Transaction Id',
        'Status',
        'Transferred to College',
        'Date Purchased',
        'Price Paid by Learner',
        'Credit Charges',
        'Stripe Fee',
        'Sales Tax',
        'Net Revenue',
        'Marketplace Fee',
        'College Revenue',
      ],
    );

    return json2csv.parse(enrollments, { fields });
  }

  async getCollegeByOrgId(orgId) {
    const college = await this.collegeModel.findOne({ orgId }).lean();

    return ResponseHandler.success(college);
  }

  async suspendUnsupendCollege(collegeId: string) {
    const college = await this.collegeModel.findById(collegeId).exec();

    college.isSuspended = !college.isSuspended;
    await Promise.all([
      college.save(),
      this.landingPageModel.findOneAndUpdate({}, { $pull: { partners: collegeId } }, { new: true, upsert: false }),
    ]);

    return ResponseHandler.success({}, `Partner ${college.isSuspended ? 'suspended' : 'unsuspended'} successfully.`);
  }

  async updateCollegeTimeZone(collegeId, timeZone) {
    const college = await this.collegeModel.findByIdAndUpdate(collegeId, { $set: { timeZone } }, { new: true }).exec();

    return ResponseHandler.success(college);
  }

  async getCollegesByLocation({ lat, lng }: LocationDto) {
    const colleges = await this.collegeModel
      .find({
        coordinates: {
          $geoWithin: {
            $centerSphere: [[lng, lat], Number(LOCATION_SEARCH_RADIUS) / 3963.2],
          },
        },
      })
      .lean();

    return ResponseHandler.success(colleges);
  }

  async getCollegesForEmployerPortal(keyword: string, user) {
    const {
      subscription: { activePlan, connectedCollege, connectedState },
    } = user;

    const pipeline = [];

    const match: any = {
      title: { $regex: keyword, $options: 'i' },
      isSuspended: { $ne: true },
      deletedAt: null,
    };

    pipeline.push({ $match: match });

    switch (activePlan.level) {
      case 0:
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $eq: ['$_id', connectedCollege] },
                then: true,
                else: false,
              },
            },
          },
        });
        break;
      case 1:
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $eq: ['$state.shortName', connectedState?.shortName] },
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
        {
          $sort: {
            isAvailable: -1,
            title: 1,
          },
        },
        {
          $project: {
            title: 1,
            state: 1,
            isAvailable: 1,
            collegeLogo: 1,
            collegeBanner: 1,
            collegeLogoThumbnail: 1,
          },
        },
      ],
    );

    const colleges = await this.collegeModel.aggregate(pipeline).exec();

    return ResponseHandler.success(colleges);
  }

  async getCollegesByLocationForEmployerPortal({ lat, lng }: LocationDto, user) {
    const {
      subscription: { activePlan, connectedCollege, connectedState },
    } = user;

    const pipeline = [];

    const match: any = {
      coordinates: {
        $geoWithin: {
          $centerSphere: [[lng, lat], Number(LOCATION_SEARCH_RADIUS) / 3963.2],
        },
      },
      isSuspended: { $ne: true },
      deletedAt: null,
    };

    pipeline.push({ $match: match });

    switch (activePlan.level) {
      case 0:
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $eq: ['$_id', connectedCollege] },
                then: true,
                else: false,
              },
            },
          },
        });
        break;
      case 1:
        pipeline.push({
          $addFields: {
            isAvailable: {
              $cond: {
                if: { $eq: ['$state.shortName', connectedState.shortName] },
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

    pipeline.push({
      $sort: {
        isAvailable: -1,
        title: 1,
      },
    });

    const colleges = await this.collegeModel.aggregate(pipeline).exec();

    return ResponseHandler.success(colleges);
  }

  async getAllCollegesIds() {
    const colleges = await this.collegeModel
      .find(
        {
          invitation: 'accepted',
          isSuspended: { $ne: true },
        },
        '_id',
      )
      .lean()
      .exec();
    const collegeIds = colleges.map(college => college._id);
    return collegeIds;
  }

  async updateCollegeOutstandingBalance(id, balance) {
    const college = await this.collegeModel.findByIdAndUpdate(id, {
      $inc: { payableToUnmudl: balance },
    });

    return ResponseHandler.success(college, 'College outstanding balance updated successfully.');
  }

  async getUnmudlAdminCollegePortalAccessToken(collegeId, user) {
    const college = await this.collegeModel.findById(collegeId).lean();

    if (!college) {
      return ResponseHandler.fail('College not found.');
    }

    let sysAdmin = await this.userModel.findOne({ collegeId, role: 'system' }).lean();

    if (!sysAdmin) {
      const counter = await this.counterModel
        .findOneAndUpdate(
          {},
          { $inc: { user: 1 } },
          {
            new: true,
            upsert: true,
          },
        )
        .lean();

      const newAdmin = {
        fullname: `Unmudl Admin for ${functions.getInitialsOfWords(college.title)}`,
        emailAddress: `${collegeId}@unmudl.com`,
        password: '',
        role: 'system',
        collegeId,
        lastLoggedIn: new Date(),
        designation: '',
        profilePhoto: '',
        profilePhotoThumbnail: '',
        joinDate: new Date(),
        invitation: 'accepted',
        isSuspended: false,
        notifications: {
          email: false,
          proposal: false,
          chat: false,
          newNotification: false,
        },
        archivedChats: [],
        numId: counter.user,
      };

      sysAdmin = await this.userModel.create(newAdmin);
    }

    this.unmudlAccessLogsService.createLog({
      type: 'college',
      user: user._id,
      college: collegeId,
    });

    const payload: JwtPayLoad = { _id: sysAdmin._id, emailAddress: sysAdmin.emailAddress, type: 'user' };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        _id: sysAdmin._id,
        fullname: sysAdmin.fullname,
        username: sysAdmin.username,
        emailAddress: sysAdmin.emailAddress,
        profilePhoto: '',
        profilePhotoThumbnail: '',
        collegeId,
        college: college.title,
        collegeDomain: college.domain,
        collegeLogo: college.collegeLogo,
        collegeLogoThumbnail: college.collegeLogoThumbnail,
        role: sysAdmin.role,
        admin: {
          fullname: user.fullname,
          profilePhoto: user.profilePhoto,
          profilePhotoThumbnail: user.profilePhotoThumbnail,
        },
      },
    };
  }
}
