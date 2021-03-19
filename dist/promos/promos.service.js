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
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose = require("mongoose");
const responseMessages_1 = require("../config/responseMessages");
const json2csv = require("json2csv");
const notifications_service_1 = require("../notifications/notifications.service");
let PromosService = class PromosService {
    constructor(promoModel, enrollmentModel, notificationsService) {
        this.promoModel = promoModel;
        this.enrollmentModel = enrollmentModel;
        this.notificationsService = notificationsService;
    }
    async createPromo(promo, notify = true) {
        let newPromo = new this.promoModel(promo);
        newPromo = await newPromo.save();
        if (notify) {
            this.notificationsService.promoApplied(newPromo);
        }
        return ResponseHandler_1.default.success(newPromo);
    }
    async updatePromo(promo) {
        const response = await this.promoModel.findByIdAndUpdate(promo._id, promo, { new: true }).exec();
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updatePromo);
    }
    async updateSuspendedStatus(promo) {
        const response = await this.promoModel
            .findByIdAndUpdate(promo._id, {
            $set: {
                status: promo.status,
            },
        }, { new: true })
            .exec();
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updatePromo);
    }
    async deletePromo(id) {
        const promo = await this.enrollmentModel
            .findOne({
            promoId: id,
        })
            .lean();
        if (!promo) {
            await this.promoModel
                .deleteOne({
                _id: id,
            })
                .exec();
            return ResponseHandler_1.default.success(null, responseMessages_1.default.success.deletePromo);
        }
        else {
            return ResponseHandler_1.default.fail(null, responseMessages_1.default.deletePromo.alreadyUsed);
        }
    }
    async getPromoById(promoId) {
        return await this.promoModel.findById(promoId).lean();
    }
    async getPromoDetails(promoId) {
        const response = await this.promoModel
            .findById(promoId)
            .populate('courses')
            .populate('collegeId')
            .populate('addedBy')
            .exec();
        const uses = await this.enrollmentModel
            .countDocuments({
            promoId,
        })
            .exec();
        const promo = Object.assign(Object.assign({}, response._doc), { uses });
        return ResponseHandler_1.default.success(promo);
    }
    async getPromos(params) {
        const { keyword, courseId, collegeId, page, perPage, applyTo, minDiscount, maxDiscount, discountType, start, end, courseKeyword, type, status, noOfUses, sortOrder, sortBy, } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [];
        const match = {
            title: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (minDiscount || maxDiscount) {
            match.discount = {};
            if (minDiscount) {
                match.discount.$gte = minDiscount;
            }
            if (maxDiscount) {
                match.discount.$lte = maxDiscount;
            }
        }
        if (discountType && discountType !== 'all') {
            match.discountMetric = discountType;
        }
        if (applyTo) {
            match.applyTo = applyTo;
        }
        if (type) {
            match.type = type;
        }
        if (courseId) {
            match.courses = mongoose.Types.ObjectId(courseId);
        }
        if (collegeId) {
            match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
        }
        if (start || end) {
            const endDate = {};
            if (start) {
                endDate.$gte = new Date(start);
            }
            if (end) {
                endDate.$lte = new Date(end);
            }
            const dateMatch = {
                'date.end': endDate,
            };
            pipeline.push({
                $match: dateMatch,
            });
        }
        if (status && status !== 'all') {
            match.status = status;
        }
        pipeline.push({
            $match: match,
        });
        pipeline.push({
            $lookup: {
                from: 'courses',
                localField: 'courses',
                foreignField: '_id',
                as: 'courses',
            },
        });
        if (courseKeyword) {
            pipeline.push({
                $match: {
                    'courses.title': {
                        $regex: courseKeyword,
                        $options: 'i',
                    },
                },
            });
        }
        pipeline.push({
            $addFields: {
                courses: '$courses.title',
            },
        });
        pipeline.push({
            $lookup: {
                from: 'enrollments',
                localField: '_id',
                foreignField: 'promoId',
                as: 'noOfUses',
            },
        });
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'addedBy',
                foreignField: '_id',
                as: 'addedBy',
            },
        });
        pipeline.push({
            $addFields: {
                noOfUses: {
                    $size: '$noOfUses',
                },
                appliedTo: {
                    $size: '$courses',
                },
                addedBy: '$addedBy.fullname',
                addedByCollegeId: '$addedBy.collegeId',
            },
        });
        if (noOfUses || noOfUses === 0) {
            pipeline.push({
                $match: {
                    noOfUses,
                },
            });
        }
        pipeline.push(...[
            {
                $addFields: {
                    addedBy: {
                        $arrayElemAt: ['$addedBy', 0],
                    },
                    addedByCollegeId: {
                        $arrayElemAt: ['$addedByCollegeId', 0],
                    },
                    expiry: '$date.end',
                },
            },
            {
                $addFields: {
                    addedByUnmudl: { $cond: { if: '$addedByCollegeId', then: false, else: true } },
                },
            },
            {
                $sort: sort,
            },
        ]);
        const promos = await this.promoModel
            .aggregate(pipeline)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getPromosCount(params);
        return ResponseHandler_1.default.success({
            promos,
            rows: rows.data,
        });
    }
    async getPromosCsv(params) {
        const { keyword, courseId, collegeId, applyTo, minDiscount, maxDiscount, discountType, start, end, courseKeyword, type, status, noOfUses, sortOrder, sortBy, } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [];
        const match = {
            title: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (minDiscount || maxDiscount) {
            match.discount = {};
            if (minDiscount) {
                match.discount.$gte = minDiscount;
            }
            if (maxDiscount) {
                match.discount.$lte = maxDiscount;
            }
        }
        if (discountType && discountType !== 'all') {
            match.discountMetric = discountType;
        }
        if (applyTo) {
            match.applyTo = applyTo;
        }
        if (type) {
            match.type = type;
        }
        if (courseId) {
            match.courses = mongoose.Types.ObjectId(courseId);
        }
        if (collegeId) {
            match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
        }
        if (start || end) {
            const endDate = {};
            if (start) {
                endDate.$gte = new Date(start);
            }
            if (end) {
                endDate.$lte = new Date(end);
            }
            const dateMatch = {
                'date.end': endDate,
            };
            pipeline.push({
                $match: dateMatch,
            });
        }
        if (status && status !== 'all') {
            match.status = status;
        }
        pipeline.push({
            $match: match,
        });
        pipeline.push({
            $lookup: {
                from: 'courses',
                localField: 'courses',
                foreignField: '_id',
                as: 'courses',
            },
        });
        if (courseKeyword) {
            pipeline.push({
                $match: {
                    'courses.title': {
                        $regex: courseKeyword,
                        $options: 'i',
                    },
                },
            });
        }
        pipeline.push(...[
            {
                $addFields: {
                    courses: '$courses.title',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedBy',
                },
            },
            {
                $addFields: {
                    noOfUses: { $size: { $ifNull: ['$learners', []] } },
                    appliedTo: { $size: '$courses' },
                    addedBy: '$addedBy.fullname',
                },
            },
            {
                $addFields: {
                    appliedTo: {
                        $toString: '$appliedTo',
                    },
                },
            },
        ]);
        if (noOfUses || noOfUses === 0) {
            pipeline.push({
                $match: {
                    noOfUses,
                },
            });
        }
        pipeline.push(...[
            {
                $addFields: {
                    'Promo Code': '$title',
                    'Date Added': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    'No of Uses': '$noOfUses',
                    'Discount Percentage': '$discount',
                    'Promo Applied To': {
                        $cond: {
                            if: { $ne: ['$applyTo', 'all'] },
                            then: { $concat: ['$appliedTo', ' Courses'] },
                            else: 'All Courses',
                        },
                    },
                    'Promo Type': { $cond: { if: { $eq: ['$type', 'unmudl'] }, then: 'Universal', else: 'Local' } },
                    'Added By': { $arrayElemAt: ['$addedBy', 0] },
                    'Expiry Date': { $dateToString: { date: '$date.end', format: '%Y-%m-%d' } },
                },
            },
            {
                $sort: sort,
            },
        ]);
        const promos = await this.promoModel
            .aggregate(pipeline)
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = [
            'Promo Code',
            'Date Added',
            'No of Uses',
            'Discount Percentage',
            'Promo Applied To',
            'Promo Type',
            'Added By',
            'Expiry Date',
        ];
        return json2csv.parse(promos, { fields });
    }
    async getPromosCount(params) {
        const { keyword, courseId, collegeId, applyTo, discount, start, end, courseKeyword, type } = params;
        const pipeline = [];
        const match = {
            title: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (discount) {
            match.discount = {
                $lte: discount,
            };
        }
        if (applyTo) {
            match.applyTo = applyTo;
        }
        if (type) {
            match.type = type;
        }
        if (courseId) {
            match.courses = mongoose.Types.ObjectId(courseId);
        }
        if (collegeId) {
            match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
        }
        if (start || end) {
            const endDate = {};
            if (start) {
                endDate.$gte = new Date(start);
            }
            if (end) {
                endDate.$lte = new Date(end);
            }
            const dateMatch = {
                'date.end': endDate,
            };
            pipeline.push({
                $match: dateMatch,
            });
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courses',
                    foreignField: '_id',
                    as: 'courses',
                },
            },
        ]);
        if (courseKeyword) {
            pipeline.push({
                $match: {
                    'courses.title': {
                        $regex: courseKeyword,
                        $options: 'i',
                    },
                },
            });
        }
        pipeline.push({
            $group: {
                _id: null,
                rows: { $sum: 1 },
            },
        });
        const rows = await this.promoModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(rows.length > 0 ? rows[0].rows : 0);
    }
    async getPromoHistory(promoId) {
        const history = await this.enrollmentModel
            .aggregate([
            {
                $match: {
                    promoId: mongoose.Types.ObjectId(promoId),
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
                    from: 'promos',
                    localField: 'promoId',
                    foreignField: '_id',
                    as: 'promo',
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
                    course: { $arrayElemAt: ['$course', 0] },
                    promo: { $arrayElemAt: ['$promo', 0] },
                    learner: { $arrayElemAt: ['$learner', 0] },
                    createdAt: 1,
                },
            },
            {
                $project: {
                    course: '$course.title',
                    promo: '$promo.title',
                    learner: '$learner.fullname',
                    createdAt: 1,
                },
            },
        ])
            .exec();
        return ResponseHandler_1.default.success(history);
    }
    async getCoursePromos(params, price) {
        const { courseId, page, perPage, sortOrder, sortBy, collegeId } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [promos, promosCount] = await Promise.all([
            this.promoModel.aggregate([
                { $match: { courses: mongoose.Types.ObjectId(courseId) } },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: 'addedBy',
                    },
                },
                { $unwind: '$addedBy' },
                {
                    $addFields: {
                        price: {
                            $cond: {
                                if: { $eq: ['$discountMetric', 'percentage'] },
                                then: {
                                    $subtract: [
                                        price,
                                        {
                                            $multiply: [
                                                price,
                                                {
                                                    $divide: ['$discount', 100],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                else: {
                                    $subtract: [price, '$discount'],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        title: 1,
                        createdAt: 1,
                        discount: 1,
                        discountType: '$discountMetric',
                        price: 1,
                        originalPrice: price,
                        type: 1,
                        addedBy: '$addedBy.fullname',
                        expiryDate: '$date.end',
                    },
                },
                {
                    $sort: sort,
                },
            ]),
            this.promoModel.countDocuments({ courses: mongoose.Types.ObjectId(courseId) }),
        ]);
        return { promos, promosCount };
    }
    async getAppliedPromos(params, price) {
        const { courseId, page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [promos, rows] = await Promise.all([
            this.enrollmentModel
                .aggregate([
                {
                    $match: {
                        courseId: mongoose.Types.ObjectId(courseId),
                        promoId: { $ne: null },
                        giftId: null,
                    },
                },
                {
                    $lookup: {
                        from: 'promos',
                        localField: 'promoId',
                        foreignField: '_id',
                        as: 'promo',
                    },
                },
                { $unwind: '$promo' },
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
                        from: 'users',
                        localField: 'promo.addedBy',
                        foreignField: '_id',
                        as: 'addedBy',
                    },
                },
                {
                    $unwind: {
                        path: '$addedBy',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'learners',
                        localField: 'promo.addedByLearner',
                        foreignField: '_id',
                        as: 'addedByLearner',
                    },
                },
                {
                    $unwind: {
                        path: '$addedByLearner',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        title: '$promo.title',
                        createdAt: '$promo.createdAt',
                        discount: '$promo.discount',
                        discountMetric: '$promo.discountMetric',
                        price: { $subtract: ['$totalPaid', '$salesTax'] },
                        originalPrice: { $add: [{ $subtract: ['$totalPaid', '$salesTax'] }, '$discountTotal'] },
                        type: '$promo.type',
                        expiry: '$promo.date.end',
                        addedBy: { $cond: { if: '$addedBy', then: '$addedBy.fullname', else: '$addedByLearner.fullname' } },
                    },
                },
            ])
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(),
            this.enrollmentModel
                .countDocuments({
                courseId,
                promoId: { $ne: null },
                giftId: null,
            })
                .exec(),
        ]);
        return ResponseHandler_1.default.success({ promos, rows });
    }
};
PromosService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('promos')),
    __param(1, mongoose_1.InjectModel('enrollments')),
    __metadata("design:paramtypes", [Object, Object, notifications_service_1.NotificationsService])
], PromosService);
exports.PromosService = PromosService;
//# sourceMappingURL=promos.service.js.map