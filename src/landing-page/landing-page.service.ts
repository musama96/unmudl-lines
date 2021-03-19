import { Injectable, Inject, CACHE_MANAGER, CacheManagerOptions } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LandingPage } from './landing-page.model';
import * as mongoose from 'mongoose';
import { UpdateFooterContentDto } from './dto/updateFooterContent.dto';
import ResponseHandler from '../common/ResponseHandler';
import { CourseStatus } from '../courses/courses.model';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { RedisKeys } from '../config/redisKeys';
import { removeFilesFromS3 } from '../s3upload/s3';

@Injectable()
export class LandingPageService {
  constructor(
    @InjectModel('landing-page') private readonly landingPageModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('blogs') private readonly blogModel,
    @InjectModel('employers') private readonly employerModel,
    // @Inject(CACHE_MANAGER) private readonly cache,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async updateLandingPageInfo(landingInfo: LandingPage) {
    // @ts-ignore
    if (landingInfo.coverPhoto) {
      let existingData = await this.landingPageModel.findOne({}, 'coverPhoto').lean().exec();
      const files = [];
      // @ts-ignore
      existingData.coverPhoto && existingData.coverPhoto !== landingInfo.coverPhoto ? files.push(existingData.coverPhoto) : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    return await this.landingPageModel.findOneAndUpdate({}, { $set: landingInfo }, { upsert: true, new: true }).exec();
  }

  async updateLandingPagePartners(partners: string[]) {
    return await this.landingPageModel.findOneAndUpdate({}, { $set: { partners } }, { new: true }).exec();
  }

  async updateLandingPageFeaturedCourses(featured: object) {
    return await this.landingPageModel.findOneAndUpdate({}, featured, { new: true }).exec();
  }

  async updateLandingPageHighlyRatedCourses(highlyRated: object) {
    return await this.landingPageModel.findOneAndUpdate({}, highlyRated, { new: true }).exec();
  }

  async updateLandingPageCredentialCourses(credentialCourses: object) {
    return await this.landingPageModel.findOneAndUpdate({}, credentialCourses, { new: true }).exec();
  }

  async updateLandingPageBlogs(blogs: object) {
    return await this.landingPageModel.findOneAndUpdate({}, blogs, { new: true }).exec();
  }

  async getLandingPageInfo() {
    return await this.landingPageModel
      .findOne()
      .populate('partners')
      .populate('highlyRated')
      .populate('featured')
      .populate('blogs')
      .lean()
      .exec();
  }

  async getAboutUs() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.about);
  }

  async getWhyUnmudl() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.why);
  }

  async getPrivacyPolicy() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.privacyPolicy);
  }

  async getTermsOfService() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.termsOfService);
  }

  async getAccessibility() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.accessibility);
  }

  async getPreviewContent() {
    const landingPageData = await this.landingPageModel.findOne({}).lean();

    return ResponseHandler.success(landingPageData.previewContent);
  }

  async getLearnersLandingPage() {
    const redisConnected = await this.redisCacheService.checkClient();
    const cachedData = redisConnected ? await this.redisCacheService.get(RedisKeys.learnerPortalLandingPageData) : null;
    // console.log(RedisKeys.learnerPortalCoursesList);
    if (!cachedData) {
      const landingPage = await this.landingPageModel
        .findOne()
        .populate('partners', 'numId title collegeLogo collegeBanner')
        .lean();
      const [featured, highlyRated, credentialCourses, blogs, collegesCount] = await Promise.all([
        landingPage.featured && landingPage.featured.length > 0 && !landingPage.hideFeatured
          ? this.getSpecifiedCourses(landingPage.featured)
          : [],
        landingPage.highlyRated && landingPage.highlyRated.length > 0 && !landingPage.hideHighlyRated
          ? this.getSpecifiedCourses(landingPage.highlyRated)
          : [],
        landingPage.credentialCourses && landingPage.credentialCourses.length > 0 && !landingPage.hideCredentialCourses
          ? this.getSpecifiedCourses(landingPage.credentialCourses)
          : [],
        landingPage.blogs && landingPage.blogs.length > 0
          ? this.blogModel.aggregate([
              {
                $match: {
                  _id: { $in: landingPage.blogs },
                },
              },
              {
                $lookup: {
                  from: 'users',
                  let: { authorId: '$author' },
                  pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$_id', '$$authorId'] }] } } },
                    { $project: { fullname: 1, profilePhoto: 1, profilePhotoThumbnail: 1, role: 1 } },
                  ],
                  as: 'author',
                },
              },
              { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'users',
                  let: { contributors: '$contributors' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $in: ['$_id', '$$contributors'] },
                      },
                    },
                    {
                      $addFields: {
                        sort: {
                          $indexOfArray: ['$$contributors', '$_id'],
                        },
                      },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                  ],
                  as: 'contributors',
                },
              },
              {
                $lookup: {
                  from: 'colleges',
                  let: { collegeId: '$collegeId' },
                  pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$_id', '$$collegeId'] }] } } },
                    { $project: { numId: 1, collegeLogo: 1, collegeLogoThumbnail: 1, collegeBanner: 1, title: 1, city: 1, state: 1 } },
                  ],
                  as: 'college',
                },
              },
              { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'blog-tags',
                  localField: 'tags',
                  foreignField: '_id',
                  as: 'tags',
                },
              },
              {
                $project: {
                  _id: 1,
                  featured: 1,
                  tags: 1,
                  views: 1,
                  excerpt: 1,
                  tagline: 1,
                  status: 1,
                  title: 1,
                  titleColor: 1,
                  subtitleColor: 1,
                  content: 1,
                  collegeId: 1,
                  numId: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  headerImage: 1,
                  headerImageThumbnail: 1,
                  college: 1,
                  author: 1,
                  'contributors.fullname': 1,
                  'contributors.profilePhoto': 1,
                  'contributors.profilePhotoThumbnail': 1,
                },
              },
              {
                $addFields: {
                  sort: {
                    $indexOfArray: [landingPage.blogs, '$_id'],
                  },
                },
              },
              { $sort: { sort: 1 } },
              { $addFields: { sort: '$$REMOVE' } },
            ])
          : [],
        this.collegeModel.countDocuments({ invitation: 'accepted' }),
      ]);
      landingPage.featured = featured;
      landingPage.highlyRated = highlyRated;
      landingPage.credentialCourses = credentialCourses;
      landingPage.blogs = blogs;
      landingPage.collegesCount = collegesCount;
      landingPage.hideFeatured = landingPage.hideFeatured ? landingPage.hideFeatured : false;
      landingPage.hideHighlyRated = landingPage.hideHighlyRated ? landingPage.hideHighlyRated : false;
      landingPage.hideCredentialCourses = landingPage.hideCredentialCourses ? landingPage.hideCredentialCourses : false;

      if (redisConnected) {
        await this.redisCacheService.set(RedisKeys.learnerPortalLandingPageData, landingPage, 10);
      }
      return landingPage;
    } else {
      return cachedData;
    }
  }

  async getLandingPage() {
    const landingPage = await this.landingPageModel
      .findOne()
      .populate('partners', 'numId title collegeLogo collegeBanner')
      .lean();
    const [featured, highlyRated, credentialCourses, blogs, collegesCount] = await Promise.all([
      landingPage.featured && landingPage.featured.length > 0 ? this.getSpecifiedCourses(landingPage.featured) : [],
      landingPage.highlyRated && landingPage.highlyRated.length > 0 ? this.getSpecifiedCourses(landingPage.highlyRated) : [],
      landingPage.credentialCourses && landingPage.credentialCourses.length > 0
        ? this.getSpecifiedCourses(landingPage.credentialCourses)
        : [],
      landingPage.blogs && landingPage.blogs.length > 0
        ? this.blogModel.aggregate([
            {
              $match: {
                _id: { $in: landingPage.blogs },
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { authorId: '$author' },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ['$_id', '$$authorId'] }] } } },
                  { $project: { fullname: 1, profilePhoto: 1, profilePhotoThumbnail: 1, role: 1 } },
                ],
                as: 'author',
              },
            },
            { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'users',
                let: { contributors: '$contributors' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ['$_id', '$$contributors'] },
                    },
                  },
                  {
                    $addFields: {
                      sort: {
                        $indexOfArray: ['$$contributors', '$_id'],
                      },
                    },
                  },
                  { $sort: { sort: 1 } },
                  { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'contributors',
              },
            },
            {
              $lookup: {
                from: 'colleges',
                let: { collegeId: '$collegeId' },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ['$_id', '$$collegeId'] }] } } },
                  { $project: { numId: 1, collegeLogo: 1, collegeLogoThumbnail: 1, collegeBanner: 1, title: 1, city: 1, state: 1 } },
                ],
                as: 'college',
              },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'blog-tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tags',
              },
            },
            {
              $project: {
                _id: 1,
                featured: 1,
                tags: 1,
                views: 1,
                excerpt: 1,
                tagline: 1,
                status: 1,
                title: 1,
                titleColor: 1,
                subtitleColor: 1,
                content: 1,
                collegeId: 1,
                numId: 1,
                createdAt: 1,
                updatedAt: 1,
                headerImage: 1,
                headerImageThumbnail: 1,
                college: 1,
                author: 1,
                'contributors.fullname': 1,
                'contributors.profilePhoto': 1,
                'contributors.profilePhotoThumbnail': 1,
              },
            },
            {
              $addFields: {
                sort: {
                  $indexOfArray: [landingPage.blogs, '$_id'],
                },
              },
            },
            { $sort: { sort: 1 } },
            { $addFields: { sort: '$$REMOVE' } },
          ])
        : [],
      this.collegeModel.countDocuments({ invitation: 'accepted' }),
    ]);
    landingPage.featured = featured;
    landingPage.highlyRated = highlyRated;
    landingPage.credentialCourses = credentialCourses;
    landingPage.blogs = blogs;
    landingPage.collegesCount = collegesCount;
    landingPage.hideFeatured = landingPage.hideFeatured ? landingPage.hideFeatured : false;
    landingPage.hideHighlyRated = landingPage.hideHighlyRated ? landingPage.hideHighlyRated : false;
    landingPage.hideCredentialCourses = landingPage.hideCredentialCourses ? landingPage.hideCredentialCourses : false;
    return landingPage;
  }

  async getSpecifiedCourses(courseIds) {
    return await this.courseModel
      .aggregate([
        {
          $match: { _id: { $in: courseIds } },
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
        { $match: { 'collegeObj.isSuspended': { $ne: true } } },
        {
          $addFields: {
            'college.numId': '$collegeObj.numId',
            'college.title': '$collegeObj.title',
            'college.collegeLogo': '$collegeObj.collegeLogo',
            'college.collegeLogoThumbnail': '$collegeObj.collegeLogoThumbnail',
            'college.city': '$collegeObj.city',
            'college.state': '$collegeObj.state',
            // totalPrice: {$add: ['$price', {$multiply: ['$price', {$divide: ['$collegeObj.salesTax', 100]}]}]},
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
            description: 1,
            followUpCourse: 1,
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
  }

  async getCoursesDropdown(params) {
    const {perPage, collegeId, keyword} = params;

    const match = {
      status: {$nin: [CourseStatus.CANCELED, CourseStatus.UNPUBLISH]},
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
      .find(match, 'title coverPhoto coverPhotoThumbnail collegeId')
      .sort({title: 1})
      .paginate(1, perPage)
      .populate('collegeId', 'title')
      .sort({title: 1})
      .collation({ locale: 'en', strength: 2 })
      .lean().exec();

    return ResponseHandler.success(courses);
  }

  async getSearchedCourses(params) {
    const { keyword, perPage, collegeId } = params;

    const [colleges, suspendedColleges, collegesList, employers/*, indexes*/] = !collegeId ? await Promise.all([
      this.collegeModel
        .find({ title: { $regex: keyword, $options: 'i' }, isSuspended: { $ne: true } }, '_id')
        .lean()
        .exec(),
      this.collegeModel
        .find({ isSuspended: true })
        .lean()
        .exec(),
      this.collegeModel.aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
              { address: { $regex: keyword, $options: 'i' } },
              { streetAddress: { $regex: keyword, $options: 'i' } },
              { city: { $regex: keyword, $options: 'i' } },
              { 'state.longName': { $regex: keyword, $options: 'i' } },
              { 'state.shortName': { $regex: keyword, $options: 'i' } },
            ],
            isSuspended: {$ne: true},
            invitation: 'accepted',
          },
        },
        {
          $addFields: {
            sort: {
              $switch: {
                branches: [
                  {
                    case: { $regexMatch: { input: '$title', regex: keyword, options: 'i' } },
                    then: 1,
                  },
                  {
                    case: { $regexMatch: { input: '$description', regex: keyword, options: 'i' } },
                    then: 2,
                  },
                ],
                default: 3,
              },
            },
          },
        },
        { $sort: {sort: 1, title: 1} },
        { $limit: perPage },
        {
          $project: {
            title: 1,
            collegeLogo: 1,
            collegeLogoThumbnail: 1,
            collegeBanner: 1,
            numId: 1,
            state: 1,
            city: 1,
          },
        },
      ]),
      this.employerModel
        .find({ title: { $regex: keyword, $options: 'i' } }, '_id')
        .lean()
        .exec(),
      // this.courseModel.collection.getIndexes(),
    ]) :
    await Promise.all([
      [], [], [],
      this.employerModel
        .find({ title: { $regex: keyword, $options: 'i' } }, '_id')
        .lean()
        .exec(),
    ]);
    const collegeIds = colleges.map(college => college._id);
    const employerIds = employers.map(employer => employer._id);
    const suspendedCollegeIds = suspendedColleges.map(college => college._id);
    // const data = await this.courseModel.collection.find({$or: [
    //   { collegeId: { $in: collegeIds } },
    //   { $text: {$search: '\"' + keyword + '\"'} },
    //   // { title: { $regex: keyword, $options: 'i' } },
    //   // { description: { $regex: keyword, $options: 'i' } },
    //   // { outline: { $regex: keyword, $options: 'i' } },
    //   // { venue: { $regex: keyword, $options: 'i' } },
    //   // { 'occupations.title': { $regex: keyword, $options: 'i' } },
    //   // { 'knowledgeOutcomes.name': { $regex: keyword, $options: 'i' } },
    //   // { 'skillOutcomes.name': { $regex: keyword, $options: 'i' } },
    //   // { 'experiences.name': { $regex: keyword, $options: 'i' } },
    //   // { 'associateDegrees.CIPTitle': { $regex: keyword, $options: 'i' } },
    //   // { 'certificates.CIPTitle': { $regex: keyword, $options: 'i' } },
    //   // { 'certifications.Name': { $regex: keyword, $options: 'i' } },
    //   // { 'licenses.Title': { $regex: keyword, $options: 'i' } },
    // ]}).explain(1);
    // console.log(data.executionStats.totalDocsExamined);
    const regexSearch = // !!indexes.CourseSearch ?
    // [
    //   { collegeId: { $in: collegeIds } },
    //   { $text: {$search: '\"' + keyword + '\"'} },
    // ] :
    [
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
    ];
    // console.log(regexSearch);
    const courses = await this.courseModel.aggregate([
      {
        $match: {
          enrollmentDeadline: { $gte: new Date() },
          $or: regexSearch,
          collegeId: !collegeId ? { $nin: suspendedCollegeIds } : mongoose.Types.ObjectId(collegeId),
          unpublishedDate: null,
          status: { $ne: CourseStatus.COMING_SOON },
        },
      },
      {
        $addFields: {
          enrollmentEnded: {$cond: [{ $lte: ['$enrollmentDeadline', new Date()] }, 1, 0]},
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
                  case: { $gt: [{$size: {$setIntersection: ['$employers', employerIds]}}, 0] },
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
                  case: { $or: [
                    {$regexMatch: { input: 'associateDegrees.CIPTitle', regex: keyword, options: 'i' }},
                    {$regexMatch: { input: 'certificates.CIPTitle', regex: keyword, options: 'i' }},
                    {$regexMatch: { input: 'certifications.Name', regex: keyword, options: 'i' }},
                    {$regexMatch: { input: 'licenses.Title', regex: keyword, options: 'i' }},
                  ] },
                  then: 6,
                },
              ],
              default: 7,
            },
          },
        },
      },
      { $sort: { enrollmentEnded: 1, sort: 1, createdAt: -1 } },
      { $limit: perPage },
      {
        $lookup: {
          from: 'colleges',
          localField: 'collegeId',
          foreignField: '_id',
          as: 'college',
        },
      },
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          coverPhoto: 1,
          coverPhotoThumbnail: 1,
          'college._id': 1,
          'college.title': 1,
          'college.numId': 1,
          numId: 1,
          enrollmentEnded: 1,
          sort: 1,
        },
      },
      { $sort: { enrollmentEnded: 1, sort: 1, createdAt: -1 } },
    ]);

    return ResponseHandler.success({courses, collegesList});
  }

  async updateFooterContent(footerPagesContent: UpdateFooterContentDto) {
    const newContent = await this.landingPageModel.findOneAndUpdate({}, { $set: footerPagesContent }, { new: true }).exec();

    return ResponseHandler.success(
      {
        about: newContent.about,
        why: newContent.why,
        privacyPolicy: newContent.privacyPolicy,
        termsOfService: newContent.termsOfService,
        accessibility: newContent.accessibility,
      },
      'Footer pages content updated successfully.',
    );
  }

  async updatePreviewContent(previewContent) {
    const newContent = await this.landingPageModel.findOneAndUpdate({}, { $set: { previewContent } }, { new: true }).exec();

    return ResponseHandler.success({ previewContent: newContent.previewContent }, 'Preview content updated successfully.');
  }
}
