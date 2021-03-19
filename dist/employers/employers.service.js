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
const courses_model_1 = require("../courses/courses.model");
const mongoose = require("mongoose");
let EmployersService = class EmployersService {
    constructor(employerModel) {
        this.employerModel = employerModel;
    }
    async createEmployers(employersArr) {
        const employers = await this.employerModel.create(employersArr);
        return employers;
    }
    async getEmployers(keyword) {
        return await this.employerModel.find().sort({ title: 1 }).byKeyword(keyword).lean();
    }
    async getEmployersForFilter(params) {
        const { keyword, collegeId } = params;
        const collegeMatch = collegeId ? { 'college._id': mongoose.Types.ObjectId(collegeId) } : { 'college.isSuspended': { $ne: true } };
        return await this.employerModel.aggregate([
            { $match: { title: { $regex: keyword, $options: 'i' } } },
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
                                        { $eq: ['$employers', '$$employer'] },
                                        { $gte: ['$enrollmentDeadline', new Date()] },
                                        { $eq: ['$unpublishedDate', null] },
                                        { $ne: ['$status', courses_model_1.CourseStatus.CANCELED] },
                                        { $ne: ['$status', courses_model_1.CourseStatus.COMING_SOON] },
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
                        { $match: collegeMatch },
                    ],
                    as: 'courses',
                },
            },
            { $addFields: { coursesCount: { $size: '$courses' } } },
            { $match: { coursesCount: { $gt: 0 } } },
            { $unset: 'courses' },
            { $sort: { title: 1 } },
        ]).collation({ locale: 'en', strength: 2 }).exec();
    }
};
EmployersService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employers')),
    __metadata("design:paramtypes", [Object])
], EmployersService);
exports.EmployersService = EmployersService;
//# sourceMappingURL=employers.service.js.map