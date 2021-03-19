import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Promo } from './promo.model';
import ResponseHandler from '../common/ResponseHandler';
import * as mongoose from 'mongoose';
import responseMessages from '../config/responseMessages';
import { PromoListDto } from './dto/promoList.dto';
import * as json2csv from 'json2csv';
import { NotificationsService } from '../notifications/notifications.service';
import { CoursePromoDataDto } from '../courses/dto/coursePromoData.dto';

@Injectable()
export class PromosService {
  constructor(
    @InjectModel('promos') private readonly promoModel,
    @InjectModel('enrollments') private readonly enrollmentModel,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPromo(promo: Promo, notify = true) {
    let newPromo = new this.promoModel(promo);
    newPromo = await newPromo.save();
    if (notify) {
      this.notificationsService.promoApplied(newPromo);
    }
    return ResponseHandler.success(newPromo);
  }

  async updatePromo(promo: Promo) {
    const response = await this.promoModel.findByIdAndUpdate(promo._id, promo, { new: true }).exec();

    return ResponseHandler.success(response, responseMessages.success.updatePromo);
  }

  async updateSuspendedStatus(promo) {
    const response = await this.promoModel
      .findByIdAndUpdate(
        promo._id,
        {
          $set: {
            status: promo.status,
          },
        },
        { new: true },
      )
      .exec();

    return ResponseHandler.success(response, responseMessages.success.updatePromo);
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

      return ResponseHandler.success(null, responseMessages.success.deletePromo);
    } else {
      return ResponseHandler.fail(null, responseMessages.deletePromo.alreadyUsed);
    }
  }

  async getPromoById(promoId: string) {
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

    const promo = { ...response._doc, uses };

    return ResponseHandler.success(promo);
  }

  async getPromos(params: PromoListDto) {
    const {
      keyword,
      courseId,
      collegeId,
      page,
      perPage,
      applyTo,
      minDiscount,
      maxDiscount,
      discountType,
      start,
      end,
      courseKeyword,
      type,
      status,
      noOfUses,
      sortOrder,
      sortBy,
    } = params;

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
      // @ts-ignore
      match.discount = {};

      if (minDiscount) {
        // @ts-ignore
        match.discount.$gte = minDiscount;
      }
      if (maxDiscount) {
        // @ts-ignore
        match.discount.$lte = maxDiscount;
      }
    }
    if (discountType && discountType !== 'all') {
      // @ts-ignore
      match.discountMetric = discountType;
    }
    if (applyTo) {
      // @ts-ignore
      match.applyTo = applyTo;
    }
    if (type) {
      // @ts-ignore
      match.type = type;
    }
    if (courseId) {
      // @ts-ignore
      match.courses = mongoose.Types.ObjectId(courseId);
    }
    if (collegeId) {
      // @ts-ignore
      match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
    }

    if (start || end) {
      const endDate = {};
      if (start) {
        // @ts-ignore
        endDate.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
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
      // @ts-ignore
      match.status = status;
    }

    // if (expiryDate) {
    //   // @ts-ignore
    //   match.expiryDate = {
    //     $gte: new Date(moment(expiryDate).startOf('d').toISOString()),
    //     $lte: new Date(moment(expiryDate).endOf('d').toISOString()),
    //   };
    // }

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
        addedByCollegeId: '$addedBy.collegeId', // { $cond: { if: , then: false, else: true } },
      },
    });

    if (noOfUses || noOfUses === 0) {
      pipeline.push({
        $match: {
          noOfUses,
        },
      });
    }

    pipeline.push(
      ...[
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
      ],
    );

    const promos = await this.promoModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    const rows = await this.getPromosCount(params);

    return ResponseHandler.success({
      promos,
      rows: rows.data,
    });
  }

  async getPromosCsv(params: PromoListDto) {
    const {
      keyword,
      courseId,
      collegeId,
      applyTo,
      minDiscount,
      maxDiscount,
      discountType,
      start,
      end,
      courseKeyword,
      type,
      status,
      noOfUses,
      sortOrder,
      sortBy,
    } = params;

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
      // @ts-ignore
      match.discount = {};

      if (minDiscount) {
        // @ts-ignore
        match.discount.$gte = minDiscount;
      }
      if (maxDiscount) {
        // @ts-ignore
        match.discount.$lte = maxDiscount;
      }
    }
    if (discountType && discountType !== 'all') {
      // @ts-ignore
      match.discountMetric = discountType;
    }
    if (applyTo) {
      // @ts-ignore
      match.applyTo = applyTo;
    }
    if (type) {
      // @ts-ignore
      match.type = type;
    }
    if (courseId) {
      // @ts-ignore
      match.courses = mongoose.Types.ObjectId(courseId);
    }
    if (collegeId) {
      // @ts-ignore
      match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
    }

    if (start || end) {
      const endDate = {};
      if (start) {
        // @ts-ignore
        endDate.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
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
      // @ts-ignore
      match.status = status;
    }

    // if (expiryDate) {
    //   // @ts-ignore
    //   match.expiryDate = {
    //     $gte: new Date(moment(expiryDate).startOf('d').toISOString()),
    //     $lte: new Date(moment(expiryDate).endOf('d').toISOString()),
    //   };
    // }

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

    pipeline.push(
      ...[
        {
          $addFields: {
            courses: '$courses.title',
          },
        },
        // {
        //   $lookup: {
        //     from: 'enrollments',
        //     localField: '_id',
        //     foreignField: 'promoId',
        //     as: 'noOfUses',
        //   },
        // },
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
      ],
    );

    if (noOfUses || noOfUses === 0) {
      pipeline.push({
        $match: {
          noOfUses,
        },
      });
    }

    pipeline.push(
      ...[
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
      ],
    );

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
      // @ts-ignore
      match.discount = {
        $lte: discount,
      };
    }
    if (applyTo) {
      // @ts-ignore
      match.applyTo = applyTo;
    }
    if (type) {
      // @ts-ignore
      match.type = type;
    }
    if (courseId) {
      // @ts-ignore
      match.courses = mongoose.Types.ObjectId(courseId);
    }

    if (collegeId) {
      // @ts-ignore
      match.$or = [{ collegeId: mongoose.Types.ObjectId(collegeId) }, { collegeId: null }];
    }

    if (start || end) {
      const endDate = {};
      if (start) {
        // @ts-ignore
        endDate.$gte = new Date(start);
      }
      if (end) {
        // @ts-ignore
        endDate.$lte = new Date(end);
      }

      const dateMatch = {
        'date.end': endDate,
      };
      pipeline.push({
        $match: dateMatch,
      });
    }

    pipeline.push(
      ...[
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
      ],
    );

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

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
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

    return ResponseHandler.success(history);
  }

  async getCoursePromos(params: CoursePromoDataDto, price) {
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

  async getAppliedPromos(params: CoursePromoDataDto, price: number) {
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

    return ResponseHandler.success({ promos, rows });
  }
}
