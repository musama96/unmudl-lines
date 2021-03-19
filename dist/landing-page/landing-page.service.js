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
const mongoose = require("mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const courses_model_1 = require("../courses/courses.model");
const redis_cache_service_1 = require("../redis-cache/redis-cache.service");
const redisKeys_1 = require("../config/redisKeys");
const s3_1 = require("../s3upload/s3");
let LandingPageService = class LandingPageService {
    constructor(landingPageModel, courseModel, collegeModel, blogModel, employerModel, redisCacheService) {
        this.landingPageModel = landingPageModel;
        this.courseModel = courseModel;
        this.collegeModel = collegeModel;
        this.blogModel = blogModel;
        this.employerModel = employerModel;
        this.redisCacheService = redisCacheService;
    }
    async updateLandingPageInfo(landingInfo) {
        if (landingInfo.coverPhoto) {
            let existingData = await this.landingPageModel.findOne({}, 'coverPhoto').lean().exec();
            const files = [];
            existingData.coverPhoto && existingData.coverPhoto !== landingInfo.coverPhoto ? files.push(existingData.coverPhoto) : null;
            files.length > 0 ? await s3_1.removeFilesFromS3(files) : null;
        }
        return await this.landingPageModel.findOneAndUpdate({}, { $set: landingInfo }, { upsert: true, new: true }).exec();
    }
    async updateLandingPagePartners(partners) {
        return await this.landingPageModel.findOneAndUpdate({}, { $set: { partners } }, { new: true }).exec();
    }
    async updateLandingPageFeaturedCourses(featured) {
        return await this.landingPageModel.findOneAndUpdate({}, featured, { new: true }).exec();
    }
    async updateLandingPageHighlyRatedCourses(highlyRated) {
        return await this.landingPageModel.findOneAndUpdate({}, highlyRated, { new: true }).exec();
    }
    async updateLandingPageCredentialCourses(credentialCourses) {
        return await this.landingPageModel.findOneAndUpdate({}, credentialCourses, { new: true }).exec();
    }
    async updateLandingPageBlogs(blogs) {
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
        return ResponseHandler_1.default.success(landingPageData.about);
    }
    async getWhyUnmudl() {
        const landingPageData = await this.landingPageModel.findOne({}).lean();
        return ResponseHandler_1.default.success(landingPageData.why);
    }
    async getPrivacyPolicy() {
        const landingPageData = await this.landingPageModel.findOne({}).lean();
        return ResponseHandler_1.default.success(landingPageData.privacyPolicy);
    }
    async getTermsOfService() {
        const landingPageData = await this.landingPageModel.findOne({}).lean();
        return ResponseHandler_1.default.success(landingPageData.termsOfService);
    }
    async getAccessibility() {
        const landingPageData = await this.landingPageModel.findOne({}).lean();
        return ResponseHandler_1.default.success(landingPageData.accessibility);
    }
    async getPreviewContent() {
        const landingPageData = await this.landingPageModel.findOne({}).lean();
        return ResponseHandler_1.default.success(landingPageData.previewContent);
    }
    async getLearnersLandingPage() {
        const redisConnected = await this.redisCacheService.checkClient();
        const cachedData = redisConnected ? await this.redisCacheService.get(redisKeys_1.RedisKeys.learnerPortalLandingPageData) : null;
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
                await this.redisCacheService.set(redisKeys_1.RedisKeys.learnerPortalLandingPageData, landingPage, 10);
            }
            return landingPage;
        }
        else {
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
        const { perPage, collegeId, keyword } = params;
        const match = {
            status: { $nin: [courses_model_1.CourseStatus.CANCELED, courses_model_1.CourseStatus.UNPUBLISH] },
            unpublishedDate: null,
            title: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        const courses = await this.courseModel
            .find(match, 'title coverPhoto coverPhotoThumbnail collegeId')
            .sort({ title: 1 })
            .paginate(1, perPage)
            .populate('collegeId', 'title')
            .sort({ title: 1 })
            .collation({ locale: 'en', strength: 2 })
            .lean().exec();
        return ResponseHandler_1.default.success(courses);
    }
    async getSearchedCourses(params) {
        const { keyword, perPage, collegeId } = params;
        const [colleges, suspendedColleges, collegesList, employers] = !collegeId ? await Promise.all([
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
                        isSuspended: { $ne: true },
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
                { $sort: { sort: 1, title: 1 } },
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
        const regexSearch = [
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
        const courses = await this.courseModel.aggregate([
            {
                $match: {
                    enrollmentDeadline: { $gte: new Date() },
                    $or: regexSearch,
                    collegeId: !collegeId ? { $nin: suspendedCollegeIds } : mongoose.Types.ObjectId(collegeId),
                    unpublishedDate: null,
                    status: { $ne: courses_model_1.CourseStatus.COMING_SOON },
                },
            },
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
                                    case: { $or: [
                                            { $regexMatch: { input: 'associateDegrees.CIPTitle', regex: keyword, options: 'i' } },
                                            { $regexMatch: { input: 'certificates.CIPTitle', regex: keyword, options: 'i' } },
                                            { $regexMatch: { input: 'certifications.Name', regex: keyword, options: 'i' } },
                                            { $regexMatch: { input: 'licenses.Title', regex: keyword, options: 'i' } },
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
        return ResponseHandler_1.default.success({ courses, collegesList });
    }
    async updateFooterContent(footerPagesContent) {
        const newContent = await this.landingPageModel.findOneAndUpdate({}, { $set: footerPagesContent }, { new: true }).exec();
        return ResponseHandler_1.default.success({
            about: newContent.about,
            why: newContent.why,
            privacyPolicy: newContent.privacyPolicy,
            termsOfService: newContent.termsOfService,
            accessibility: newContent.accessibility,
        }, 'Footer pages content updated successfully.');
    }
    async updatePreviewContent(previewContent) {
        const newContent = await this.landingPageModel.findOneAndUpdate({}, { $set: { previewContent } }, { new: true }).exec();
        return ResponseHandler_1.default.success({ previewContent: newContent.previewContent }, 'Preview content updated successfully.');
    }
};
LandingPageService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('landing-page')),
    __param(1, mongoose_1.InjectModel('courses')),
    __param(2, mongoose_1.InjectModel('colleges')),
    __param(3, mongoose_1.InjectModel('blogs')),
    __param(4, mongoose_1.InjectModel('employers')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, redis_cache_service_1.RedisCacheService])
], LandingPageService);
exports.LandingPageService = LandingPageService;
//# sourceMappingURL=landing-page.service.js.map